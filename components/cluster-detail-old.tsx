'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { showToast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import {
  Trash2,
  ReplyAll,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  Mail,
  ShieldCheck,
  Clock,
  Layout,
  Reply,
  Forward,
  Send,
  X,
} from 'lucide-react'
import { Email } from '@/lib/types'
import {
  parseSenderEmail,
  parseSenderName,
  stripHtmlTags,
  formatDateShort,
  getAvatarColor,
} from '@/lib/utils'

export function ClusterDetail() {
  const {
    getSelectedCluster,
    getSelectedClusterEmails,
    setSelectedClusterId,
    activeAccount,
  } = useDashboardStore()

  const cluster = getSelectedCluster()
  const emails = getSelectedClusterEmails()
  const [selectedEmail, setLocalSelectedEmail] = useState<Email | null>(null)
  const [showCompose, setShowCompose] = useState(false)
  const [composeRecipient, setComposeRecipient] = useState('')
  const [composeSubject, setComposeSubject] = useState('')
  const [composeBody, setComposeBody] = useState('')
  const [composeSending, setComposeSending] = useState(false)

  if (!cluster) {
    return null
  }

  // Determine priority badge styles
  const priorityStyles = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-400/10 text-amber-500 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }[cluster.priority] || 'bg-secondary text-muted-foreground'

  const handleEmailClick = (email: Email) => {
    setLocalSelectedEmail(email)
  }

  const handleReply = (email: Email) => {
    setLocalSelectedEmail(email)
    const senderEmail = parseSenderEmail(email.sender)
    setComposeRecipient(senderEmail)
    setComposeSubject(`Re: ${email.subject}`)
    setShowCompose(true)
  }

  const handleReplyAll = () => {
    if (!emails.length) return
    const allSenders = [
      ...new Set(
        emails
          .map((e) => parseSenderEmail(e.sender))
          .filter((e) => e && e !== activeAccount)
      ),
    ]
    setComposeRecipient(allSenders.join(', '))
    setComposeSubject(`Re: ${cluster.title}`)
    setLocalSelectedEmail(emails[0])
    setShowCompose(true)
  }

  const handleForward = (email: Email) => {
    setLocalSelectedEmail(email)
    setComposeRecipient('')
    setComposeSubject(`Fwd: ${email.subject}`)
    setShowCompose(true)
  }

  const handleSendCompose = async () => {
    if (!composeBody.trim()) {
      showToast('Please write a message', 'error')
      return
    }

    setComposeSending(true)
    try {
      // Determine if this is a reply, reply-all, or forward based on compose context
      const isReplyAll = composeRecipient.includes(',')
      const type = isReplyAll ? 'reply_all' : 'reply_one'

      const payload = {
        type: type,
        recipients: composeRecipient.split(',').map((e) => e.trim()),
        subject: composeSubject,
        reply_body: composeBody,
        account_id: activeAccount,
        cluster_id: cluster.id,
        cluster_title: cluster.title,
      }

      const response = await fetch(process.env.NEXT_PUBLIC_N8N_REPLY_WEBHOOK || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to send')

      showToast('Message sent successfully', 'success')
      setShowCompose(false)
      setComposeBody('')
      setComposeRecipient('')
      setComposeSubject('')
    } catch (error) {
      console.error('[ClusterDetail] Failed to send compose:', error)
      showToast('Failed to send message', 'error')
    } finally {
      setComposeSending(false)
    }
  }

  // If email is selected, show read view
  if (selectedEmail) {
    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {/* Header with back button and actions */}
        <div className="h-20 flex items-center justify-between px-8 border-b border-border bg-background/50 backdrop-blur-md shrink-0">
          <button
            onClick={() => {
              setLocalSelectedEmail(null)
              setShowCompose(false)
            }}
            className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all group"
          >
            <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Back to cluster
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleReply(selectedEmail)}
              className="h-9 px-3 bg-white/[0.03] border border-border text-foreground text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-white/[0.05] transition-all"
            >
              <Reply size={14} />
              Reply
            </button>
            <button
              onClick={() => handleReplyAll()}
              className="h-9 px-3 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 transition-all"
            >
              <ReplyAll size={14} />
              Reply All
            </button>
            <button
              onClick={() => handleForward(selectedEmail)}
              className="h-9 px-3 bg-white/[0.03] border border-border text-foreground text-xs font-bold rounded-xl flex items-center gap-2 hover:bg-white/[0.05] transition-all"
            >
              <Forward size={14} />
              Forward
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-minimal">
          <div className="px-10 py-10">
            {/* Email header info */}
            <div className="border-b border-border pb-8 mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-4">{selectedEmail.subject}</h2>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-bold">From:</span> {parseSenderName(selectedEmail.sender)}{' '}
                  &lt;{parseSenderEmail(selectedEmail.sender)}&gt;
                </div>
                <div>
                  <span className="font-bold">To:</span> {activeAccount}
                </div>
                <div>
                  <span className="font-bold">Date:</span> {formatDateShort(selectedEmail.timestamp)}
                </div>
              </div>
            </div>

            {/* Email body */}
            <div className="prose dark:prose-invert max-w-none">
              {selectedEmail.body_html ? (
                <div
                  dangerouslySetInnerHTML={{ __html: selectedEmail.body_html }}
                  style={{ all: 'revert' }}
                  className="text-foreground/80 leading-relaxed whitespace-pre-wrap"
                />
              ) : (
                <pre className="text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans">
                  {stripHtmlTags(selectedEmail.body)}
                </pre>
              )}
            </div>

            {/* Compose panel if showing */}
            {showCompose && (
              <div className="mt-12 p-6 border border-border rounded-2xl bg-white/[0.02] space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-foreground">Compose Message</h3>
                  <button
                    onClick={() => setShowCompose(false)}
                    className="p-1 hover:bg-secondary rounded transition-colors"
                  >
                    <X size={16} className="text-muted-foreground" />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="To: recipient@example.com"
                    value={composeRecipient}
                    onChange={(e) => setComposeRecipient(e.target.value)}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />

                  <input
                    type="text"
                    placeholder="Subject"
                    value={composeSubject}
                    readOnly
                    className="w-full bg-background/50 border border-border rounded-lg px-4 py-2 text-xs text-muted-foreground opacity-60 cursor-not-allowed"
                  />

                  <textarea
                    placeholder="Write your message..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full h-32 bg-background border border-border rounded-lg px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />

                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => {
                        setShowCompose(false)
                        setComposeBody('')
                      }}
                      className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendCompose}
                      disabled={composeSending}
                      className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                      {composeSending ? 'Sending...' : (
                        <>
                          <Send size={12} />
                          Send
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Cluster detail view with email list
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Top Header Actions */}
      <div className="h-20 flex items-center justify-between px-8 border-b border-border bg-background/50 backdrop-blur-md shrink-0">
        <button
          onClick={() => setSelectedClusterId(null)}
          className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-all group"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to clusters
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleReplyAll()}
            className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-xl flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            <ReplyAll size={14} />
            Reply All
          </button>

          <div className="h-9 w-px bg-border mx-1" />

          <div className="flex items-center gap-1">
            <button className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
              <Calendar size={16} />
            </button>
            <button className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all">
              <Trash2 size={16} />
            </button>
            <button className="h-9 w-9 rounded-xl border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-all">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-minimal">
        {/* Main Title Section */}
        <div className="px-10 py-10">
          <div className="flex items-center gap-3 mb-6 animate-in slide-in-from-left duration-500">
            <h1 className="text-2xl font-bold text-foreground tracking-tight max-w-2xl">
              {cluster.title}
            </h1>
            <span
              className={cn(
                'px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider',
                priorityStyles
              )}
            >
              {cluster.priority} Priority
            </span>
          </div>

          <p className="text-sm text-foreground/70 leading-relaxed max-w-3xl mb-10 opacity-80 border-l-2 border-primary/20 pl-6 italic">
            {cluster.summary}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-14">
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Emails</span>
              </div>
              <p className="text-xl font-bold text-foreground pl-5 group-hover:translate-x-1 transition-transform">
                {cluster.email_count}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck size={14} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Priority</span>
              </div>
              <p
                className={cn(
                  'text-xl font-bold pl-5 group-hover:translate-x-1 transition-transform first-letter:uppercase',
                  cluster.priority === 'urgent' ? 'text-destructive' : 'text-foreground'
                )}
              >
                {cluster.priority}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Latest</span>
              </div>
              <p className="text-xs font-bold text-foreground pl-5 leading-tight group-hover:translate-x-1 transition-transform">
                {new Date(cluster.updated_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layout size={14} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cluster</span>
              </div>
              <p className="text-[11px] font-bold text-foreground pl-5 truncate group-hover:translate-x-1 transition-transform opacity-70">
                {cluster.title.slice(0, 15)}...
              </p>
            </div>
          </div>

          {/* Emails Section */}
          <div className="border-t border-border pt-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-muted-foreground opacity-50" />
                <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
                  All Emails in this Cluster
                </h2>
                <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
                  {emails.length}
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-border overflow-hidden bg-white/[0.01] divide-y divide-border">
              {!Array.isArray(emails) ? (
                <div className="h-40 flex items-center justify-center bg-secondary/10">
                  <p className="text-xs text-muted-foreground font-bold italic">Error loading emails</p>
                </div>
              ) : emails.length === 0 ? (
                <div className="h-40 flex items-center justify-center bg-secondary/10">
                  <p className="text-xs text-muted-foreground font-bold italic">No emails found</p>
                </div>
              ) : (
                emails.map((email) => {
                  const senderName = parseSenderName(email.sender)
                  const preview = stripHtmlTags(email.body).substring(0, 100)
                  const avatarBg = getAvatarColor(email.sender_email)

                  return (
                    <button
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className="w-full text-left px-6 py-4 hover:bg-white/[0.02] transition-colors flex items-start gap-4 group"
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-md',
                          avatarBg
                        )}
                      >
                        {(email.sender || 'U')[0].toUpperCase()}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-foreground">{senderName}</p>
                            <p className="text-[11px] font-bold text-foreground mt-0.5">{email.subject}</p>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground opacity-60 shrink-0">
                            {formatDateShort(email.timestamp)}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground opacity-60 line-clamp-1">
                          {preview}...
                        </p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
