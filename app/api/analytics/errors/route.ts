import { NextRequest, NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = getServerSupabaseClient()
    const limitParam = Number(request.nextUrl.searchParams.get('limit') || '10')
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 10

    const { data, error } = await supabase
      .from('email_processing_errors')
      .select('id,message_id,error_message,failed_stage,timestamp')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch processing errors' }, { status: 500 })
    }

    const transformed = (data || []).map((row: any) => ({
      id: String(row.id),
      message_id: row.message_id || 'unknown',
      error_type: row.failed_stage || 'Unknown',
      error_message: row.error_message || 'No details available',
      created_at: row.timestamp,
    }))

    return NextResponse.json(transformed, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
