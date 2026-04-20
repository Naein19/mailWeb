'use client'

import { useDashboardStore } from '@/lib/store'
import { Email } from '@/lib/types'
import { Star, ExternalLink } from 'lucide-react'

interface EmailListItemProps {
  email: Email
}

export function EmailListItem({ email }: EmailListItemProps) {
  const { setSelectedEmailId, setEmailDrawerOpen } = useDashboardStore()

  const handleClick = () => {
    setSelectedEmailId(email.id)
    setEmailDrawerOpen(true)
  }

  return (
    <div
      onClick={handleClick}
      className="w-full p-4 hover:bg-white/5 transition-colors duration-200 text-left group cursor-pointer"
    >
      <div className="flex items-start gap-3">
        {/* Unread indicator */}
        {!email.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
        )}
        {email.is_read && <div className="w-2 h-2 mt-2 flex-shrink-0" />}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm group-hover:text-blue-400 transition-colors">
              {email.sender}
            </p>
            <span className="text-xs text-gray-500 flex-shrink-0 whitespace-nowrap">
              {new Date(email.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          <p className="text-sm text-gray-400 mb-1 line-clamp-1">
            {email.subject}
          </p>

          <p className="text-xs text-gray-500 line-clamp-2">
            {email.body}
          </p>

          {/* Tags */}
          {email.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {email.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            <Star
              className={`w-4 h-4 ${
                email.is_important
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-500'
              }`}
            />
          </button>
          <button
            className="p-1 hover:bg-white/10 rounded transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <ExternalLink className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}
