import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

function determinePriority(emailCount: number): 'urgent' | 'medium' | 'low' {
  if (emailCount > 30) return 'urgent'
  if (emailCount > 15) return 'medium'
  return 'low'
}

export async function GET() {
  try {
    const supabase = getServerSupabaseClient()

    // Get all clusters that have at least one email in email_clusters junction
    const { data: clustersData, error: clustersError } = await supabase
      .from('email_clusters')
      .select('cluster_id')

    if (clustersError) {
      console.error('Error fetching cluster IDs:', clustersError)
      return NextResponse.json([], { status: 200 })
    }

    // If no clusters found, return empty array
    if (!clustersData || clustersData.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    // Extract unique cluster IDs
    const clusterIds = Array.from(new Set((clustersData || []).map((item: any) => item.cluster_id)))

    // Fetch cluster details from clusters table - only for IDs that have emails
    const { data, error } = await supabase
      .from('clusters')
      .select('cluster_id, title, summary, email_count, updated_at, created_at')
      .in('cluster_id', clusterIds)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching cluster details:', error)
      return NextResponse.json([], { status: 200 })
    }

    // Return empty array if no clusters found
    if (!data || data.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const transformed = data.map((cluster: any) => ({
      id: cluster.cluster_id,
      title: cluster.title || cluster.summary || 'Untitled Cluster',
      summary: cluster.summary || 'No summary available',
      priority: determinePriority(cluster.email_count || 0),
      email_count: cluster.email_count || 0,
      updated_at: cluster.updated_at || new Date().toISOString(),
      created_at: cluster.created_at || new Date().toISOString(),
    }))

    return NextResponse.json(transformed, { status: 200 })
  } catch (error) {
    console.error('Clusters endpoint error:', error)
    return NextResponse.json([], { status: 200 })
  }
}
