import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyData() {
  console.log('--- Verifying Supabase Data ---')
  
  const { count: clustersCount, error: clusterError } = await supabase
    .from('clusters')
    .select('*', { count: 'exact', head: true })
  
  if (clusterError) console.error('Clusters Error:', clusterError.message)
  else console.log('Clusters Rows:', clustersCount)

  const { count: emailsCount, error: emailError } = await supabase
    .from('emails')
    .select('*', { count: 'exact', head: true })
  
  if (emailError) console.error('Emails Error:', emailError.message)
  else console.log('Emails Rows:', emailsCount)

  const { count: linkCount, error: linkError } = await supabase
    .from('email_clusters')
    .select('*', { count: 'exact', head: true })
  
  if (linkError) console.error('EmailClusters Error:', linkError.message)
  else console.log('EmailClusters Links:', linkCount)
}

verifyData()
