import React from 'react'
import { View, StyleSheet } from 'react-native'
import * as Progress from 'react-native-progress'

interface ProgressBarProps {
  progress: number // 0 ~ 1 の間の値
}

const getProgressColor = (progress: number) => {
  if (progress < 0.3) return '#F44336' // Red
  if (progress < 0.7) return '#FF9800' // Orange
  return '#4CAF50' // Green
}

const ProgressBar = ({ progress }: ProgressBarProps): JSX.Element => {
  return (
    <View style={styles.container}>
      <Progress.Circle
        progress={progress}
        size={60} // 円のサイズ
        thickness={6}
        showsText={true}
        formatText={() => `${Math.round(progress * 100)}%`}
        color={getProgressColor(progress)}
        unfilledColor="#E0E0E0"
        borderWidth={0}
        textStyle={styles.text}
      />
    </View>
  )
}

export default ProgressBar

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    color: '#333',
    fontWeight: 'bold',
  },
})