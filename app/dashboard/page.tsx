'use client'

import { useEffect, useState } from 'react'
import { BarChart3, Mail, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react'
import { getAnalyticsData } from '@/lib/api'
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

  if (loading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-muted-foreground font-bold tracking-widest text-[10px] uppercase">Initializing Intelligence...</div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-destructive font-bold tracking-widest text-[10px] uppercase">Service Temporarily Unavailable</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Phase 5/6 */}
        <div className="h-16 flex items-center px-8 border-b border-border bg-background sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-muted-foreground" />
            <h1 className="text-sm font-bold text-foreground">Dashboard</h1>
          </div>
        </div>

        {/* Content - Phase 4 */}
        <div className="flex-1 overflow-y-auto p-12 lg:p-16">
          <div className="max-w-5xl mx-auto space-y-16">
            {/* Title Section */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                Overview
              </h1>
              <p className="text-base text-muted-foreground">
                Summary of your automated email processing activity.
              </p>
            </div>

            {/* KPI Cards - Phase 4 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                { label: 'Total Volume', value: analytics.totalEmails.toLocaleString(), sub: 'Emails processed', icon: Mail, color: 'text-blue-600' },
                { label: 'Clusters', value: analytics.totalClusters, sub: 'Semantic groups', icon: BarChart3, color: 'text-purple-600' },
                { label: 'System Health', value: `${analytics.successRate}%`, sub: 'Success rate', icon: CheckCircle, color: 'text-emerald-600' },
              ].map((stat) => (
                <div key={stat.label} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <stat.icon size={14} className={stat.color} />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-4xl font-bold text-foreground tracking-tighter">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/50" />

            {/* Efficiency Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Processing Efficiency</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Automated clustering is active. Real-time mapping is currently operating with minimal latency across all semantic vectors.
                  </p>
                </div>
                <div className="flex items-center gap-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Avg Density</p>
                    <p className="text-2xl font-bold text-foreground">{analytics.avgEmailsPerCluster.toFixed(1)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Growth</p>
                    <p className="text-2xl font-bold text-blue-600">+12%</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Anomalies</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Detected items requiring attention or manual intervention due to low similarity scores.
                  </p>
                </div>
                <div className="pt-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold uppercase tracking-wider">
                    <AlertCircle size={12} />
                    {analytics.totalErrors} issues identified
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
