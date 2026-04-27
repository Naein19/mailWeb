'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import type { User } from '@supabase/supabase-js'
import {
  onAuthStateChange,
  addConnectedAccount,
  getActiveAccount,
  setActiveAccountStorage,
  getConnectedAccounts,
  type AuthUser,
} from '@/lib/auth'

interface AuthContextType {
  user: User | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const currentUser = useDashboardStore((state) => state.currentUser)
  const setCurrentUser = useDashboardStore((state) => state.setCurrentUser)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const accounts = getConnectedAccounts()
    useDashboardStore.getState().setConnectedAccounts(accounts)

    const activeAcc = getActiveAccount()
    if (activeAcc) {
      useDashboardStore.getState().setActiveAccount(activeAcc)
    } else if (accounts.length > 0) {
      useDashboardStore.getState().setActiveAccount(accounts[0])
      setActiveAccountStorage(accounts[0])
    }

    const unsubscribe = onAuthStateChange((currentUser: AuthUser | null) => {
      setCurrentUser(currentUser as any)

      if (currentUser?.email) {
        addConnectedAccount(currentUser.email)
        const stored = getActiveAccount()
        if (!stored) setActiveAccountStorage(currentUser.email)
        const store = useDashboardStore.getState()
        store.setConnectedAccounts(getConnectedAccounts())
        const active = getActiveAccount() || currentUser.email
        if (store.activeAccount !== active) store.setActiveAccount(active)
      }
      
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [setCurrentUser])

  return (
    <AuthContext.Provider value={{ user: currentUser as any, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
