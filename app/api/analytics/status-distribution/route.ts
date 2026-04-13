import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

export async function GET() {
  try {
    const supabase = getServerSupabaseClient()

    const { data, error } = await supabase
      .from('emails')
      .select('status')
      .eq('is_deleted', false)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch email statuses' }, { status: 500 })
    }

    const statusMap = new Map<string, number>()
    ;(data || []).forEach((row: any) => {
      const status = row.status || 'unknown'
      statusMap.set(status, (statusMap.get(status) || 0) + 1)
    })

    const transformed = Array.from(statusMap, ([status, count]) => ({ status, count })).sort(
      (a, b) => b.count - a.count
    )

    return NextResponse.json(transformed, { status: 200 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
