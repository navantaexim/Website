'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'

interface PaywallState {
    timeSpent: number
    scrollCompleted: boolean
    paywallTriggered: boolean
}

export default function BlogPaywall() {
    const params = useParams()
    const slug = params?.slug as string
    
    // Config
    const FREE_TIME_LIMIT_SECONDS = 45 // Example limit
    
    const [state, setState] = useState<PaywallState>({
        timeSpent: 0,
        scrollCompleted: false,
        paywallTriggered: false
    })
    
    const [isMounted, setIsMounted] = useState(false)
    const stateRef = useRef<PaywallState>(state)
    
    // Keep ref in sync with state
    useEffect(() => {
        stateRef.current = state
    }, [state])

    // 1. Initial Load
    useEffect(() => {
        if (!slug) return
        
        setIsMounted(true)
        const key = `paywall:blog:${slug}`
        
        try {
            const saved = localStorage.getItem(key)
            if (saved) {
                const parsed = JSON.parse(saved)
                setState(prev => ({
                    ...prev,
                    ...parsed,
                }))
            }
        } catch (e) {
            console.error('Error loading paywall state:', e)
        }
    }, [slug])

    // 2. Timer (runs every second)
    useEffect(() => {
        if (!isMounted || !slug) return
        if (state.paywallTriggered) return // Stop timer if paywall is already triggered

        const timer = setInterval(() => {
            setState(prev => {
                const newState = { ...prev, timeSpent: prev.timeSpent + 1 }
                
                // Logic to trigger paywall (Example rule)
                if (!newState.paywallTriggered && newState.timeSpent > FREE_TIME_LIMIT_SECONDS) {
                    newState.paywallTriggered = true
                }
                
                return newState
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [isMounted, slug, state.paywallTriggered])

    // 3. Scroll Listener
    useEffect(() => {
        if (!isMounted || !slug) return
        
        const handleScroll = () => {
            const scrollTop = window.scrollY
            const docHeight = document.documentElement.scrollHeight
            const winHeight = window.innerHeight
            
            // Check if user scrolled to near bottom (90%)
            if (scrollTop + winHeight > docHeight * 0.9) {
                setState(prev => {
                    if (prev.scrollCompleted) return prev
                    return { ...prev, scrollCompleted: true }
                })
            }
        }
        
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [isMounted, slug])

    // 4. Periodic Save (every 5 seconds)
    useEffect(() => {
        if (!isMounted || !slug) return

        const saveInterval = setInterval(() => {
            const key = `paywall:blog:${slug}`
            // Save the latest state from ref to avoid stale closures in interval
            // But wait, stateRef is updated in an effect, which might be slightly delayed? 
            // Actually, using the functional update in setState is for updating state.
            // For SAVING, we need the current state.
            // Using a Ref is the standard way to access latest state in an interval.
            localStorage.setItem(key, JSON.stringify(stateRef.current))
        }, 5000)

        // Also save on unmount/page hide is often good practice, but not explicitly requested.
        
        return () => clearInterval(saveInterval)
    }, [isMounted, slug])

    if (!isMounted) return null

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
                            Keep reading this story
                        </h2>
                        <p className="mb-8 text-gray-600">
                            You've reached your free preview limit. Subscribe now to get unlimited access to all our in-depth articles.
                        </p>
                        <div className="space-y-3">
                            <button 
                                onClick={() => {
                                    // Reset for demo purposes if clicked (optional, or just do nothing)
                                    // window.location.reload()
                                    // For now, it's a hard wall.
                                }}
                                className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Subscribe for $5/month
                            </button>
                            <button 
                                onClick={() => {
                                    // Allow resetting for testing/demo?
                                    // The user requested persistent paywall.
                                    // I'll leave a backdoor for the user/dev: clear local storage.
                                }}
                                className="w-full text-xs text-gray-400 hover:text-gray-500"
                            >
                                Already a subscriber? Sign in
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
