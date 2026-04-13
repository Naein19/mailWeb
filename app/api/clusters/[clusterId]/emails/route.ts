import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

function extractEmail(sender: string) {
  if (!sender) return ''
  const match = sender.match(/<(.+?)>/)
  return match ? match[1] : sender
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ clusterId: string }> }
) {
  try {
    const { clusterId } = await params
    const supabase = getServerSupabaseClient()

    const { data: linkRows, error: linkError } = await supabase
      .from('email_clusters')
      .select('message_id')
      .eq('cluster_id', clusterId)
      .limit(200)

    if (linkError) {
      return NextResponse.json({ error: 'Failed to fetch cluster links' }, { status: 500 })
    }

    if (!linkRows || linkRows.length === 0) {
      return NextResponse.json([], { status: 200 })
    }

    const messageIds = linkRows.map((row: any) => row.message_id)

    const { data: emails, error: emailsError } = await supabase
      .from('emails')
      .select('message_id,sender,subject,body,status,created_at')
      .in('message_id', messageIds)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (emailsError) {
      return NextResponse.json({ error: 'Failed to fetch emails' }, { status: 500 })
    }

    const transformed = (emails || []).map((email: any) => ({
      id: email.message_id,
      cluster_id: clusterId,
      sender: email.sender || 'Unknown',
      sender_email: extractEmail(email.sender || ''),
      subject: email.subject || 'No Subject',
      body: email.body || '',
      body_html: email.body || '',
      timestamp: email.created_at,
      is_read: email.status === 'processed',
      is_important: false,
      tags: ['email'],
    }))

    return NextResponse.json(transformed, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
