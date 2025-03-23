import React, { useState,useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Header from "../components/header";
import ReviewButton from "../components/ReviewButton";
import AnswerButton from "../components/AnswerButton";
import { useLocalSearchParams } from "expo-router";
import { collection,doc,getDocs,updateDoc,Timestamp,query,where} from "firebase/firestore"
import { auth,db } from "../../config"
import { calculateSM2 } from "../utils/srs";


interface Flashcard {
  id:string
  question: string;
  answer: string;
  repetition: number
  interval: number
  efactor: number 
  nextReview:Timestamp
  createdAt:Timestamp
}

const FlashcardScreen = (): JSX.Element => {
  const {
    deckId,
    deckName,
  } = useLocalSearchParams<{
    deckId: string;
    deckName: string;
    flashcardId: string;
    flashcardFront: string;
    flashcardBack: string;
    tags: string; // 配列は文字列で渡される可能性あり
  }>();

  
  const [, setShowAnswer] = useState(false);
  const [showReviewButtons, setShowReviewButtons] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [flashcards,setFlashCards] = useState<Flashcard[]>()

  const fetchFlashCard = async () => {
    if (!auth.currentUser) return;
  
    const now = new Date();

    const ref = collection(db, `users/${auth.currentUser.uid}/decks/${deckId}/flashcards`);
    const q = query(ref, where("nextReview", "<=", Timestamp.fromDate(now)));//復習カードを抽出
  
    const snapshot = await getDocs(q);
  
    const dueFlashCardList: Flashcard[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        question: data.front,       
        answer: data.back,
        repetition:data.repetition,
        interval:data.interval,
        efactor:data.efactor,
        nextReview:data.nextReview,
        createdAt: data.createdAt || Timestamp.now(),
      };
    });
  
    setFlashCards(dueFlashCardList);
  };



  const handleShowAnswer = () => {
    setShowAnswer(true);
    setShowReviewButtons(true);
  };


  const calculateNextInterval = async (score: number) => {
    const currentCardData = flashcards?.[currentCard];
    if (!currentCardData) return;
    const { id, repetition, interval, efactor } = currentCardData;
  
    const { repetition: newRepetition, interval: newInterval, efactor: newEfactor } = calculateSM2(
      score,
      repetition || 0,
      interval || 1,
      efactor || 2.5
    );
  
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);
  
    if (auth.currentUser && deckId && id) {
      const ref = doc(db, `users/${auth.currentUser.uid}/decks/${deckId}/flashcards/${id}`);
      await updateDoc(ref, {
        repetition: newRepetition,
        interval: newInterval,
        efactor: newEfactor,
        nextReview: Timestamp.fromDate(nextReviewDate),
      });
    }
  };


  const handleNextCard = async(score:number) => {
    await calculateNextInterval(score)
    setShowAnswer(false);
    setShowReviewButtons(false);
    setCurrentCard((prev) => prev + 1); 
  };


  useEffect(() => {
    fetchFlashCard();
  }, []);

  return (
    <View style={styles.container}>
      <Header
        deckId={deckId}
        deckName={deckName}
        flashcardId={flashcards?.[currentCard]?.id}
        flashcardFront={flashcards?.[currentCard]?.question}
        flashcardBack={flashcards?.[currentCard]?.answer}
      />

      {/* Question & Answer */}
      <View style={styles.cardContainer}>
        {flashcards && flashcards.length > 0 ? (
          currentCard >= flashcards.length ? (
            <Text style={styles.cardText}>全てのカードを終了しました 🎉</Text>
          ) : !showReviewButtons ? (
            <Text style={styles.cardText}>
              {flashcards[currentCard].question}
            </Text>
          ) : (
            <View style={styles.answerWrapper}>
              <Text style={styles.answerText}>
                {flashcards[currentCard].answer}
              </Text>
              <Text style={styles.nextReviewText}>
                次の復習: {flashcards[currentCard].nextReview.toDate().toLocaleString()}
              </Text>
            </View>
          )
        ) : (
          <Text style={styles.cardText}>カードがありません</Text>
        )}
      </View>

      {/* answerButton & reviewButton */}
      {flashcards && currentCard < flashcards.length && (
        !showReviewButtons ? (
          <AnswerButton label="Show Answer" onPress={handleShowAnswer} />
        ) : (
          <View style={styles.buttonContainer}>
            <ReviewButton label="Again" time="1m" color="#B90101" onPress={() => handleNextCard(1)} />
            <ReviewButton label="Good" time="10m" color="#26B502" onPress={() => handleNextCard(4)} />
            <ReviewButton label="Easy" time="4d" color="#2F79E7" onPress={() => handleNextCard(5)} />
          </View>
        )
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
    fontSize: 32,
    textAlign: "center",
  },
  hiddenText: {
    fontSize: 18,
    color: "#467FD3",
    fontWeight: "bold",
  },
  answerWrapper: {
    alignItems: "center",
  },
  answerText: {
    fontSize: 32,
    color: "#467FD3",
    fontWeight: "bold",
    textAlign:'center'
  },
  nextReviewText: {
    fontSize: 16,
    color: "#888", 
    marginTop: 10,
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
});