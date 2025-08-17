import { useRouter } from 'expo-router'
import { signOut } from 'firebase/auth'
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
import StudyHistoryGraph from '../components/studyHistoryGraph'

const SettingsScreen = (): JSX.Element => {
  const router = useRouter()

  const handleOpenForm = () => {
    Linking.openURL(
      'https://docs.google.com/forms/d/1d9DFnJrN1fBiRtKGn5e_FzcQygW_utP4YpkfsJDGueQ/viewform',
    )
  }

  const handleSignOut = (): void => {
    Alert.alert(
      'ログアウトしますか？',
      'もう一度ログインするにはメールアドレスとパスワードが必要です。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'ログアウト',
          style: 'destructive',
          onPress: () => {
            signOut(auth)
              .then(() => {
                router.replace('/auth/logIn')
              })
              .catch(() => {
                Alert.alert('ログアウトに失敗しました')
              })
          },
        },
      ],
    )
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>設定</Text>

        <StudyHistoryGraph />

        {/* <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/accountEdit')}
        >
          <Text style={styles.menuText}>アカウント情報の編集</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/settings/term')}
        >
          <Text style={styles.menuText}>利用規約とプライバシーポリシー</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleOpenForm}>
          <Text style={styles.menuText}>お問い合わせ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
          <Text style={styles.logoutText}>ログアウト</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>v1.0.0</Text> */}
      </ScrollView>

      <Footer
        current="Settings"
        onNavigate={(screen) => router.push(`/${screen.toLowerCase()}`)}
      />
    </View>
  )
}

export default SettingsScreen

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
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  menuText: {
    fontSize: 18,
  },
  logoutButton: {
    marginTop: 40,
    paddingVertical: 16,
    backgroundColor: '#2C64C6',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  versionText: {
    marginTop: 50,
    textAlign: 'center',
    color: '#888',
  },
})
