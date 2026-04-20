'use client'

import { useState } from 'react'
import { Search, Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { signOut } from '@/lib/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function TopBar() {
  const [showMenu, setShowMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { setFilters } = useDashboardStore()
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
    <div className="h-16 border-b border-white/10 bg-black/20 backdrop-blur-md px-6 flex items-center justify-between relative">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search emails or clusters..."
            onChange={(e) =>
              setFilters({ search: e.target.value })
            }
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <div className="relative">
          <motion.button
            onClick={() => setShowNotifications(!showNotifications)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"
            />
          </motion.button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-80 glass border border-white/10 rounded-xl shadow-xl z-50"
              >
                <div className="p-4">
                  <p className="text-sm text-gray-400">No new notifications</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings & Profile Dropdown */}
        <div className="relative">
          <motion.button
            onClick={() => setShowMenu(!showMenu)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 flex items-center justify-center flex-shrink-0 font-bold text-black text-sm">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </motion.button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 glass border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="p-3 border-b border-white/10">
                  <p className="text-sm font-medium text-white">{user?.email?.split('@')[0]}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>

                <div className="py-2">
                  <Link
                    href="/settings"
                    onClick={() => setShowMenu(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-200"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => setShowMenu(false)}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                </div>

                <div className="border-t border-white/10 p-2">
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ x: 4 }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors duration-200 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
