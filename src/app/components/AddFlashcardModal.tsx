import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { auth } from '../../config'
import generateFlashcard from '../utils/chatgptApi'
import CustomRadioButton from './CustomRadioButton'

interface AddFlashcardModalProps {
  visible: boolean
  onClose: () => void
  onCreateFlashcard: (front: string, back: string, tag: string) => void
}
const AddFlashcardModal: React.FC<AddFlashcardModalProps> = ({
  visible,
  onClose,
  onCreateFlashcard,
}) => {
  const [keyword, setKeyword] = useState('')
  const [selectedOption, setSelectedOption] = useState<
    null | 'en' | 'zh' | 'explain' | 'blank'
  >(null)

  const handleAddFlashcard = async () => {
    if (!keyword.trim()) {
      alert('キーワードを入力してください')
      return
    }
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }
    try {
      // 指示を付加
      let prompt = ''

      switch (selectedOption) {
        case 'en':
          prompt = `Create a flashcard that translates the Japanese word "${keyword}" into English.\n`
          break
        case 'zh':
          prompt = `Create a flashcard that translates the Japanese word "${keyword}" into Chinese.\n`
          break
        case 'explain':
          prompt = `Create a flashcard that explains the term "${keyword}" in Japanese.\n`
          break
        // case 'blank':
        //   prompt = `Create a fill-in-the-blank flashcard using the word "${keyword}".\n`;
        //   break;
        default:
          prompt = `Create a general learning flashcard for the word "${keyword}".\n`
      }

      if (!prompt) {
        prompt =
          `Create a general learning flashcard for the word "${keyword}".\n` +
          `Format: {"question": "...", "answer": "..."}\n` +
          `Return only valid pure JSON.`
      }

      const result = await generateFlashcard(prompt)
      console.log('生成されたprompt: ', prompt)
      if (result) {
        onCreateFlashcard(result.front, result.back, result.tag)
      } else {
        alert('フラッシュカードの生成に失敗しました')
      }
      setKeyword('')
      onClose()
    } catch (error) {
      console.error('フラッシュカード追加エラー: ', error)
      alert('フラッシュカードの追加に失敗しました')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>カードを作成する</Text>
          <TextInput
            style={styles.input}
            placeholder="キーワードを入力"
            value={keyword}
            onChangeText={setKeyword}
          />
          <View style={styles.radioContainer}>
            <CustomRadioButton
              label="日→英 翻訳"
              selected={selectedOption === 'en'}
              onSelect={() => setSelectedOption('en')}
            />
            <CustomRadioButton
              label="日→中 翻訳"
              selected={selectedOption === 'zh'}
              onSelect={() => setSelectedOption('zh')}
            />
            <CustomRadioButton
              label="用語解説"
              selected={selectedOption === 'explain'}
              onSelect={() => setSelectedOption('explain')}
            />
            {/* <CustomRadioButton
              label="穴埋め"
              selected={selectedOption === 'blank'}
              onSelect={() => setSelectedOption('blank')}
            /> */}
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.add]}
              onPress={handleAddFlashcard}
            >
              <Text style={styles.buttonText}>作成</Text>
            </TouchableOpacity>
          </View>
          <View>
            <Text style={styles.notice}>
              ※カードはキーワードをもとにAIが自動生成します。内容は必ずご自身でご確認・修正ください。
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default AddFlashcardModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // 背景を半透明に
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  radioContainer: {
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  add: {
    backgroundColor: '#467FD3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  notice: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
    textAlign: 'left',
  },
})
