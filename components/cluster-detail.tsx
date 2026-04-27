'use client'

import { useDashboardStore } from '@/lib/store'
import { EmailListItem } from './email-list-item'
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
  User,
  Tag,
  ArrowRight
} from 'lucide-react'

export function ClusterDetail() {
  const { getSelectedCluster, getSelectedClusterEmails, setComposerOpen, setSelectedClusterId } = useDashboardStore()

  const cluster = getSelectedCluster()
  const emails = getSelectedClusterEmails()

  const handleReplyAll = () => {
    if (!cluster) {
      showToast('No cluster selected', 'error')
      return
    }
    setComposerOpen(true, 'reply_all')
  }

  if (!cluster) {
    return null
  }

  // Determine priority badge styles
  const priorityStyles = {
    urgent: 'bg-destructive/10 text-destructive border-destructive/20',
    medium: 'bg-amber-400/10 text-amber-500 border-amber-500/20',
    low:    'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  }[cluster.priority] || 'bg-secondary text-muted-foreground'

  // Extract participants (unique senders)
  const participants = Array.from(new Set(emails.map(e => e.sender))).slice(0, 3)

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
            onClick={handleReplyAll}
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
             <span className={cn(
              "px-3 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider",
              priorityStyles
            )}>
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
               <p className="text-xl font-bold text-foreground pl-5 group-hover:translate-x-1 transition-transform">{cluster.email_count}</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck size={14} className="opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Priority</span>
               </div>
               <p className={cn("text-xl font-bold pl-5 group-hover:translate-x-1 transition-transform first-letter:uppercase", 
                 cluster.priority === 'urgent' ? 'text-destructive' : 'text-foreground'
               )}>{cluster.priority}</p>
            </div>
            <div className="p-4 rounded-2xl border border-border bg-white/[0.02] space-y-2 group hover:border-primary/20 transition-all">
               <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={14} className="opacity-50" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Latest</span>
               </div>
               <p className="text-xs font-bold text-foreground pl-5 leading-tight group-hover:translate-x-1 transition-transform">
                  {new Date(cluster.updated_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
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

          {/* Participants section */}
          <div className="border-t border-border pt-8 mb-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <User size={14} className="text-muted-foreground opacity-50" />
                <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">Participants</h3>
              </div>
              <button className="text-[10px] font-bold text-primary hover:underline bg-primary/5 px-3 py-1 rounded-lg">View All ({participants.length})</button>
            </div>
            
            <div className="flex flex-wrap gap-4">
              {participants.map((sender, i) => (
                <div key={i} className="flex items-center gap-3 pr-6 py-2 border-r border-border last:border-0 hover:bg-secondary/20 rounded-xl transition-all cursor-pointer group">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center font-bold text-primary-foreground text-xs shadow-md group-hover:scale-105 transition-transform">
                    {sender[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{sender.split('<')[0].trim()}</p>
                    <p className="text-[10px] text-muted-foreground truncate opacity-60">
                      {sender.includes('<') ? sender.split('<')[1].replace('>', '') : sender}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emails Section */}
          <div className="border-t border-border pt-10">
            <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                  <Mail size={16} className="text-muted-foreground opacity-50" />
                  <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">All Emails in this Cluster</h2>
               </div>
            </div>
            
            <div className="rounded-3xl border border-border overflow-hidden bg-white/[0.01] divide-y divide-border">
              {emails.length === 0 ? (
                <div className="h-40 flex items-center justify-center bg-secondary/10">
                  <p className="text-xs text-muted-foreground font-bold italic">No emails found</p>
                </div>
              ) : (
                emails.map((email) => (
                  <EmailListItem key={email.id} email={email} />
                ))
              )}
            </div>
          </div>
          
          {/* Labels Section */}
          <div className="mt-14 pt-10 border-t border-border mb-10">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-2.5 rounded-xl bg-secondary/50 border border-border">
                      <Tag size={16} className="text-muted-foreground" />
                   </div>
                   <div className="flex flex-col">
                      <p className="text-[12px] font-bold text-foreground">Cluster labels</p>
                      <div className="flex gap-2 mt-2">
                         <span className="px-2 py-1 bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold rounded-lg leading-none cursor-default">
                            {cluster.title.split(' ').slice(0, 1).join('-').toLowerCase()}
                         </span>
                      </div>
                   </div>
                </div>
                <button className="px-5 py-2.5 bg-white/[0.03] hover:bg-white/[0.06] border border-border rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 group shadow-sm active:scale-95">
                   Manage Labels
                   <ArrowRight size={14} className="opacity-50 transition-transform group-hover:translate-x-0.5" />
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
