'use client'

import { useState } from 'react'
import { useDashboardStore } from '@/lib/store'
import { supabase } from '@/lib/auth'
import { ClusterCard } from './cluster-card'
import type { Cluster } from '@/lib/types'
import { Loader2, ListFilter } from 'lucide-react'

export function ClusterList({ isLoading }: { isLoading?: boolean }) {
  const {
    selectedClusterId,
    setSelectedClusterId,
    setEmails,
    getFilteredClusters,
    activeAccount,
  } = useDashboardStore()

  const [loadingClusterId, setLoadingClusterId] = useState<string | null>(null)
  const filteredClusters = getFilteredClusters()

  const handleClusterClick = async (cluster: Cluster) => {
    setSelectedClusterId(cluster.id)
    setLoadingClusterId(cluster.id)

    try {
      const { data, error } = await supabase.rpc('get_emails_for_cluster', {
        p_cluster_id: cluster.id,
        p_account_id: activeAccount || '',
      })
      if (error) throw error
      const emails = (data || []).map((email: any) => ({
        id: email.message_id,
        cluster_id: cluster.id,
        sender: email.sender || 'Unknown',
        sender_email: email.sender?.match(/<(.+?)>/)?.[1] || email.sender || '',
        subject: email.subject || '(No subject)',
        body: email.body || '',
        timestamp: email.created_at || new Date().toISOString(),
        is_read: true,
        is_important: false,
        tags: ['email'],
      }))
      setEmails(cluster.id, emails)
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      setLoadingClusterId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* Header skeleton */}
        <div className="h-16 flex items-center px-6 border-b border-border shrink-0">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
        </div>
        {/* Item skeletons */}
        <div className="flex-1 divide-y divide-border/20">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <div className="h-3 bg-muted rounded animate-pulse" style={{ width: `${60 + (i * 7) % 20}%` }} />
                <div className="h-2 w-10 bg-muted/50 rounded animate-pulse" />
              </div>
              <div className="h-2 bg-muted/30 rounded animate-pulse" style={{ width: `${70 + i * 4}%` }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Cluster list header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-foreground">Clusters</h2>
          <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-lg">
            {filteredClusters.length}
          </span>
        </div>
        <button className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-all">
          <ListFilter size={16} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto scrollbar-minimal">
        {filteredClusters.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center px-6">
            <p className="text-xs font-bold text-muted-foreground mb-1">No clusters found</p>
            <p className="text-[10px] text-muted-foreground/60">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {filteredClusters.map((cluster) => (
              <div key={cluster.id} className="relative">
                <ClusterCard
                  cluster={cluster}
                  isActive={selectedClusterId === cluster.id}
                  onClick={() => handleClusterClick(cluster)}
                />
                {loadingClusterId === cluster.id && (
                  <div className="absolute inset-0 bg-background/30 backdrop-blur-[1px] flex items-center justify-center z-10 transition-all">
                    <Loader2 size={16} className="animate-spin text-primary" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
