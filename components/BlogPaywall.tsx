'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import GoogleSignInButton from '@/components/auth/google-signin-button'

interface PaywallState {
    timeSpent: number
    scrollCompleted: boolean
    paywallTriggered: boolean
}

export default function BlogPaywall() {
    const params = useParams()
    const slug = params?.slug as string
    const { user, loading } = useAuth()
    
    // Config
    const FREE_TIME_LIMIT_SECONDS = 240 // 4 minutes

    const [state, setState] = useState<PaywallState>({
        timeSpent: 0,
        scrollCompleted: false,
        paywallTriggered: false
    })
    
    const [isMounted, setIsMounted] = useState(false)
    const stateRef = useRef<PaywallState>(state)
    
    // Auth Effect: Clear storage if logged in
    useEffect(() => {
        if (user) {
            // Clear all paywall entries
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('paywall:blog:')) {
                    localStorage.removeItem(key)
                }
            })
        }
    }, [user])

    // Keep ref in sync with state
    useEffect(() => {
        stateRef.current = state
    }, [state])

    // 1. Initial Load
    useEffect(() => {
        if (!slug || loading || user) return
        
        setIsMounted(true)
        const key = `paywall:blog:${slug}`
        
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                const parsed = JSON.parse(saved)
                
                // Unified Trigger Logic: Check all conditions on load
                if (parsed.scrollCompleted || (parsed.timeSpent || 0) >= FREE_TIME_LIMIT_SECONDS || parsed.paywallTriggered) {
                    parsed.paywallTriggered = true
                }

                setState(prev => ({
                    ...prev,
                    ...parsed,
                }))
            }
        } catch (e) {
            console.error('Error loading paywall state:', e)
        }
    }, [slug, loading, user])

    // 2. Timer (runs every second)
    useEffect(() => {
        if (!isMounted || !slug || loading || user) return
        if (state.paywallTriggered) return // Stop tracking once triggered

        const timer = setInterval(() => {
            setState(prev => {
                const newState = { ...prev, timeSpent: prev.timeSpent + 1 }
                
                // Triggers paywall when total time >= 240 seconds
                if (!newState.paywallTriggered && newState.timeSpent >= FREE_TIME_LIMIT_SECONDS) {
                    newState.paywallTriggered = true
                }
                
                return newState
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isMounted, slug, state.paywallTriggered, loading, user])

    // 3. Scroll Listener
    useEffect(() => {
        if (!isMounted || !slug || loading || user) return
        if (state.paywallTriggered) return // Remove listeners if paywall triggered
        
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            
            // Calculate completion (100% with buffer)
            const isBottom = scrollTop + winHeight >= docHeight - 10

            if (isBottom) {
                setState(prev => ({
                    ...prev,
                    scrollCompleted: true,
                    paywallTriggered: true // Trigger paywall immediately
                }))
            }
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isMounted, slug, state.paywallTriggered, loading, user])

    // 4. Periodic Save (every 5 seconds)
    useEffect(() => {
        if (!isMounted || !slug || loading || user) return

        const saveInterval = setInterval(() => {
            const key = `paywall:blog:${slug}`
            // Save the latest state from ref to avoid stale closures in interval
            localStorage.setItem(key, JSON.stringify(stateRef.current))
        }, 5000)
        
        return () => clearInterval(saveInterval)
    }, [isMounted, slug, loading, user])

    if (loading || user || !isMounted) return null

    if (state.paywallTriggered) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-in fade-in duration-300">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200">
                    <div className="p-8 text-center">
                        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </div>
                        <h2 className="mb-3 text-2xl font-bold text-gray-900">
                            Start your journey today
                        </h2>
                        <p className="mb-8 text-gray-600 leading-relaxed">
                            Create a free account to continue reading and unlock deeper insights, practical examples, and future premium content curated for serious learners.
                        </p>
                        <div className="space-y-4 max-w-xs mx-auto">
                            <div className="w-full">
                                <GoogleSignInButton />
                            </div>
                            
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-gray-300" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white px-2 text-gray-500">Or</span>
                                </div>
                            </div>

                            <Link 
                                href="/signup"
                                className="block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 text-center transition-colors"
                            >
                                Create Free Account
                            </Link>

                            <p className="text-sm text-gray-500 mt-4">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500 underline decoration-blue-600/30">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
