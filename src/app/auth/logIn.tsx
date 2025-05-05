import { Link, router } from 'expo-router'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { auth } from '../../config'
import Button from '../components/Button'

const LogIn = (): JSX.Element => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)

  // Firebaseの認証状態を監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('ログイン済みユーザー:', user.uid)
        router.replace('/memo/deckScreen') // ログイン済みならdeckScreenへ遷移
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // ログイン処理
  const handlePress = (): void => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log('ログイン成功:', userCredential.user.uid)
        router.replace('/memo/deckScreen') // ログイン成功後、deckScreenへ遷移
      })
      .catch((error) => {
        console.log(error.code, error.message)
        Alert.alert('ログインエラー', error.message)
      })
  }

  // ロード中はローディング表示
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#467FD3" />
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>ログイン</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={(e) => setEmail(e)}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="メールアドレス"
          textContentType="emailAddress"
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={(e) => setPassword(e)}
          autoCapitalize="none"
          secureTextEntry
          placeholder="パスワード"
          textContentType="password"
        />
        <Button label="送信" onPress={handlePress} />
        <View style={styles.footer}>
          <Text style={styles.footerText}>未登録の方</Text>
          <Link href="/auth/signUp" asChild replace>
            <TouchableOpacity>
              <Text style={styles.footerLink}>新規登録はこちら</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  )
}

export default LogIn

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDE7',

  },
  inner: {
    marginTop: 50,
    paddingVertical: 24,
    paddingHorizontal: 27,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dddddd',
    height: 48,
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
  },
  footerText: {
    fontSize: 14,
    lineHeight: 24,
    marginRight: 8,
    color: '#000000',
  },
  footerLink: {
    fontSize: 14,
    lineHeight: 24,
    color: '#467fd3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
