import { Ionicons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import * as Speech from 'expo-speech'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  setDoc,
  Timestamp,
  query,
  where,
  serverTimestamp,
  increment,
} from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import { auth, db } from '../../config'
import AnswerButton from '../components/answerButton'
import CircleButton from '../components/circleButton'
import FlashcardActionSheetComponent from '../components/FlashcardModal'
import Footer from '../components/Footer'
import ProgressBar from '../components/progressBar'
import ReviewButton from '../components/reviewButton'
import { isMockTime } from '../dev/mockTime'
import calculateSM2 from '../utils/srs'

interface Deck {
  id: string
  name: string
  tag: string | null
  cardCount: number // 復習対象
  totalCount: number // 全体数
  createdAt?: Timestamp
}

interface Flashcard {
  id: string
  question: string
  answer: string
  isBookmarked: boolean
  repetition: number
  interval: number
  efactor: number
  nextReview: Timestamp
  createdAt: Timestamp
  deckId: string
  deckName: string
}

const BookmarkReviewScreen = (): JSX.Element => {
  const router = useRouter()

  const { deckId, deckName } = useLocalSearchParams<{
    deckId: string
    deckName: string
  }>()

  const [, setShowAnswer] = useState(false)
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false)
  const [showReviewButtons, setShowReviewButtons] = useState(false)
  const [currentCard, setCurrentCard] = useState(0)
  const currentCardRef = useRef(0)
  const isCompletedRef = useRef(false)
  const [flashcards, setFlashCards] = useState<Flashcard[]>()
  const [showCongratsModal, setShowCongratsModal] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false)
  const [autoSpeakEnabled, setAutoSpeakEnabled] = useState(false)
  const [selectedCard, setSelectedCard] = useState<{
    deckId: string
    deckName: string
    flashcardId: string
    flashcardFront: string
    flashcardBack: string
    flashcardBookmarked: boolean
  }>()

  const detectLanguage = (text: string): 'en' | 'ja' | 'zh' => {
    const hasEnglish = /[a-zA-Z]/.test(text)
    const hasHiraganaOrKatakana = /[\u3040-\u30FF]/.test(text)
    const hasChineseCharacters = /[\u4E00-\u9FFF]/.test(text)

    if (hasEnglish) return 'en'
    if (hasHiraganaOrKatakana) return 'ja'
    if (hasChineseCharacters) return 'zh'
    return 'ja'
  }

  const handleMorePress = (
    deckId: string,
    deckName: string,
    flashcardId: string,
    flashcardFront: string,
    flashcardBack: string,
    flashcardBookmarked: boolean,
  ) => {
    setSelectedCard({
      deckId: deckId,
      deckName: deckName,
      flashcardId: flashcardId,
      flashcardFront: flashcardFront,
      flashcardBack: flashcardBack,
      flashcardBookmarked: flashcardBookmarked,
    })

    setFlashcardModalVisible(true)
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
    setShowReviewButtons(true)
  }

  const handleToggleBookmark = async (
    deckId: string,
    flashcardId: string,
    currentBookmarked: boolean,
  ) => {
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }

    try {
      const ref = doc(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards/${flashcardId}`,
      )
      await updateDoc(ref, {
        isBookmarked: !currentBookmarked, // true → false、false → true
      })

      setIsBookmarked(!currentBookmarked)

      setFlashCards((prev) =>
        prev?.map((card) =>
          card.id === flashcardId
            ? { ...card, isBookmarked: !currentBookmarked }
            : card,
        ),
      )
    } catch (error) {
      console.error('ブックマーク更新エラー: ', error)
      alert('ブックマークの更新に失敗しました')
    }
  }

  //ボタンの不具合が発生しているためtry catchで場合わけ
  const calculateNextInterval = async (score: number) => {
    try {
      const currentCardData = flashcards?.[currentCard]
      if (!currentCardData) return
      const { id, repetition, interval, efactor } = currentCardData

      const {
        repetition: newRepetition,
        interval: newInterval,
        efactor: newEfactor,
      } = calculateSM2(score, repetition || 0, interval || 1, efactor || 2.5)

      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

      if (auth.currentUser && currentCardData.deckId && id) {
        const ref = doc(
          db,
          `users/${auth.currentUser.uid}/decks/${currentCardData.deckId}/flashcards/${id}`,
        )
        await updateDoc(ref, {
          repetition: newRepetition,
          interval: newInterval,
          efactor: newEfactor,
          nextReview: Timestamp.fromDate(nextReviewDate),
        })
      }
    } catch (error) {
      console.error('calculateNextInterval エラー:', error)
      // エラーが発生しても処理を続行
    }
  }

  const handleNextCard = async (score: number) => {
    try {
      if (score === 1) {
        // Again の場合：スコアを 0 にして、nextReview は今のまま or 1分後に設定
        await calculateNextInterval(0)
      }
    } catch (error) {
      console.error('handleNextCard エラー:', error)
      // エラーが発生してもUIは更新
    } finally {
      // エラーが発生しても必ずUIを更新
      setShowAnswer(false)
      setShowReviewButtons(false)
      setCurrentCard((prev) => prev + 1)
    }
  }

  const canGoBack =
    !!flashcards?.length && (showReviewButtons || currentCard > 0)

  const handlePreviousCard = () => {
    if (showReviewButtons) {
      // いま英語（回答）表示中 → 同じカードの日本語へ
      setShowReviewButtons(false)
      setShowAnswer(false)
      return
    }

    // いま日本語（質問）表示中 → 前カードの英語へ
    setCurrentCard((prev) => {
      const nextIndex = Math.max(0, prev - 1)
      return nextIndex
    })
    setShowReviewButtons(true) // 前カードを英語状態で表示
    setShowAnswer(true)
  }

  const speakQuestion = React.useCallback((text: string) => {
    const lang = detectLanguage(text)

    Speech.speak(text, {
      language: lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP',
      rate: 0.85,
      pitch: 1.1,
    })
  }, [])

  // ユーティリティ：日付だけ比較（時刻は切り捨て）
  const toYmd = (d: Date) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x.getTime()
  }

  // 全カード終了時に 1日 分の streak を更新
  const updateStreakOnComplete = async () => {
    // if (!auth.currentUser || isMockTime()) return // モック時間帯は書き込まない
    const uid = auth.currentUser.uid
    const userRef = doc(db, 'users', uid)
    const snapshot = await getDoc(userRef)

    // ユーザードキュメントが無い場合は作る（既存フィールドはmergeで温存）
    if (!snapshot.exists()) {
      await setDoc(
        userRef,
        {
          email: auth.currentUser.email ?? null,
          createdAt: serverTimestamp(),
          streakCount: 1,
          lastStudiedAt: serverTimestamp(),
        },
        { merge: true },
      )
      return
    }

    const data = snapshot.data()
    const today = new Date()
    const last = data.lastStudiedAt?.toDate?.() as Date | undefined

    // すでに今日更新済み → 何もしない
    if (last && toYmd(last) === toYmd(today)) return

    let nextStreak = 1
    if (last) {
      const diffDays = Math.round(
        (toYmd(today) - toYmd(last)) / (1000 * 60 * 60 * 24),
      )
      //昨日も学習していた
      if (diffDays === 1) {
        //型の確認
        nextStreak =
          (typeof data.streakCount === 'number'
            ? data.streakCount
            : parseInt(String(data.streakCount ?? 0), 10)) + 1
      } else {
        nextStreak = 1 // 1日以上空いたらリセット
      }
    }

    await updateDoc(userRef, {
      streakCount: nextStreak,
      lastStudiedAt: serverTimestamp(),
    })
  }

  // 0埋め
  const pad2 = (n: number) => String(n).padStart(2, '0')

  // その日のドキュメントID（YYYYMMDD）と各種メタ
  const getDayKeyAndMeta = (d = new Date()) => {
    const year = d.getFullYear()
    const month = d.getMonth() + 1
    const day = d.getDate()
    const id = `${year}${pad2(month)}${pad2(day)}`
    const yearMonth = `${year}-${pad2(month)}`

    // ISO週/年の算出
    const { isoWeek, isoYear } = getIsoWeekYear(d)

    return {
      id,
      year,
      month,
      day,
      yearMonth,
      isoWeek,
      isoYear,
      date: Timestamp.fromDate(new Date(year, month - 1, day, 0, 0, 0, 0)),
    }
  }

  // ISO週番号とISO年を返す（週の始まりは月曜）
  function getIsoWeekYear(date: Date) {
    const tmp = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    )
    // 木曜の週に属すると定義されるため、木曜基準に移動
    const dayNum = tmp.getUTCDay() || 7
    tmp.setUTCDate(tmp.getUTCDate() + 4 - dayNum)
    const isoYear = tmp.getUTCFullYear()
    const yearStart = new Date(Date.UTC(isoYear, 0, 1))
    const isoWeek = Math.ceil(
      ((tmp.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
    )
    return { isoWeek, isoYear }
  }

  // 1回の学習完了で増やす枚数を引数に
  const updateStudyLogOnComplete = async (addCount: number) => {
    // if (!auth.currentUser || isMockTime()) return // モック時間は書かない
    if (!addCount || addCount <= 0) return

    const uid = auth.currentUser.uid
    const { id, year, month, day, yearMonth, isoWeek, isoYear, date } =
      getDayKeyAndMeta(new Date())
    const ref = doc(db, `users/${uid}/studyLogs/${id}`)

    // setDoc + merge と increment で原子的に加算
    await setDoc(
      ref,
      {
        count: increment(addCount), //現在値に加算する
        // 初回作成時に必要なメタが無ければ付与、あれば温存（merge）
        year,
        month,
        day,
        yearMonth,
        isoWeek,
        isoYear,
        date, // その日0時の Timestamp（集計キー）
        updatedAt: serverTimestamp(),
      },
      { merge: true }, //現在値を置き換える
    )
  }

  const handleNavigateWithSave = (screen: string) => {
    // 完了済みでなく、1枚以上進んでいたら保存
    if (!isCompletedRef.current && currentCardRef.current > 0) {
      updateStudyLogOnComplete(currentCardRef.current).catch((e) =>
        console.error('中断時studyLog更新失敗:', e),
      )
    }
    router.push(`/${screen.toLowerCase()}`)
  }

  useEffect(() => {
    if (!auth.currentUser) return

    const fetchBookmarkedFlashcards = async () => {
      const deckRef = collection(db, `users/${auth.currentUser?.uid}/decks`)
      const snapshot = await getDocs(deckRef)

      const items: Flashcard[] = []

      for (const deckDoc of snapshot.docs) {
        const flashcardRef = collection(
          db,
          `users/${auth.currentUser?.uid}/decks/${deckDoc.id}/flashcards`,
        )
        const q = query(flashcardRef, where('isBookmarked', '==', true))
        const flashcardSnap = await getDocs(q)

        flashcardSnap.forEach((flashcardDoc) => {
          items.push({
            id: flashcardDoc.id,
            question: flashcardDoc.data().front,
            answer: flashcardDoc.data().back,
            isBookmarked: true,
            repetition: flashcardDoc.data().repetition,
            interval: flashcardDoc.data().interval,
            efactor: flashcardDoc.data().efactor,
            nextReview: flashcardDoc.data().nextReview,
            createdAt: flashcardDoc.data().createdAt || Timestamp.now(),
            deckId: deckDoc.id,
            deckName: deckDoc.data().name,
          })
        })
      }

      console.log('読み込みしたBookmarkフラッシュカード: ', items.length)

      // シャッフル
      const shuffled = [...items]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }

      setFlashCards(shuffled)
    }

    fetchBookmarkedFlashcards()
  }, [])

  // 問題表示時
  useEffect(() => {
    if (
      autoSpeakEnabled &&
      flashcards &&
      flashcards.length > 0 &&
      currentCard < flashcards.length
    ) {
      Speech.stop() // 👈 先に読み上げを停止
      speakQuestion(flashcards[currentCard].question)
      setIsBookmarked(flashcards[currentCard].isBookmarked || false) //setIsBookmarked(flashcards[currentCard].isBookmarked || false)
    }
  }, [currentCard, flashcards, speakQuestion, autoSpeakEnabled])

  // 回答表示時
  useEffect(() => {
    const speakAnswer = (text: string) => {
      Speech.stop() // 👈 先に読み上げを停止
      const lang = detectLanguage(text)
      Speech.speak(text, {
        language: lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP',
        rate: 0.85,
        pitch: 1.1,
      })
    }

    if (
      autoSpeakEnabled &&
      showReviewButtons &&
      flashcards &&
      flashcards.length > 0 &&
      currentCard < flashcards.length
    ) {
      speakAnswer(flashcards[currentCard].answer)
    }
  }, [showReviewButtons, currentCard, flashcards, autoSpeakEnabled])

  useEffect(() => {
    currentCardRef.current = currentCard
  }, [currentCard])

  useEffect(() => {
    if (flashcards && currentCard >= flashcards.length) {
      setShowCongratsModal(true)
    }
  }, [currentCard, flashcards])

  // 中断時にstudyLogを更新
  useEffect(() => {
    return () => {
      if (!isCompletedRef.current && currentCardRef.current > 0) {
        updateStudyLogOnComplete(currentCardRef.current).catch((e) =>
          console.error('中断時studyLog更新失敗:', e),
        )
      }
    }
  }, [])

  // セッション開始時に初期化
  useEffect(() => {
    isCompletedRef.current = false
    currentCardRef.current = 0
  }, [])

  return (
    <View style={styles.container}>
      <View style={styles.progressWrapper}>
        <ProgressBar
          progress={
            flashcards && flashcards.length > 0
              ? currentCard / flashcards.length
              : 0
          }
        />
        <Text style={styles.nextReviewText}>
          {flashcards && flashcards.length > 0
            ? `${currentCard} / ${flashcards.length}（完了）`
            : ''}
        </Text>
      </View>

      {/* Question & Answer */}
      <View style={styles.cardContainer}>
        {/* cardHeader */}
        <View style={styles.cardHeader}>
          {/* 戻るボタン */}
          <TouchableOpacity
            onPress={handlePreviousCard}
            disabled={!canGoBack}
            style={[styles.backButton, { opacity: canGoBack ? 1 : 0 }]}
          >
            <Ionicons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
          {/* お気に入り（スター） */}
          <TouchableOpacity>
            <Ionicons
              name={
                flashcards?.[currentCard]?.isBookmarked
                  ? 'bookmark'
                  : 'bookmark-outline'
              }
              size={40}
              color={
                flashcards?.[currentCard]?.isBookmarked ? '#467FD3' : '#aaa'
              }
              onPress={() =>
                handleToggleBookmark(
                  flashcards?.[currentCard]?.deckId as string,
                  flashcards?.[currentCard]?.id ?? '',
                  flashcards?.[currentCard]?.isBookmarked ?? false,
                )
              }
            />
          </TouchableOpacity>

          {/* 三点メニュー */}
          <TouchableOpacity
            onPress={() =>
              handleMorePress(
                flashcards?.[currentCard]?.deckId,
                flashcards?.[currentCard]?.deckName,
                flashcards?.[currentCard]?.id,
                flashcards?.[currentCard]?.question,
                flashcards?.[currentCard]?.answer,
                flashcards?.[currentCard]?.isBookmarked,
              )
            }
          >
            <Feather name="more-vertical" size={32} color="#444" />
          </TouchableOpacity>
        </View>

        <View>
          {flashcards && flashcards.length > 0 ? (
            currentCard >= flashcards.length ? (
              <Text style={styles.cardText}>
                全てのカードを{'\n'}終了しました 🎉
              </Text>
            ) : !showReviewButtons ? (
              <ScrollView
                style={{ maxHeight: 300 }}
                contentContainerStyle={{ justifyContent: 'center' }}
              >
                <Text style={styles.cardText}>
                  {flashcards[currentCard].question}
                </Text>
              </ScrollView>
            ) : (
              <View style={styles.answerWrapper}>
                <ScrollView
                  style={{ maxHeight: 300 }}
                  contentContainerStyle={{ justifyContent: 'center' }}
                >
                  <Text style={styles.answerText}>
                    {flashcards[currentCard].answer}
                  </Text>
                </ScrollView>
              </View>
            )
          ) : (
            <Text style={styles.cardText}>
              新しいカードを{'\n'}追加してみましょう
            </Text>
          )}
        </View>

        {flashcards &&
          flashcards.length > 0 &&
          currentCard < flashcards.length && (
            <CircleButton
              onPress={() => setAutoSpeakEnabled(!autoSpeakEnabled)}
              backgroundColor={autoSpeakEnabled}
            >
              <Ionicons name="volume-high-outline" size={40} color="#2C64C6" />
            </CircleButton>
          )}
      </View>

      <Footer
        current="BookmarkFlashcard"
        // onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
        onNavigate={handleNavigateWithSave}
        deckId={deckId}
        deckName={deckName}
      />

      <Modal visible={showCongratsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}> 全てのカードを終了しました</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                isCompletedRef.current = true 
                updateStreakOnComplete().catch((e) =>
                  console.error('streak 更新失敗:', e),
                ) 
                updateStudyLogOnComplete(flashcards?.length ?? 0) 
                setShowCongratsModal(false)
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {flashcardModalVisible && (
        <FlashcardActionSheetComponent
          visible={flashcardModalVisible}
          onClose={() => setFlashcardModalVisible(false)}
          deckId={selectedCard?.deckId}
          deckName={selectedCard?.deckName}
          flashcardId={selectedCard?.flashcardId}
          flashcardFront={selectedCard?.flashcardFront}
          flashcardBack={selectedCard?.flashcardBack}
        />
      )}

      {/* answerButton & reviewButton */}
      {flashcards &&
        currentCard < flashcards.length &&
        (!showReviewButtons ? (
          <View style={styles.answerButton}>
            <AnswerButton label="回答を表示" onPress={handleShowAnswer} />
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <ReviewButton
              label="もう一度"
              color="#B90101"
              onPress={() => handleNextCard(1)}
            />
            <ReviewButton
              label="できた"
              color="#26B502"
              onPress={() => handleNextCard(4)}
            />
            <ReviewButton
              label="簡単"
              color="#2F79E7"
              onPress={() => handleNextCard(5)}
            />
          </View>
        ))}
    </View>
  )
}

export default BookmarkReviewScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    paddingTop: 50,
  },
  backButton: {
    backgroundColor: 'rgba(70, 127, 211, 0.25)',
    padding: 10,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3, // Android用影
  },
  cardContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 200,
    padding: 24,
    borderWidth: 2,
    borderColor: '#DDD',
    borderRadius: 16,
    backgroundColor: '#F9F9F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeader: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 28, //少し小さめに
    textAlign: 'left',
  },
  hiddenText: {
    fontSize: 18,
    color: '#467FD3',
    fontWeight: 'bold',
  },
  answerWrapper: {
    alignItems: 'center',
  },
  answerText: {
    fontSize: 32,
    color: '#467FD3',
    fontWeight: 'bold',
    textAlign: 'left',
  },
  nextReviewText: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
  SoundIcon: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(70, 127, 211, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android用の影
  },
  answerButton: {
    alignItems: 'center',
  },
  answerButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#467FD3',
    marginBottom: 10,
  },
  modalSubText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#467FD3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
    position: 'absolute',
    bottom: 100,
  },
})
