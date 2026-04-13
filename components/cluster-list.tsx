'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useDashboardStore } from '@/lib/store'
import { mockDataService } from '@/lib/api'
import { ClusterCard } from './cluster-card'
import type { Cluster } from '@/lib/types'
import { Loader2 } from 'lucide-react'

export function ClusterList({ isLoading }: { isLoading?: boolean }) {
  const {
    clusters,
    selectedClusterId,
    setSelectedClusterId,
    setEmails,
    getFilteredClusters,
  } = useDashboardStore()

  const [loadingClusterId, setLoadingClusterId] = useState<string | null>(null)
  const filteredClusters = getFilteredClusters()

  const handleClusterClick = async (cluster: Cluster) => {
    setSelectedClusterId(cluster.id)
    setLoadingClusterId(cluster.id)

    try {
      const emails = await mockDataService.getEmailsForCluster(cluster.id)
      setEmails(cluster.id, emails)
    } catch (error) {
      console.error('Failed to load emails:', error)
    } finally {
      setLoadingClusterId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="space-y-3 w-full px-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-lg glass animate-pulse"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/10">
        <h2 className="font-semibold text-lg">Clusters ({filteredClusters.length})</h2>
        <p className="text-sm text-gray-500 mt-1">
          {clusters.length} total clusters
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {filteredClusters.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <p className="text-sm">No clusters found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClusters.map((cluster, index) => (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="relative">
                  <ClusterCard
                    cluster={cluster}
                    isActive={selectedClusterId === cluster.id}
                    onClick={() => handleClusterClick(cluster)}
                  />
                  {loadingClusterId === cluster.id && (
                    <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
