import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Footer from '../components/Footer'
import StudyHistoryCard from '../components/studyHistoryCard'
import StudyHistoryGraph from '../components/studyHistoryGraph'
import StudyHistoryGraphMonth from '../components/studyHistoryGraphMonth'
import StudyHistoryGraphWeek from '../components/studyHistoryGraphWeek'
import StudyHistoryGraphYear from '../components/studyHistoryGraphYear'

type GraphType = 'day' | 'week' | 'month' | 'year'

const StudyHistory = (): JSX.Element => {
  const router = useRouter()

  const [selected, setSelected] = useState<GraphType>('day')

  const renderGraph = () => {
    switch (selected) {
      case 'day':
        return <StudyHistoryGraph />
      case 'week':
        return <StudyHistoryGraphWeek />
      case 'month':
        return <StudyHistoryGraphMonth />
      case 'year':
        return <StudyHistoryGraphYear />
      default:
        return null
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>学習履歴</Text>
      <StudyHistoryCard />

      {/* 切り替えボタン */}
      <View style={styles.switcher}>
        {(['day', 'week', 'month', 'year'] as GraphType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.button, selected === type && styles.activeButton]}
            onPress={() => setSelected(type)}
          >
            <Text style={[styles.text, selected === type && styles.activeText]}>
              {type === 'day' && '日'}
              {type === 'week' && '週'}
              {type === 'month' && '月'}
              {type === 'year' && '年'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* グラフ表示エリア */}
      {renderGraph()}

      <Footer
        current="History"
        onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
      />
    </View>
  )
}

export default StudyHistory

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#FFFDE7',
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 75,
    marginLeft: 25,
    marginBottom: 24,
  },
  switcher: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 50,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#4caf50',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
  activeText: {
    color: 'white',
    fontWeight: 'bold',
  },
})
