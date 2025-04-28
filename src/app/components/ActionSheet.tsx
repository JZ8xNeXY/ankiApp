import { MaterialIcons } from '@expo/vector-icons'
import React, { useRef } from 'react'
import { View, TouchableOpacity } from 'react-native'
import ActionSheet from 'react-native-actionsheet'

interface ActionSheetProps {
  deckId: string
  deckName: string
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
}

const ActionSheetComponent: React.FC<ActionSheetProps> = ({
  deckId,
  deckName,
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
        title={'Choose an action'}
        options={['Rename', 'Delete', 'Cancel']}
        cancelButtonIndex={2}
        destructiveButtonIndex={1}
        onPress={(index: number) => {
          if (index === 0) onRename(deckId, deckName)
          if (index === 1) onDelete(deckId)
        }}
      />
    </View>
  )
}

export default ActionSheetComponent
