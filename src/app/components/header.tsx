import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { auth } from '../../config'

interface HeaderProps {
  deckId?: string
  deckName?: string
  flashcardId?: string
  flashcardFront?: string
  flashcardBack?: string
  tags?: string
  showBackToDecks?: boolean
}

const Header = ({ showBackToDecks = true }: HeaderProps): JSX.Element => {
  const router = useRouter()

  const handlePress = (): void => {
    signOut(auth)
      .then(() => {
        router.replace('/auth/logIn')
      })
      .catch(() => {
        Alert.alert('ログアウトに失敗しました')
      })
  }

  return (
    <View style={styles.header}>
      {showBackToDecks && (
        <TouchableOpacity
          style={styles.navLink}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home-outline" size={20} color="#467FD3" />
          <Text style={styles.headerText}>Home</Text>
        </TouchableOpacity>
      )}

      {!showBackToDecks && (
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <TouchableOpacity onPress={handlePress}>
            <Text style={styles.headerText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

export default Header

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#DDE9F8',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android向け
  },
  headerText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#467FD3',
  },
})
