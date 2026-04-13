'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { getClusters, getEmailsForCluster } from '@/lib/api'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { ClusterList } from '@/components/cluster-list'
import { ClusterDetail } from '@/components/cluster-detail'
import { EmailDrawer } from '@/components/email-drawer'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const {
    setClusters,
    setEmails,
    selectedClusterId,
    setSelectedClusterId,
  } = useDashboardStore()

  useEffect(() => {
    const loadData = async () => {
      try {
        const clusters = await getClusters()
        setClusters(clusters)

        // Load emails for the first cluster by default
        if (clusters.length > 0) {
          const emails = await getEmailsForCluster(clusters[0].id)
          setEmails(clusters[0].id, emails)
          setSelectedClusterId(clusters[0].id)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setIsLoading(false)
      }
    }

    loadData()
  }, [setClusters, setEmails, setSelectedClusterId])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />

        <div className="flex-1 flex gap-4 overflow-hidden">
          {/* Cluster List Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 border-r border-white/10 overflow-hidden"
          >
            <ClusterList isLoading={isLoading} />
          </motion.div>

          {/* Cluster Detail Panel */}
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
                <div className="text-center">
                  <p className="text-lg font-medium">Select a cluster to view details</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Email Drawer */}
      <EmailDrawer />
    </div>
  )
}
