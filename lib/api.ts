import type { Cluster, Email } from '@/lib/types'

const ENABLE_MOCK_BLEND = process.env.NEXT_PUBLIC_ENABLE_MOCK_DATA === 'true'

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

// Cluster-specific mock emails for different clusters
const MOCK_EMAILS_BY_CLUSTER: Record<string, any[]> = {
  'tech-001': [
    {
      message_id: 'mock-tech-1',
      sender: 'John Smith <john@example.com>',
      subject: '[MOCK] Unable to login to account',
      body: 'I am unable to access my account. The login page keeps showing an error.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      message_id: 'mock-tech-2',
      sender: 'Sarah Johnson <sarah@example.com>',
      subject: '[MOCK] Password reset not working',
      body: 'I requested a password reset but never received the email.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
  ],
  'supp-001': [
    {
      message_id: 'mock-supp-1',
      sender: 'Alice Brown <alice@example.com>',
      subject: '[MOCK] Email delivery failed',
      body: 'My emails are bouncing back with undeliverable error.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      message_id: 'mock-supp-2',
      sender: 'Bob Wilson <bob@example.com>',
      subject: '[MOCK] Bounce notification received',
      body: 'Why am I getting bounce notifications for valid emails?',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
  'feat-001': [
    {
      message_id: 'mock-feat-1',
      sender: 'Carol White <carol@example.com>',
      subject: '[MOCK] Feature request: Export to PDF',
      body: 'It would be great if we could export reports to PDF format.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
  ],
  'bill-001': [
    {
      message_id: 'mock-bill-1',
      sender: 'David Lee <david@example.com>',
      subject: '[MOCK] Invoice question for last month',
      body: 'I have a question about the charges on my invoice.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
  'cluster-001': [
    {
      message_id: 'msg-1-1',
      sender: 'John Smith <john@example.com>',
      subject: 'Unable to login to account',
      body: 'I am unable to access my account. The login page keeps showing an error.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      message_id: 'msg-1-2',
      sender: 'Sarah Johnson <sarah@example.com>',
      subject: 'Password reset not working',
      body: 'I requested a password reset but never received the email.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    },
    {
      message_id: 'msg-1-3',
      sender: 'Mike Chen <mike@example.com>',
      subject: 'Two-factor authentication error',
      body: 'The 2FA code seems to be expired when I try to use it.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
  ],
  'cluster-002': [
    {
      message_id: 'msg-2-1',
      sender: 'Alice Brown <alice@example.com>',
      subject: 'Email delivery failed',
      body: 'My emails are bouncing back with undeliverable error.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    },
    {
      message_id: 'msg-2-2',
      sender: 'Bob Wilson <bob@example.com>',
      subject: 'Bounce notification received',
      body: 'Why am I getting bounce notifications for valid emails?',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    },
  ],
  'cluster-003': [
    {
      message_id: 'msg-3-1',
      sender: 'Carol White <carol@example.com>',
      subject: 'Verification email not received',
      body: 'I completed registration but did not receive the verification email.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      message_id: 'msg-3-2',
      sender: 'David Lee <david@example.com>',
      subject: 'Account activation link expired',
      body: 'The activation link in my email has expired.',
      status: 'processed',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ],
}

// Fallback for unmapped clusters
const DEFAULT_MOCK_EMAILS = [
  {
    message_id: 'msg-default-1',
    sender: 'Support <support@example.com>',
    subject: 'Sample email from this cluster',
    body: 'This is a sample email to demonstrate the cluster functionality.',
    status: 'processed',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
]

type AnalyticsData = {
  totalEmails: number
  processedEmails: number
  totalClusters: number
  totalErrors: number
  avgEmailsPerCluster: number
  successRate: number
}

type ProcessingError = {
  id: string
  message_id: string
  error_type: string
  error_message: string
  created_at: string
}

type EmailStatusDistribution = {
  status: string
  count: number
}

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`API error at ${url}: status ${response.status}`)
      return null
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error(`Fetch error at ${url}:`, error)
    return null
  }
}

function blendById<T>(realItems: T[], mockItems: T[], getId: (item: T) => string): T[] {
  if (!ENABLE_MOCK_BLEND) {
    return realItems
  }

  const realIds = new Set(realItems.map(getId))
  const extraMock = mockItems.filter((item) => !realIds.has(getId(item)))
  return [...realItems, ...extraMock]
}

// Get all clusters with real data
export async function getClusters(): Promise<Cluster[]> {
  try {
    const data = await safeFetch<Cluster[]>('/api/clusters')

    if (!data || data.length === 0) {
      console.warn('No clusters returned from API')
      return []
    }

    return data
  } catch (error) {
    console.error('Failed to fetch clusters:', error)
    return []
  }
}

// Get emails for a specific cluster
export async function getEmailsForCluster(clusterId: string): Promise<Email[]> {
  try {
    const data = await safeFetch<Email[]>(`/api/clusters/${encodeURIComponent(clusterId)}/emails`)

    if (!data || data.length === 0) {
      console.warn(`No emails found for cluster ${clusterId}`)
      return []
    }

    return data
  } catch (error) {
    console.error(`Failed to fetch emails for cluster ${clusterId}:`, error)
    return []
  }
}

// Get analytics data
export async function getAnalyticsData(): Promise<AnalyticsData> {
  try {
    const data = await safeFetch<AnalyticsData>('/api/analytics/overview')

    if (!data || data.totalEmails === 0) {
      return getAnalyticsMock()
    }

    return data
  } catch (error) {
    console.error('Failed to fetch analytics')
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
    const data = await safeFetch<ProcessingError[]>(`/api/analytics/errors?limit=${limit}`)
    const mockErrors = getMockErrors(limit)

    if (!data || data.length === 0) {
      return mockErrors
    }

    return blendById(data, mockErrors, (errorItem) => errorItem.id).slice(0, limit)
  } catch (error) {
    console.error('Failed to fetch processing errors')
    return getMockErrors(limit)
  }
}

// Get email status distribution with mock fallback
export async function getEmailStatusDistribution() {
  try {
    const data = await safeFetch<EmailStatusDistribution[]>('/api/analytics/status-distribution')
    const mockStats = getMockEmailStats()

    if (!data || data.length === 0) {
      return mockStats
    }

    if (!ENABLE_MOCK_BLEND) {
      return data
    }

    const totals = new Map<string, number>()
    data.forEach((item) => totals.set(item.status, (totals.get(item.status) || 0) + item.count))
    mockStats.forEach((item) => totals.set(item.status, (totals.get(item.status) || 0) + item.count))

    return Array.from(totals, ([status, count]) => ({ status, count })).sort(
      (a, b) => b.count - a.count
    )
  } catch (error) {
    console.error('Failed to fetch email status distribution')
    return getMockEmailStats()
  }
}

// Mock data generators
function getMockErrors(limit: number = 10) {
  const mockErrors = [
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

  return mockErrors.slice(0, limit)
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

function getMockEmailsForCluster(clusterId: string) {
  // Try to get cluster-specific mock emails
  const clusterMockEmails = MOCK_EMAILS_BY_CLUSTER[clusterId]
  const emailsToUse = clusterMockEmails || DEFAULT_MOCK_EMAILS

  return emailsToUse.map((email: any) => ({
    id: email.message_id,
    cluster_id: clusterId,
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
    return getMockEmailsForCluster(_clusterId)
  },
}
