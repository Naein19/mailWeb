'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Mail, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { getAnalyticsData } from '@/lib/api'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { ProtectedRoute } from '@/components/protected-route'

interface AnalyticsData {
  totalEmails: number
  processedEmails: number
  totalClusters: number
  totalErrors: number
  avgEmailsPerCluster: number
  successRate: number
}

function DashboardContent() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getAnalyticsData()
        setAnalytics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">Failed to load dashboard data</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 glass px-8 py-6 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-gray-400 text-sm">Email clustering analytics & insights</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={container}
        className="flex-1 p-8 overflow-y-auto"
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Emails Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Total Emails</p>
                <p className="text-3xl font-bold text-white">{analytics.totalEmails}</p>
                <p className="text-gray-500 text-xs mt-2">All processed emails</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          {/* Processed Emails Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Processed</p>
                <p className="text-3xl font-bold text-white">{analytics.processedEmails}</p>
                <p className="text-green-400 text-xs mt-2">✓ {analytics.successRate}% success rate</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          {/* Total Clusters Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Clusters</p>
                <p className="text-3xl font-bold text-white">{analytics.totalClusters}</p>
                <p className="text-gray-500 text-xs mt-2">{analytics.avgEmailsPerCluster} avg emails/cluster</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </motion.div>

          {/* Processing Errors Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Processing Errors</p>
                <p className="text-3xl font-bold text-white">{analytics.totalErrors}</p>
                <p className="text-red-400 text-xs mt-2">⚠ Requires attention</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
            </div>
          </motion.div>

          {/* Success Rate Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Success Rate</p>
                <p className="text-3xl font-bold text-white">{analytics.successRate}%</p>
                <p className="text-blue-400 text-xs mt-2">Processing efficiency</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          {/* Average Emails per Cluster Card */}
          <motion.div
            variants={item}
            className="glass border border-white/10 rounded-xl p-6 hover:border-white/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">Avg Emails/Cluster</p>
                <p className="text-3xl font-bold text-white">{analytics.avgEmailsPerCluster}</p>
                <p className="text-gray-500 text-xs mt-2">Distribution metric</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-amber-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Summary Section */}
        <motion.div
          variants={item}
          className="glass border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Summary</h2>
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Total emails in system</span>
              <span className="font-semibold">{analytics.totalEmails}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Successfully processed</span>
              <span className="font-semibold text-green-400">{analytics.processedEmails}</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-white/5">
              <span>Organized into clusters</span>
              <span className="font-semibold">{analytics.totalClusters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Processing errors</span>
              <span className="font-semibold text-red-400">{analytics.totalErrors}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
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
