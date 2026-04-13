'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Cluster as ClusterType } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ClusterCardProps {
  cluster: ClusterType
  isActive?: boolean
  onClick?: () => void
}

export function ClusterCard({ cluster, isActive, onClick }: ClusterCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400 bg-red-500/10'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/10'
      case 'low':
        return 'text-green-400 bg-green-500/10'
      default:
        return 'text-gray-400 bg-gray-500/10'
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'p-4 rounded-lg cursor-pointer transition-all duration-200 group',
        'glass hover:shadow-lg',
        isActive && 'ring-2 ring-blue-500 bg-blue-500/10'
      )}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-sm leading-tight flex-1 group-hover:text-blue-400 transition-colors">
            {cluster.title}
          </h3>
          <span
            className={cn(
              'text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap',
              getPriorityColor(cluster.priority)
            )}
          >
            {cluster.priority.charAt(0).toUpperCase() + cluster.priority.slice(1)}
          </span>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2">{cluster.summary}</p>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <span className="text-xs text-gray-500">
            {cluster.email_count} emails
          </span>
          <span className="text-xs text-gray-600">{formatTime(cluster.updated_at)}</span>
        </div>
      </div>
    </motion.div>
  )
}
