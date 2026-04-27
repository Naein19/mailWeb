'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { X, Reply, Forward, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmailDrawerProps {
  inline?: boolean
}

export function EmailDrawer({ inline = false }: EmailDrawerProps) {
  const {
    isEmailDrawerOpen,
    setEmailDrawerOpen,
    getSelectedEmail,
    setComposerOpen,
    setSelectedEmailId,
  } = useDashboardStore()

  const email = getSelectedEmail()

  const handleReply = () => {
    if (email?.sender_email) {
      setComposerOpen(true, 'reply_one', email.sender_email)
    }
  }

  const handleForward = () => {
    if (email) {
      setComposerOpen(true, 'forward')
    }
  }

  const handleClose = () => {
    setEmailDrawerOpen(false)
    if (inline) {
      setSelectedEmailId(null)
    }
  }

  // Empty state for inline panel
  if (!email && inline) return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center">
      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
        <Reply size={16} className="text-muted-foreground rotate-180" />
      </div>
      <p className="text-xs font-medium text-muted-foreground">Select an email to read</p>
    </div>
  )

  if (!email) return null

  // Format date nicely
  const emailDate = new Date(email.timestamp)
  const dateStr = emailDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  const timeStr = emailDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  const senderInitial = email.sender?.charAt(0)?.toUpperCase() || '?'

  const content = (
    <div className={cn(
      "h-full flex flex-col",
      inline ? "w-full bg-panel-bg" : "bg-popover w-full max-w-2xl border-l border-border shadow-2xl"
    )}>
      {/* Header */}
      <div className="h-12 flex items-center justify-between px-5 border-b border-border shrink-0">
        <span className="text-xs font-semibold text-muted-foreground">Message</span>
        {!inline && (
          <button
            onClick={handleClose}
            className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Sender Meta */}
      <div className="px-5 pt-5 pb-4 shrink-0 border-b border-border">
        {/* Sender row */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground shrink-0">
            {senderInitial}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-semibold text-foreground truncate">{email.sender}</p>
              <p className="text-[10px] text-muted-foreground whitespace-nowrap tabular-nums">{timeStr}</p>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{email.sender_email}</p>
          </div>
        </div>

        {/* Date + Subject */}
        <div className="mt-3">
          <p className="text-[10px] text-muted-foreground mb-1">{dateStr}</p>
          <h2 className="text-sm font-bold text-foreground leading-snug">{email.subject}</h2>
        </div>

        {/* Tags */}
        {email.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {email.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-secondary text-[9px] font-semibold text-muted-foreground rounded uppercase tracking-wide">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 scrollbar-minimal">
        <div className="text-[13px] text-foreground/85 leading-[1.7]">
          {email.body_html ? (
            <div
              className="[&_a]:text-blue-500 [&_a]:underline [&_p]:mb-3 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: email.body_html }}
            />
          ) : (
            <p className="whitespace-pre-wrap">{email.body}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-border px-5 py-3 flex items-center gap-2 shrink-0">
        <button
          onClick={handleReply}
          className="btn-primary flex-1"
        >
          <Reply size={13} />
          Reply
        </button>
        <button
          onClick={handleForward}
          className="btn-ghost px-3 border border-border"
          title="Forward"
        >
          <Forward size={14} />
        </button>
        <button
          className="btn-ghost px-3 border border-border"
          title="Star"
        >
          <Star
            size={14}
            className={cn(
              email.is_important ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
            )}
          />
        </button>
      </div>
    </div>
  )

  if (inline) return content

  return (
    <AnimatePresence>
      {isEmailDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/50 backdrop-blur-[2px] z-40"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: [0.32, 0, 0.67, 0] }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-2xl shadow-2xl"
          >
            {content}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
