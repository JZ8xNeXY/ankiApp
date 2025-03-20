import React, { useState,useEffect,useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet ,Dimensions} from "react-native";
import Header from "../components/header";
import { useRouter } from "expo-router";
import AddDeckModal from "../components/AddDeckModal";
import EditDeckModal from "../components/EditDeckModal";
import { collection,doc,getDocs,deleteDoc} from "firebase/firestore"
import { auth,db } from "../../config"
import ActionSheetComponent from "../components/ActionSheet";


interface Deck {
  id: string;
  name: string;
  cardCount: number;
  createdAt?: Date;
}

const DeckScreen = (): JSX.Element => {
  const router = useRouter();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState(null);


  const actionSheetRef = useRef(null);
  const selectedDeckId = useRef(null);
  
  const handleAddDeck = (deckName: string, deckId: string) => {
    setDecks((prevDecks) => [
      ...prevDecks,
      { id: deckId, name: deckName, cardCount: 0 },
    ]);
  };

  const fetchDecks = async () => {
    if (!auth.currentUser) return;
    
    const ref = collection(db, `users/${auth.currentUser.uid}/decks`);
    const snapshot = await getDocs(ref);
  
    const deckList: Deck[] = snapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      cardCount: doc.data().cardCount || 0,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));  
    setDecks(deckList);
  };

  const handleShowActionSheet = (deckId) => {
    selectedDeckId.current = deckId; 
    if(actionSheetRef.current){
      actionSheetRef.current.show();
    }
  };

  const handleRename = (deckId, currentName) => {
    setSelectedDeck({ id: deckId, name: currentName });
    setEditModalVisible(true);
  };

  const handleDelete = async(deckId) => {
    console.log(`Delete deck: ${deckId}`);
    
    try {
      const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, deckId);
      await deleteDoc(deckRef);
      console.log(`Deleted deck: ${deckId}`);

      // UIを更新（削除されたデッキをリストから削除）
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error("デッキ削除エラー: ", error);
      alert("デッキの削除に失敗しました");
    }
  };

  const handleUpdateDeck = (deckId, newName) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) => (deck.id === deckId ? { ...deck, name: newName } : deck))
    );
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  return (
    <View style={styles.container}>
      <Header />

      {/* デッキ一覧 */}
      <View style={styles.deck}>
        <FlatList
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.deckItem}>
              <TouchableOpacity
                onPress={() => router.push("/memo/flashcardScreen")}
              >
                <Text style={styles.deckTitle}>{item.name}</Text>
              </TouchableOpacity>
              <Text style={styles.deckCount}>{item.cardCount}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleShowActionSheet(item.id)}>
                {/* ActionSheet */}
                <ActionSheetComponent
                  deckId={item.id}  // ✅ 修正: 各デッキの ID を渡す
                onRename={(id) => handleRename(id)}
                onDelete={(id) => handleDelete(id)}
               />
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      
      <View style={styles.addDeckButton}>
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
          <Text style={styles.addButtonText}>Add Deck</Text>
        </TouchableOpacity>
      </View>

       {/* モーダルを表示 */}
       <AddDeckModal 
        visible={addModalVisible} 
        onClose={() => setAddModalVisible(false)} 
        onAddDeck={handleAddDeck} 
       />

      {selectedDeck && (
        <EditDeckModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          deckId={selectedDeck.id}
          currentName={selectedDeck.name}
          onUpdateDeck={handleUpdateDeck}
        />
      )}


    </View>
  );
};

export default DeckScreen;

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#467FD3",
  },
  deck:{
    marginTop:15
  },
  deckItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  deckTitle: {
    fontSize: 18,
    color: "#467FD3",
    width: screenWidth/3,
    flexShrink: 1,
    overflow: "hidden",
  },
  deckCount: {
    fontSize: 16,
    color: "#333",
  },
  actionButton: {
    padding: 5,
  },
  actionText: {
    fontSize: 16,
    color: "#467FD3",
  },
  addDeckButton: {
    alignItems: "center",
    marginVertical: 100,
  },
  addButton: {
    backgroundColor: "#467FD3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});