# Supabase Database Setup Guide

## Problem: Clusters Not Showing in Web

**Possible causes:**
1. Tables not created yet in Supabase
2. Tables created but no data inserted
3. Incorrect table structure/column names
4. Supabase credentials not set correctly

---

## Part 1: Create Tables (SQL)

Run these SQL commands in your Supabase SQL Editor (https://app.supabase.com → your project → SQL Editor):

### 1. Create `clusters` table
```sql
CREATE TABLE IF NOT EXISTS public.clusters (
  cluster_id TEXT PRIMARY KEY,
  summary TEXT NOT NULL,
  email_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security) - Optional but recommended
ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (for anon key)
CREATE POLICY "Allow public read access to clusters"
  ON public.clusters
  FOR SELECT
  USING (true);
```

### 2. Create `emails` table
```sql
CREATE TABLE IF NOT EXISTS public.emails (
  message_id TEXT PRIMARY KEY,
  sender TEXT,
  sender_email TEXT,
  subject TEXT,
  body TEXT,
  body_html TEXT,
  status TEXT DEFAULT 'pending',
  is_deleted BOOLEAN DEFAULT false,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to emails"
  ON public.emails
  FOR SELECT
  USING (true);
```

### 3. Create `email_clusters` table (junction table)
```sql
CREATE TABLE IF NOT EXISTS public.email_clusters (
  id BIGSERIAL PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(cluster_id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES public.emails(message_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cluster_id, message_id)
);

-- Enable RLS
ALTER TABLE public.email_clusters ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to email_clusters"
  ON public.email_clusters
  FOR SELECT
  USING (true);
```

### 4. Create `email_ingestion_logs` table
```sql
CREATE TABLE IF NOT EXISTS public.email_ingestion_logs (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT,
  source TEXT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_ingestion_logs ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to email_ingestion_logs"
  ON public.email_ingestion_logs
  FOR SELECT
  USING (true);
```

### 5. Create `email_processing_errors` table
```sql
CREATE TABLE IF NOT EXISTS public.email_processing_errors (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT,
  error_message TEXT,
  failed_stage TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_processing_errors ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access
CREATE POLICY "Allow public read access to email_processing_errors"
  ON public.email_processing_errors
  FOR SELECT
  USING (true);
```

---

## Part 2: Insert Mock Data (SQL)

Run these SQL commands to populate with test data:

### Insert Clusters
```sql
-- Clear existing data (if needed)
DELETE FROM public.email_clusters;
DELETE FROM public.emails;
DELETE FROM public.clusters;

-- Insert clusters
INSERT INTO public.clusters (cluster_id, summary, email_count, created_at, updated_at) VALUES
('cluster-001', 'Login authentication issues and password resets', 28, NOW() - INTERVAL '2 days', NOW() - INTERVAL '30 minutes'),
('cluster-002', 'Email delivery and bounce notifications', 15, NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 hour'),
('cluster-003', 'Account registration and verification', 42, NOW() - INTERVAL '14 days', NOW()),
('cluster-004', 'Payment and billing inquiries', 12, NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'),
('cluster-005', 'Support tickets and bug reports', 38, NOW() - INTERVAL '21 days', NOW() - INTERVAL '15 minutes'),
('cluster-006', 'API Integration and Key Failures', 85, NOW() - INTERVAL '30 days', NOW() - INTERVAL '5 minutes'),
('cluster-007', 'Subscription Cancellation and Retention', 40, NOW() - INTERVAL '45 days', NOW() - INTERVAL '10 minutes'),
('cluster-008', 'Account Security and MFA Issues', 60, NOW() - INTERVAL '60 days', NOW() - INTERVAL '20 minutes'),
('cluster-009', 'General Customer Support Requests', 200, NOW() - INTERVAL '90 days', NOW() - INTERVAL '1 minute'),
('cluster-010', 'New Feature Suggestions and Feedback', 45, NOW() - INTERVAL '15 days', NOW() - INTERVAL '30 minutes');
```

### Insert Emails
```sql
-- Insert emails for cluster-001
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-001-001', 'John Smith', 'john@example.com', 'Unable to login to account', 'I am unable to access my account. The login page keeps showing an error.', 'processed', NOW() - INTERVAL '30 minutes'),
('msg-001-002', 'Sarah Johnson', 'sarah@example.com', 'Password reset not working', 'I requested a password reset but never received the email.', 'processed', NOW() - INTERVAL '40 minutes'),
('msg-001-003', 'Mike Chen', 'mike@example.com', 'Two-factor authentication error', 'The 2FA code seems to be expired when I try to use it.', 'processed', NOW() - INTERVAL '50 minutes');

-- Insert emails for cluster-002
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-002-001', 'Alice Brown', 'alice@example.com', 'Email delivery failed', 'My emails are bouncing back with undeliverable error.', 'processed', NOW() - INTERVAL '1 hour'),
('msg-002-002', 'Bob Wilson', 'bob@example.com', 'Bounce notification received', 'Why am I getting bounce notifications for valid emails?', 'processed', NOW() - INTERVAL '1 hour 10 minutes');

-- Insert emails for cluster-003
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-003-001', 'Carol White', 'carol@example.com', 'Verification email not received', 'I completed registration but did not receive the verification email.', 'processed', NOW() - INTERVAL '5 hours'),
('msg-003-002', 'David Lee', 'david@example.com', 'Account activation link expired', 'The activation link in my email has expired.', 'processed', NOW() - INTERVAL '6 hours');

-- Insert emails for cluster-004
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-004-001', 'Emma Davis', 'emma@example.com', 'Invoice not received', 'I did not receive my invoice for this month.', 'processed', NOW() - INTERVAL '2 hours'),
('msg-004-002', 'Frank Garcia', 'frank@example.com', 'Payment declined', 'My payment was declined but I was still charged.', 'processed', NOW() - INTERVAL '3 hours');

-- Insert emails for cluster-005
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-005-001', 'Grace Martinez', 'grace@example.com', 'Bug report: Dashboard crashes', 'The dashboard crashes when I try to upload files.', 'processed', NOW() - INTERVAL '12 hours'),
('msg-005-002', 'Henry Taylor', 'henry@example.com', 'Feature request: Dark mode', 'Can you add a dark mode option to the interface?', 'processed', NOW() - INTERVAL '15 hours');

-- Insert emails for cluster-006
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-006-001', 'Iris Anderson', 'iris@example.com', 'API key generation failed', 'Unable to generate new API keys from the dashboard.', 'processed', NOW() - INTERVAL '20 hours'),
('msg-006-002', 'Jack Thomas', 'jack@example.com', 'API rate limit exceeded', 'Getting 429 errors even though I am within the rate limit.', 'processed', NOW() - INTERVAL '22 hours');

-- Insert emails for cluster-007
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-007-001', 'Kate Jackson', 'kate@example.com', 'Cancellation request', 'I want to cancel my subscription effective immediately.', 'processed', NOW() - INTERVAL '30 hours'),
('msg-007-002', 'Liam White', 'liam@example.com', 'Retention offer', 'Are there any discounts available before I cancel?', 'processed', NOW() - INTERVAL '32 hours');

-- Insert emails for cluster-008
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-008-001', 'Mona Clark', 'mona@example.com', 'MFA setup issues', 'I cannot setup two-factor authentication on my account.', 'processed', NOW() - INTERVAL '40 hours'),
('msg-008-002', 'Noah Lewis', 'noah@example.com', 'Unauthorized access', 'I detected unauthorized login attempts on my account.', 'processed', NOW() - INTERVAL '42 hours');

-- Insert emails for cluster-009
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-009-001', 'Olivia Hall', 'olivia@example.com', 'General inquiry', 'I have a question about your pricing plans.', 'processed', NOW() - INTERVAL '50 hours'),
('msg-009-002', 'Peter Allen', 'peter@example.com', 'Documentation help', 'The documentation for the API is unclear.', 'processed', NOW() - INTERVAL '52 hours');

-- Insert emails for cluster-010
INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-010-001', 'Quinn Young', 'quinn@example.com', 'Feature suggestion: Export to CSV', 'It would be great to export data as CSV.', 'processed', NOW() - INTERVAL '15 hours'),
('msg-010-002', 'Rachel Green', 'rachel@example.com', 'UI improvement feedback', 'The sidebar navigation could be more intuitive.', 'processed', NOW() - INTERVAL '16 hours');
```

### Link Emails to Clusters (email_clusters junction table)
```sql
-- Link emails from cluster-001
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-001', 'msg-001-001'),
('cluster-001', 'msg-001-002'),
('cluster-001', 'msg-001-003');

-- Link emails from cluster-002
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-002', 'msg-002-001'),
('cluster-002', 'msg-002-002');

-- Link emails from cluster-003
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-003', 'msg-003-001'),
('cluster-003', 'msg-003-002');

-- Link emails from cluster-004
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-004', 'msg-004-001'),
('cluster-004', 'msg-004-002');

-- Link emails from cluster-005
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-005', 'msg-005-001'),
('cluster-005', 'msg-005-002');

-- Link emails from cluster-006
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-006', 'msg-006-001'),
('cluster-006', 'msg-006-002');

-- Link emails from cluster-007
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-007', 'msg-007-001'),
('cluster-007', 'msg-007-002');

-- Link emails from cluster-008
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-008', 'msg-008-001'),
('cluster-008', 'msg-008-002');

-- Link emails from cluster-009
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-009', 'msg-009-001'),
('cluster-009', 'msg-009-002');

-- Link emails from cluster-010
INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-010', 'msg-010-001'),
('cluster-010', 'msg-010-002');
```

### Insert Processing Errors
```sql
INSERT INTO public.email_processing_errors (message_id, error_message, failed_stage, timestamp) VALUES
('msg-001-001', 'Invalid email format', 'validation', NOW() - INTERVAL '2 days'),
('msg-002-001', 'SMTP connection timeout', 'sending', NOW() - INTERVAL '1 day'),
('msg-003-001', 'Database constraint violation', 'storage', NOW() - INTERVAL '12 hours'),
('msg-004-001', 'Rate limit exceeded', 'processing', NOW() - INTERVAL '6 hours'),
('msg-005-001', 'Memory allocation failed', 'clustering', NOW() - INTERVAL '3 hours');
```

### Insert Ingestion Logs
```sql
INSERT INTO public.email_ingestion_logs (message_id, source, status, details, created_at) VALUES
('msg-001-001', 'SMTP', 'success', '{"from":"john@example.com","to":"support@app.com"}', NOW() - INTERVAL '2 days'),
('msg-001-002', 'IMAP', 'success', '{"folder":"INBOX","flags":""}', NOW() - INTERVAL '30 minutes'),
('msg-001-003', 'API', 'success', '{"endpoint":"/emails/ingest","method":"POST"}', NOW() - INTERVAL '25 minutes'),
('msg-002-001', 'SMTP', 'failed', '{"error":"Connection refused","retry":1}', NOW() - INTERVAL '1 day'),
('msg-003-001', 'IMAP', 'success', '{"folder":"Sent","flags":"seen"}', NOW() - INTERVAL '5 hours');
```

---

## Part 3: Step-by-Step Instructions

### 1. Go to Supabase Dashboard
- Navigate to https://app.supabase.com
- Select your project

### 2. Open SQL Editor
- Click **"SQL Editor"** in the left sidebar
- Click **"New Query"**

### 3. Run Table Creation Queries
- Copy the SQL from **Part 1** sections
- Paste into the SQL editor one table at a time
- Click **"Run"** button (or Ctrl+Enter)
- Verify no errors appear

### 4. Insert Mock Data
- After all tables are created, copy SQL from **Part 2**
- Paste each section into a new query
- Click **"Run"**

### 5. Verify Data
- Go to **"Table Editor"** in left sidebar
- Click each table to see the inserted data:
  - `clusters` → should show 10 clusters
  - `emails` → should show 20+ emails
  - `email_clusters` → should show junction records
  - `email_processing_errors` → should show error logs

---

## Part 4: Verify Web Connection

### Check Environment Variables
Your `.env.local` should have:
```
SUPABASE_URL=https://sgqhvzqwyeijztchychx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

### Run Development Server
```bash
cd /home/naveen/Documents/zzxzz
npm run dev
```

### Check API Endpoint
Open browser and go to:
- http://localhost:3000/api/clusters

You should see JSON with cluster data.

### Check Web UI
- Go to http://localhost:3000
- You should now see clusters in the list on the left side

---

## Part 5: Troubleshooting

### Clusters still not showing?

**Check 1: API Response**
```bash
curl http://localhost:3000/api/clusters
```
Should return JSON array with clusters. If empty, check:
- Database has data (verify in Supabase Table Editor)
- API endpoint code correct

**Check 2: Browser Console**
- Open DevTools (F12)
- Go to Console tab
- Check for JavaScript errors
- Check Network tab → `/api/clusters` request → see response

**Check 3: Supabase RLS Policies**
- Go to Supabase → Table Editor
- Click table (e.g., `clusters`)
- Click "RLS" button at top right
- Verify policies exist and are enabled

**Check 4: NEXT_PUBLIC_ENABLE_MOCK_DATA**
- If `true` → will show mock data if API fails
- If `false` → will show real data only (or empty if API fails)

### No data in tables?
- Verify you ran the INSERT statements
- Check Supabase Table Editor to see rows
- If needed, run the INSERT SQL again

### RLS Policy Errors?
If you see "permission denied" errors:
```sql
-- Disable RLS temporarily for testing
ALTER TABLE public.clusters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_clusters DISABLE ROW LEVEL SECURITY;
-- etc for other tables
```

---

## Summary

1. ✅ Create tables using SQL commands from Part 1
2. ✅ Insert mock data using SQL commands from Part 2
3. ✅ Verify data in Supabase Table Editor
4. ✅ Run `npm run dev`
5. ✅ Visit http://localhost:3000 → Clusters should appear!

If you still have issues, run:
```bash
curl -s http://localhost:3000/api/clusters | jq .
```
This will show you the exact API response and help identify the problem.
