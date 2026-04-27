'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Bell, Settings, LogOut, ChevronDown, Moon, Sun, Command, Plus, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { signOut, setActiveAccountStorage } from '@/lib/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  hideSearch?: boolean
}

export function TopBar({ hideSearch = false }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { setFilters, theme, setTheme, activeAccount, setActiveAccount, connectedAccounts } = useDashboardStore()
  const { user } = useAuth()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  // Helper function to get avatar color based on email hash
  const getAvatarColor = (email: string) => {
    const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-cyan-500 to-cyan-600',
      'from-emerald-500 to-emerald-600',
      'from-orange-500 to-orange-600',
      'from-indigo-500 to-indigo-600',
      'from-rose-500 to-rose-600',
    ]
    return colors[hash % colors.length]
  }

  // Handle click outside to close menu
  useEffect(() => {
    if (!showMenu) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAddAccount = () => {
    try {
      setShowMenu(false)
      // Navigate to login page instead of direct OAuth
      router.push('/login')
    } catch (error) {
      console.error('Failed to navigate to login:', error)
    }
  }

  const handleSwitchAccount = (email: string) => {
    setActiveAccount(email)
    setActiveAccountStorage(email)
    setShowMenu(false)
  }

  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/5 backdrop-blur-md sticky top-0 z-30 shrink-0">
      {/* Search Area */}
      <div className="flex-1 max-w-xl">
        {!hideSearch && (
          <div className="relative group max-w-md focus-within:scale-[1.01] transition-transform">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search clusters or emails..."
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-white/[0.03] border border-border rounded-xl px-9 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-sm focus:scale-105 group-focus-within:border-primary/40"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background shadow-sm pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity">
              <Command size={10} className="text-muted-foreground" />
              <span className="text-[10px] font-bold text-muted-foreground">K</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-3">
        {/* Toggle Theme - Pill style like screenshot */}
        <div className="flex items-center gap-1 p-1 bg-white/[0.03] border border-border rounded-lg shadow-inner">
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              theme === 'dark' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Moon size={13} />
          </button>
          <button
            onClick={() => setTheme('light')}
            className={cn(
              "p-1.5 rounded-md transition-all",
              theme === 'light' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sun size={13} />
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 hover:bg-white/[0.05] rounded-xl text-muted-foreground hover:text-foreground transition-all relative group"
          >
            <Bell size={18} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background shadow-lg">
              3
            </span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-3 w-80 bg-popover/80 border border-border rounded-2xl shadow-2xl p-4 z-50 backdrop-blur-xl"
              >
                <div className="text-center py-10">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell size={18} className="text-primary" />
                  </div>
                  <p className="text-xs font-bold text-foreground">You're all caught up!</p>
                  <p className="text-[10px] text-muted-foreground mt-1 opacity-60">No new notifications to show right now.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.05] rounded-full transition-all group border border-border"
          >
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-6 h-6 rounded-full bg-gradient-to-br flex items-center justify-center font-bold text-white text-xs shadow-md",
                activeAccount ? getAvatarColor(activeAccount) : "from-gray-500 to-gray-600"
              )}>
                {(activeAccount || user?.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col items-start leading-none hidden sm:block">
                <p className="text-xs font-bold text-foreground">{(activeAccount || user?.email || 'User').split('@')[0]}</p>
                <p className="text-[9px] text-muted-foreground opacity-60">{activeAccount || user?.email}</p>
              </div>
            </div>
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
            <ChevronDown size={14} className={cn("text-muted-foreground group-hover:text-foreground transition-all flex-shrink-0", showMenu && "rotate-180")} />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-3 w-72 bg-popover border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Connected Accounts Header */}
                <div className="px-5 py-4 border-b border-border bg-white/[0.03]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Connected Accounts</p>
                  <div className="space-y-2 max-h-[240px] overflow-y-auto">
                    {connectedAccounts.length > 0 ? (
                      connectedAccounts.map((acc) => (
                        <button
                          key={acc}
                          onClick={() => handleSwitchAccount(acc)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors group",
                            activeAccount === acc ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                          )}
                        >
                          <div className={cn(
                            "w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shrink-0",
                            getAvatarColor(acc)
                          )}>
                            {acc[0].toUpperCase()}
                          </div>
                          <span className="flex-1 text-left truncate font-medium">{acc}</span>
                          {activeAccount === acc && <Check size={14} className="shrink-0 text-primary" />}
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-muted-foreground/60 px-3 py-2">No connected accounts</p>
                    )}
                  </div>
                </div>

                {/* Connect Gmail Button */}
                <div className="p-1.5 border-t border-border bg-white/[0.02]">
                  <button
                    onClick={handleAddAccount}
                    className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors"
                  >
                    <Plus size={14} />
                    Connect another Gmail account
                  </button>
                </div>

                {/* Settings */}
                <div className="p-1.5 border-t border-border">
                  <Link
                    href="/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-white/[0.05] hover:text-foreground rounded-xl transition-all"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                </div>

                {/* Sign Out */}
                <div className="p-1.5 border-t border-border bg-white/[0.02]">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
