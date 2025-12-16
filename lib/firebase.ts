import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'DEMO_KEY',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '000000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:000000000000:web:0000000000000000',
}

const isUsingDemoCredentials = 
  !process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'DEMO_KEY' ||
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY === 'AIzaSyDummyKeyForDevelopment'

let app: any
let auth: any
let googleProvider: any
let db: any

try {
  if (isUsingDemoCredentials) {
    throw new Error('Using demo credentials')
  }
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  googleProvider = new GoogleAuthProvider()
  db = getFirestore(app)
} catch (error: any) {
  console.warn('[Firebase] Using demo mode - authentication disabled. Configure Firebase credentials to enable auth.')
  // Create mock auth object for demo mode
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback: any) => callback(null),
  }
  googleProvider = null
  db = {}
}

export { auth, googleProvider, db, isUsingDemoCredentials }
