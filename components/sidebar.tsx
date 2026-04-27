'use client'

import { 
  LayoutDashboard, 
  Mail, 
  BarChart3, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  User as UserIcon,
  Link as LinkIcon,
  Bell,
  ArrowRight,
  Plus,
  Check,
  ChevronDown,
  Globe
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { useAuth } from '@/components/auth-provider'
import { signOut, signInWithGoogleAddAccount, setActiveAccountStorage, getConnectedAccounts } from '@/lib/auth'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    activeAccount, 
    setActiveAccount, 
    connectedAccounts 
  } = useDashboardStore()
  const [mounted, setMounted] = useState(false)
  const [showAccountSwitcher, setShowAccountSwitcher] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-open')
      if (stored !== null) {
        setSidebarOpen(stored === 'true')
      }
    }

    const accounts = getConnectedAccounts()
    if (accounts.length > 0) {
      useDashboardStore.getState().setConnectedAccounts(accounts)
    }
  }, [setSidebarOpen])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', String(newState))
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handleAddAccount = async () => {
    try {
      await signInWithGoogleAddAccount()
    } catch (error) {
      console.error('Failed to start add account flow:', error)
    }
  }

  const handleSwitchAccount = (email: string) => {
    setActiveAccount(email)
    setActiveAccountStorage(email)
    setShowAccountSwitcher(false)
    // Reload data will be triggered by app/page.tsx effect watching activeAccount
  }

  if (!mounted) return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 260 : 72 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="bg-[var(--sidebar-bg)] border-r border-border flex flex-col relative z-30"
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-10 z-50 w-6 h-6 rounded-md bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shadow-sm"
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>

      {/* Logo Section */}
      <div className="h-16 flex items-center px-7 gap-3 mb-2">
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
          <img src="/logo.svg" alt="Cluex Logo" className="w-5 h-5 grayscale-0 brightness-110" />
        </div>
        <AnimatePresence mode="wait">
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-lg text-foreground tracking-tight"
            >
              Cluex
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Account Switcher */}
      <div className="px-4 mb-4 relative">
        <button
          onClick={() => sidebarOpen && setShowAccountSwitcher(!showAccountSwitcher)}
          className={cn(
            "w-full flex items-center gap-3 p-2 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] transition-all group",
            !sidebarOpen && "justify-center px-0 border-none bg-transparent"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 shrink-0">
            {activeAccount ? (
              <span className="text-[10px] font-bold text-primary">{activeAccount[0].toUpperCase()}</span>
            ) : (
               <Globe size={14} className="text-muted-foreground" />
            )}
          </div>
          {sidebarOpen && (
            <>
              <div className="flex-1 text-left min-w-0">
                <p className="text-[11px] font-bold text-foreground truncate">
                  {activeAccount ? activeAccount.split('@')[0] : 'Connect Account'}
                </p>
                <p className="text-[9px] text-muted-foreground truncate opacity-60">
                   {activeAccount || 'No account active'}
                </p>
              </div>
              <ChevronDown size={14} className={cn("text-muted-foreground transition-transform", showAccountSwitcher && "rotate-180")} />
            </>
          )}
        </button>

        {/* Account Dropdown */}
        <AnimatePresence>
          {showAccountSwitcher && sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute left-4 right-4 top-full mt-2 bg-[#1A1F26] border border-[#2D333B] rounded-xl shadow-2xl z-[100] p-1.5 space-y-1"
            >
              <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">Select Account</p>
              
              <div className="max-h-[200px] overflow-y-auto scrollbar-minimal space-y-1">
                {connectedAccounts.map((acc) => (
                  <button
                    key={acc}
                    onClick={() => handleSwitchAccount(acc)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors group",
                      activeAccount === acc ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                    )}
                  >
                    <div className="w-5 h-5 rounded-md bg-white/5 flex items-center justify-center text-[10px] font-bold">
                       {acc[0].toUpperCase()}
                    </div>
                    <span className="flex-1 text-left truncate">{acc}</span>
                    {activeAccount === acc && <Check size={12} />}
                  </button>
                ))}
              </div>

              <div className="border-t border-white/5 pt-1.5 mt-1">
                <button
                  onClick={handleAddAccount}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors"
                >
                  <Plus size={14} />
                  <span>Connect Gmail</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-none px-4 space-y-8">
        {/* Main Nav */}
        <nav className="space-y-1">
          {[
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Clusters', icon: Mail, href: '/' },
            { label: 'Analytics', icon: BarChart3, href: '/analytics' },
          ].map((item) => {
            const active = isActive(item.href)
            return (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                  active 
                    ? "bg-primary/[0.08] text-foreground" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
                )}
              >
                <item.icon 
                  size={18} 
                  className={cn(
                    "transition-colors duration-200",
                    active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {sidebarOpen && (
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                )}
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-[-16px] w-[3px] h-4 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </nav>

        {/* System Group */}
        {sidebarOpen && (
          <div className="space-y-4">
            <p className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">System</p>
            <nav className="space-y-1">
              {[
                { label: 'Settings', icon: Settings, href: '/settings' },
                { label: 'Profile', icon: UserIcon, href: '/profile' },
                { label: 'Integrations', icon: LinkIcon, href: '/integrations' },
                { label: 'Notifications', icon: Bell, href: '/notifications' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-all duration-200 group"
                >
                  <item.icon size={16} className="opacity-70 group-hover:opacity-100" />
                  <span className="text-xs font-bold tracking-tight">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Health Widget */}
        {sidebarOpen && (
          <div className="px-3 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">System Health</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-bold text-foreground">Healthy</span>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center py-2">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-white/[0.05]"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray="213"
                  strokeDashoffset={213 - (213 * 0.92)}
                  strokeLinecap="round"
                  className="text-emerald-500"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">92%</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-[11px] font-bold text-foreground">Success Rate</p>
              <p className="text-[10px] text-muted-foreground">Last 24 hours</p>
            </div>

            <button className="w-full py-2 px-3 flex items-center justify-between bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-all group">
              <span className="text-[10px] font-bold text-foreground">View Analytics</span>
              <ArrowRight size={12} className="text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Profile Section */}
      <div className="p-4 border-t border-border mt-auto">
        {sidebarOpen && user ? (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-secondary/30 border border-border group cursor-pointer hover:bg-secondary/50 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs shadow-lg">
              {user.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-foreground truncate">{user.email?.split('@')[0] || 'User'}</p>
              <p className="text-[10px] text-muted-foreground truncate opacity-70">{user.email || 'user@example.com'}</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs" />
        )}
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 mt-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
        >
          <LogOut size={18} className="transition-transform group-hover:-translate-x-0.5" />
          {sidebarOpen && <span className="text-sm font-bold tracking-tight">Logout</span>}
        </button>
      </div>
    </motion.aside>
  )
}
