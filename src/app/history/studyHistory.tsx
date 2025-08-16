import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text, StyleSheet, ScrollView } from 'react-native'
import Footer from '../components/footer'
import ProgressWholeCard from '../components/progressWholeCard'
import StudyHistoryCard from '../components/studyHistoryCard'

const StudyHistory = (): JSX.Element => {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>学習履歴</Text>
        <StudyHistoryCard />
        <ProgressWholeCard />
      </ScrollView>

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
  },
  container: {
    padding: 24,
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 24,
  },
})
