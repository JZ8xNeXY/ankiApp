import {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  QuerySnapshot,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { auth, db } from '../../config'
import ProgressBar from '../components/progressBar'
import { isMockTime } from '../dev/mockTime'

interface Deck {
  id: string
  name: string
  tag: string | null
  cardCount: number // 復習対象
  totalCount: number // 全体数
  createdAt?: Timestamp
  order?: number
}

const ProgressIndividualCard = () => {
  const [, setDeckList] = useState<Deck[]>([])
  const [totalCards, setTotalCards] = useState(0)
  const [, setTotalReviewCards] = useState(0)
  const [done, setDone] = useState(0)
  const [progress, setProgress] = useState(0)

  const fetchDeckList = async (snapshot: QuerySnapshot) => {
    const now = new Date()

    // 1) デッキごとの件数を集計
    const deckList: Deck[] = await Promise.all(
      snapshot.docs.map(async (d) => {
        const flashcardRef = collection(
          db,
          `users/${auth.currentUser?.uid}/decks/${d.id}/flashcards`,
        )

        // 各デッキの総カード数
        const allSnap = await getDocs(flashcardRef)
        const totalCount = allSnap.size

        // 各デッキの復習対象カード数
        const reviewSnap = await getDocs(
          query(
            flashcardRef,
            where('nextReview', '<=', Timestamp.fromDate(now)),
          ),
        )
        const reviewCount = reviewSnap.size

        return {
          id: d.id,
          name: d.data().name,
          tag: d.data().tag,
          cardCount: reviewCount,
          totalCount,
          createdAt: d.data().createdAt?.toDate() || new Date(),
          order: d.data().order || 0,
        }
      }),
    )

    // 2) 配列ができてから合計
    const totalCards = deckList.reduce((sum, deck) => sum + deck.totalCount, 0)
    const totalReviewCards = deckList.reduce(
      (sum, deck) => sum + deck.cardCount,
      0,
    )

    const done = Math.max(totalCards - totalReviewCards, 0)
    const progress = totalCards ? done / totalCards : 0

    return { deckList, totalCards, totalReviewCards, done, progress }
  }

  useEffect(() => {
    const uid = auth.currentUser?.uid
    if (!uid) {
      console.log('auth 未確定（currentUser なし）')
      return
    }

    if (isMockTime()) {
      setDeckList([
        {
          id: 'mock1',
          name: '模擬デッキ',
          tag: null,
          cardCount: 50,
          totalCount: 100,
        },
        {
          id: 'mock2',
          name: '模擬デッキ2',
          tag: null,
          cardCount: 20,
          totalCount: 200,
        },
      ])
      setTotalCards(300) // 総カード数
      setTotalReviewCards(70) // 復習対象数
      setDone(230) // できたカード数
      setProgress(230 / 300)
      console.log('onSnapshot は開発モードなので停止中')

      return
    }

    const deckRef = collection(db, `users/${uid}/decks`)

    const unsubscribe = onSnapshot(
      query(deckRef, orderBy('order')),
      async (deckSnap) => {
        const result = await fetchDeckList(deckSnap)

        setDeckList(result.deckList)
        setTotalCards(result.totalCards)
        setTotalReviewCards(result.totalReviewCards)
        setDone(result.done)
        setProgress(result.progress)

        console.log('result', result)
      },
      (err) => {
        console.error('onSnapshot error:', err)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={[styles.label]}>カード全体累計</Text>
        <Text style={[styles.value, styles.num]}>
          {totalCards.toLocaleString()}枚
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label]}>できたカード累計</Text>
        <Text style={[styles.value, styles.num]}>
          {done.toLocaleString()}枚
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={[styles.label]}>進捗</Text>
        <Text style={[styles.value, styles.num]}>
          {Math.floor(progress * 100)}%
        </Text>
      </View>

      <View style={styles.progressRow}>
        <ProgressBar progress={progress} />
      </View>
    </View>
  )
}

export default ProgressIndividualCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 16,
    marginTop: 12,
    marginHorizontal: 10,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6e6e6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  label: {
    flexShrink: 1,
    fontSize: 15,
    color: '#4A4A4A',
  },
  value: {
    flexShrink: 0,
    textAlign: 'right',
    color: '#222',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    minWidth: 80,
  },
  num: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 8,
    width: '100%',
  },
  progressRow: {
    width: '100%',
    paddingTop: 2,
  },
})
