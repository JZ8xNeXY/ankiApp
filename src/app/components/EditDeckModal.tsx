import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../config";

const EditDeckModal = ({ visible, onClose, deckId, currentName, onUpdateDeck }) => {
  const [newDeckName, setNewDeckName] = useState("");

  // デッキ名を編集前のものにセット
  useEffect(() => {
    setNewDeckName(currentName || "");
  }, [currentName]);

  const handleUpdateDeck = async () => {
    if (!newDeckName.trim()) {
      alert("デッキ名を入力してください");
      return;
    }
    if (!auth.currentUser) {
      alert("ログインしてください");
      return;
    }
    if (!deckId) {
      alert("編集するデッキが見つかりません");
      return;
    }

    try {
      const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, deckId);
      await updateDoc(deckRef, { name: newDeckName });

      onUpdateDeck(deckId, newDeckName);
      setNewDeckName("")

      onClose();
    } catch (error) {
      console.error("デッキ編集エラー: ", error);
      alert("デッキの編集に失敗しました");
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Edit Deck</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter new deck name"
            value={newDeckName}
            onChangeText={setNewDeckName}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.save]} onPress={handleUpdateDeck}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default EditDeckModal;

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
  save: {
    backgroundColor: "#467FD3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});