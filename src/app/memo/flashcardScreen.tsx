import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/header";

const FlashcardScreen = (): JSX.Element => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <View style={styles.container}>
      <Header />

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
  },
  cardContainer: {
    flexGrow: 1,
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
    position: "absolute",  
    bottom: 50,  
    left: "50%",
    transform: [{ translateX: -100 }], 
    backgroundColor: "#467FD3",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 30,
    width:200,
    alignItems:'center'
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
});