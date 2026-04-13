import { createClient } from '@supabase/supabase-js'

// Supabase client
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Mock data for fallback
const MOCK_CLUSTERS = [
  {
    cluster_id: 'cluster-1',
    summary: 'Login authentication issues and password resets',
    email_count: 28,
    updated_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    cluster_id: 'cluster-2',
    summary: 'Email delivery and bounce notifications',
    email_count: 15,
    updated_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
  {
    cluster_id: 'cluster-3',
    summary: 'Account registration and verification',
    email_count: 42,
    updated_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
  },
  {
    cluster_id: 'cluster-4',
    summary: 'Payment and billing inquiries',
    email_count: 12,
    updated_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
  {
    cluster_id: 'cluster-5',
    summary: 'Support tickets and bug reports',
    email_count: 38,
    updated_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 21).toISOString(),
  },
]

const MOCK_EMAILS = [
  {
    message_id: 'msg-1',
    sender: 'John Smith <john@example.com>',
    subject: 'Unable to login to account',
    body: 'I am unable to access my account. The login page keeps showing an error.',
    status: 'processed',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
  {
    message_id: 'msg-2',
    sender: 'Sarah Johnson <sarah@example.com>',
    subject: 'Password reset not working',
    body: 'I requested a password reset but never received the email.',
    status: 'processed',
    created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
  },
  {
    message_id: 'msg-3',
    sender: 'Mike Chen <mike@example.com>',
    subject: 'Two-factor authentication error',
    body: 'The 2FA code seems to be expired when I try to use it.',
    status: 'processed',
    created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
  },
]

// Get all clusters with email data
export async function getClusters() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase not configured, using mock data')
      return getMockClusters()
    }

    const { data, error } = await supabase
      .from('clusters')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('Error fetching clusters from Supabase, using mock data:', error.message)
      return getMockClusters()
    }

    if (!data || data.length === 0) {
      console.warn('No clusters found in Supabase, using mock data')
      return getMockClusters()
    }

    return data.map((cluster: any) => ({
      id: cluster.cluster_id,
      title: `${cluster.summary?.slice(0, 40) || 'Cluster'} – ${cluster.email_count} emails`,
      summary: cluster.summary || 'No summary available',
      priority: determinePriority(cluster.email_count),
      email_count: cluster.email_count || 0,
      updated_at: cluster.updated_at,
      created_at: cluster.created_at,
    }))
  } catch (error) {
    console.error('Error fetching clusters:', error)
    return getMockClusters()
  }
}

// Get emails for a specific cluster
export async function getEmailsForCluster(clusterId: string) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return getMockEmails()
    }

    // Get message IDs for this cluster
    const { data: clusterData, error: clusterError } = await supabase
      .from('email_clusters')
      .select('message_id')
      .eq('cluster_id', clusterId)
      .limit(100)

    if (clusterError) {
      console.warn('Error fetching cluster emails:', clusterError.message)
      return getMockEmails()
    }

    if (!clusterData || clusterData.length === 0) {
      return getMockEmails()
    }

    // Get email details
    const messageIds = clusterData.map((c: any) => c.message_id)
    const { data: emailsData, error: emailsError } = await supabase
      .from('emails')
      .select('*')
      .in('message_id', messageIds)

    if (emailsError) {
      console.warn('Error fetching email details:', emailsError.message)
      return getMockEmails()
    }

    if (!emailsData || emailsData.length === 0) {
      return getMockEmails()
    }

    return emailsData.map((email: any) => ({
      id: email.message_id,
      cluster_id: clusterId,
      sender: email.sender || 'Unknown',
      sender_email: extractEmail(email.sender) || 'unknown@email.com',
      subject: email.subject || 'No Subject',
      body: email.body || '',
      body_html: email.body,
      timestamp: email.created_at,
      is_read: email.status === 'processed',
      is_important: false,
      tags: ['email'],
    }))
  } catch (error) {
    console.error('Error fetching emails for cluster:', error)
    return getMockEmails()
  }
}

// Get analytics data
export async function getAnalyticsData() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return getAnalyticsMock()
    }

    // Total emails
    const { count: totalEmails } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })

    // Processed emails
    const { count: processedEmails } = await supabase
      .from('emails')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processed')

    // Total clusters
    const { count: totalClusters } = await supabase
      .from('clusters')
      .select('*', { count: 'exact', head: true })

    // Get errors count
    const { count: totalErrors } = await supabase
      .from('email_processing_errors')
      .select('*', { count: 'exact', head: true })

    // Get cluster email counts
    const { data: clusterStats } = await supabase
      .from('clusters')
      .select('email_count')

    const avgEmailsPerCluster =
      clusterStats && clusterStats.length > 0
        ? Math.round(
            clusterStats.reduce((sum: number, c: any) => sum + (c.email_count || 0), 0) /
              clusterStats.length
          )
        : 0

    const finalData = {
      totalEmails: totalEmails || 0,
      processedEmails: processedEmails || 0,
      totalClusters: totalClusters || 0,
      totalErrors: totalErrors || 0,
      avgEmailsPerCluster,
      successRate: totalEmails ? Math.round(((processedEmails || 0) / totalEmails) * 100) : 0,
    }

    // Fallback to mock if no data
    if (finalData.totalEmails === 0) {
      return getAnalyticsMock()
    }

    return finalData
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return getAnalyticsMock()
  }
}

