'use client'

import { LayoutDashboard, Mail, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { signOut } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'clusters', label: 'Clusters', icon: Mail, href: '/' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useDashboardStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('sidebar-open')
    if (stored !== null) {
      setSidebarOpen(stored === 'true')
    }
  }, [setSidebarOpen])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    localStorage.setItem('sidebar-open', String(newState))
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!mounted) return null

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 256 : 80 }}
      transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
      className="border-r border-white/10 glass flex flex-col relative overflow-hidden"
    >
      {/* Toggle Button */}
      <motion.button
        onClick={toggleSidebar}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="absolute -right-3 top-8 z-50 p-1 rounded-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-4 h-4 text-blue-400" />
        ) : (
          <ChevronRight className="w-4 h-4 text-blue-400" />
        )}
      </motion.button>

      {/* Content Container */}
      <div className="p-6 flex flex-col h-full">
        {/* Logo */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            {sidebarOpen && (
              <motion.h1
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="font-bold text-lg whitespace-nowrap"
              >
                EmailCluster
              </motion.h1>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2">
          {navigationItems.map((item) => (
            <motion.button
              key={item.id}
              onClick={() => router.push(item.href)}
              whileHover={{ x: sidebarOpen ? 4 : 0 }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
                'hover:bg-white/5 text-gray-400 hover:text-white',
                (pathname === item.href || (item.href === '/' && pathname === '/')) && 'bg-white/10 text-white',
                !sidebarOpen && 'justify-center'
              )}
              title={!sidebarOpen ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* User Profile */}
        <div className="space-y-3 border-t border-white/10 pt-4">
          {sidebarOpen && user && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-white/5"
            >
              <p className="text-sm font-medium truncate">{user.email.split('@')[0]}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </motion.div>
          )}
          <motion.button
            onClick={handleLogout}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-sm',
              !sidebarOpen && 'justify-center'
            )}
            title={!sidebarOpen ? 'Logout' : undefined}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
      </div>
    </motion.aside>
  )
}
