import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/header";

const decks = [
  { id: "1", title: "英語", count: 10 },
  { id: "2", title: "TOEIC", count: 5 },
  { id: "3", title: "プログラミング", count: 8 },
  { id: "4", title: "歴史", count: 12 },
];


const DeckScreen = (): JSX.Element => {
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
              <Text style={styles.deckTitle}>{item.title}</Text>
              <Text style={styles.deckCount}>{item.count}</Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionText}>Action ▼</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
};

export default DeckScreen;


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
});