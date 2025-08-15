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

const StudyHistory = (): JSX.Element => {
  const router = useRouter()

  return (
    <View style={styles.wrapper}>
      <ScrollView>
        <Text style={styles.title}>学習履歴</Text>
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
