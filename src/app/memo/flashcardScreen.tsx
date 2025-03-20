import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../components/header";

const FlashcardScreen = (): JSX.Element => {
  const [showAnswer, setShowAnswer] = useState(false);
  const [showReviewButtons, setShowReviewButtons] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);

  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowReviewButtons(true);
  };

  const handleNextCard = () => {
    setShowAnswer(false);
    setShowReviewButtons(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const flashcards = [
    { question: "What is the capital of Japan?", answer: "Tokyo" },
    { question: "What is the capital of France?", answer: "Paris" },
    // 追加のカード
  ];


  return (
    <View style={styles.container}>
      <Header />

      {/* Question & Answer */}
      <View style={styles.cardContainer}>
        {!showReviewButtons ? (<Text style={styles.cardText}>
          {flashcards[currentCard].question}
        </Text>):(
          <Text style={styles.answerText}>{flashcards[currentCard].answer}</Text>
        )}
      </View>

      {/* answerButton & reviewButton */}
      {!showReviewButtons ? (
        <TouchableOpacity style={styles.answerButton} onPress={handleShowAnswer}>
          <Text style={styles.answerButtonText}>Show Answer</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.reviewButton, styles.again]} onPress={handleNextCard}>
            <Text style={styles.reviewText}>1m {"\n"}Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reviewButton, styles.good]} onPress={handleNextCard}>
            <Text style={styles.reviewText}>10m {"\n"}Good</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.reviewButton, styles.easy]} onPress={handleNextCard}>
            <Text style={styles.reviewText}>4d {"\n"}Easy</Text>
          </TouchableOpacity>
        </View>
      )}
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
    marginBottom:100
  },
  cardText: {
    fontSize: 18,
    textAlign: "center",
  },
  hiddenText: {
    fontSize: 18,
    color: "#467FD3",
    fontWeight: "bold",
  },
  answerText: {
    fontSize: 18,
    color: "#467FD3",
    fontWeight: "bold",
  },
  answerButton: {
    position: "absolute",  
    bottom: 25,  
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
  answerButtonText: {
    fontSize: 18,
    color: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    position: "absolute",
    bottom: 50,
  },
  reviewButton: {
    width: 96,
    paddingVertical: 5,
    alignItems: "center",
    borderRadius: 10,
  },
  again: { backgroundColor: "#B90101" },
  good: { backgroundColor: "#26B502" },
  easy: { backgroundColor: "#2F79E7" },
  reviewText: {
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
  },
});