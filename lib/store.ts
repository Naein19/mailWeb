import { create } from 'zustand'
import type { Cluster, Email, User, ClusterFilters } from './types'

interface DashboardStore {
  // UI State
  selectedClusterId: string | null
  selectedEmailId: string | null
  selectedEmail: Email | null  // For email read view
  isEmailDrawerOpen: boolean
  sidebarOpen: boolean
  isComposerOpen: boolean
  composerType: 'reply_all' | 'reply_one' | 'forward' | null
  composerRecipient: string | null
  composerSubject: string | null
  composerBody: string | null
  theme: 'light' | 'dark'
  replyAllOpen: boolean  // Auto-open reply all compose
  
  // Data State
  clusters: Cluster[]
  emails: Record<string, Email[]>
  currentUser: User | null
  activeAccount: string | null
  connectedAccounts: string[]
  filters: ClusterFilters
  
  // Actions
  setSelectedClusterId: (id: string | null) => void
  setSelectedEmailId: (id: string | null) => void
  setSelectedEmail: (email: Email | null) => void
  setEmailDrawerOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setComposerOpen: (open: boolean, type?: 'reply_all' | 'reply_one' | 'forward', recipient?: string, subject?: string) => void
  setComposerBody: (body: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setClusters: (clusters: Cluster[]) => void
  setEmails: (clusterId: string, emails: Email[]) => void
  addCluster: (cluster: Cluster) => void
  updateCluster: (id: string, updates: Partial<Cluster>) => void
  addEmailToCluster: (clusterId: string, email: Email) => void
  setCurrentUser: (user: User | null) => void
  setActiveAccount: (email: string) => void
  setConnectedAccounts: (emails: string[]) => void
  setFilters: (filters: ClusterFilters) => void
  setReplyAllOpen: (open: boolean) => void
  
  // Computed
  getFilteredClusters: () => Cluster[]
  getSelectedCluster: () => Cluster | undefined
  getSelectedEmail: () => Email | undefined
  getSelectedClusterEmails: () => Email[]
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  selectedClusterId: null,
  selectedEmailId: null,
  selectedEmail: null,
  isEmailDrawerOpen: false,
  sidebarOpen: true,
  isComposerOpen: false,
  composerType: null,
  composerRecipient: null,
  composerSubject: null,
  composerBody: null,
  theme: 'dark',
  replyAllOpen: false,
  clusters: [],
  emails: {},
  currentUser: null,
  activeAccount: null,
  connectedAccounts: [],
  filters: {},

  setSelectedClusterId: (id: string | null) => set({ selectedClusterId: id, selectedEmail: null }),
  setSelectedEmailId: (id: string | null) => set({ selectedEmailId: id }),
  setSelectedEmail: (email: Email | null) => set({ selectedEmail: email }),
  setEmailDrawerOpen: (open: boolean) => set({ isEmailDrawerOpen: open }),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setComposerOpen: (open: boolean, type?: 'reply_all' | 'reply_one' | 'forward', recipient?: string, subject?: string) =>
    set({ isComposerOpen: open, composerType: type || null, composerRecipient: recipient || null, composerSubject: subject || null, composerBody: '' }),
  setComposerBody: (body: string) => set({ composerBody: body }),
  setTheme: (theme: 'light' | 'dark') => set({ theme }),
  setReplyAllOpen: (open: boolean) => set({ replyAllOpen: open }),
  
  setClusters: (clusters: Cluster[]) => set({ clusters }),
  setEmails: (clusterId: string, emails: Email[]) =>
    set((state) => ({
      emails: { ...state.emails, [clusterId]: emails },
    })),
  
  addCluster: (cluster: Cluster) =>
    set((state) => ({
      clusters: [cluster, ...state.clusters],
    })),
  
  updateCluster: (id: string, updates: Partial<Cluster>) =>
    set((state) => ({
      clusters: state.clusters.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
    })),
  
  addEmailToCluster: (clusterId: string, email: Email) =>
    set((state) => ({
      emails: {
        ...state.emails,
        [clusterId]: [...(state.emails[clusterId] || []), email],
      },
    })),
  
  setCurrentUser: (user: User | null) => set({ currentUser: user }),
  setActiveAccount: (email: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('active_account', email)
    set({ activeAccount: email, selectedClusterId: null, selectedEmail: null, clusters: [], emails: {} })
  },
  setConnectedAccounts: (emails: string[]) => set({ connectedAccounts: emails }),
  setFilters: (filters: ClusterFilters) => set({ filters }),

  getFilteredClusters: () => {
    const { clusters, filters } = get()
    
    // Validate clusters is an array
    if (!Array.isArray(clusters)) {
      console.error('[Store] Clusters is not an array:', {
        type: typeof clusters,
        isArray: Array.isArray(clusters),
      })
      return []
    }
    
    // Validate filters object exists
    if (!filters || typeof filters !== 'object') {
      console.warn('[Store] Filters is not an object')
      return clusters
    }
    
    return clusters.filter((cluster) => {
      if (filters.priority && cluster.priority !== filters.priority) {
        return false
      }
      if (
        filters.search &&
        !cluster.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  },

  getSelectedCluster: () => {
    const { clusters, selectedClusterId } = get()
    return clusters.find((c) => c.id === selectedClusterId)
  },

  getSelectedEmail: () => {
    const { selectedEmailId, selectedClusterId, emails } = get()
    if (!selectedClusterId || !selectedEmailId) return undefined
    
    // Validate emails object exists
    if (!emails || typeof emails !== 'object') {
      console.warn('[Store] Emails object is invalid')
      return undefined
    }
    
    // Get cluster emails and validate it's an array
    const clusterEmails = emails[selectedClusterId]
    if (!Array.isArray(clusterEmails)) {
      console.warn('[Store] Cluster emails is not an array:', {
        selectedClusterId,
        type: typeof clusterEmails,
        isArray: Array.isArray(clusterEmails),
      })
      return undefined
    }
    
    return clusterEmails.find((e) => e.id === selectedEmailId)
  },

  getSelectedClusterEmails: () => {
    const { selectedClusterId, emails } = get()
    if (!selectedClusterId) return []
    
    // Validate emails object exists
    if (!emails || typeof emails !== 'object') {
      console.warn('[Store] Emails object is invalid')
      return []
    }
    
    // Get cluster emails and validate it's an array
    const clusterEmails = emails[selectedClusterId]
    if (!Array.isArray(clusterEmails)) {
      console.warn('[Store] Cluster emails is not an array:', {
        selectedClusterId,
        type: typeof clusterEmails,
        isArray: Array.isArray(clusterEmails),
      })
      return []
    }
    
    return clusterEmails
  },
}))
