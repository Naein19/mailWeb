export type Priority = 'urgent' | 'medium' | 'low'

export interface Cluster {
  id: string
  title: string
  summary: string
  priority: Priority
  email_count: number
  updated_at: string
  created_at: string
  preview_sender?: string
}

export interface Email {
  id: string
  cluster_id: string
  sender: string
  sender_email: string
  subject: string
  body: string
  body_html?: string
  timestamp: string
  is_read: boolean
  is_important: boolean
  tags: string[]
}

export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
}

export interface ClusterFilters {
  priority?: Priority
  search?: string
  date_range?: {
    from: Date
    to: Date
  }
  status?: 'unread' | 'all'
}
