import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { router,useLocalSearchParams } from "expo-router";
import { collection,addDoc,serverTimestamp} from "firebase/firestore"
import { auth,db } from "../../config"
import AddFlashcardModal from '../components/AddFlashcardModal';

const AddCard= (): JSX.Element => {
  const { deckId } = useLocalSearchParams<{ deckId: string; deckName: string }>();

  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [tags, setTags] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);

  // SM2関連
  const [interval, ] = useState(0);           // 前回の復習間隔（分や日）


  const handleAddFlashCard = async () => {
    if (!front.trim() || !back.trim()) {
      alert("FRONTとBACKを入力してください");
      return;
    }
    if (!auth.currentUser) {
      alert("ログインしてください");
      return;
    }
    const now = new Date();
    try {
      const ref = collection(db, `users/${auth.currentUser.uid}/decks/${deckId}/flashcards`);
      await addDoc(ref, {
        front,
        back,
        tags,
        repetition: 0,
        interval: 1,
        efactor: 2.5,
        nextReview: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
        createdAt: serverTimestamp(),
      });
  
      Alert.alert(
        "カードを追加しました！",
        "続けて登録しますか？",
        [
          {
            text: "戻る",
            onPress: () => router.push("/"),
            style: "cancel",
          },
          {
            text: "続けて追加",
            onPress: () => {
              setFront('');
              setBack('');
              setTags('');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error("カード追加エラー: ", error);
      alert("カードの追加に失敗しました");
    }
  };

  const handleCreateFlashCard = async (front: string, back: string, tags: string) => {
    setFront(front);
    setBack(back);
    setTags(tags);
    setAddModalVisible(false);                                        
  }


  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inner}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.headerText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>新規カード</Text>
          <TouchableOpacity onPress={handleAddFlashCard}>
            <Text style={styles.headerText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Question</Text>
          <TextInput
            style={styles.input}
            multiline={true}
            placeholder="例: What is the capital of Japan"
            value={front}
            onChangeText={setFront}
          />
          <Text style={styles.label}>Answer</Text>
          <TextInput
            style={styles.input}
            multiline={true}
            placeholder="例: Tokyo"
            value={back}
            onChangeText={setBack}
          />
          <Text style={styles.label}>TAGS</Text>
          <TextInput
            style={styles.input}
            placeholder="例: Country, Capitol"
            value={tags}
            onChangeText={setTags}
          />
        </View>

        {/* TODO 補助ツールエリア */}
        <View style={styles.tools}>
          <TouchableOpacity style={styles.toolButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.toolText}>例文生成</Text>
          </TouchableOpacity>
          {/* <TouchableOpacity style={styles.toolButton}>
            <Text style={styles.toolText}>翻訳</Text>
          </TouchableOpacity> */}
        </View>


        {/* モーダルを表示 */}
        <AddFlashcardModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onCreateFlashcard={handleCreateFlashCard}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AddCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  inner: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerText: {
    color: '#467FD3',
    fontSize: 16,
    fontWeight:'bold'
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    height: 100,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  tools: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginBottom: 30,
  },
  toolButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#467FD3',
    borderRadius: 6,
  },
  toolText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});