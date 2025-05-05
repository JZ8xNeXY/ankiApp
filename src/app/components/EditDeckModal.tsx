import { doc, updateDoc } from 'firebase/firestore'
import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { auth, db } from '../../config'

interface EditDeckModalProps {
  visible: boolean
  onClose: () => void
  deckId: string
  currentName: string
  currentTag: string| null
  onUpdateDeck: (deckId: string, newName: string,newTags:string|null) => void
}

const EditDeckModal: React.FC<EditDeckModalProps> = ({
  visible,
  onClose,
  deckId,
  currentName,
  currentTag,
  onUpdateDeck,
}) => {
  const [newDeckName, setNewDeckName] = useState('')
  const [newDeckTag, setNewDeckTag] = useState<string | null | undefined>()

  const handleUpdateDeck = async () => {
    if (!newDeckName.trim()) {
      alert('デッキ名を入力してください')
      return
    }
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }
    if (!deckId) {
      alert('編集するデッキが見つかりません')
      return
    }

    try {
      const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, deckId)
      await updateDoc(deckRef, { name: newDeckName,tag: newDeckTag})

      onUpdateDeck(deckId, newDeckName, newDeckTag ? newDeckTag.split(',').map(tag => tag.trim()) : [])
      setNewDeckName('')
      setNewDeckTag('')

      onClose()
    } catch (error) {
      console.error('デッキ編集エラー: ', error)
      alert('デッキの編集に失敗しました')
    }
  }

  useEffect(() => {
    setNewDeckName(currentName)
    setNewDeckTag(currentTag)
  }, [currentName,currentTag, visible])

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>デッキを編集する</Text>
          <TextInput
            style={styles.input}
            placeholder="デッキ名を入力"
            value={newDeckName}
            onChangeText={setNewDeckName}
          />
          <TextInput
            style={styles.input}
            placeholder="タグを入力"
            value={newDeckTag ?? ''}
            onChangeText={setNewDeckTag}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.save]}
              onPress={handleUpdateDeck}
            >
              <Text style={styles.buttonText}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default EditDeckModal

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
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
  save: {
    backgroundColor: '#467FD3',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
})
