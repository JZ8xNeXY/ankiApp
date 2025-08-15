import { MaterialCommunityIcons } from '@expo/vector-icons'
import { doc, getDoc } from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { auth, db } from '../../config'

const StudyHistoryCard = () => {
  const [streakCount, setStreakCount] = useState<number>(0)

  useEffect(() => {
    const fetchStreakCount = async () => {
      if (!auth.currentUser) return

      try {
        const uid = auth.currentUser.uid
        const userRef = doc(db, 'users', uid)
        const snapshot = await getDoc(userRef)
        if (snapshot.exists()) {
          const data = snapshot.data()
          setStreakCount(data.streakCount ?? 0)
          return
        }
      } catch (error) {
        console.error('ユーザー情報の取得に失敗しました', error)
      }
    }

    fetchStreakCount()
  }, [])

  return (
    <View style={styles.studyHistory}>
      <MaterialCommunityIcons
        name="fire"
        size={64}
        color="red"
        style={styles.tipIcon}
      />
      <Text style={styles.studyHistoryText}>{streakCount}日連続</Text>
    </View>
  )
}

export default StudyHistoryCard

const styles = StyleSheet.create({
  tipIcon: {
    marginTop: 4,
  },
  studyHistory: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
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
  studyHistoryText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginLeft: 28,
    color: '#333333',
    flexShrink: 1,
    overflow: 'hidden',
  },
})
