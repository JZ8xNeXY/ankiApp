import { useRouter } from 'expo-router'
import React, { useRef, useEffect } from 'react'
import ActionSheet from 'react-native-actionsheet'

interface ActionSheetProps {
  visible: boolean
  onClose: () => void
  deckId: string
  deckName: string
  flashcardId?: string
  flashcardFront?: string
  flashcardBack?: string
  onDelete?: () => void
}

const FlashcardActionSheetComponent: React.FC<ActionSheetProps> = ({
  visible,
  onClose,
  deckId,
  deckName,
  flashcardId,
  flashcardFront,
  flashcardBack,
  onDelete,
}) => {
  const actionSheetRef = useRef<ActionSheet | null>(null)

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
        else if (index === 2) onDelete?.()
        onClose()
      }}
    />
  )
}

export default FlashcardActionSheetComponent
