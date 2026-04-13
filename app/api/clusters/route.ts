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

    const { data, error } = await supabase
      .from('clusters')
      .select('cluster_id,summary,email_count,updated_at,created_at')
      .order('updated_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch clusters' }, { status: 500 })
    }

    const transformed = (data || []).map((cluster: any) => ({
      id: cluster.cluster_id,
      title: `${(cluster.summary || 'Cluster').slice(0, 40)} – ${cluster.email_count || 0} emails`,
      summary: cluster.summary || 'No summary available',
      priority: determinePriority(cluster.email_count || 0),
      email_count: cluster.email_count || 0,
      updated_at: cluster.updated_at,
      created_at: cluster.created_at,
    }))

    return NextResponse.json(transformed, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
