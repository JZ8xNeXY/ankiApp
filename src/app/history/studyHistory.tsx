import { useRouter } from 'expo-router'
import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native'
import { auth } from '../../config'
import Footer from '../components/footer'
import StudyHistoryCard from '../components/studyHistoryCard'

const StudyHistory = (): JSX.Element => {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>学習履歴</Text>
        <StudyHistoryCard />
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
  // tipIcon: {
  //   marginTop: 4,
  // },
  // studyHistory: {
  //   flexDirection: 'row',
  //   justifyContent: 'flex-start',
  //   alignItems: 'center',
  //   backgroundColor: '#FDFDFD',
  //   paddingVertical: 25,
  //   paddingHorizontal: 20,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#ccc',
  //   marginTop: 10,
  //   marginHorizontal: 10,
  //   borderRadius: 20,
  //   shadowColor: '#000',
  //   shadowOffset: { width: 0, height: 4 },
  //   shadowOpacity: 0.15,
  //   shadowRadius: 8,
  //   elevation: 5,
  // },
  // studyHistoryText: {
  //   fontSize: 32,
  //   fontWeight: 'bold',
  //   marginLeft: 28,
  //   color: '#333333',
  //   flexShrink: 1,
  //   overflow: 'hidden',
  // },
})
