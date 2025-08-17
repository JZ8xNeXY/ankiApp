import { useRouter } from 'expo-router'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Footer from '../components/footer'
import ProgressIndividualCard from '../components/progressIndividualCard'
import ProgressWholeCard from '../components/progressWholeCard'

const StudyProgress = (): JSX.Element => {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>進捗状況</Text>
      <ProgressWholeCard />
      <ProgressIndividualCard />
      <Footer
        current="Progress"
        onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
      />
    </View>
  )
}

export default StudyProgress

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
