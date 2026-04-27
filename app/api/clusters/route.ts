import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

function determinePriority(emailCount: number): 'urgent' | 'medium' | 'low' {
  if (emailCount > 30) return 'urgent'
  if (emailCount > 15) return 'medium'
  return 'low'
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const accountId = searchParams.get('account_id') || ''
    if (!accountId) {
      return NextResponse.json([], { status: 200 })
    }

    if (!accountId) {
      console.warn('[API/Clusters] No account_id provided in query')
      return NextResponse.json([], { status: 200 })
    }

    const supabase = getServerSupabaseClient()
    const { data, error } = await supabase.rpc('get_clusters_for_account', {
      p_account_id: accountId,
      p_limit: 50,
      p_offset: 0,
    })

    if (error) {
      console.error('[API/Clusters] Supabase Query Error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json((data || []).map((cluster: any) => ({
      id: cluster.cluster_id,
      title: cluster.title || 'Untitled Cluster',
      summary: cluster.summary || '',
      priority: determinePriority(cluster.email_count || 0),
      email_count: cluster.email_count || 0,
      updated_at: cluster.updated_at || new Date().toISOString(),
      created_at: cluster.updated_at || new Date().toISOString(),
    })))
  } catch (error) {
    console.error('[/api/clusters]', error)
    return NextResponse.json([], { status: 200 })
  }
}
