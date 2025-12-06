import { router, useLocalSearchParams } from 'expo-router'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { auth, db } from '../../config'

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
}

const EditDeck = (): JSX.Element => {
  const { deckId } = useLocalSearchParams<{
    deckId: string
    deckName: string
  }>()

  const { flashcardId } = useLocalSearchParams<{
    flashcardId: string
    front: string
    back: string
    tags: string[]
  }>()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [tags, setTags] = useState('')
  const [, setFlashCard] = useState<Flashcard>()
  
  // SM2関連
  const [interval] = useState(0) 

  const handleEditFlashCard = async () => {
    if (!front.trim() || !back.trim()) {
      alert('FRONTとBACKを入力してください')
      return
    }
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }

    try {
      const now = new Date()
      const ref = doc(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards/${flashcardId}`,
      )
      await setDoc(ref, {
        front,
        back,
        tags,
        isBookmarked,
        repetition: 0,
        interval: 1,
        efactor: 2.5,
        nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
      })

      alert('カードを更新しました')
      router.back()
    } catch (error) {
      console.error('カード追加エラー: ', error)
      alert('カードの追加に失敗しました')
    }
  }

  useEffect(() => {
    const fetchFlashCard = async () => {
      if (!auth.currentUser || !deckId || !flashcardId) return

      const ref = doc(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards/${flashcardId}`,
      )
      const snapshot = await getDoc(ref)
      const data = snapshot.data()
      if (data) {
        const flashcard: Flashcard = {
          id: snapshot.id,
          question: data.front,
          answer: data.back,
          createdAt: data.createdAt || Timestamp.now(),
          isBookmarked: data.isBookmarked || false,
          repetition: data.repetition,
          interval: data.interval,
          efactor: data.efactor,
          nextReview: data.nextReview,
        }
        setFlashCard(flashcard)
        setFront(data.front)
        setBack(data.back)
        setIsBookmarked(data.isBookmarked || false)
        setTags(data.tags || '')
      }
    }

    fetchFlashCard()
  }, [deckId, flashcardId])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.headerText}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>カードの修正</Text>
          <TouchableOpacity onPress={handleEditFlashCard}>
            <Text style={styles.headerText}>保存</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>問題</Text>
          <TextInput
            style={styles.input}
            multiline={true}
            value={front}
            onChangeText={setFront}
          />
          <Text style={styles.label}>回答</Text>
          <TextInput
            style={styles.input}
            multiline={true}
            value={back}
            onChangeText={setBack}
          />
          {/* TODO タグ */}
          {/* <Text style={styles.label}>TAGS</Text>
          <TextInput style={styles.input} value={tags} onChangeText={setTags} /> */}
        </View>

        {/* TODO 補助ツールエリア */}
        <View style={styles.tools}>
          {/* <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolText}>翻訳</Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default EditDeck

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    color: '#467FD3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    height: 100,
    borderRadius: 6,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  toolButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#467FD3',
    borderRadius: 6,
  },
  toolText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
