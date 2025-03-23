import React, { useState,useEffect,useRef } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet ,Dimensions} from "react-native";
import Header from "../components/header";
import { useRouter } from "expo-router";
import AddDeckModal from "../components/AddDeckModal";
import EditDeckModal from "../components/EditDeckModal";
import { collection,doc,getDocs,deleteDoc,Timestamp,query,where} from "firebase/firestore"
import { auth,db } from "../../config"
import ActionSheetComponent from "../components/ActionSheet";


interface Deck {
  id: string;
  name: string;
  cardCount: number;
  createdAt?: Timestamp
}

const DeckScreen = (): JSX.Element => {
  const router = useRouter();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<{ id: string; name: string } | null>(null);

  const actionSheetRef = useRef<{ show: () => void } | null>(null);
  const selectedDeckId = useRef<string | null>(null);
  
  const handleAddDeck = (deckName: string, deckId: string) => {
    setDecks((prevDecks) => [
      ...prevDecks,
      { id: deckId, name: deckName, cardCount: decks.length },
    ]);
  };


  const fetchDecks = async () => {
    if (!auth.currentUser) return;

    const now = new Date();
  
    const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`);
    const snapshot = await getDocs(deckRef);
  
    const deckList: Deck[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
  
          const ref = collection(db, `users/${auth.currentUser.uid}/decks/${doc.id}/flashcards`);
          const q = query(ref, where("nextReview", "<=", Timestamp.fromDate(now)));//復習カードを抽出
      
          const snapshot = await getDocs(q);
          const cardCount = snapshot.size;
  
          return {
            id: doc.id,
            name: doc.data().name,
            cardCount:cardCount,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          };  
      })
    );
  
    setDecks(deckList);
  };

  const handleShowActionSheet = (deckId:string) => {
    if (selectedDeckId){
      selectedDeckId.current = deckId;
    }
    if(actionSheetRef.current){
      actionSheetRef.current.show();
    }
  };

  const handleRename = (deckId:string, currentName:string) => {
    setSelectedDeck({ id: deckId, name: currentName });
    setEditModalVisible(true);
  };

  const handleUpdateDeck = (deckId:string, newName:string) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) => (deck.id === deckId ? { ...deck, name: newName } : deck))
    );
  };

  const handleDelete = async(deckId:string) => {
    console.log(`Delete deck: ${deckId}`);
    
    try {
      if(auth.currentUser){
        const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, deckId);
        await deleteDoc(deckRef);
        console.log(`Deleted deck: ${deckId}`);
      }
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error("デッキ削除エラー: ", error);
      alert("デッキの削除に失敗しました");
    }
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
            <TouchableOpacity onPress={() => router.push({
              pathname: "/memo/flashcardScreen",
              params: { deckId: item.id, deckName: item.name }
            })}>
                <Text style={styles.deckTitle}>{item.name}</Text>
              </TouchableOpacity>
              <Text style={styles.deckCount}>{item.cardCount}</Text>
              <TouchableOpacity style={styles.actionButton} onPress={() => handleShowActionSheet(item.id)}>
                {/* ActionSheet */}
                <ActionSheetComponent
                  deckId={item.id} 
                  deckName={item.name}
                  onRename={(id:string,name:string) => handleRename(id,name)}
                  onDelete={(id:string) => handleDelete(id)}
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
          currentName={selectedDeck?.name || ""}
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