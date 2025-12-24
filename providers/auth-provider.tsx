'use client'

import { ReactNode, useEffect, useState, createContext, useContext } from 'react'
import { onAuthStateChanged, User } from 'firebase/auth'
import { 
  auth, 
  signUpWithEmail, 
  signInWithEmail, 
  logout as firebaseLogout, 
  signInWithGoogle 
} from '@/lib/firebase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithEmail: typeof signInWithEmail
  signUpWithEmail: typeof signUpWithEmail
  signInWithGoogle: typeof signInWithGoogle
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  signInWithEmail: async () => ({} as any),
  signUpWithEmail: async () => ({} as any),
  signInWithGoogle: async () => ({} as any),
  logout: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Get the ID token
          const token = await currentUser.getIdToken()
          
          // Sync with PostgreSQL backend & Set Cookie
          await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
          })
        } catch (error) {
          console.error("Error syncing user with backend:", error)
        }
      }
      
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await firebaseLogout() // Client side logout
      await fetch('/api/auth/logout', { method: 'POST' }) // Server side cookie clear
      setUser(null)
      router.refresh() // Refresh to update server components
      router.push('/')
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading,
      signInWithEmail,
      signUpWithEmail,
      signInWithGoogle,
      logout: handleLogout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
