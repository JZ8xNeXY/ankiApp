import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const FlashcardScreen = (): JSX.Element => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <View style={styles.container}>
      {/* ナビゲーションバー */}
      <View style={styles.navbar}>
        <Text style={styles.navItem}>Decks</Text>
        <Text style={styles.navItem}>Add</Text>
        <Text style={styles.navItem}>Edit</Text>
        <Text style={styles.navItem}>Find</Text>
      </View>

      {/* 問題部分 */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardText}>
          The goal is to help slow down{" "}
          <Text style={styles.hiddenText}>[...]</Text> and keep the temperature rise below{" "}
          <Text style={styles.hiddenText}>[...]</Text>
        </Text>
      </View>

      {/* Show Answer ボタン */}
      <TouchableOpacity style={styles.button} onPress={() => setShowAnswer(!showAnswer)}>
        <Text style={styles.buttonText}>{showAnswer ? "Hide Answer" : "Show Answer"}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FlashcardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: 50,
    alignItems: "center",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingVertical: 15,
  },
  navItem: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#467FD3",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  cardText: {
    fontSize: 18,
    textAlign: "center",
  },
  hiddenText: {
    color: "#467FD3",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#467FD3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 30,
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
});