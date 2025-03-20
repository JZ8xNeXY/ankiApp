import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

type AnswerButtonProps = {
  label: string;
  onPress: () => void;
};

const AnswerButton: React.FC<AnswerButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.answerButton} onPress={onPress}>
      <Text style={styles.answerButtonText}>{label}</Text>
    </TouchableOpacity>
  );
};

export default AnswerButton;

const styles = StyleSheet.create({
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
});