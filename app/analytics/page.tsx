'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, AlertTriangle, Clock, Filter, CheckCircle } from 'lucide-react'
import { getProcessingErrors, getEmailStatusDistribution } from '@/lib/api'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'

interface ErrorLog {
  id: string
  message_id: string
  error_type: string
  error_message: string
  created_at: string
}

interface EmailStats {
  status: string
  count: number
}

export default function Analytics() {
  const [errors, setErrors] = useState<ErrorLog[]>([])
  const [emailStats, setEmailStats] = useState<EmailStats[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data for errors
  const mockErrors: ErrorLog[] = [
    {
      id: 'err-1',
      message_id: 'msg-123',
      error_type: 'Parsing Error',
      error_message: 'Failed to parse email headers',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'err-2',
      message_id: 'msg-124',
      error_type: 'Clustering Error',
      error_message: 'Similarity score calculation failed',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'err-3',
      message_id: 'msg-125',
      error_type: 'Database Error',
      error_message: 'Failed to store cluster assignment',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ]

  // Mock email stats
  const mockEmailStats: EmailStats[] = [
    { status: 'processed', count: 145 },
    { status: 'queued', count: 28 },
    { status: 'failed', count: 3 },
  ]

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch processing errors
        const errorsData = await getProcessingErrors(10)
        setErrors(errorsData)

        // Fetch email status distribution
        const statsData = await getEmailStatusDistribution()
        setEmailStats(statsData)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        console.log('Using mock data due to error')
        setErrors(mockErrors)
        setEmailStats(mockEmailStats)
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
          <div className="text-gray-400">Loading analytics...</div>
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
          <TrendingUp className="w-6 h-6 text-purple-500" />
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-gray-400 text-sm">Email processing insights & error tracking</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Email Status Distribution */}
          <motion.div
            variants={item}
            className="lg:col-span-1 glass border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <Filter className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">Email Status Distribution</h2>
            </div>

            <div className="space-y-4">
              {emailStats.length > 0 ? (
                emailStats.map((stat, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-300 capitalize">{stat.status}</span>
                      <span className="font-semibold text-white">{stat.count}</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.max(
                            (stat.count / Math.max(...emailStats.map((s) => s.count))) * 100,
                            5
                          )}%`,
                        }}
                        transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                        className={`h-full ${
                          stat.status === 'processed'
                            ? 'bg-green-500'
                            : stat.status === 'failed'
                              ? 'bg-red-500'
                              : stat.status === 'queued'
                                ? 'bg-blue-500'
                                : 'bg-amber-500'
                        }`}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-400 text-sm">No email data available</div>
              )}
            </div>
          </motion.div>

          {/* Recent Processing Errors */}
          <motion.div
            variants={item}
            className="lg:col-span-2 glass border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold">Recent Processing Errors</h2>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {errors.length > 0 ? (
                errors.map((error, index) => (
                  <motion.div
                    key={error.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass-subtle border border-red-500/20 rounded-lg p-4 hover:border-red-500/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{error.error_type}</p>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{error.error_message}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(error.created_at).toLocaleDateString()} at{' '}
                            {new Date(error.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{error.message_id.slice(0, 8)}</span>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-gray-400 text-sm text-center py-8">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No processing errors!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Detailed Error Analysis */}
        <motion.div variants={item} className="mt-8 glass border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-6">Error Type Breakdown</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {errors.length > 0 ? (
              Array.from(
                errors.reduce(
                  (acc, err) => {
                    acc.set(err.error_type, (acc.get(err.error_type) || 0) + 1)
                    return acc
                  },
                  new Map<string, number>()
                ),
                ([type, count]) => ({ type, count })
              )
                .sort((a, b) => b.count - a.count)
                .map((item, index) => (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass border border-white/5 rounded-lg p-4 text-center hover:border-white/10 transition-colors"
                  >
                    <p className="text-2xl font-bold text-red-400">{item.count}</p>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{item.type}</p>
                  </motion.div>
                ))
            ) : (
              <div className="col-span-full text-center text-gray-400 py-8">No error data available</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
    </div>
  )
}
