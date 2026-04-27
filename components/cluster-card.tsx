'use client'

import { Cluster as ClusterType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Mail, MessageCircle, Forward, Archive } from 'lucide-react'

interface ClusterCardProps {
  cluster: ClusterType
  isActive?: boolean
  unread?: boolean
  onClick?: () => void
  onReplyAll?: () => void
}

export function ClusterCard({ cluster, isActive, unread = true, onClick, onReplyAll }: ClusterCardProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick?.()
    }
  }

  // Determine badge colors based on priority
  const priorityStyles = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-400/10 text-amber-500 border-amber-500/20',
    low:    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }[cluster.priority] || 'bg-secondary text-muted-foreground'

  // Get accent color based on priority
  const accentColor = {
    urgent: 'bg-destructive',
    medium: 'bg-amber-500',
    low:    'bg-emerald-500',
  }[cluster.priority] || 'bg-primary'

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full text-left px-5 py-4 transition-all duration-200 group relative border-l-2 hover:translate-y-[-1px] cursor-pointer",
        isActive
          ? "bg-primary/[0.05] border-primary shadow-sm"
          : "hover:bg-white/[0.02] border-transparent hover:shadow-sm"
      )}
    >
      {/* Left Accent Bar on Hover */}
      {!isActive && (
        <div className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r opacity-0 group-hover:opacity-100 transition-opacity",
          accentColor
        )} />
      )}

      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex items-start gap-2 min-w-0">
          {/* Unread indicator - blue dot like screenshot */}
          <div className="mt-1.5 flex-shrink-0">
            {unread ? (
              <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
            ) : (
              <div className="w-2 h-2" />
            )}
          </div>
          
          <h3 className={cn(
            "text-[13px] font-bold leading-tight line-clamp-2",
            isActive ? "text-foreground" : "text-foreground/90 group-hover:text-foreground transition-colors"
          )}>
            {cluster.title}
          </h3>
        </div>
        <span className="text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5 opacity-60">
          {formatDate(cluster.updated_at)}
        </span>
      </div>

      <p className="text-[11px] text-muted-foreground line-clamp-1 leading-normal ml-4 opacity-70 mb-3">
        {cluster.summary}
      </p>

      <div className="flex items-center gap-2.5 ml-4 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Mail size={11} className="opacity-50" />
            <span className="text-[10px] font-bold">{cluster.email_count}</span>
          </div>
          
          <span className={cn(
            "px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wider",
            priorityStyles
          )}>
            {cluster.priority}
          </span>
        </div>

        {/* Quick Action Icons - Fade in on Hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onReplyAll?.()
            }}
            className="p-1 hover:bg-white/[0.05] rounded transition-colors text-muted-foreground hover:text-foreground"
            title="Reply All"
          >
            <MessageCircle size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('Forward')
            }}
            className="p-1 hover:bg-white/[0.05] rounded transition-colors text-muted-foreground hover:text-foreground"
            title="Forward"
          >
            <Forward size={12} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              console.log('Archive')
            }}
            className="p-1 hover:bg-white/[0.05] rounded transition-colors text-muted-foreground hover:text-foreground"
            title="Archive"
          >
            <Archive size={12} />
          </button>
        </div>
      </div>
      
      {/* Selection Border logic handled by border-l-2 above */}
    </div>
  )
}
