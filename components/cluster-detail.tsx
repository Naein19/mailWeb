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
} from 'lucide-react'
import { Email } from '@/lib/types'
import {
  parseSenderEmail,
  parseSenderName,
  stripHtmlTags,
  formatDateShort,
  getAvatarColor,
  decodeHTMLEntities,
  isValidEmail,
} from '@/lib/utils'
import { ComposeModal } from './compose-modal'

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
  const [composeType, setComposeType] = useState<'reply' | 'reply_all' | 'forward'>('reply')

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
    setComposeType('reply')
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
    setComposeType('reply_all')
    setLocalSelectedEmail(emails[0])
    setShowCompose(true)
  }

  const handleForward = (email: Email) => {
    setLocalSelectedEmail(email)
    setComposeRecipient('')
    setComposeSubject(`Fwd: ${email.subject}`)
    setComposeType('forward')
    setShowCompose(true)
  }

  const handleSendCompose = async (body: string) => {
    if (!composeRecipient.trim()) {
      showToast('Please enter recipient email address', 'error')
      return
    }

    if (composeType === 'forward' && !isValidEmail(composeRecipient)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    try {
      const type = composeType === 'reply_all' ? 'reply_all' : composeType === 'reply' ? 'reply_one' : 'forward'

      const payload = {
        type: type,
        recipients: composeRecipient.split(',').map((e) => e.trim()),
        subject: composeSubject,
        reply_body: body,
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

      showToast('Reply sent ✓', 'success')
    } catch (error) {
      console.error('[ClusterDetail] Failed to send compose:', error)
      showToast('Failed to send. Try again.', 'error')
      throw error // Re-throw to keep modal open
    }
  }

  // If email is selected, show read view
  if (selectedEmail) {
    const senderName = parseSenderName(selectedEmail.sender)
    const senderEmail = parseSenderEmail(selectedEmail.sender)

    return (
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {/* Header with back button and actions */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
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
              className="h-9 px-4 bg-white/[0.05] border border-white/20 text-foreground text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-white/[0.08] transition-all"
            >
              <Reply size={14} />
              Reply
            </button>
            <button
              onClick={() => handleReplyAll()}
              className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
            >
              <ReplyAll size={14} />
              Reply All
            </button>
            <button
              onClick={() => handleForward(selectedEmail)}
              className="h-9 px-4 bg-white/[0.05] border border-white/20 text-foreground text-xs font-bold rounded-lg flex items-center gap-2 hover:bg-white/[0.08] transition-all"
            >
              <Forward size={14} />
              Forward
            </button>
          </div>
        </div>

        {/* Email Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 max-w-4xl mx-auto">
            {/* Email Header */}
            <div className="mb-8 pb-8 border-b border-white/10">
              <h1 className="text-2xl font-bold text-foreground mb-6">{selectedEmail.subject}</h1>

              <div className="space-y-3 text-sm">
                <div className="flex gap-4">
                  <span className="font-bold text-muted-foreground w-12">From:</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-md bg-gradient-to-br flex items-center justify-center text-xs font-bold text-white',
                        getAvatarColor(senderEmail)
                      )}
                    >
                      {senderName[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium">{senderName}</p>
                      <p className="text-muted-foreground text-xs">{senderEmail}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <span className="font-bold text-muted-foreground w-12">To:</span>
                  <span className="text-foreground">{activeAccount}</span>
                </div>

                <div className="flex gap-4">
                  <span className="font-bold text-muted-foreground w-12">Date:</span>
                  <span className="text-foreground">
                    {new Date(selectedEmail.timestamp).toLocaleDateString([], {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="prose dark:prose-invert prose-sm max-w-none">
              {selectedEmail.body_html ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: selectedEmail.body_html.replace(
                      /<img[^>]*>/g,
                      ''
                    ), // Remove problematic img tags
                  }}
                  style={{
                    all: 'initial',
                    fontFamily: 'inherit',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--foreground)',
                    overflowX: 'auto',
                  }}
                  className="text-foreground/80"
                />
              ) : (
                <pre className="bg-white/[0.02] border border-white/10 rounded-lg p-4 text-foreground/80 leading-relaxed whitespace-pre-wrap font-sans break-words">
                  {decodeHTMLEntities(stripHtmlTags(selectedEmail.body))}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Compose Modal */}
        <ComposeModal
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          onSend={handleSendCompose}
          toField={composeRecipient}
          toReadonly={composeType !== 'forward'}
          subject={composeSubject}
          title={
            composeType === 'reply'
              ? `Reply to ${senderName}`
              : composeType === 'reply_all'
              ? 'Reply All'
              : 'Forward'
          }
          onToChange={(value) => setComposeRecipient(value)}
        />
      </div>
    )
  }

  // Cluster detail view with email list
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-sm shrink-0">
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
            className="h-9 px-4 bg-primary text-primary-foreground text-xs font-bold rounded-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <ReplyAll size={14} />
            Reply All
          </button>

          <div className="flex items-center gap-2 border-l border-white/10 pl-2 ml-2">
            <button className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all flex items-center justify-center">
              <Calendar size={16} />
            </button>
            <button className="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all flex items-center justify-center">
              <Trash2 size={16} />
            </button>
            <button className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all flex items-center justify-center">
              <MoreHorizontal size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-8 max-w-4xl mx-auto">
          {/* Cluster Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-2xl font-bold text-foreground">{cluster.title}</h1>
              <span
                className={cn(
                  'px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider',
                  priorityStyles
                )}
              >
                {cluster.priority}
              </span>
            </div>
            <p className="text-sm text-foreground/70 leading-relaxed">{cluster.summary}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-10 pb-10 border-b border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Emails</span>
              </div>
              <p className="text-lg font-bold text-foreground pl-6">{cluster.email_count}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Priority</span>
              </div>
              <p className={cn('text-lg font-bold pl-6', cluster.priority === 'urgent' ? 'text-destructive' : 'text-foreground')}>
                {cluster.priority}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Latest</span>
              </div>
              <p className="text-xs font-bold text-foreground pl-6">
                {new Date(cluster.updated_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layout size={14} />
                <span className="text-[11px] font-bold uppercase tracking-wider">Cluster</span>
              </div>
              <p className="text-xs font-bold text-foreground pl-6 truncate">{cluster.title.slice(0, 15)}...</p>
            </div>
          </div>

          {/* Emails List */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">All Emails</h2>
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                {emails.length}
              </span>
            </div>

            {!Array.isArray(emails) ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">Error loading emails</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No emails found</p>
              </div>
            ) : (
              <div className="space-y-px border border-white/10 rounded-xl overflow-hidden">
                {emails.map((email, idx) => {
                  const senderName = parseSenderName(email.sender)
                  const preview = decodeHTMLEntities(stripHtmlTags(email.body)).substring(0, 90)
                  const avatarBg = getAvatarColor(email.sender_email)

                  return (
                    <button
                      key={email.id}
                      onClick={() => handleEmailClick(email)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 transition-all hover:bg-white/[0.03]',
                        idx !== emails.length - 1 && 'border-b border-white/5'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'w-9 h-9 rounded-md bg-gradient-to-br flex items-center justify-center text-[11px] font-bold text-white shrink-0',
                            avatarBg
                          )}
                        >
                          {(email.sender || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <p className="text-xs font-bold text-foreground">{senderName}</p>
                            <p className="text-[10px] font-bold text-muted-foreground opacity-60 shrink-0">
                              {formatDateShort(email.timestamp)}
                            </p>
                          </div>
                          <p className="text-xs font-bold text-foreground mb-1">{email.subject}</p>
                          <p className="text-[12px] text-muted-foreground opacity-60 line-clamp-1">{preview}...</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
