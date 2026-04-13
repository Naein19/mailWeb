'use client'

import { motion } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { EmailListItem } from './email-list-item'
import {
  MoreVertical,
  Archive,
  Trash2,
  CheckCircle2,
} from 'lucide-react'

export function ClusterDetail() {
  const { getSelectedCluster, getSelectedClusterEmails } = useDashboardStore()

  const cluster = getSelectedCluster()
  const emails = getSelectedClusterEmails()

  if (!cluster) {
    return null
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      case 'low':
        return 'text-green-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-full flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{cluster.title}</h1>
              <p className="text-gray-400 text-sm">{cluster.summary}</p>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200">
              <MoreVertical className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass p-3 rounded-lg">
              <p className="text-gray-500 text-xs">Total Emails</p>
              <p className="text-lg font-semibold mt-1">{cluster.email_count}</p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="text-gray-500 text-xs">Priority</p>
              <p className={`text-lg font-semibold mt-1 ${getPriorityColor(cluster.priority)}`}>
                {cluster.priority.charAt(0).toUpperCase() + cluster.priority.slice(1)}
              </p>
            </div>
            <div className="glass p-3 rounded-lg">
              <p className="text-gray-500 text-xs">Unread</p>
              <p className="text-lg font-semibold mt-1">
                {emails.filter((e) => !e.is_read).length}
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex gap-2 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Reply All
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm font-medium">
              <Archive className="w-4 h-4" />
              Archive
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 glass hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-colors duration-200 text-sm font-medium">
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-white/5">
          {emails.length === 0 ? (
            <div className="h-full flex items-center justify-center text-gray-500">
              <p>No emails in this cluster</p>
            </div>
          ) : (
            emails.map((email, index) => (
              <motion.div
                key={email.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <EmailListItem email={email} />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
