-- Supabase Schema Verification Script
-- Tests tables, indexes, constraints, and relationships
-- NO users/profiles table access

-- 1. VERIFY EMAILS TABLE
SELECT 
  table_name,
  (SELECT COUNT(*) FROM emails) as total_rows
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'emails';

-- 2. VERIFY CLUSTERS TABLE  
SELECT 
  table_name,
  (SELECT COUNT(*) FROM clusters) as total_rows
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'clusters';

-- 3. VERIFY EMAIL_CLUSTERS JUNCTION TABLE
SELECT 
  table_name,
  (SELECT COUNT(*) FROM email_clusters) as total_rows
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'email_clusters';

-- 4. CHECK COLUMNS IN EMAILS TABLE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'emails'
ORDER BY ordinal_position;

-- 5. CHECK COLUMNS IN CLUSTERS TABLE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clusters'
ORDER BY ordinal_position;

-- 6. CHECK COLUMNS IN EMAIL_CLUSTERS TABLE
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'email_clusters'
ORDER BY ordinal_position;

-- 7. CHECK INDEXES
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('emails', 'clusters', 'email_clusters')
ORDER BY tablename, indexname;

-- 8. CHECK CONSTRAINTS
SELECT 
  tc.table_name, 
  tc.constraint_name,
  tc.constraint_type
FROM information_schema.table_constraints tc
WHERE tc.table_schema = 'public' 
  AND tc.table_name IN ('emails', 'clusters', 'email_clusters')
ORDER BY tc.table_name, tc.constraint_name;

-- 9. CHECK FOREIGN KEYS
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.update_rule,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- 10. DATA RELATIONSHIP VALIDATION
SELECT 
  'emails' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT message_id) as unique_ids,
  COUNT(DISTINCT sender) as unique_senders,
  MIN(created_at) as oldest_email,
  MAX(created_at) as newest_email
FROM emails;

SELECT 
  'clusters' as table_name,
  COUNT(*) as total_count,
  COUNT(DISTINCT cluster_id) as unique_ids,
  SUM(email_count) as total_email_count_field
FROM clusters;

SELECT 
  'email_clusters' as table_name,
  COUNT(*) as total_junctions,
  COUNT(DISTINCT cluster_id) as unique_clusters,
  COUNT(DISTINCT message_id) as unique_messages
FROM email_clusters;

-- 11. ORPHAN DETECTION
-- Find email_clusters entries without corresponding emails
SELECT COUNT(*) as orphaned_emails_count
FROM email_clusters ec
WHERE NOT EXISTS (SELECT 1 FROM emails e WHERE e.message_id = ec.message_id);

-- Find email_clusters entries without corresponding clusters
SELECT COUNT(*) as orphaned_clusters_count
FROM email_clusters ec
WHERE NOT EXISTS (SELECT 1 FROM clusters c WHERE c.cluster_id = ec.cluster_id);

-- 12. EMAILS PER CLUSTER
SELECT 
  cluster_id,
  COUNT(message_id) as email_count,
  MIN(CAST(REGEXP_REPLACE(message_id, '[^0-9]', '', 'g') AS INTEGER)) as min_msg_id,
  MAX(CAST(REGEXP_REPLACE(message_id, '[^0-9]', '', 'g') AS INTEGER)) as max_msg_id
FROM email_clusters
GROUP BY cluster_id
ORDER BY cluster_id;

-- 13. CHECK RLS POLICIES (Row Level Security)
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
