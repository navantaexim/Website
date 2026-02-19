
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'


const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: any
let auth: any
let googleProvider: any
let db: any

try {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  db = getFirestore(app)
} catch (error: any) {
  console.warn('[Firebase] Using demo mode - authentication disabled. Configure Firebase credentials.')
  // Create mock auth object for demo mode
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => callback(null),
  }
  googleProvider = null
  db = {}
}

export { auth, googleProvider, db }

import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  signInWithPopup
} from 'firebase/auth'

export const signUpWithEmail = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password)

export const signInWithEmail = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password)

export const logout = () => firebaseSignOut(auth)

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
