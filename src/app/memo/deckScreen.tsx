import { MaterialCommunityIcons } from '@expo/vector-icons'
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
  orderBy,
  writeBatch,
  QuerySnapshot,
  getCountFromServer,
} from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  RefreshControl,
} from 'react-native'
import { ActivityIndicator } from 'react-native'
import DraggableFlatList, {
  ScaleDecorator,
} from 'react-native-draggable-flatlist'
import { auth, db } from '../../config'
import ActionSheetComponent from '../components/actionSheet'
import EditDeckModal from '../components/editDeckModal'
import Footer from '../components/Footer'
import ProgressCircle from '../components/progressCircle'
import TipBox from '../components/tipBox'

interface Deck {
  id: string
  name: string
  tag: string | null
  cardCount: number // 復習対象
  totalCount: number // 全体数
  createdAt?: Timestamp
  order?: number
}

const DeckScreen = (): JSX.Element => {
  const router = useRouter()

  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [selectedDeck, setSelectedDeck] = useState<{
    id: string
    name: string
    tag: string | null
  } | null>(null)

  const actionSheetRef = useRef<{ show: () => void } | null>(null)
  const selectedDeckId = useRef<string | null>(null)

  const handleShowActionSheet = (deckId: string) => {
    if (selectedDeckId) {
      selectedDeckId.current = deckId
    }
    if (actionSheetRef.current) {
      actionSheetRef.current.show()
    }
  }

  const handleRename = (
    deckId: string,
    currentName: string,
    currentTag: string | null,
  ) => {
    setSelectedDeck({ id: deckId, name: currentName, tag: currentTag })
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

    Alert.alert(
      'デッキを削除しますか？',
      '一度削除すると元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            try {
              if (auth.currentUser) {
                const deckRef = doc(
                  db,
                  `users/${auth.currentUser.uid}/decks`,
                  deckId,
                )
                await deleteDoc(deckRef)
                console.log(`Deleted deck: ${deckId}`)
                setDecks((prevDecks) =>
                  prevDecks.filter((deck) => deck.id !== deckId),
                )
              }
            } catch (error) {
              console.error('デッキ削除エラー: ', error)
              alert('デッキの削除に失敗しました')
            }
          },
        },
      ],
      { cancelable: true },
    )
  }

  const fetchDeckList = async (snapshot: QuerySnapshot): Promise<Deck[]> => {
    const now = new Date()

    const deckList: Deck[] = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const flashcardRef = collection(
          db,
          `users/${auth.currentUser?.uid}/decks/${doc.id}/flashcards`,
        )

        const allSnap = await getCountFromServer(flashcardRef)
        const totalCount = allSnap.data().count

        const reviewSnap = await getCountFromServer(
          query(
            flashcardRef,
            where('nextReview', '<=', Timestamp.fromDate(now)),
          ),
        )
        const reviewCount = reviewSnap.data().count

        return {
          id: doc.id,
          name: doc.data().name,
          tag: doc.data().tag,
          cardCount: reviewCount,
          totalCount: totalCount,
          createdAt: doc.data().createdAt?.toDate() || new Date(),
          order: doc.data().order || 0,
        }
      }),
    )

    return deckList
  }

  const onRefresh = async () => {
    if (!auth.currentUser) return
    setRefreshing(true)

    try {
      const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`)
      const snapshot = await getDocs(query(deckRef, orderBy('order')))
      const deckList = await fetchDeckList(snapshot)
      setDecks(deckList)
    } catch (error) {
      console.error('デッキの取得に失敗しました:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleDragEnd = async ({ data }: { data: Deck[] }) => {
    setDecks(data)
    try {
      if (auth.currentUser) {
        const batch = writeBatch(db)
        data.forEach((deck, index) => {
          const ref = auth.currentUser
            ? doc(db, `users/${auth.currentUser.uid}/decks/${deck.id}`)
            : null
          if (!ref) return
          batch.update(ref, { order: index })
        })
        await batch.commit()
      }
    } catch (error) {
      console.error('Error updating deck order: ', error)
      alert('デッキの順序更新に失敗しました')
    }
  }

  useEffect(() => {
    if (!auth.currentUser) return
    setLoading(true)

    const deckRef = collection(db, `users/${auth.currentUser.uid}/decks`)

    // 🔁 リアルタイムで監視
    const unsubscribe = onSnapshot(
      query(deckRef, orderBy('order')),
      async (snapshot) => {
        const deckList = await fetchDeckList(snapshot)
        setDecks(deckList)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2C64C6" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.tipCard}>
        <MaterialCommunityIcons
          name="lightbulb-on-outline"
          size={48}
          color="gold"
          style={styles.tipIcon}
        />
        <TipBox />
      </View>

      {/* デッキ一覧 */}
      <View style={styles.deck}>
        <DraggableFlatList
          contentContainerStyle={{ paddingBottom: 120 }}
          data={decks}
          onDragEnd={({ data }) => handleDragEnd({ data })}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#2C64C6"
            />
          }
          renderItem={({ item, drag }) => {
            const reviewedCount = item.totalCount - item.cardCount
            const progress =
              item.totalCount > 0 ? reviewedCount / item.totalCount : 0

            return (
              <ScaleDecorator>
                <TouchableOpacity onLongPress={drag} style={styles.deckItem}>
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
                  </View>

                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleShowActionSheet(item.id)}
                  >
                    <ActionSheetComponent
                      deckId={item.id}
                      deckName={item.name}
                      deckTag={item.tag}
                      onRename={(id, name, tag) => handleRename(id, name, tag)}
                      onDelete={(id) => handleDelete(id)}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </ScaleDecorator>
            )
          }}
        />
      </View>

      <Footer
        current="Home"
        onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
      />

      {selectedDeck && (
        <EditDeckModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          deckId={selectedDeck.id}
          currentName={selectedDeck?.name || ''}
          currentTag={selectedDeck?.tag || ''}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: 60,
    marginHorizontal: 10,
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
    marginTop: 10,
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
