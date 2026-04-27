'use client'

import { Cluster as ClusterType } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Mail } from 'lucide-react'

interface ClusterCardProps {
  cluster: ClusterType
  isActive?: boolean
  unread?: boolean
  onClick?: () => void
}

export function ClusterCard({ cluster, isActive, unread = true, onClick }: ClusterCardProps) {
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  // Determine badge colors based on priority
  const priorityStyles = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-400/10 text-amber-500 border-amber-500/20',
    low:    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }[cluster.priority] || 'bg-secondary text-muted-foreground'

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left px-5 py-4 transition-all duration-200 group relative border-l-2",
        isActive
          ? "bg-primary/[0.05] border-primary"
          : "hover:bg-white/[0.02] border-transparent"
      )}
    >
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
            isActive ? "text-foreground" : "text-foreground/90 group-hover:text-primary transition-colors"
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

      <div className="flex items-center gap-2.5 ml-4">
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
      
      {/* Selection Border logic handled by border-l-2 above */}
    </button>
  )
}
