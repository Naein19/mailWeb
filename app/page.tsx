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

  const handleCardReplyAll = (cluster: Cluster) => {
    // Select the cluster
    setSelectedClusterId(cluster.id)
    // The ClusterDetail component will handle showing the compose panel
  }

  useEffect(() => {
    const stored = getActiveAccount()
    const accounts = getConnectedAccounts()
    if (accounts.length > 0) setConnectedAccounts(accounts)

    // Use user email as account_id (backend expects email, not UUID)
    const target = stored || user?.email || ''
    console.log('[Dashboard] Account initialization:', {
      userEmail: user?.email,
      userId: user?.id,
      stored,
      target,
      currentActiveAccount: activeAccount,
    })

    if (target && target !== activeAccount) {
      console.log('[Dashboard] Setting active account to:', target)
      setActiveAccount(target)
      if (!stored) setActiveAccountStorage(target)
    }
  }, [user?.email, activeAccount, setActiveAccount, setConnectedAccounts])

  const fetchClusters = useCallback(async (accountId: string) => {
    if (!accountId) {
      console.warn('[Dashboard] Cannot fetch clusters: no accountId provided', {
        userEmail: user?.email,
        userId: user?.id,
        activeAccount,
      })
      return
    }

    setIsLoading(true)
    console.log('[Dashboard] ===== FETCH CLUSTERS START =====')
    console.log('[Dashboard] Input account ID:', accountId, {
      userEmail: user?.email,
      userId: user?.id,
      accountIdType: typeof accountId,
      isEmail: accountId.includes('@'),
    })

    try {
      // STEP 1: Verify user identity
      console.log('[Dashboard] STEP 1: Verifying user...')
      console.log('[Dashboard] USER EMAIL:', user?.email)
      console.log('[Dashboard] USER ID:', user?.id)
      
      if (!user?.email) {
        throw new Error('User email missing — cannot fetch clusters')
      }

      // STEP 2: Verify session exists
      console.log('[Dashboard] STEP 2: Checking session...')
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('[Dashboard] Session check result:', {
        hasSession: !!session,
        sessionError,
        userId: session?.user?.id,
      })
      
      if (!session) {
        throw new Error('No session — user not authenticated')
      }

      // STEP 3: Call RPC with full debug
      console.log('[Dashboard] STEP 3: Calling RPC get_clusters_for_account...')
      console.log('[Dashboard] RPC Parameters:', {
        p_account_id: accountId,
        p_limit: 50,
        p_offset: 0,
      })

      const { data, error } = await supabase.rpc('get_clusters_for_account', {
        p_account_id: accountId,
        p_limit: 50,
        p_offset: 0,
      })

      // 🔥 FULL RAW LOG - This reveals the real error
      console.log('[Dashboard] RAW RPC RESPONSE:', { data, error })
      console.log('[Dashboard] RPC Response Details:', {
        dataType: typeof data,
        dataIsArray: Array.isArray(data),
        dataLength: Array.isArray(data) ? data.length : 'N/A',
        dataValue: data,
        errorExists: !!error,
        errorType: error?.constructor?.name,
      })

      if (error) {
        console.error('[Dashboard] ❌ FULL ERROR OBJECT:')
        console.error(JSON.stringify(error, null, 2))
        console.error('[Dashboard] Error properties:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        })
        throw new Error(`Supabase RPC failed: ${error.message || JSON.stringify(error)}`)
      }

      // STEP 4: Validate response format
      console.log('[Dashboard] STEP 4: Validating response format...')
      if (!Array.isArray(data)) {
        console.error('[Dashboard] ❌ Invalid data format - not an array:', {
          type: typeof data,
          isArray: Array.isArray(data),
          value: data,
          accountIdUsed: accountId,
        })
        setClusters([])
        return
      }

      console.log('[Dashboard] ✓ Response is valid array with', data.length, 'items')

      if (data.length === 0) {
        console.log('[Dashboard] No clusters in response (empty array)')
        setClusters([])
        return
      }

      // STEP 5: Transform clusters
      console.log('[Dashboard] STEP 5: Transforming', data.length, 'clusters...')
      const clusters: Cluster[] = data.map((cluster: any) => {
        if (!cluster.cluster_id) {
          console.warn('[Dashboard] Cluster missing cluster_id:', cluster)
        }
        return {
          id: cluster.cluster_id || `unknown-${Date.now()}`,
          title: cluster.title || 'Untitled Cluster',
          summary: cluster.summary || '',
          priority: cluster.email_count > 30 ? 'urgent' : cluster.email_count > 15 ? 'medium' : 'low',
          email_count: cluster.email_count || 0,
          updated_at: cluster.updated_at || new Date().toISOString(),
          created_at: cluster.created_at || cluster.updated_at || new Date().toISOString(),
        }
      })

      console.log('[Dashboard] ✓ Clusters loaded successfully:', {
        count: clusters.length,
        accountId,
        userEmail: user?.email,
        firstCluster: clusters[0]?.id,
      })

      setClusters(Array.isArray(clusters) ? clusters : [])

      // Show notification if new clusters arrived
      if (clusters.length > lastClusterCount.current) {
        const delta = clusters.length - lastClusterCount.current
        showToast(`${delta} new emails clustered`, 'success')
      }
      lastClusterCount.current = clusters.length

      // Auto-select first cluster and load its emails
      if (clusters.length > 0 && !selectedClusterId) {
        const firstCluster = clusters[0]
        console.log('[Dashboard] Auto-selecting first cluster:', firstCluster.id)
        setSelectedClusterId(firstCluster.id)

        try {
          const { data: emailData, error: emailError } = await supabase.rpc('get_emails_for_cluster', {
            p_cluster_id: firstCluster.id,
          })

          if (emailError) {
            console.error('[Dashboard] Failed to load emails for cluster:', {
              clusterId: firstCluster.id,
              message: emailError.message,
              accountIdUsed: accountId,
              error: emailError,
            })
            return // Don't crash, just skip email loading
          }

          // Validate email data is an array
          console.log('[Dashboard] Email response validation:', {
            type: typeof emailData,
            isArray: Array.isArray(emailData),
            clusterId: firstCluster.id,
          })

          if (!Array.isArray(emailData)) {
            console.warn('[Dashboard] Email response is not an array:', {
              type: typeof emailData,
              isArray: Array.isArray(emailData),
              clusterId: firstCluster.id,
            })
            setEmails(firstCluster.id, [])
            return
          }

          console.log('[Dashboard] Emails loaded:', {
            clusterId: firstCluster.id,
            emailCount: emailData.length,
          })

          setEmails(firstCluster.id, emailData.map((email: any) => ({
            id: email.message_id,
            cluster_id: firstCluster.id,
            sender: email.sender || 'Unknown',
            sender_email: email.sender?.match(/<(.+?)>/)?.[1] || email.sender || '',
            subject: email.subject || '(No subject)',
            body: email.body || '',
            timestamp: email.created_at || new Date().toISOString(),
            is_read: true,
            is_important: false,
            tags: ['email'],
          })))
        } catch (emailError) {
          console.error('[Dashboard] Error loading emails for first cluster:', {
            clusterId: firstCluster.id,
            message: emailError instanceof Error ? emailError.message : String(emailError),
            error: emailError,
          })
        }
      }
    } catch (error) {
      // 🔥 COMPREHENSIVE FINAL ERROR LOGGING
      console.error('[Dashboard] ❌ FETCH ERROR OCCURRED')
      console.error('[Dashboard] FINAL ERROR:', error)
      console.error('[Dashboard] ERROR STRING:', String(error))
      if (error instanceof Error) {
        console.error('[Dashboard] ERROR STACK:', error.stack)
      }
      console.error('[Dashboard] ERROR DETAILS:', {
        message: error instanceof Error ? error.message : String(error),
        type: error?.constructor?.name,
        isError: error instanceof Error,
        accountIdUsed: accountId,
        userEmail: user?.email,
        userId: user?.id,
      })

      // Detect specific error types
      if (error instanceof TypeError) {
        console.error('[Dashboard] 🔴 Network error: server unreachable or CORS blocked')
      } else if (error instanceof Error && error.message.includes('Supabase')) {
        console.error('[Dashboard] 🔴 Supabase connectivity issue')
      } else if (error instanceof Error && error.message.includes('User email missing')) {
        console.error('[Dashboard] 🔴 Authentication issue: no user email')
      } else if (error instanceof Error && error.message.includes('No session')) {
        console.error('[Dashboard] 🔴 Authentication issue: no active session')
      }

      // Safely set empty state as fallback
      setClusters(Array.isArray([]) ? [] : [])
      console.log('[Dashboard] Cluster list cleared due to error')

    } finally {
      setIsLoading(false)
      console.log('[Dashboard] Cluster fetch cycle complete')
    }
  }, [selectedClusterId, setClusters, setEmails, setSelectedClusterId, user?.email, user?.id])

  useEffect(() => {
    if (!activeAccount) {
      console.warn('[Dashboard] Cannot fetch: activeAccount not set', {
        userEmail: user?.email,
        activeAccount,
      })
      return
    }

    console.log('[Dashboard] Fetch effect triggered with activeAccount:', activeAccount, {
      userEmail: user?.email,
      isEmail: activeAccount.includes('@'),
    })

    fetchClusters(activeAccount)

    const channel = supabase
      .channel(`clusters:${activeAccount}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'clusters',
        filter: `account_id=eq.${activeAccount}`,
      }, () => {
        console.log('[Dashboard] Real-time update detected, refetching clusters...')
        fetchClusters(activeAccount)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [activeAccount, fetchClusters, user?.email])

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
              <ClusterList isLoading={isLoading} onReplyAll={handleCardReplyAll} />
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
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl inline-block animate-pulse">📬</div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      {isLoading ? 'Loading clusters...' : 'Setting up your inbox…'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? 'Please wait while we fetch your email clusters' : 'Your first emails will appear within 1 minute'}
                    </p>
                  </div>
                  {!isLoading && activeAccount && (
                    <p className="text-xs text-muted-foreground opacity-70 pt-2">
                      Showing clusters for <span className="text-primary font-semibold">{activeAccount}</span>
                    </p>
                  )}
                  {!isLoading && activeAccount && (
                    <button
                      onClick={() => fetchClusters(activeAccount)}
                      className="mt-6 px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-lg text-xs font-bold text-primary transition-colors"
                    >
                      Retry
                    </button>
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
