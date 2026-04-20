'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { X, Reply, Forward, Star, Tag } from 'lucide-react'

export function EmailDrawer() {
  const {
    isEmailDrawerOpen,
    setEmailDrawerOpen,
    getSelectedEmail,
    setComposerOpen,
  } = useDashboardStore()

  const email = getSelectedEmail()

  const handleReply = () => {
    if (email?.sender_email) {
      setComposerOpen(true, 'reply_one', email.sender_email)
    }
  }

  const handleForward = () => {
    setComposerOpen(true, 'forward', '')
  }

  if (!email) return null

  return (
    <AnimatePresence>
      {isEmailDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setEmailDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-2xl glass z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="h-16 border-b border-white/10 flex items-center justify-between px-6">
              <h2 className="font-semibold truncate">Email Details</h2>
              <button
                onClick={() => setEmailDrawerOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-6">
                {/* From */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    From
                  </p>
                  <p className="font-semibold">{email.sender}</p>
                  <p className="text-sm text-gray-400">{email.sender_email}</p>
                </div>

                {/* Subject */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Subject
                  </p>
                  <p className="text-lg font-semibold">{email.subject}</p>
                </div>

                {/* Timestamp */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                    Date
                  </p>
                  <p className="text-sm">
                    {new Date(email.timestamp).toLocaleString()}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-white/10" />

                {/* Body */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                    Message
                  </p>
                  <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                    {email.body_html ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: email.body_html }}
                        className="space-y-2"
                      />
                    ) : (
                      <p className="text-gray-300 whitespace-pre-wrap">{email.body}</p>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {email.tags.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {email.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="h-20 border-t border-white/10 px-6 py-4 flex items-center gap-2 bg-white/2">
              <motion.button
                onClick={handleReply}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                <Reply className="w-4 h-4" />
                Reply
              </motion.button>
              <motion.button
                onClick={handleForward}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg glass hover:bg-white/10 transition-all duration-200 text-sm font-medium border border-white/10 hover:border-white/20"
              >
                <Forward className="w-4 h-4" />
                Forward
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <Star className="w-4 h-4 text-gray-400 hover:text-yellow-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
              >
                <Tag className="w-4 h-4 text-gray-400 hover:text-white" />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
