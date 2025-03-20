import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet ,Dimensions} from "react-native";
import Header from "../components/header";
import { useRouter } from "expo-router";
import Button from "../components/Button";
import AddDeckModal from "../components/AddDeckModal";




const DeckScreen = (): JSX.Element => {
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);

  const [decks, setDecks] = useState([
    { id: "1", title: "英語", count: 10 },
    { id: "2", title: "TOEIC", count: 5 },
    { id: "3", title: "プログラミング", count: 8 },
    { id: "4", title: "歴史", count: 12 },
  ]);
  

  const handleAddDeck = (deckName) => {
    setDecks([...decks, { id: String(decks.length + 1), title: deckName, count: 0 }]);
  };

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
                <Text style={styles.deckTitle}>{item.title}</Text>
              </TouchableOpacity>
              <Text style={styles.deckCount}>{item.count}</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Action ▼</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
      <View style={styles.addDeckButton}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Deck</Text>
      </TouchableOpacity>
      </View>

       {/* モーダルを表示 */}
       <AddDeckModal visible={modalVisible} onClose={() => setModalVisible(false)} onAddDeck={handleAddDeck} />
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