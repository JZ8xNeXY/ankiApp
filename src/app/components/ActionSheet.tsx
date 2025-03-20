import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ActionSheet from "react-native-actionsheet";


interface ActionSheetProps {
  deckId:string
  deckName:string
  onRename: (id:string,name:string) => void
  onDelete: (id:string) => void
}

const ActionSheetComponent:React.FC<ActionSheetProps> = ({ deckId, deckName,onRename, onDelete }) => {
  const actionSheetRef = useRef(null);

  const showActionSheet = () => {
    actionSheetRef.current.show();
  };

  return (
    <View>
      {/* Action ボタン */}
      <TouchableOpacity onPress={showActionSheet}>
        <Text style={{ color: "blue", fontSize: 16 }}>Action ▼</Text>
      </TouchableOpacity>

      {/* ActionSheet */}
      <ActionSheet
        ref={actionSheetRef}
        title={"Choose an action"}
        options={["Rename", "Delete", "Cancel"]}
        cancelButtonIndex={2} 
        destructiveButtonIndex={1} 
        onPress={(index:number) => {
          if (index === 0) onRename(deckId,deckName); 
          if (index === 1) onDelete(deckId); 
        }}
      />
    </View>
  );
};

export default ActionSheetComponent;