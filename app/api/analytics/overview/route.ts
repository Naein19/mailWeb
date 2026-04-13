import { NextResponse } from 'next/server'
import { getServerSupabaseClient } from '@/app/api/_lib/supabase'

export async function GET() {
  try {
    const supabase = getServerSupabaseClient()

    const [{ count: totalEmails }, { count: processedEmails }, { count: totalClusters }, { count: totalErrors }] =
      await Promise.all([
        supabase.from('emails').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase
          .from('emails')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'processed')
          .eq('is_deleted', false),
        supabase.from('clusters').select('*', { count: 'exact', head: true }),
        supabase.from('email_processing_errors').select('*', { count: 'exact', head: true }),
      ])

    const { data: clusterStats } = await supabase.from('clusters').select('email_count')

    const avgEmailsPerCluster =
      clusterStats && clusterStats.length > 0
        ? Math.round(
            clusterStats.reduce((sum: number, row: any) => sum + (row.email_count || 0), 0) /
              clusterStats.length
          )
        : 0

    const safeTotal = totalEmails || 0
    const safeProcessed = processedEmails || 0

    return NextResponse.json(
      {
        totalEmails: safeTotal,
        processedEmails: safeProcessed,
        totalClusters: totalClusters || 0,
        totalErrors: totalErrors || 0,
        avgEmailsPerCluster,
        successRate: safeTotal > 0 ? Math.round((safeProcessed / safeTotal) * 100) : 0,
      },
      { status: 200 }
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
