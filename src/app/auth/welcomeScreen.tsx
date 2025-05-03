import React ,{useState,useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { auth } from '../../config'

const WelcomeScreen = (): JSX.Element => {
  const router = useRouter();

  const [loading, setLoading] = useState(true)

  const handlePress = () => {
    router.replace('/auth/logIn');
  };

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

  return (
    <LinearGradient
      colors={['#FFFDE7', '#FFECB3', '#FFD54F']}
      style={styles.container}
    >
      <Text style={styles.logo}>マイアンキカード</Text>
      <Text style={styles.catchphrase}>学習を、もっとシンプルに。</Text>
      <Text style={styles.description}>効率よく復習できる毎日の習慣づくり。</Text>

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>タップしてはじめる</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default WelcomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#2C2C2C', 
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  catchphrase: {
    color: '#333333', 
    fontSize: 18,
    marginBottom: 10,
  },
  description: {
    color: '#555555', 
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 50,
  },
  button: {
    backgroundColor: '#2C64C6', 
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  buttonText: {
    color: '#ffffff', 
    fontWeight: 'bold',
    fontSize: 20,
  },
});