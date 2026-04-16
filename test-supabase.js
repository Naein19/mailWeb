const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

async function test() {
  console.log("Testing Supabase connection...")
  
  // Get first cluster
  const { data: clusters } = await supabase.from("clusters").select("*").limit(1)
  console.log("\n1. Clusters:", clusters)
  
  if (clusters && clusters.length > 0) {
    const clusterId = clusters[0].cluster_id
    console.log(`\n2. Checking email_clusters for cluster: ${clusterId}`)
    
    const { data: links } = await supabase
      .from("email_clusters")
      .select("*")
      .eq("cluster_id", clusterId)
      .limit(5)
    console.log("Email cluster links:", links)
    
    if (links && links.length > 0) {
      const msgIds = links.map(l => l.message_id)
      console.log(`\n3. Fetching emails with message_ids: ${msgIds.join(", ")}`)
      
      const { data: emails } = await supabase
        .from("emails")
        .select("*")
        .in("message_id", msgIds)
      console.log("Emails:", emails)
    }
  }
}

test().catch(console.error)
