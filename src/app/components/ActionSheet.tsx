import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ActionSheet from "react-native-actionsheet";

const ActionSheetComponent = ({ deckId, onRename, onDelete }) => {
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
        onPress={(index) => {
          if (index === 0) onRename(deckId); 
          if (index === 1) onDelete(deckId); 
        }}
      />
    </View>
  );
};

export default ActionSheetComponent;