import React, { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Alert } from 'react-native'
import { auth } from '../../config'
import { updateEmail, sendEmailVerification } from 'firebase/auth'
import Button from '../components/Button'

const AccountEdit = (): JSX.Element => {
  const [newEmail, setNewEmail] = useState('')

  const handleUpdateEmail = async () => {
    const user = auth.currentUser

    if (!user) {
      Alert.alert('エラー', 'ログイン状態ではありません')
      return
    }

    if (!newEmail) {
      Alert.alert('入力エラー', '新しいメールアドレスを入力してください')
      return
    }

    try {
      await updateEmail(user, newEmail)
      await sendEmailVerification(user)
      Alert.alert('メールアドレス変更完了', '認証メールを確認してください')
    } catch (error: any) {
      console.error('更新エラー:', error)
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('認証エラー', '再ログインが必要です。いったんログアウトして、再度ログインしてください。')
      } else {
        Alert.alert('変更失敗', error.message || 'エラーが発生しました')
      }
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>メールアドレスの変更</Text>
      <Text style={styles.label}>新しいメールアドレス</Text>
      <TextInput
        style={styles.input}
        value={newEmail}
        onChangeText={setNewEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="New Email Address"
      />
      <Button label="変更する" onPress={handleUpdateEmail} />
    </View>
  )
}

export default AccountEdit

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 50,
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    height: 48,
    padding: 8,
    fontSize: 16,
    marginBottom: 16,
  },
})