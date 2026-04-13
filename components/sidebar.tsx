'use client'

import { LayoutDashboard, Mail, BarChart3, Settings, LogOut } from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { id: 'clusters', label: 'Clusters', icon: Mail, href: '/' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/settings' },
]

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-white/10 glass p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-bold text-lg">EmailCluster</h1>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.href)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200',
              'hover:bg-white/5 text-gray-400 hover:text-white',
              (pathname === item.href || (item.href === '/' && pathname === '/')) && 'bg-white/10 text-white'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* User Profile */}
      <div className="space-y-3 border-t border-white/10 pt-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Admin User</p>
            <p className="text-xs text-gray-400 truncate">admin@company.com</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
