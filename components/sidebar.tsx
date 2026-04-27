'use client'

import { 
  LayoutDashboard, 
  Mail, 
  BarChart3, 
  ChevronLeft, 
  ChevronRight,
  ArrowRight
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useDashboardStore } from '@/lib/store'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { 
    sidebarOpen, 
    setSidebarOpen
  } = useDashboardStore()
  const [mounted, setMounted] = useState(false)

  // Handle click outside to close dropdown
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebar-open')
      if (stored !== null) {
        setSidebarOpen(stored === 'true')
      }
    }
  }, [setSidebarOpen])

  const toggleSidebar = () => {
    const newState = !sidebarOpen
    setSidebarOpen(newState)
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', String(newState))
    }
  }



  // Helper function to get avatar color based on email hash

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

        {/* Health Widget */}
        {sidebarOpen && (
          <div className="px-3 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4 shadow-sm group hover:bg-white/[0.03] transition-colors">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">System Health</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[10px] font-bold text-foreground">Healthy</span>
              </div>
            </div>
            
            <div className="relative flex items-center justify-center py-2 group/health cursor-help" title="92% of emails processed successfully in the last 24 hours">
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
                  className="text-emerald-500 transition-all group-hover/health:text-emerald-400"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-bold text-foreground">92%</span>
              </div>
            </div>

            <div className="text-center space-y-1">
              <p className="text-[11px] font-bold text-foreground">Success Rate</p>
              <p className="text-[10px] text-muted-foreground">Last 24 hours</p>
              <p className="text-[10px] text-muted-foreground opacity-50">Hover for details</p>
            </div>

            <button className="w-full py-2 px-3 flex items-center justify-between bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-all group/btn">
              <span className="text-[10px] font-bold text-foreground">View Analytics</span>
              <ArrowRight size={12} className="text-muted-foreground transition-transform group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="mt-auto" />
    </motion.aside>
  )
}
