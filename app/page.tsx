'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { supabase, getActiveAccount, getConnectedAccounts, setActiveAccountStorage } from '@/lib/auth'
import { useAuth } from '@/components/auth-provider'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { ClusterList } from '@/components/cluster-list'
import { ClusterDetail } from '@/components/cluster-detail'
import { EmailDrawer } from '@/components/email-drawer'
import { ResizablePanel } from '@/components/resizable-panel'
import { ProtectedRoute } from '@/components/protected-route'
import type { Cluster } from '@/lib/types'
import { showToast } from '@/lib/toast'

function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const lastClusterCount = useRef(0)
  const { user } = useAuth()
  const {
    setClusters,
    setEmails,
    selectedClusterId,
    setSelectedClusterId,
    activeAccount,
    setActiveAccount,
    setConnectedAccounts,
  } = useDashboardStore()

  useEffect(() => {
    const stored = getActiveAccount()
    const accounts = getConnectedAccounts()
    if (accounts.length > 0) setConnectedAccounts(accounts)

    const target = stored || user?.email || ''
    if (target && target !== activeAccount) {
      setActiveAccount(target)
      if (!stored) setActiveAccountStorage(target)
    }
  }, [user?.email, activeAccount, setActiveAccount, setConnectedAccounts])

  const fetchClusters = useCallback(async (accountId: string) => {
    if (!accountId) return
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_clusters_for_account', {
        p_account_id: accountId,
        p_limit: 50,
        p_offset: 0,
      })
      if (error) throw error

      const clusters: Cluster[] = (data || []).map((cluster: any) => ({
        id: cluster.cluster_id,
        title: cluster.title || 'Untitled Cluster',
        summary: cluster.summary || '',
        priority: cluster.email_count > 30 ? 'urgent' : cluster.email_count > 15 ? 'medium' : 'low',
        email_count: cluster.email_count || 0,
        updated_at: cluster.updated_at || new Date().toISOString(),
        created_at: cluster.updated_at || new Date().toISOString(),
      }))

      setClusters(clusters)

      if (clusters.length > lastClusterCount.current) {
        const delta = clusters.length - lastClusterCount.current
        showToast(`${delta} new emails clustered`, 'success')
      }
      lastClusterCount.current = clusters.length

      if (clusters.length > 0 && !selectedClusterId) {
        setSelectedClusterId(clusters[0].id)
        const { data: emailData } = await supabase.rpc('get_emails_for_cluster', {
          p_cluster_id: clusters[0].id,
          p_account_id: accountId,
        })
        if (emailData) {
          setEmails(clusters[0].id, (emailData || []).map((email: any) => ({
            id: email.message_id,
            cluster_id: clusters[0].id,
            sender: email.sender || 'Unknown',
            sender_email: email.sender?.match(/<(.+?)>/)?.[1] || email.sender || '',
            subject: email.subject || '(No subject)',
            body: email.body || '',
            timestamp: email.created_at || new Date().toISOString(),
            is_read: true,
            is_important: false,
            tags: ['email'],
          })))
        }
      }
    } catch (error) {
      console.error('[Dashboard] Failed to fetch clusters:', error)
      setClusters([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedClusterId, setClusters, setEmails, setSelectedClusterId])

  useEffect(() => {
    if (!activeAccount) return

    fetchClusters(activeAccount)

    const channel = supabase
      .channel(`clusters:${activeAccount}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clusters',
        filter: `account_id=eq.${activeAccount}`,
      }, () => fetchClusters(activeAccount))
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeAccount, fetchClusters])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 flex gap-0 overflow-hidden">
          <ResizablePanel minWidth={280} maxWidth={560} defaultWidth={320} storageKey="cluster-panel-width">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full border-r border-white/10 overflow-hidden flex flex-col"
            >
              <ClusterList isLoading={isLoading} />
            </motion.div>
          </ResizablePanel>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="flex-1 overflow-hidden"
          >
            {selectedClusterId ? (
              <ClusterDetail />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center space-y-3">
                  <div className="text-6xl">📬</div>
                  <p className="text-lg font-medium text-gray-400">
                    {isLoading ? 'Loading clusters...' : 'Waiting for n8n to process emails — this takes up to 1 minute after connecting'}
                  </p>
                  {!isLoading && activeAccount && (
                    <p className="text-sm text-gray-600">
                      Showing clusters for <span className="text-blue-400">{activeAccount}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
      <EmailDrawer />
    </div>
  )
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
