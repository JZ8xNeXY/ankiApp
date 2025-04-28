import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

interface FooterProps {
  current: string
  onNavigate: (screen: string) => void
}

const Footer = ({ current, onNavigate }: FooterProps) => {
  return (
    <View style={styles.container}>
      <FooterButton
        icon="home-outline"
        label="Home"
        active={current === 'Home'}
        onPress={() => onNavigate('Home')}
      />
      <FooterButton
        icon="search-outline"
        label="Search"
        active={current === 'Search'}
        onPress={() => onNavigate('Search')}
      />
      <FooterButton
        icon="star-outline"
        label="Favorites"
        active={current === 'Favorites'}
        onPress={() => onNavigate('Favorites')}
      />
      <FooterButton
        icon="settings-outline"
        label="Settings"
        active={current === 'Settings'}
        onPress={() => onNavigate('Settings')}
      />
    </View>
  )
}

const FooterButton = ({
  icon,
  label,
  active,
  onPress,
}: {
  icon: string
  label: string
  active: boolean
  onPress: () => void
}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? '#2C64C6' : '#888'} />
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
)

export default Footer

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 75,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    zIndex: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },
  activeLabel: {
    color: '#2C64C6',
    fontWeight: '600',
  },
})
