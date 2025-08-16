import { doc, getDoc } from 'firebase/firestore'
import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { auth, db } from '../../config'

const ProgressWholeCard = () => {
  useEffect(() => {
    const fetchProgressWholeCount = async () => {
      if (!auth.currentUser) return

      console.log('カードを読み込みました。')
    }

    fetchProgressWholeCount()
  }, [])

  return (
    <View style={styles.progressWholeCard}>
      <View style={styles.progressCardTexts}>
        <Text style={styles.progressCardText}>カード累計</Text>
        <Text style={styles.progressCardText}>1000枚</Text>
      </View>
      <View style={styles.progressCardTexts}>
        <Text style={styles.progressCardText}>できたカード累計</Text>
        <Text style={styles.progressCardText}>500枚</Text>
      </View>
    </View>
  )
}

export default ProgressWholeCard

const styles = StyleSheet.create({
  tipIcon: {
    marginTop: 4,
  },
  progressWholeCard: {
    flexDirection: 'column',
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
  progressCardTexts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 6,
    flexShrink: 1,
    overflow: 'hidden',
  },
  progressCardText: {
    overflow: 'hidden',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
})
