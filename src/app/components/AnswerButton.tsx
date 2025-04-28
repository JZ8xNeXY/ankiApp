import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'
import { Dimensions } from 'react-native'

type AnswerButtonProps = {
  label: string
  onPress: () => void
}

const AnswerButton: React.FC<AnswerButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity style={styles.answerButton} onPress={onPress}>
      <Text style={styles.answerButtonText}>{label}</Text>
    </TouchableOpacity>
  )
}

export default AnswerButton

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  answerButton: {
    position: 'absolute',
    bottom: 50,
    left: screenWidth * 0.15,
    width: screenWidth * 0.7,
    backgroundColor: '#2C64C6',
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 0,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  answerButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '500',
  },
})
