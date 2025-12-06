import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { Timestamp } from 'firebase/firestore'
import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import AddDeckModal from '../components/addDeckModal'

interface FooterProps {
  current: string
  onNavigate?: (screen: string) => void
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

const Footer = ({ current, deckId, deckName }: FooterProps) => {
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


  return (
    <View>
      <View style={styles.container}>
        <FooterButton
          icon="home-outline"
          label="ホーム"
          size={current === 'Home' ? 28 : 24}
          active={current === 'Home'}
          onPress={current !== 'Home' ? () => router.replace('/') : () => {}}
        />

        {current == 'Home' && (
          <FooterButton
            icon="albums-outline"
            label="デッキを追加"
            size={24}
            active={false}
            onPress={() => setAddModalVisible(true)}
          />
        )}

        {current == 'Flashcard' && (
          <FooterButton
            icon="document-outline"
            label="カードを追加"
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

      {current == 'Home' && (
        <FooterButton
        icon="star-outline"
        label="ブックマーク"
        size={24}
        active={false}
        onPress={() => {
          router.push({
            pathname: '/memo/bookmark',
          })
        }}
      />
      )}

        
        <FooterButton
          icon="trophy-outline"
          label="履歴"
          size={24}
          active={current === 'History'}
          onPress={() => {
            router.push({
              pathname: '/history/studyHistory',
            })
          }}
        />

        <FooterButton
          icon="calendar-outline"
          label="進捗"
          size={24}
          active={current === 'Progress'}
          onPress={() => {
            router.push({
              pathname: '/history/studyProgress',
            })
          }}
        />

        <FooterButton
          icon="settings-outline"
          label="設定"
          size={24}
          active={current === 'Settings'}
          onPress={() => {
            router.push({
              pathname: '/settings/settingScreen',
            })
          }}
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
    bottom: 0,
    width: '100%',
    height: 75,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24, 
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    zIndex: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6, 
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