// Helper function to determine priority based on email count
function determinePriority(emailCount: number): 'urgent' | 'medium' | 'low' {
  if (emailCount > 30) return 'urgent'
  if (emailCount > 15) return 'medium'
  return 'low'
}

// Helper function to extract email from sender string
function extractEmail(sender: string) {
  if (!sender) return ''
  const match = sender.match(/<(.+?)>/)
  return match ? match[1] : sender
}

// Get processing errors with mock fallback
export async function getProcessingErrors(limit: number = 10) {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return getMockErrors()
    }

    const { data, error } = await supabase
      .from('email_processing_errors')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      console.warn('Error fetching errors from Supabase:', error.message)
      return getMockErrors()
    }

    if (!data || data.length === 0) {
      return getMockErrors()
    }

    return data.map((err: any) => ({
      id: err.id,
      message_id: err.message_id,
      error_type: err.failed_stage || 'Unknown',
      error_message: err.error_message || 'No details available',
      created_at: err.timestamp,
    }))
  } catch (error) {
    console.error('Error fetching processing errors:', error)
    return getMockErrors()
  }
}

// Get email status distribution with mock fallback
export async function getEmailStatusDistribution() {
  try {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return getMockEmailStats()
    }

    const { data, error } = await supabase
      .from('emails')
      .select('status')

    if (error) {
      console.warn('Error fetching email stats from Supabase:', error.message)
      return getMockEmailStats()
    }

    if (!data || data.length === 0) {
      return getMockEmailStats()
    }

    const statusMap = new Map<string, number>()
    data.forEach((email: any) => {
      const status = email.status || 'unknown'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const stats = Array.from(statusMap, ([status, count]) => ({
      status,
      count,
    })).sort((a, b) => b.count - a.count)

    return stats.length > 0 ? stats : getMockEmailStats()
  } catch (error) {
    console.error('Error fetching email status distribution:', error)
    return getMockEmailStats()
  }
}

// Mock data generators
function getMockErrors() {
  return [
    {
      id: 'err-1',
      message_id: 'msg-001',
      error_type: 'parsing',
      error_message: 'Failed to parse email headers',
      created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    },
    {
      id: 'err-2',
      message_id: 'msg-002',
      error_type: 'clustering',
      error_message: 'Similarity score calculation failed',
      created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'err-3',
      message_id: 'msg-003',
      error_type: 'database',
      error_message: 'Failed to store cluster assignment',
      created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    },
  ]
}

function getMockEmailStats() {
  return [
    { status: 'processed', count: 145 },
    { status: 'queued', count: 28 },
    { status: 'failed', count: 3 },
  ]
}

// Mock data generators
function getMockClusters() {
  return MOCK_CLUSTERS.map((cluster: any) => ({
    id: cluster.cluster_id,
    title: `${cluster.summary?.slice(0, 40)} – ${cluster.email_count} emails`,
    summary: cluster.summary,
    priority: determinePriority(cluster.email_count),
    email_count: cluster.email_count,
    updated_at: cluster.updated_at,
    created_at: cluster.created_at,
  }))
}

function getMockEmails() {
  return MOCK_EMAILS.map((email: any) => ({
    id: email.message_id,
    cluster_id: 'cluster-1',
    sender: email.sender,
    sender_email: extractEmail(email.sender),
    subject: email.subject,
    body: email.body,
    body_html: email.body,
    timestamp: email.created_at,
    is_read: email.status === 'processed',
    is_important: false,
    tags: ['email'],
  }))
}

function getAnalyticsMock() {
  const totalEmails = MOCK_CLUSTERS.reduce((sum, c) => sum + c.email_count, 0)
  const avgEmailsPerCluster = Math.round(totalEmails / MOCK_CLUSTERS.length)

  return {
    totalEmails,
    processedEmails: Math.round(totalEmails * 0.85),
    totalClusters: MOCK_CLUSTERS.length,
    totalErrors: 3,
    avgEmailsPerCluster,
    successRate: 85,
  }
}

// Mock data fallback (for development)
export const mockDataService = {
  async getClusters() {
    return getMockClusters()
  },

  async getEmailsForCluster(_clusterId: string) {
    return getMockEmails()
  },
}
