import { useRouter } from 'expo-router'
import { doc, deleteDoc } from 'firebase/firestore'
import React, { useRef, useEffect } from 'react'
import ActionSheet from 'react-native-actionsheet'
import { auth, db } from '../../config'
import { Alert } from 'react-native'

interface ActionSheetProps {
  visible: boolean
  onClose: () => void
  deckId: string
  deckName: string
  flashcardId?: string
  flashcardFront?: string
  flashcardBack?: string
}

const FlashcardActionSheetComponent: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  deckId,
  deckName,
  flashcardId,
  flashcardFront,
  flashcardBack,
}) => {
  const actionSheetRef = useRef<ActionSheet | null>(null)
  
  console.log('FlashcardActionSheetComponent', {
    visible,
    deckId,
    deckName,
    flashcardId,
    flashcardFront,
    flashcardBack,
  })

  // const showActionSheet = () => {
  //   if (actionSheetRef.current) {
  //     actionSheetRef.current.show()
  //   }
  // }

  const router = useRouter()

  const handleAddPress = () => {
    router.push({
      pathname: '/memo/add',
      params: {
        deckId,
        deckName,
        flashcardId,
        flashcardFront,
        flashcardBack,
      },
    })
    console.log(deckId, deckName)
  }

  const handleEditPress = () => {
    router.push({
      pathname: '/memo/edit',
      params: {
        deckId,
        deckName,
        flashcardId,
        flashcardFront,
        flashcardBack,
      },
    })
  }

  const handleDeleteFlashcard = async () => {
    if (!auth.currentUser || !deckId || !flashcardId) {
      alert('削除に必要な情報が足りません')
      return
    }
  
    Alert.alert(
      'フラッシュカードを削除しますか？',
      '一度削除すると元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            console.log('Deleting flashcard:', deckId, flashcardId)
            try {
              const flashcardRef = doc(
                db,
                `users/${auth.currentUser?.uid}/decks/${deckId}/flashcards`,
                flashcardId,
              )
              await deleteDoc(flashcardRef)
              alert('フラッシュカードを削除しました')
              router.push('/') // 削除後にホームへ遷移
            } catch (error) {
              console.error('フラッシュカード削除エラー: ', error)
              alert('削除に失敗しました')
            }
          },
        },
      ],
      { cancelable: true }
    )
  }

  useEffect(() => {
    if (visible && actionSheetRef.current) {
      actionSheetRef.current.show()
    }
  }, [visible])

  return (
    <ActionSheet
      ref={actionSheetRef}
      title={'選択してください'}
      options={['追加', '編集', '削除', 'キャンセル']}
      cancelButtonIndex={3}
      destructiveButtonIndex={2}
      onPress={(index) => {
        if (index === 0) handleAddPress()
        else if (index === 1) handleEditPress()
        else if (index === 2) handleDeleteFlashcard()
        onClose()
      }}
    />
  )
}

export default FlashcardActionSheetComponent
