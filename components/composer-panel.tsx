'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Send, Loader } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { sendWebhookReply, extractRecipients } from '@/lib/webhook'
import { showToast } from '@/lib/toast'
import { useAuth } from '@/components/auth-provider'

export function ComposerPanel() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [forwardRecipient, setForwardRecipient] = useState('')
  const [isSending, setIsSending] = useState(false)

  const {
    isComposerOpen,
    setComposerOpen,
    composerType,
    composerRecipient,
    getSelectedCluster,
    getSelectedClusterEmails,
    activeAccount,
  } = useDashboardStore()
  const { user } = useAuth()

  const cluster = getSelectedCluster()
  const emails = getSelectedClusterEmails()

  const handleClose = () => {
    setComposerOpen(false)
    setSubject('')
    setMessage('')
    setForwardRecipient('')
  }

  const handleSend = async () => {
    if (!message.trim()) {
      showToast('Message cannot be empty', 'warning')
      return
    }

    if (!subject.trim()) {
      showToast('Subject is required', 'warning')
      return
    }

    try {
      setIsSending(true)

      let recipients: string[] = []

      if (composerType === 'reply_all') {
        recipients = extractRecipients(emails)
        if (recipients.length === 0) {
          showToast('No recipients found in cluster', 'error')
          return
        }
      } else if (composerType === 'reply_one' && composerRecipient) {
        recipients = [composerRecipient]
      } else if (composerType === 'forward') {
        if (!forwardRecipient.trim()) {
          showToast('Please enter a recipient email address', 'warning')
          return
        }
        recipients = [forwardRecipient]
      } else {
        showToast('Invalid composer configuration', 'error')
        return
      }

      const payload = {
        type: composerType,
        cluster_id: cluster?.id || 'unknown',
        cluster_title: cluster?.title || 'Unknown',
        account_id: activeAccount || user?.email || '',
        subject,
        message,
        reply_body: message,
        recipients,
        original_email_data: (Array.isArray(emails) ? emails : []).map(e => ({
          id: e.id,
          sender: e.sender || 'Unknown',
          sender_email: e.sender_email || 'unknown@unknown.com',
          subject: e.subject || '(no subject)',
          body: e.body || '',
          timestamp: e.timestamp || new Date().toISOString(),
        })),
        email_count: (Array.isArray(emails) ? emails : []).length,
        timestamp: new Date().toISOString(),
      }

      const result = await sendWebhookReply(payload)

      if (result.success) {
        showToast('Message sent successfully!', 'success')
        handleClose()
      } else {
        showToast(result.message || 'Failed to send message', 'error')
      }
    } catch (error) {
      console.error('[Composer] Error:', error)
      showToast('Error sending message', 'error')
    } finally {
      setIsSending(false)
    }
  }

  return (
    <AnimatePresence>
      {isComposerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-[2px] z-[60]"
          />

          {/* Composer Panel - Phase 5 */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-background border-l border-border z-[70] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-12 flex items-center justify-between px-6 border-b border-border shrink-0">
              <span className="label-section">New Message</span>
              <button
                onClick={handleClose}
                className="p-1.5 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-minimal">
              {/* Context strip */}
              <div>
                <p className="text-sm font-semibold text-foreground capitalize">
                  {composerType?.replace('_', ' ')}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {composerType === 'reply_all'
                    ? `Replying to ${emails.length} contacts in cluster`
                    : composerRecipient || 'New message'}
                </p>
                {composerType === 'reply_all' && (
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 mt-3">
                    <p className="text-xs text-gray-500 mb-1">To: {extractRecipients(emails).length} recipient(s)</p>
                    <p className="text-xs text-gray-300 break-all">{extractRecipients(emails).join(', ')}</p>
                    <p className="text-xs text-gray-600 mt-1.5">
                      ✓ Each person receives a separate individual email (via n8n Loop)
                    </p>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Subject */}
                <div>
                  <label className="label-section block mb-1.5">Subject</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter subject..."
                    className="input-base"
                  />
                </div>

                {/* Forward recipient */}
                {composerType === 'forward' && (
                  <div>
                    <label className="label-section block mb-1.5">Forward To</label>
                    <input
                      type="email"
                      value={forwardRecipient}
                      onChange={(e) => setForwardRecipient(e.target.value)}
                      placeholder="recipient@example.com"
                      className="input-base"
                    />
                  </div>
                )}

                {/* Message */}
                <div>
                  <label className="label-section block mb-1.5">Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    className="input-base min-h-[320px] resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between shrink-0">
              <button
                onClick={handleClose}
                className="btn-outline"
              >
                Discard
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="btn-primary px-6 disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader size={13} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={13} />
                    Send
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
