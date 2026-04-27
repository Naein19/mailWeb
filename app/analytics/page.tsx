'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { getProcessingErrors, getEmailStatusDistribution } from '@/lib/api'
import { motion } from 'framer-motion'
import { Sidebar } from '@/components/sidebar'
import { TopBar } from '@/components/topbar'
import { ProtectedRoute } from '@/components/protected-route'
import { cn } from '@/lib/utils'

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

function AnalyticsContent() {
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar hideSearch />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar hideSearch />
        <div className="flex-1 overflow-y-auto scrollbar-minimal">
          <div className="max-w-4xl mx-auto px-8 py-10 space-y-10">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground mt-1">Monitor system performance and processing integrity.</p>
            </div>

            {/* Top Grid: Status & High-level Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
              {/* Distribution */}
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">Status Distribution</h2>
                  <div className="space-y-6">
                    {emailStats.map((stat, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between items-center px-0.5">
                          <span className="text-xs font-semibold text-foreground/80 capitalize">{stat.status}</span>
                          <span className="text-xs font-bold text-foreground">{stat.count}</span>
                        </div>
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(stat.count / Math.max(...emailStats.map(s => s.count))) * 100}%` }}
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              stat.status === 'processed' ? "bg-emerald-500" : 
                              stat.status === 'failed' ? "bg-destructive" : "bg-primary"
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Errors - Phase 4.3 (Grouping) */}
              <div className="lg:col-span-8 space-y-8">
                <div>
                  <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-6">System Errors</h2>
                  <div className="space-y-1">
                    {errors.length > 0 ? (
                      errors.map((error) => (
                        <div key={error.id} className="group py-4 flex items-start gap-4 hover:bg-secondary/20 px-4 -mx-4 rounded-lg transition-all">
                          <div className={cn(
                            "mt-1 p-1 rounded transition-colors group-hover:bg-background",
                            "text-destructive"
                          )}>
                             <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h4 className="text-sm font-bold text-foreground">{error.error_type}</h4>
                              <span className="text-[10px] tabular-nums text-muted-foreground">{new Date(error.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-1">{error.error_message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center border border-dashed border-border rounded-xl">
                        <CheckCircle size={24} className="mx-auto text-emerald-500/30 mb-3" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">No anomalies detected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border/50" />

            {/* Error Breakdown */}
            <div className="space-y-8">
              <h2 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">Breakdown by Type</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {Array.from(errors.reduce((acc, err) => acc.set(err.error_type, (acc.get(err.error_type) || 0) + 1), new Map<string, number>()))
                  .map(([type, count], idx) => (
                    <div key={idx} className="space-y-1">
                      <p className="text-sm font-semibold text-muted-foreground truncate">{type}</p>
                      <p className="text-2xl font-bold text-foreground">{count}</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Analytics() {
  return (
    <ProtectedRoute>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}
