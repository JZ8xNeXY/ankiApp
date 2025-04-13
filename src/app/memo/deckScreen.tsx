import { useRouter } from 'expo-router'
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native'
import { auth, db } from '../../config'
import ActionSheetComponent from '../components/ActionSheet'
import AddDeckModal from '../components/AddDeckModal'
import EditDeckModal from '../components/EditDeckModal'
// import Header from '../components/Header's
import ProgressCircle from '../components/ProgressCircle'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import Footer from '../components/Footer'

interface Deck {
  id: string
  name: string
  tag:string | null
  cardCount: number // 復習対象
  totalCount: number // 全体数
  createdAt?: Timestamp
}

const DeckScreen = (): JSX.Element => {
  const router = useRouter()

  const [decks, setDecks] = useState<Deck[]>([])
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<{
    id: string
    name: string
  } | null>(null)

  const actionSheetRef = useRef<{ show: () => void } | null>(null)
  const selectedDeckId = useRef<string | null>(null)

  const handleAddDeck = (deckName: string, deckId: string,deckTag:string) => {
    setDecks((prevDecks) => [
      ...prevDecks,
      {
        id: deckId,
        name: deckName,
        tag:deckTag,
        cardCount: 0,
        totalCount: 0,
        createdAt: Timestamp.fromDate(new Date()),
      },
    ])
  }

  const handleShowActionSheet = (deckId: string) => {
    if (selectedDeckId) {
      selectedDeckId.current = deckId
    }
    if (actionSheetRef.current) {
      actionSheetRef.current.show()
    }
  }

  const handleRename = (deckId: string, currentName: string,currentTag:string) => {
    setSelectedDeck({ id: deckId, name: currentName,tag:currentTag })
    setEditModalVisible(true)
  }

  const handleUpdateDeck = (deckId: string, newName: string) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) =>
        deck.id === deckId ? { ...deck, name: newName } : deck,
      ),
    )
  }

  const handleDelete = async (deckId: string) => {
    console.log(`Delete deck: ${deckId}`)

    try {
      if (auth.currentUser) {
        const deckRef = doc(db, `users/${auth.currentUser.uid}/decks`, deckId)
        await deleteDoc(deckRef)
        console.log(`Deleted deck: ${deckId}`)
      }
      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId))
    } catch (error) {
      console.error('デッキ削除エラー: ', error)
      alert('デッキの削除に失敗しました')
    }
  }

  useEffect(() => {
    if (!auth.currentUser) return

    const now = new Date()
    const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`)

    // 🔁 リアルタイムで監視
    const unsubscribe = onSnapshot(deckRef, async (snapshot) => {
      const deckList: Deck[] = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const flashcardRef = collection(
            db,
            `users/${auth.currentUser?.uid}/decks/${doc.id}/flashcards`,
          )

          // 全体数
          const allSnap = await getDocs(flashcardRef)
          const totalCount = allSnap.size

          // 今日の復習対象
          const q = query(
            flashcardRef,
            where('nextReview', '<=', Timestamp.fromDate(now)),
          )
          const reviewSnap = await getDocs(q)
          const reviewCount = reviewSnap.size

          return {
            id: doc.id,
            name: doc.data().name,
            tag:doc.data().tag,
            cardCount: reviewCount,
            totalCount: totalCount,
            createdAt: doc.data().createdAt?.toDate() || new Date(),
          }
        }),
      )

      setDecks(deckList)
    })

    return () => unsubscribe()
  }, [])

  return (
    <View style={styles.container}>
      {/* TODO : Headerの表示を修正 */}
      {/* <Header showBackToDecks={false} /> */}

      <View>
        <Text style={styles.headerTitle}>Home</Text>
      </View>

      <View style={styles.tipCard}>
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={48}
          color="white"
          style={styles.tipIcon}
        />
        <View style={styles.tipTextContainer}>
          <Text style={styles.tipTitle}>Today's Tip</Text>
          <Text style={styles.tipText}>
            Set a daily goal to build
          </Text>
          <Text style={styles.tipText}>
            a vocabulary habit
          </Text>
        </View>
      </View>
     

      {/* デッキ一覧 */}
      <View style={styles.deck}>
        <FlatList
          contentContainerStyle={{ paddingBottom: 120 }}
          data={decks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const reviewedCount = item.totalCount - item.cardCount
            const progress =
              item.totalCount > 0 ? reviewedCount / item.totalCount : 0

            return (
              <View style={styles.deckItem}>
                <Text style={styles.tag}>
                  {item.tag ? item.tag.toUpperCase() : ''}
                </Text> 

                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: '/memo/flashcardScreen',
                      params: { deckId: item.id, deckName: item.name },
                    })
                  }
                >
                  <Text style={styles.deckTitle}>{item.name}</Text>
                </TouchableOpacity>

                <View style={styles.progressWrapper}>
                  <ProgressCircle progress={progress} />
                  {/* <Text style={styles.deckCount}>
                    {reviewedCount} / {item.totalCount}（完了）
                  </Text> */}
                </View>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleShowActionSheet(item.id)}
                >
                  <ActionSheetComponent
                    deckId={item.id}
                    deckName={item.name}
                    onRename={(id, name) => handleRename(id, name)}
                    onDelete={(id) => handleDelete(id)}
                  />
                </TouchableOpacity>
              </View>
            )
          }}
        />
      </View>

      <Footer current="Home" onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)} />
      
      {/* TODO adddeckボタン修正 */}
      {/* <View style={styles.addDeckButton}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Text style={styles.addButtonText}>Add Deck</Text>
        </TouchableOpacity>
      </View> */}



      {/* モーダルを表示 */}
      <AddDeckModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onAddDeck={handleAddDeck}
      />

      {selectedDeck && (
        <EditDeckModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          deckId={selectedDeck.id}
          currentName={selectedDeck?.name || ''}
          onUpdateDeck={handleUpdateDeck}
        />
      )}
    </View>
  )
}

export default DeckScreen

const screenWidth = Dimensions.get('window').width

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 80,
    marginHorizontal: 20,
  },
  tipCard: {
    backgroundColor: '#2C64C6',
    margin: 10,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start', 
    gap: 12, 
  },
  tipIcon: {
    marginTop: 4,
  },
  tipTextContainer: {
    flex: 1,
  },  
  tipTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tipText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 15,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0000',
  },
  deck: {
    flex: 1,
  },
  deckItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDFDFD',
    paddingVertical: 25,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    marginHorizontal: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tag: {
    backgroundColor: '#E5EFFF', 
    color: '#2C64C6',
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  deckTitle: {
    width: screenWidth * 0.4,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flexShrink: 1,
    overflow: 'hidden',
  },
  progressWrapper: {
    flex: 2,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  deckCount: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  actionButton: {
    padding: 5,
  },
  actionText: {
    fontSize: 16,
    color: '#467FD3',
  },
  addDeckButton: {
    alignItems: 'center',
    marginVertical: 100,
  },
  addButton: {
    backgroundColor: '#467FD3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
})
