import React from 'react'
import { View, StyleSheet } from 'react-native'
import * as Progress from 'react-native-progress'

interface ProgressBarProps {
  progress: number // 0 ~ 1 の間の値
}

const getProgressColor = (progress: number) => {
  if (progress < 0.3) return '#F44336' // Red
  if (progress < 0.7) return '#FF9800' // Orange
  return 'rgb(76, 175, 80)' // Green
}

const ProgressBar = ({ progress }: ProgressBarProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <Progress.Bar
        progress={progress}
        width={300}
        height={10}
        borderRadius={5}
        color={getProgressColor(progress)}
      />
    </View>
  )
}

export default ProgressBar

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
})
