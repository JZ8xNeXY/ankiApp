import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore'
import { auth, db } from '../../config'
import { Ionicons,Feather } from '@expo/vector-icons'
import Footer from '../components/Footer'
import * as Speech from 'expo-speech'
import { router } from 'expo-router'

interface BookmarkedFlashcard {
  deckId: string
  deckName: string
  flashcardId: string
  question: string
  answer: string
}

const Bookmark = (): JSX.Element => {
  const [bookmarkedItems, setBookmarkedItems] = useState<BookmarkedFlashcard[]>([])

  const detectLanguage = (text: string): 'en' | 'ja' | 'zh' => {
    const hasEnglish = /[a-zA-Z]/.test(text)
    const hasHiraganaOrKatakana = /[\u3040-\u30FF]/.test(text)
    const hasChineseCharacters = /[\u4E00-\u9FFF]/.test(text)

    if (hasEnglish) return 'en'
    if (hasHiraganaOrKatakana) return 'ja'
    if (hasChineseCharacters) return 'zh'
    return 'ja'
  }

  const speak = React.useCallback((text: string) => {
    const lang = detectLanguage(text)

    Speech.speak(text, {
      language: lang === 'en' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'ja-JP',
      rate: 1.0,
      pitch: 1.0,
    })
  }, [])

  useEffect(() => {
    if (!auth.currentUser) return

    const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`)

    const unsubscribe = onSnapshot(
      query(deckRef, orderBy('order')), // ← 順番があるならそのまま活用
      async (snapshot) => {
        const items: BookmarkedFlashcard[] = []

        for (const doc of snapshot.docs) {
          const deckId = doc.id
          const deckName = doc.data().name

          const flashcardRef = collection(
            db,
            `users/${auth.currentUser?.uid}/decks/${deckId}/flashcards`,
          )
          const q = query(flashcardRef, where('isBookmarked', '==', true))
          const flashcardSnap = await getDocs(q)

          flashcardSnap.forEach((flashcardDoc) => {
            items.push({
              deckId,
              deckName,
              flashcardId: flashcardDoc.id,
              question: flashcardDoc.data().front,
              answer: flashcardDoc.data().back,
            })
          })
        }

        setBookmarkedItems(items)
      },
    )

    return () => unsubscribe()
  }, [])

  const renderItem = ({ item }: { item: BookmarkedFlashcard }) => (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => speak(item.question)}>
        <Ionicons name="volume-high-outline" size={20} color="#467FD3" />
      </TouchableOpacity>
      <View style={{ flex: 1, marginLeft: 12 }}>
        <Text style={styles.question}>{item.question}</Text>
        <Text style={styles.answer}>
          {item.answer.length > 30 ? item.answer.slice(0, 30) + '…' : item.answer}
        </Text>
      </View>
      {/* TODO そのうち機能追加 */}
      {/* <TouchableOpacity onPress={() => console.log('More options')}>
        <Feather name="more-vertical" size={20} color="#444" />
      </TouchableOpacity> */}
    </View>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ブックマーク一覧</Text>
      <FlatList
        data={bookmarkedItems}
        keyExtractor={(item) => item.flashcardId}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>ブックマークはまだありません</Text>}
      />
      <TouchableOpacity
        style={styles.reviewButton}
        onPress={() => {
          router.push('/memo/bookmarkReviewScreen');
        }}
      >
        <Text style={styles.reviewButtonText}>復習する</Text>
      </TouchableOpacity>
      <Footer current="Bookmark" onNavigate={(screen) => console.log(`Navigate to ${screen}`)} />
    </View>
  )
}

export default Bookmark

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    paddingTop: 50,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 16,
    textAlign: 'center',
    color: '#467FD3',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#DDD',
  },
  question: {
    fontSize: 18,
    color: '#333',
    marginBottom: 4,
  },
  answer: {
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 20,
    fontSize: 16,
  },
  reviewButton: {
    position: 'absolute',
    bottom: 75,
    left: '35%',
    transform: [{ translateX: -100 }],
    backgroundColor: '#467FD3',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 30,
    width: 300,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})