import { Ionicons, Feather } from '@expo/vector-icons'
import { useLocalSearchParams ,useRouter} from 'expo-router'
import * as Speech from 'expo-speech'
import {
  collection,
  doc,
  getDocs,
  updateDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native'
import { auth, db } from '../../config'
import AnswerButton from '../components/AnswerButton'
import CircleButton from '../components/CircleButton'
import FlashcardActionSheetComponent from '../components/FlashcardModal'
import ProgressBar from '../components/ProgressBar'
import ReviewButton from '../components/ReviewButton'
import { calculateSM2 } from '../utils/srs'
import Footer from '../components/Footer'

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
  repetition: number
  interval: number
  efactor: number
  nextReview: Timestamp
  createdAt: Timestamp
}

const FlashcardScreen = (): JSX.Element => {
  const router = useRouter()

  const { deckId, deckName } = useLocalSearchParams<{
    deckId: string
    deckName: string
    flashcardId: string
    flashcardFront: string
    flashcardBack: string
    tags: string // 配列は文字列で渡される可能性あり
  }>()

  const [, setShowAnswer] = useState(false)
  const [flashcardModalVisible, setFlashcardModalVisible] = useState(false)
  const [showReviewButtons, setShowReviewButtons] = useState(false)
  const [, setDecks] = useState<Deck[]>([])
  const [currentCard, setCurrentCard] = useState(0)
  const [flashcards, setFlashCards] = useState<Flashcard[]>()
  const [showCongratsModal, setShowCongratsModal] = useState(false)
  const [selectedCard, setSelectedCard] = useState<{
    deckId: string
    deckName: string
    flashcardId: string
    flashcardFront: string
    flashcardBack: string
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

  const isBookmarked = true

  const toggleBookmark = () => {}

  const handleMorePress = (
    deckId: string,
    deckName: string,
    flashcardId: string,
    flashcardFront: string,
    flashcardBack: string,
  ) => {
    setSelectedCard({
      deckId: deckId,
      deckName: deckName,
      flashcardId: flashcardId,
      flashcardFront: flashcardFront,
      flashcardBack: flashcardBack,
    })

    setFlashcardModalVisible(true)

    console.log(flashcardModalVisible)
  }

  const handleShowAnswer = () => {
    setShowAnswer(true)
    setShowReviewButtons(true)
  }

  const calculateNextInterval = async (score: number) => {
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

    if (auth.currentUser && deckId && id) {
      const ref = doc(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards/${id}`,
      )
      await updateDoc(ref, {
        repetition: newRepetition,
        interval: newInterval,
        efactor: newEfactor,
        nextReview: Timestamp.fromDate(nextReviewDate),
      })
    }
  }

  const handleNextCard = async (score: number) => {
    if (score === 1) {
      // Again の場合：スコアを 0 にして、nextReview は今のまま or 1分後に設定
      await calculateNextInterval(0)
      setShowAnswer(false)
      setShowReviewButtons(false)
      setCurrentCard((prev) => prev + 1)
    } else {
      await calculateNextInterval(score)
      setShowAnswer(false)
      setShowReviewButtons(false)
      setCurrentCard((prev) => prev + 1)
    }
  }

  const speakQuestion = React.useCallback((text: string) => {
    const lang = detectLanguage(text)

    Speech.speak(text, {
      language: lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP',
      rate: 1.0,
      pitch: 1.0,
    })
  }, [])

  useEffect(() => {
    if (!auth.currentUser) return

    const now = new Date()
    const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`)

    // 🔁 リアルタイムで監視
    const unsubscribe = onSnapshot(deckRef, async (snapshot) => {
      const deckList: Deck[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const flashcardRef = collection(
            db,
            `users/${auth.currentUser?.uid}/decks/${doc.id}/flashcards`,
          )

          // 全体数
          const allSnap = await getDocs(flashcardRef)
          const totalCount = allSnap.size

          // 今日の復習対象
          const q = query(
            flashcardRef,
            where('nextReview', '<=', Timestamp.fromDate(now)),
          )
          const reviewSnap = await getDocs(q)
          const reviewCount = reviewSnap.size

          return {
            id: doc.id,
            name: doc.data().name,
            tag: doc.data().tag,
            cardCount: reviewCount,
            totalCount: totalCount,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }
        }),
      )
      setDecks(deckList)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchFlashCard = async () => {
      if (!auth.currentUser) return

      const now = new Date()

      const ref = collection(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards`,
      )
      const q = query(ref, where('nextReview', '<=', Timestamp.fromDate(now))) //復習カードを抽出

      const snapshot = await getDocs(q)

      const dueFlashCardList: Flashcard[] = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          question: data.front,
          answer: data.back,
          repetition: data.repetition,
          interval: data.interval,
          efactor: data.efactor,
          nextReview: data.nextReview,
          createdAt: data.createdAt || Timestamp.now(),
        }
      })

      // 🔀 Fisher-Yatesアルゴリズムでシャッフル
      for (let i = dueFlashCardList.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[dueFlashCardList[i], dueFlashCardList[j]] = [
          dueFlashCardList[j],
          dueFlashCardList[i],
        ]
      }

      setFlashCards(dueFlashCardList)
    }

    fetchFlashCard()
  }, [deckId])

  // 問題表示時
  useEffect(() => {
    if (
      flashcards &&
      flashcards.length > 0 &&
      currentCard < flashcards.length
    ) {
      speakQuestion(flashcards[currentCard].question)
    }
  }, [currentCard, flashcards, speakQuestion])

  // 回答表示時
  useEffect(() => {
    const speakAnswer = (text: string) => {
      const lang = detectLanguage(text)
      Speech.speak(text, {
        language: lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP',
        rate: 1.0,
        pitch: 1.0,
      })
    }

    if (
      showReviewButtons &&
      flashcards &&
      flashcards.length > 0 &&
      currentCard < flashcards.length
    ) {
      speakAnswer(flashcards[currentCard].answer)
    }
  }, [showReviewButtons, currentCard, flashcards])

  useEffect(() => {
    if (flashcards && currentCard >= flashcards.length) {
      setShowCongratsModal(true)
    }
  }, [currentCard, flashcards])

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
          {/* お気に入り（スター） */}
          <TouchableOpacity onPress={toggleBookmark}>
            <Feather
              name={isBookmarked ? 'bookmark' : 'bookmark'}
              size={32}
              color={isBookmarked ? '#467FD3' : '#aaa'}
            />
          </TouchableOpacity>

          {/* 三点メニュー */}
          <TouchableOpacity
            onPress={() =>
              handleMorePress(
                deckId,
                deckName,
                flashcards?.[currentCard]?.id,
                flashcards?.[currentCard]?.question,
                flashcards?.[currentCard]?.answer,
              )
            }
          >
            <Feather name="more-vertical" size={32} color="#444" />
          </TouchableOpacity>
        </View>

        {flashcards && flashcards.length > 0 ? (
          currentCard >= flashcards.length ? (
            <Text style={styles.cardText}>
              全てのカードを{'\n'}終了しました 🎉
            </Text>
          ) : !showReviewButtons ? (
            <Text style={styles.cardText}>
              {flashcards[currentCard].question}
            </Text>
          ) : (
            <View style={styles.answerWrapper}>
              <Text style={styles.answerText}>
                {flashcards[currentCard].answer}
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.cardText}>
            新しいカードを{'\n'}追加してみましょう
          </Text>
        )}

        {flashcards &&
          flashcards.length > 0 &&
          currentCard < flashcards.length && (
            <CircleButton
              onPress={() =>
                speakQuestion(
                  showReviewButtons
                    ? flashcards[currentCard].answer
                    : flashcards[currentCard].question,
                )
              }
            >
              <Ionicons name="volume-high-outline" size={40} color="#2C64C6" />
            </CircleButton>
          )}
      </View>
      
      <Footer
        current="Flashcard"
        onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
        deckId={deckId}
        deckName={deckName}
      />

      <Modal visible={showCongratsModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}> 全てのカードを終了しました</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowCongratsModal(false)}
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
          deckId={deckId}
          deckName={deckName}
          flashcardId={selectedCard?.flashcardId}
          flashcardFront={selectedCard?.flashcardFront}
          flashcardBack={selectedCard?.flashcardBack}
        />
      )}

      {/* answerButton & reviewButton */}
      {flashcards &&
        currentCard < flashcards.length &&
        (!showReviewButtons ? (
          <AnswerButton label="Show Answer" onPress={handleShowAnswer} />
        ) : (
          <View style={styles.buttonContainer}>
            <ReviewButton
              label="Again"
              color="#B90101"
              onPress={() => handleNextCard(1)}
            />
            <ReviewButton
              label="Good"
              color="#26B502"
              onPress={() => handleNextCard(4)}
            />
            <ReviewButton
              label="Easy"
              color="#2F79E7"
              onPress={() => handleNextCard(5)}
            />
          </View>
        ))}
    </View>
  )
}

export default FlashcardScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    paddingTop: 50,
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
    fontSize: 32,
    textAlign: 'center',
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
    textAlign: 'center',
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
    position: 'absolute',
    bottom: 25,
    left: '50%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#467FD3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 30,
    width: 200,
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
