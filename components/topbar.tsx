'use client'

import { useState } from 'react'
import { Search, Bell, Settings, LogOut, ChevronDown, Moon, Sun, Command } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { signOut } from '@/lib/auth'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface TopBarProps {
  hideSearch?: boolean
}

export function TopBar({ hideSearch = false }: TopBarProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { setFilters, theme, setTheme, activeAccount } = useDashboardStore()
  const { user } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <div className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/5 backdrop-blur-md sticky top-0 z-30 shrink-0">
      {/* Search Area */}
      <div className="flex-1 max-w-xl">
        {!hideSearch && (
          <div className="relative group max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
            <input
              type="text"
              placeholder="Search clusters or emails..."
              onChange={(e) => setFilters({ search: e.target.value })}
              className="w-full bg-white/[0.03] border border-border rounded-xl px-9 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/30 shadow-sm"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background shadow-sm pointer-events-none">
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

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 p-1.5 hover:bg-white/[0.05] rounded-xl transition-all group"
          >
            <div className="flex flex-col items-end mr-1 hidden sm:flex">
              <p className="text-xs font-bold text-foreground leading-none">{(activeAccount || user?.email || 'User').split('@')[0]}</p>
              <p className="text-[9px] text-muted-foreground leading-none mt-1 opacity-60">{activeAccount || user?.email}</p>
            </div>
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
              <span className="text-[10px] text-muted-foreground max-w-[150px] truncate">{activeAccount || user?.email}</span>
            </div>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs shadow-md group-hover:scale-105 transition-transform">
              {(activeAccount || user?.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-all" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                transition={{ duration: 0.1 }}
                className="absolute right-0 mt-3 w-60 bg-popover/80 border border-border rounded-2xl shadow-2xl z-50 overflow-hidden backdrop-blur-xl"
              >
                <div className="px-5 py-4 border-b border-border bg-white/[0.03]">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 shadow-sm">Account</p>
                  <p className="text-xs font-bold text-foreground truncate">{activeAccount || user?.email}</p>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-muted-foreground hover:bg-white/[0.05] hover:text-foreground rounded-xl transition-all"
                  >
                    <Settings size={14} />
                    Settings
                  </Link>
                </div>
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
