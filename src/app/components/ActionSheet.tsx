import React, { useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import ActionSheet from "react-native-actionsheet";

const ActionSheetComponent = ({ onRename, onDelete }) => {
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
        cancelButtonIndex={2} // "Cancel" をキャンセルボタンにする
        destructiveButtonIndex={1} // "Delete" を赤色で強調
        onPress={(index) => {
          if (index === 0) onRename(); // "Rename" が押された
          if (index === 1) onDelete(); // "Delete" が押された
        }}
      />
    </View>
  );
};

export default ActionSheetComponent;