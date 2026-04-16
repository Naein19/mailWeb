#!/usr/bin/env node

/**
 * Mock Data Insertion Script for Supabase
 * 
 * Usage: node insert-mock-data.js
 * 
 * This script connects directly to your Supabase project and inserts mock data.
 * It's easier than manually running SQL queries in the web UI.
 */

const { createClient } = require("@supabase/supabase-js")

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment")
  console.error("Please set these in your .env.local file")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Mock data
const clusters = [
  {
    cluster_id: "cluster-001",
    summary: "Login authentication issues and password resets",
    email_count: 28,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: "cluster-002",
    summary: "Email delivery and bounce notifications",
    email_count: 15,
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: "cluster-003",
    summary: "Account registration and verification",
    email_count: 42,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    cluster_id: "cluster-004",
    summary: "Payment and billing inquiries",
    email_count: 12,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    cluster_id: "cluster-005",
    summary: "Support tickets and bug reports",
    email_count: 38,
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
]

const emails = [
  {
    message_id: "msg-001-001",
    sender: "John Smith",
    sender_email: "john@example.com",
    subject: "Unable to login to account",
    body: "I am unable to access my account. The login page keeps showing an error.",
    status: "processed",
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    message_id: "msg-001-002",
    sender: "Sarah Johnson",
    sender_email: "sarah@example.com",
    subject: "Password reset not working",
    body: "I requested a password reset but never received the email.",
    status: "processed",
    created_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    message_id: "msg-002-001",
    sender: "Alice Brown",
    sender_email: "alice@example.com",
    subject: "Email delivery failed",
    body: "My emails are bouncing back with undeliverable error.",
    status: "processed",
    created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: "msg-003-001",
    sender: "Carol White",
    sender_email: "carol@example.com",
    subject: "Verification email not received",
    body: "I completed registration but did not receive the verification email.",
    status: "processed",
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: "msg-004-001",
    sender: "Emma Davis",
    sender_email: "emma@example.com",
    subject: "Invoice not received",
    body: "I did not receive my invoice for this month.",
    status: "processed",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

const emailClusters = [
  { cluster_id: "cluster-001", message_id: "msg-001-001" },
  { cluster_id: "cluster-001", message_id: "msg-001-002" },
  { cluster_id: "cluster-002", message_id: "msg-002-001" },
  { cluster_id: "cluster-003", message_id: "msg-003-001" },
  { cluster_id: "cluster-004", message_id: "msg-004-001" },
]

const processingErrors = [
  {
    message_id: "msg-001-001",
    error_message: "Invalid email format",
    failed_stage: "validation",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    message_id: "msg-002-001",
    error_message: "SMTP connection timeout",
    failed_stage: "sending",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

async function insertData() {
  try {
    console.log("📊 Starting mock data insertion...")
    console.log("")

    // 1. Clear existing data
    console.log("🗑️  Clearing existing data...")
    await supabase.from("email_clusters").delete().gt("id", 0)
    await supabase.from("email_processing_errors").delete().gt("id", 0)
    await supabase.from("email_ingestion_logs").delete().gt("id", 0)
    await supabase.from("emails").delete().gt("message_id", "")
    await supabase.from("clusters").delete().gt("cluster_id", "")
    console.log("✅ Cleared existing data")
    console.log("")

    // 2. Insert clusters
    console.log("📥 Inserting clusters...")
    const { error: clusterError } = await supabase.from("clusters").insert(clusters)
    if (clusterError) throw clusterError
    console.log(`✅ Inserted ${clusters.length} clusters`)

    // 3. Insert emails
    console.log("📥 Inserting emails...")
    const { error: emailError } = await supabase.from("emails").insert(emails)
    if (emailError) throw emailError
    console.log(`✅ Inserted ${emails.length} emails`)

    // 4. Insert email-cluster relationships
    console.log("📥 Linking emails to clusters...")
    const { error: linkError } = await supabase.from("email_clusters").insert(emailClusters)
    if (linkError) throw linkError
    console.log(`✅ Created ${emailClusters.length} email-cluster links`)

    // 5. Insert processing errors
    console.log("📥 Inserting processing errors...")
    const { error: errorError } = await supabase.from("email_processing_errors").insert(processingErrors)
    if (errorError) throw errorError
    console.log(`✅ Inserted ${processingErrors.length} processing errors`)

    console.log("")
    console.log("✨ Mock data insertion completed successfully!")
    console.log("")
    console.log("📋 Summary:")
    console.log(`   - Clusters: ${clusters.length}`)
    console.log(`   - Emails: ${emails.length}`)
    console.log(`   - Email-Cluster Links: ${emailClusters.length}`)
    console.log(`   - Processing Errors: ${processingErrors.length}`)
    console.log("")
    console.log("🚀 Next steps:")
    console.log("   1. Run: npm run dev")
    console.log("   2. Visit: http://localhost:3000")
    console.log("   3. You should now see clusters in the left panel!")
  } catch (error) {
    console.error("❌ Error inserting data:")
    console.error(error.message)
    process.exit(1)
  }
}

insertData()
