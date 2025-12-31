import {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  QuerySnapshot,
  getCountFromServer,
} from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, FlatList } from 'react-native'
import { auth, db } from '../../config'
import ProgressBar from './progressBar'

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
  const [deckList, setDeckList] = useState<Deck[]>([])
  const [, setTotalCards] = useState(0)
  const [, setTotalReviewCards] = useState(0)
  const [, setDone] = useState(0)
  const [, setProgress] = useState(0)

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
        const allSnap = await getCountFromServer(flashcardRef)
        const totalCount = allSnap.data().count

        // 各デッキの復習対象カード数
        const reviewSnap = await getCountFromServer(
          query(
            flashcardRef,
            where('nextReview', '<=', Timestamp.fromDate(now)),
          ),
        )
        const reviewCount = reviewSnap.data().count

        return {
          id: d.id,
          name: d.data().name,
          tag: d.data().tag,
          cardCount: reviewCount,
          totalCount: totalCount,
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
      },
      (err) => {
        console.error('onSnapshot error:', err)
      },
    )

    return () => unsubscribe()
  }, [])

  return (
    <FlatList
      data={deckList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
      renderItem={({ item }) => {
        const done = Math.max(item.totalCount - item.cardCount, 0)
        const progress = item.totalCount ? done / item.totalCount : 0

        return (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.label}>{item.name}</Text>
              <Text style={[styles.value, styles.num]}>
                {done.toLocaleString()} / {item.totalCount.toLocaleString()} 枚
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>進捗</Text>
              <Text style={[styles.value, styles.num]}>
                {Math.floor(progress * 100)}%
              </Text>
            </View>

            <View style={styles.progressRow}>
              <ProgressBar progress={progress} />
            </View>
          </View>
        )
      }}
      // 長いリストなら最適化オプション
      initialNumToRender={6}
      windowSize={7}
    />
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
