'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComposeModalProps {
  isOpen: boolean
  onClose: () => void
  onSend: (body: string) => Promise<void>
  toField: string
  toReadonly?: boolean
  subject: string
  title: string
  onToChange?: (value: string) => void
}

export function ComposeModal({
  isOpen,
  onClose,
  onSend,
  toField,
  toReadonly = false,
  subject,
  title,
  onToChange,
}: ComposeModalProps) {
  const [body, setBody] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [localTo, setLocalTo] = useState(toField)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setBody('')
      setLocalTo(toField)
    }
  }, [isOpen, toField])

  const handleSend = async () => {
    if (!body.trim()) return
    setIsSending(true)
    try {
      await onSend(body)
      setBody('')
      onClose()
    } finally {
      setIsSending(false)
    }
  }

  const handleBackdropClick = () => {
    if (!isSending) {
      onClose()
    }
  }

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSending) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, isSending, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl bg-background border border-white/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 bg-background/50">
                <h2 className="text-base font-bold text-foreground">{title}</h2>
                <button
                  onClick={onClose}
                  disabled={isSending}
                  className="p-1 hover:bg-white/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 min-h-[400px] max-h-[calc(90vh-140px)]">
                {/* To Field */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    To:
                  </label>
                  <input
                    type="text"
                    value={localTo}
                    onChange={(e) => {
                      setLocalTo(e.target.value)
                      onToChange?.(e.target.value)
                    }}
                    readOnly={toReadonly}
                    placeholder="recipient@example.com"
                    className={cn(
                      'w-full px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-foreground font-mono placeholder:text-muted-foreground/50 transition-all',
                      'focus:outline-none focus:border-primary/50 focus:bg-white/[0.04]',
                      toReadonly && 'bg-white/[0.01] cursor-not-allowed opacity-70'
                    )}
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Subject:
                  </label>
                  <input
                    type="text"
                    value={subject}
                    readOnly
                    className="w-full px-3 py-2.5 bg-white/[0.01] border border-white/10 rounded-lg text-sm text-muted-foreground cursor-not-allowed opacity-60 font-mono"
                  />
                </div>

                {/* Body Textarea */}
                <div className="flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                    Message:
                  </label>
                  <textarea
                    autoFocus
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Write your reply here..."
                    className={cn(
                      'w-full h-48 px-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 resize-none transition-all',
                      'focus:outline-none focus:border-primary/50 focus:bg-white/[0.04]'
                    )}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 bg-background/50">
                <button
                  onClick={onClose}
                  disabled={isSending}
                  className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-lg transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={isSending || !body.trim()}
                  className={cn(
                    'px-5 py-2 text-sm font-bold text-primary-foreground bg-primary rounded-lg transition-all flex items-center gap-2',
                    'hover:opacity-90 active:scale-95',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isSending ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
