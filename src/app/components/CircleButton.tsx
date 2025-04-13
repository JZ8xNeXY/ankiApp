import React from 'react'
import {
  Text,
  StyleSheet,
  type ViewStyle,
  TouchableOpacity,
} from 'react-native'

interface Props {
  children: JSX.Element
  style?: ViewStyle
  onPress?: () => void
}

const CircleButton = (props: Props): JSX.Element => {
  const { children, style, onPress } = props

  return (
    <TouchableOpacity onPress={onPress} style={[styles.circleButton, style]}>
      <Text style={styles.circleButtonLabel}>{children}</Text>
    </TouchableOpacity>
  )
}

export default CircleButton

const styles = StyleSheet.create({
  circleButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 64,
    height: 64,
    backgroundColor: 'rgba(70, 127, 211, 0.2)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4.65,
    elevation: 6,
  },
  circleButtonLabel: {
    color: '#000',
    fontSize: 40,
    lineHeight: 40,
  },
})
