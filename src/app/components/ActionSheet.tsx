import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'
import ActionSheet from 'react-native-actionsheet'

interface ActionSheetProps {
  deckId: string
  deckName: string
  deckTag: string | null
  onRename: (id: string, name: string,tag:string|null) => void
  onDelete: (id: string) => void
}

const ActionSheetComponent: React.FC<ActionSheetProps> = ({
  deckId,
  deckName,
  deckTag,
  onRename,
  onDelete,
}) => {
  const actionSheetRef = useRef<ActionSheet | null>(null)

  const showActionSheet = () => {
    if (actionSheetRef.current) {
      actionSheetRef.current.show()
    }
  }

  return (
    <View>
      {/* Action ボタン */}
      <TouchableOpacity onPress={showActionSheet}>
        <MaterialIcons name="more-vert" size={24} color="#666" />
      </TouchableOpacity>

      {/* ActionSheet */}
      <ActionSheet
        ref={actionSheetRef}
        title={'選択してください'}
        options={['編集', '削除', 'キャンセル']}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={(index: number) => {
          if (index === 0) onRename(deckId, deckName, deckTag)
          if (index === 1) onDelete(deckId)
        }}
      />
    </View>
  )
}

export default ActionSheetComponent
