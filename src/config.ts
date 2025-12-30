import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage'
import { initializeApp,getApp, getApps } from 'firebase/app'
import { initializeAuth, getAuth, getReactNativePersistence } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import  isMockTime  from './app/dev/mockTime'

let firebaseConfig

if (!isMockTime()) {
  //本番用のfirebaseConfig//
 firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FB_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FB_APP_ID,
}
} else {
//開発用のfirebaseConfig//
 firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_DEV_FB_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_DEV_FB_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_DEV_FB_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_DEV_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_DEV_FB_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_DEV_FB_APP_ID,
}

}

// Appは二重初期化しない
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

let auth

try {
  auth = getAuth(app)
} catch {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  })
}

const db = getFirestore(app)

console.log(
  !isMockTime() ? '🔥 Firebase: PROD/MOCK' : '🧪 Firebase: DEV'
)

export { app, auth, db }
