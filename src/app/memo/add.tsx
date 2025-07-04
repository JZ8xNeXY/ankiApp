import { router, useLocalSearchParams } from 'expo-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import { Dimensions } from 'react-native'
import { auth, db } from '../../config'
import AddFlashcardModal from '../components/addFlashcardModal'

const AddCard = (): JSX.Element => {
  const { deckId } = useLocalSearchParams<{
    deckId: string
    deckName: string
  }>()

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [tags, setTags] = useState('')
  const [addModalVisible, setAddModalVisible] = useState(false)

  // SM2関連
  const [interval] = useState(0) // 前回の復習間隔（分や日）

  const handleAddFlashCard = async () => {
    if (!front.trim() || !back.trim()) {
      alert('FRONTとBACKを入力してください')
      return
    }
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }
    const now = new Date()
    try {
      const ref = collection(
        db,
        `users/${auth.currentUser.uid}/decks/${deckId}/flashcards`,
      )
      await addDoc(ref, {
        front,
        back,
        tags,
        repetition: 0,
        interval: 1,
        efactor: 2.5,
        nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
      })

      Alert.alert(
        'カードを追加しました！',
        '続けて登録しますか？',
        [
          {
            text: '戻る',
            onPress: () => router.push('/'),
            style: 'cancel',
          },
          {
            text: '続けて追加',
            onPress: () => {
              setFront('')
              setBack('')
              setTags('')
            },
          },
        ],
        { cancelable: false },
      )
    } catch (error) {
      console.error('カード追加エラー: ', error)
      alert('カードの追加に失敗しました')
    }
  }

  const handleCreateFlashCard = async (
    front: string,
    back: string,
    tags: string,
  ) => {
    setFront(front)
    setBack(back)
    setTags(tags)
    setAddModalVisible(false)
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.inner}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.push('/')}>
              <Text style={styles.headerText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>新規カード</Text>
            <TouchableOpacity onPress={handleAddFlashCard}>
              <Text style={styles.headerText}>保存</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>問題</Text>

            <TextInput
              style={styles.input}
              multiline={true}
              placeholder="例: 日本の首都は？"
              value={front}
              onChangeText={setFront}
            />
            <Text style={styles.label}>回答</Text>
            <TextInput
              style={styles.input}
              multiline={true}
              placeholder="例: 東京"
              value={back}
              onChangeText={setBack}
            />
            {/* TODO タグ */}
            {/* <Text style={styles.label}>TAGS</Text>
            <TextInput
              style={styles.input}
              placeholder="例: Country, Capitol"
              value={tags}
              onChangeText={setTags}
            /> */}
          </View>

          {/* TODO 補助ツールエリア */}
          <View style={styles.tools}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={() => setAddModalVisible(true)}
            >
              <Text style={styles.toolButtonText}>AIでカード作成支援</Text>
            </TouchableOpacity>
          </View>

          {/* モーダルを表示 */}
          <AddFlashcardModal
            visible={addModalVisible}
            onClose={() => setAddModalVisible(false)}
            onCreateFlashcard={handleCreateFlashCard}
          />
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  )
}

export default AddCard

const screenWidth = Dimensions.get('window').width

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
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  tools: {
    alignItems: 'center',
  },
  toolButton: {
    position: 'absolute',
    bottom: 60,
    width: screenWidth * 0.7,
    backgroundColor: '#2C64C6',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  toolButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
})
