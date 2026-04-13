'use client'

import { Search, Bell, Settings } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'

export function TopBar() {
  const { setFilters } = useDashboardStore()

  return (
    <div className="h-16 border-b border-white/10 glass px-6 flex items-center justify-between">
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
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors duration-200">
          <Bell className="w-5 h-5 text-gray-400 hover:text-white" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Settings */}
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors duration-200">
          <Settings className="w-5 h-5 text-gray-400 hover:text-white" />
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 cursor-pointer hover:ring-2 hover:ring-white/20 transition-all duration-200" />
      </div>
    </div>
  )
}
