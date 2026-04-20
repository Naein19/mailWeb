import { create } from 'zustand'
import type { Cluster, Email, User, ClusterFilters } from './types'

interface DashboardStore {
  // UI State
  selectedClusterId: string | null
  selectedEmailId: string | null
  isEmailDrawerOpen: boolean
  sidebarOpen: boolean
  isComposerOpen: boolean
  composerType: 'reply_all' | 'reply_one' | 'forward' | null
  composerRecipient: string | null
  
  // Data State
  clusters: Cluster[]
  emails: Record<string, Email[]>
  currentUser: User | null
  filters: ClusterFilters
  
  // Actions
  setSelectedClusterId: (id: string | null) => void
  setSelectedEmailId: (id: string | null) => void
  setEmailDrawerOpen: (open: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setComposerOpen: (open: boolean, type?: 'reply_all' | 'reply_one' | 'forward', recipient?: string) => void
  setClusters: (clusters: Cluster[]) => void
  setEmails: (clusterId: string, emails: Email[]) => void
  addCluster: (cluster: Cluster) => void
  updateCluster: (id: string, updates: Partial<Cluster>) => void
  addEmailToCluster: (clusterId: string, email: Email) => void
  setCurrentUser: (user: User | null) => void
  setFilters: (filters: ClusterFilters) => void
  
  // Computed
  getFilteredClusters: () => Cluster[]
  getSelectedCluster: () => Cluster | undefined
  getSelectedEmail: () => Email | undefined
  getSelectedClusterEmails: () => Email[]
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  selectedClusterId: null,
  selectedEmailId: null,
  isEmailDrawerOpen: false,
  sidebarOpen: true,
  isComposerOpen: false,
  composerType: null,
  composerRecipient: null,
  clusters: [],
  emails: {},
  currentUser: null,
  filters: {},

  setSelectedClusterId: (id: string | null) => set({ selectedClusterId: id }),
  setSelectedEmailId: (id: string | null) => set({ selectedEmailId: id }),
  setEmailDrawerOpen: (open: boolean) => set({ isEmailDrawerOpen: open }),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setComposerOpen: (open: boolean, type?: 'reply_all' | 'reply_one' | 'forward', recipient?: string) =>
    set({ isComposerOpen: open, composerType: type || null, composerRecipient: recipient || null }),
  
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
  setFilters: (filters: ClusterFilters) => set({ filters }),

  getFilteredClusters: () => {
    const { clusters, filters } = get()
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
    return (emails[selectedClusterId] || []).find((e) => e.id === selectedEmailId)
  },

  getSelectedClusterEmails: () => {
    const { selectedClusterId, emails } = get()
    return selectedClusterId ? emails[selectedClusterId] || [] : []
  },
}))
