import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import React, { useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { auth, db } from '../../config'

interface AddDeckModalProps {
  visible: boolean
  onClose: () => void
  onAddDeck: (deckName: string, deckId: string,decTag:string) => void
}

const AddDeckModal: React.FC<AddDeckModalProps> = ({
  visible,
  onClose,
  onAddDeck,
}) => {
  const [deckName, setDeckName] = useState('')
  const [deckTag, setDeckTag] = useState('')

  const handleAddDeck = async () => {
    if (!deckName.trim()) {
      alert('デッキ名を入力してください')
      return
    }
    if (!auth.currentUser) {
      alert('ログインしてください')
      return
    }

    try {
      const ref = collection(db, `users/${auth.currentUser.uid}/decks`)
      const docRef = await addDoc(ref, {
        name: deckName,
        tap:deckTag,
        cardCount: 0,
        createdAt: serverTimestamp(),
      })

      onAddDeck(deckName, docRef.id, deckTag) 

      setDeckName('')
      onClose()
    } catch (error) {
      console.error('デッキ追加エラー: ', error)
      alert('デッキの追加に失敗しました')
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Add Deck</Text>
          <TextInput
            style={styles.input}
            placeholder="Add Deck Name"
            value={deckName}
            onChangeText={setDeckName}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancel]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.add]}
              onPress={handleAddDeck}
            >
              <Text style={styles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

export default AddDeckModal

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
})
