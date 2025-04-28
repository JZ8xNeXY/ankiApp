import { Ionicons } from '@expo/vector-icons'
import React,{useState} from 'react'
import { View, Text, TouchableOpacity, StyleSheet,Alert } from 'react-native'
import AddDeckModal from '../components/AddDeckModal'
import { Timestamp } from 'firebase/firestore'
import { router } from 'expo-router'
import { auth } from '../../config'
import { signOut } from 'firebase/auth'


interface FooterProps {
  current: string
  onNavigate: (screen: string) => void
  deckId?: string
  deckName?: string
}

interface Deck {
  id: string
  name: string
  tag: string | null
  cardCount: number // 復習対象
  totalCount: number // 全体数
  createdAt?: Timestamp
  order?: number
}

interface FooterProps {
  deckId?: string
  deckName?: string
  flashcardId?: string
  flashcardFront?: string
  flashcardBack?: string
  tags?: string
  showBackToDecks?: boolean
}

const FooterButton = ({
  icon,
  label,
  size,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  size?: number
  active: boolean
  onPress: () => void
}) => (
  <TouchableOpacity style={styles.button} onPress={onPress}>
    <Ionicons name={icon} size={size} color={active ? '#2C64C6' : '#888'} />
    <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
  </TouchableOpacity>
)



const Footer = ({ 
  current, 
  onNavigate,
  deckId,
  deckName,
}: FooterProps) => {

  const [, setDecks] = useState<Deck[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)


  const handleAddDeck = (deckName: string, deckId: string, deckTag: string) => {
    setDecks((prevDecks) => [
      ...prevDecks,
      {
        id: deckId,
        name: deckName,
        tag: deckTag,
        cardCount: 0,
        totalCount: 0,
        createdAt: Timestamp.fromDate(new Date()),
        order: prevDecks.length,
      },
    ])
  }

  const handleSignOut = (): void => {
    signOut(auth)
      .then(() => {
        router.replace('/auth/logIn')
      })
      .catch(() => {
        Alert.alert('ログアウトに失敗しました')
      })
  }

  return (
    <View>
      <View style={styles.container}>

        <FooterButton
          icon="home-outline"
          label="Home"
          size={current === 'Home' ? 28 : 24}
          active={current === 'Home'}
          onPress={current !== 'Home' ? () => router.replace('/') : () => {}}
        />
        
        {current == 'Home' && (
          <FooterButton
            icon="albums-outline"
            label="Add Deck"
            size={24}
            active={false}
            onPress={() => setAddModalVisible(true)}
          />
        )}

        {current == 'Flashcard' && (
          <FooterButton
            icon="document-outline"
            label="Add Card"
            size={24}
            active={false}
            onPress={() => {
              router.push({
                pathname: '/memo/add',
                params: {
                  deckId,
                  deckName,
                },
              })
            }}
          />
        )}
    
        {/* <FooterButton
          icon="search-outline"
          label="Search"
          size={24}
          active={current === 'Search'}
          onPress={() => onNavigate('Search')}
        /> */}
        


        <FooterButton
          icon="star-outline"
          label="Bookmark"
          size={24}
          active={current === 'bookmark'}
          onPress={() => {
            router.push({
              pathname: '/memo/bookmark',
            })
          }}
        />
        <FooterButton
          icon="settings-outline"
          label="Logout"
          size={24}
          active={current === 'Logout'}
          onPress={handleSignOut}
        />
      </View>

      <AddDeckModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddDeck={handleAddDeck}
      />


    </View>
  )
}



export default Footer

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom:0,
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
