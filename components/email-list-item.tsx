'use client'

import { useDashboardStore } from '@/lib/store'
import { Email } from '@/lib/types'
import { cn } from '@/lib/utils'
import { MoreVertical } from 'lucide-react'

interface EmailListItemProps {
  email: Email
}

export function EmailListItem({ email }: EmailListItemProps) {
  const { setSelectedEmailId, setEmailDrawerOpen } = useDashboardStore()

  const handleClick = () => {
    setSelectedEmailId(email.id)
    setEmailDrawerOpen(true)
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return { dateStr, timeStr }
  }

  const { dateStr, timeStr } = formatDateTime(email.timestamp)

  const senderName = email.sender?.includes('<')
    ? email.sender.split('<')[0].trim()
    : email.sender
  
  const initials = senderName?.[0]?.toUpperCase() || '?'

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full text-left px-6 py-5 transition-all duration-200 group relative border-l-2",
        !email.is_read
          ? "bg-primary/[0.02] border-primary"
          : "bg-transparent border-transparent hover:bg-white/[0.01]"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center font-bold text-foreground text-xs shadow-sm flex-shrink-0">
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-1">
            <div className="min-w-0">
              <p className="text-[13px] font-bold text-foreground truncate">{senderName}</p>
              <p className="text-[11px] text-muted-foreground truncate opacity-70 leading-relaxed mt-0.5">
                {email.subject || '(no subject)'}
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <div className="flex items-center gap-2">
                {!email.is_read && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded uppercase tracking-wider border border-primary/20">
                    Unread
                  </span>
                )}
                <p className="text-[10px] font-bold text-muted-foreground opacity-60 uppercase">{dateStr}</p>
                <button className="p-1 hover:bg-secondary rounded transition-colors opacity-0 group-hover:opacity-100">
                  <MoreVertical size={13} className="text-muted-foreground" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground opacity-40">{timeStr}</p>
            </div>
          </div>
          
          <p className="text-[11px] text-muted-foreground line-clamp-1 opacity-50 mt-1">
             {email.body?.substring(0, 120)}...
          </p>
        </div>
      </div>
    </button>
  )
}
