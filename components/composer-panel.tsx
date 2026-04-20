'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { X, Send, Loader } from 'lucide-react'
import { useDashboardStore } from '@/lib/store'
import { sendWebhookReply, extractRecipients } from '@/lib/webhook'
import { showToast } from '@/lib/toast'

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
  } = useDashboardStore()

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

      // Determine recipients based on type
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

      // Build complete webhook payload
      const payload = {
        type: composerType,
        cluster_id: cluster?.id || 'unknown',
        cluster_title: cluster?.title || 'Unknown',
        subject,
        message,
        reply_body: message,
        recipients,
        original_email_data: emails.map(e => ({
          id: e.id,
          sender: e.sender || 'Unknown',
          sender_email: e.sender_email || 'unknown@unknown.com',
          subject: e.subject || '(no subject)',
          body: e.body || '',
          timestamp: e.timestamp || new Date().toISOString(),
        })),
        email_count: emails.length,
        timestamp: new Date().toISOString(),
      }

      console.log(`[Composer] Sending ${composerType} with ${recipients.length} recipient(s)`)
      console.log(`[Composer] Payload:`, payload)

      // Send via API proxy (not directly to n8n)
      const result = await sendWebhookReply(payload)

      if (result.success) {
        showToast('Message sent successfully! 🎉', 'success')
        handleClose()
      } else {
        showToast(result.message || 'Failed to send message', 'error')
        console.error('[Composer] Send failed:', result.error)
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
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Composer Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md glass z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
              <h2 className="font-semibold text-lg">
                {composerType === 'reply_all' && 'Reply All'}
                {composerType === 'reply_one' && 'Reply'}
                {composerType === 'forward' && 'Forward'}
              </h2>
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Recipient Info or Input */}
            {composerRecipient && (composerType === 'reply_all' || composerType === 'reply_one') && (
              <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                <p className="text-xs text-gray-500 mb-1">To:</p>
                <p className="text-sm font-medium">{composerRecipient}</p>
              </div>
            )}

            {/* Forward Recipient Input */}
            {composerType === 'forward' && (
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Recipient
                </label>
                <input
                  type="email"
                  value={forwardRecipient}
                  onChange={(e) => setForwardRecipient(e.target.value)}
                  placeholder="Enter recipient email..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200"
                />
              </div>
            )}

              {/* Subject Input */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200"
                />
              </div>

              {/* Message Textarea */}
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-300 mb-2 block">
                  Message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message..."
                  className="w-full h-64 px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm transition-all duration-200 resize-none"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="h-20 border-t border-white/10 px-6 py-4 flex items-center gap-3 bg-white/2">
              <motion.button
                onClick={handleClose}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-colors duration-200 text-sm font-medium border border-white/10"
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSend}
                disabled={isSending}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 disabled:from-blue-600/50 disabled:to-cyan-500/50 disabled:cursor-not-allowed transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                {isSending ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
