'use client'

import { ReactNode, useEffect, useState } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { createContext, useContext } from 'react'

interface AuthContextType {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const { doc, setDoc, serverTimestamp } = await import('firebase/firestore')
          await setDoc(doc(db, 'users', currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLogin: serverTimestamp(),
            updatedAt: serverTimestamp(),
          }, { merge: true })
        } catch (error) {
          console.error("Error saving user to Firestore:", error)
        }
      }
      
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
