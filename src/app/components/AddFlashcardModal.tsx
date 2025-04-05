import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { auth,db } from "../../config"
import generateFlashcard from "../utils/chatgptApi";

interface AddFlashcardModalProps {
  visible: boolean;  
  onClose: () => void;  
  onCreateFlashcard: (front: string, back: string,tag:string) => void; 
}
const AddFlashcardModal: React.FC<AddFlashcardModalProps> = ({ visible, onClose, onCreateFlashcard }) => {
  const [keyword, setKeyword] = useState("");

  const handleAddFlashcard = async () => {
    if (!keyword.trim()) {
      alert("キーワードを入力してください");
      return;
    }
    if (!auth.currentUser) {
      alert("ログインしてください");
      return;
    }
    try {

      const result = await generateFlashcard(keyword);
      if (result) {
        onCreateFlashcard(result.front, result.back,result.tag); 
      } else {
        alert("フラッシュカードの生成に失敗しました");
      }
      setKeyword("");
      onClose();
    } catch (error) {
      console.error("フラッシュカード追加エラー: ", error);
      alert("フラッシュカードの追加に失敗しました");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Create Flashcard</Text>
          <TextInput
            style={styles.input}
            placeholder="Input Keyword"
            value={keyword}
            onChangeText={setKeyword}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.add]} onPress={handleAddFlashcard}>
              <Text style={styles.buttonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default AddFlashcardModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // 背景を半透明に
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  cancel: {
    backgroundColor: "#ccc",
  },
  add: {
    backgroundColor: "#467FD3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
