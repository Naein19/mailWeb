import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params
    const accountId = request.nextUrl.searchParams.get('account_id') || ''
    if (!accountId) {
      return NextResponse.json([], { status: 200 })
    }
    const supabase = getServerSupabaseClient()
    const { data, error } = await supabase.rpc('get_emails_for_cluster', {
      p_cluster_id: clusterId,
      p_account_id: accountId,
    })

    if (error) {
      console.error('[/api/clusters/emails]', error)
      return NextResponse.json([], { status: 200 })
    }

    const extractEmail = (sender: string) => sender?.match(/<(.+?)>/)?.[1] || sender || ''
    return NextResponse.json((data || []).map((email: any) => ({
      id: email.message_id,
      cluster_id: clusterId,
      sender: email.sender || 'Unknown',
      sender_email: extractEmail(email.sender || ''),
      subject: email.subject || '(No subject)',
      body: email.body || '',
      timestamp: email.created_at || new Date().toISOString(),
      is_read: true,
      is_important: false,
      tags: ['email'],
    })))
  } catch (error) {
    console.error('[/api/clusters/emails]', error)
    return NextResponse.json([], { status: 200 })
  }
}
