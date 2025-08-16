import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Footer from '../components/footer'
import ProgressIndividualCard from '../components/progressIndividualCard'
import ProgressWholeCard from '../components/progressWholeCard'
import StudyHistoryCard from '../components/studyHistoryCard'

const StudyHistory = (): JSX.Element => {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>学習履歴</Text>
      <StudyHistoryCard />
      <ProgressWholeCard />
      <ProgressIndividualCard />
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
})
