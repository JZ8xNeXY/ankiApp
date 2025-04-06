import React from 'react'
import { TouchableOpacity, Text, StyleSheet } from 'react-native'

interface ReviewButtonProps {
  label: string
  time: string
  color: string
  onPress: () => void
}

const ReviewButton: React.FC<ReviewButtonProps> = ({
  label,
  time,
  color,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.text}>
        {time} {'\n'}
        {label}
      </Text>
    </TouchableOpacity>
  )
}

export default ReviewButton

const styles = StyleSheet.create({
  button: {
    width: 96,
    paddingVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
})
