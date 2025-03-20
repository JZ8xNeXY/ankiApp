import { initializeApp } from "firebase/app"
import { initializeAuth, getReactNativePersistence } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"

const firebaseConfig = {
  apiKey: process.env.development.EXPO_PUBLIC_FB_API_KEY,
  authDomain: process.env.development.EXPO_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.development.EXPO_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.development.EXPO_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.development.EXPO_PUBLIC_FB_MESSAGING_SENDER_ID,
  appId: process.env.development.EXPO_PUBLIC_FB_APP_ID
}

const app = initializeApp(firebaseConfig)

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage) 
})

const db = getFirestore(app)

export { app, auth, db }