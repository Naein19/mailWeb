# Complete Step-by-Step Setup Guide

## What You Need to Do

Your clusters are in the Supabase database but not showing in the web interface. Here's the complete fix:

---

## STEP 1: Login to Supabase

1. Open browser and go to: **https://app.supabase.com**
2. Login with your account
3. Select your project (looks like it might be `sgqhvzqwyeijztchychx`)

---

## STEP 2: Open SQL Editor

In Supabase dashboard:
1. Look at the **left sidebar**
2. Find and click **"SQL Editor"**
3. Click **"New Query"** (or the + icon)

---

## STEP 3: Copy the Complete SQL

**IMPORTANT:** Copy the ENTIRE SQL from here:

```sql
-- Drop tables if they exist (careful! deletes all data)
DROP TABLE IF EXISTS public.email_processing_errors CASCADE;
DROP TABLE IF EXISTS public.email_ingestion_logs CASCADE;
DROP TABLE IF EXISTS public.email_clusters CASCADE;
DROP TABLE IF EXISTS public.emails CASCADE;
DROP TABLE IF EXISTS public.clusters CASCADE;

-- ============= CLUSTERS TABLE =============
CREATE TABLE public.clusters (
  cluster_id TEXT PRIMARY KEY,
  summary TEXT NOT NULL,
  email_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.clusters FOR SELECT
  USING (true);

-- ============= EMAILS TABLE =============
CREATE TABLE public.emails (
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

ALTER TABLE public.emails ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.emails FOR SELECT
  USING (true);

-- ============= EMAIL_CLUSTERS TABLE =============
CREATE TABLE public.email_clusters (
  id BIGSERIAL PRIMARY KEY,
  cluster_id TEXT NOT NULL REFERENCES public.clusters(cluster_id) ON DELETE CASCADE,
  message_id TEXT NOT NULL REFERENCES public.emails(message_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cluster_id, message_id)
);

ALTER TABLE public.email_clusters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.email_clusters FOR SELECT
  USING (true);

-- ============= EMAIL_INGESTION_LOGS TABLE =============
CREATE TABLE public.email_ingestion_logs (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT,
  source TEXT,
  status TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_ingestion_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.email_ingestion_logs FOR SELECT
  USING (true);

-- ============= EMAIL_PROCESSING_ERRORS TABLE =============
CREATE TABLE public.email_processing_errors (
  id BIGSERIAL PRIMARY KEY,
  message_id TEXT,
  error_message TEXT,
  failed_stage TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.email_processing_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users"
  ON public.email_processing_errors FOR SELECT
  USING (true);

-- ============= INSERT MOCK DATA =============
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

INSERT INTO public.emails (message_id, sender, sender_email, subject, body, status, created_at) VALUES
('msg-001-001', 'John Smith', 'john@example.com', 'Unable to login to account', 'I am unable to access my account. The login page keeps showing an error.', 'processed', NOW() - INTERVAL '30 minutes'),
('msg-001-002', 'Sarah Johnson', 'sarah@example.com', 'Password reset not working', 'I requested a password reset but never received the email.', 'processed', NOW() - INTERVAL '40 minutes'),
('msg-001-003', 'Mike Chen', 'mike@example.com', 'Two-factor authentication error', 'The 2FA code seems to be expired when I try to use it.', 'processed', NOW() - INTERVAL '50 minutes'),
('msg-002-001', 'Alice Brown', 'alice@example.com', 'Email delivery failed', 'My emails are bouncing back with undeliverable error.', 'processed', NOW() - INTERVAL '1 hour'),
('msg-002-002', 'Bob Wilson', 'bob@example.com', 'Bounce notification received', 'Why am I getting bounce notifications for valid emails?', 'processed', NOW() - INTERVAL '1 hour 10 minutes'),
('msg-003-001', 'Carol White', 'carol@example.com', 'Verification email not received', 'I completed registration but did not receive the verification email.', 'processed', NOW() - INTERVAL '5 hours'),
('msg-003-002', 'David Lee', 'david@example.com', 'Account activation link expired', 'The activation link in my email has expired.', 'processed', NOW() - INTERVAL '6 hours'),
('msg-004-001', 'Emma Davis', 'emma@example.com', 'Invoice not received', 'I did not receive my invoice for this month.', 'processed', NOW() - INTERVAL '2 hours'),
('msg-004-002', 'Frank Garcia', 'frank@example.com', 'Payment declined', 'My payment was declined but I was still charged.', 'processed', NOW() - INTERVAL '3 hours'),
('msg-005-001', 'Grace Martinez', 'grace@example.com', 'Bug report: Dashboard crashes', 'The dashboard crashes when I try to upload files.', 'processed', NOW() - INTERVAL '12 hours'),
('msg-005-002', 'Henry Taylor', 'henry@example.com', 'Feature request: Dark mode', 'Can you add a dark mode option to the interface?', 'processed', NOW() - INTERVAL '15 hours'),
('msg-006-001', 'Iris Anderson', 'iris@example.com', 'API key generation failed', 'Unable to generate new API keys from the dashboard.', 'processed', NOW() - INTERVAL '20 hours'),
('msg-006-002', 'Jack Thomas', 'jack@example.com', 'API rate limit exceeded', 'Getting 429 errors even though I am within the rate limit.', 'processed', NOW() - INTERVAL '22 hours'),
('msg-007-001', 'Kate Jackson', 'kate@example.com', 'Cancellation request', 'I want to cancel my subscription effective immediately.', 'processed', NOW() - INTERVAL '30 hours'),
('msg-007-002', 'Liam White', 'liam@example.com', 'Retention offer', 'Are there any discounts available before I cancel?', 'processed', NOW() - INTERVAL '32 hours'),
('msg-008-001', 'Mona Clark', 'mona@example.com', 'MFA setup issues', 'I cannot setup two-factor authentication on my account.', 'processed', NOW() - INTERVAL '40 hours'),
('msg-008-002', 'Noah Lewis', 'noah@example.com', 'Unauthorized access', 'I detected unauthorized login attempts on my account.', 'processed', NOW() - INTERVAL '42 hours'),
('msg-009-001', 'Olivia Hall', 'olivia@example.com', 'General inquiry', 'I have a question about your pricing plans.', 'processed', NOW() - INTERVAL '50 hours'),
('msg-009-002', 'Peter Allen', 'peter@example.com', 'Documentation help', 'The documentation for the API is unclear.', 'processed', NOW() - INTERVAL '52 hours'),
('msg-010-001', 'Quinn Young', 'quinn@example.com', 'Feature suggestion: Export to CSV', 'It would be great to export data as CSV.', 'processed', NOW() - INTERVAL '15 hours'),
('msg-010-002', 'Rachel Green', 'rachel@example.com', 'UI improvement feedback', 'The sidebar navigation could be more intuitive.', 'processed', NOW() - INTERVAL '16 hours');

INSERT INTO public.email_clusters (cluster_id, message_id) VALUES
('cluster-001', 'msg-001-001'),
('cluster-001', 'msg-001-002'),
('cluster-001', 'msg-001-003'),
('cluster-002', 'msg-002-001'),
('cluster-002', 'msg-002-002'),
('cluster-003', 'msg-003-001'),
('cluster-003', 'msg-003-002'),
('cluster-004', 'msg-004-001'),
('cluster-004', 'msg-004-002'),
('cluster-005', 'msg-005-001'),
('cluster-005', 'msg-005-002'),
('cluster-006', 'msg-006-001'),
('cluster-006', 'msg-006-002'),
('cluster-007', 'msg-007-001'),
('cluster-007', 'msg-007-002'),
('cluster-008', 'msg-008-001'),
('cluster-008', 'msg-008-002'),
('cluster-009', 'msg-009-001'),
('cluster-009', 'msg-009-002'),
('cluster-010', 'msg-010-001'),
('cluster-010', 'msg-010-002');

INSERT INTO public.email_processing_errors (message_id, error_message, failed_stage, timestamp) VALUES
('msg-001-001', 'Invalid email format', 'validation', NOW() - INTERVAL '2 days'),
('msg-002-001', 'SMTP connection timeout', 'sending', NOW() - INTERVAL '1 day'),
('msg-003-001', 'Database constraint violation', 'storage', NOW() - INTERVAL '12 hours'),
('msg-004-001', 'Rate limit exceeded', 'processing', NOW() - INTERVAL '6 hours'),
('msg-005-001', 'Memory allocation failed', 'clustering', NOW() - INTERVAL '3 hours');

INSERT INTO public.email_ingestion_logs (message_id, source, status, details, created_at) VALUES
('msg-001-001', 'SMTP', 'success', '{"from":"john@example.com","to":"support@app.com"}', NOW() - INTERVAL '2 days'),
('msg-001-002', 'IMAP', 'success', '{"folder":"INBOX","flags":""}', NOW() - INTERVAL '30 minutes'),
('msg-001-003', 'API', 'success', '{"endpoint":"/emails/ingest","method":"POST"}', NOW() - INTERVAL '25 minutes'),
('msg-002-001', 'SMTP', 'failed', '{"error":"Connection refused","retry":1}', NOW() - INTERVAL '1 day'),
('msg-003-001', 'IMAP', 'success', '{"folder":"Sent","flags":"seen"}', NOW() - INTERVAL '5 hours');
```

---

## STEP 4: Paste the SQL

In the SQL Editor:
1. **Click in the text area** (white area where you see the code)
2. **Press Ctrl+A** to select all (if there's existing code)
3. **Press Ctrl+V** to paste the SQL above
4. Make sure all the SQL is there

---

## STEP 5: Run the SQL

1. Look for the **"Run"** button (usually green button at top right)
2. OR just press **Ctrl+Enter** on your keyboard
3. **Wait 5-10 seconds** for it to execute

You should see a **green checkmark** ✅ with message like:
```
executed successfully
```

If you see red error, screenshot it and let me know.

---

## STEP 6: Verify the Data

1. In Supabase left sidebar, click **"Table Editor"**
2. On the left, click **"clusters"** table
3. You should see a table with rows like:
   - cluster-001: Login authentication issues... (28 emails)
   - cluster-002: Email delivery and bounce... (15 emails)
   - etc.

If you see 10 rows → ✅ Success! Go to Step 7.

---

## STEP 7: Run Your Web App

Open a terminal and run:
```bash
cd /home/naveen/Documents/zzxzz
npm run dev
```

Wait for message like:
```
▲ Next.js 15.5.15
- Environments: .env.local, .env

ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

---

## STEP 8: Open in Browser

1. Open your browser (Chrome, Firefox, etc.)
2. Go to: **http://localhost:3000**
3. You should see:
   - Left panel: List of clusters (cluster-001, cluster-002, etc.)
   - Right panel: Details of first cluster
   - Top bar: Navigation menu

---

## Success! 🎉

If you can see clusters in the left panel, you're done!

- Click on any cluster to see its details
- Click "Analytics" or "Settings" in top menu
- Everything should work!

---

## Didn't Work? Troubleshooting

### Problem 1: Still shows empty list

**Try these in order:**

1. **Refresh browser** (Ctrl+Shift+R for hard refresh)

2. **Restart dev server**
   - Press Ctrl+C in terminal
   - Run again: `npm run dev`

3. **Check if data really inserted**
   - Go to Supabase Table Editor → clusters
   - Do you see rows there?
   - If NO: Re-run SQL from Step 3-5
   - If YES: There's an API issue

4. **Check API directly**
   ```bash
   curl http://localhost:3000/api/clusters
   ```
   Should show JSON with clusters. If empty `[]`:
   - Check Supabase Table Editor again
   - Re-run the INSERT SQL

### Problem 2: Got error running SQL in Supabase

**Common errors:**

1. **"relation does not exist"**
   - Make sure you ran the CREATE TABLE parts
   - Some tables might have existed before
   - Run the DROP TABLE ... CASCADE lines first

2. **"permission denied"**
   - RLS policy issue
   - Run the "CREATE POLICY" lines
   - Make sure they executed successfully

3. **"duplicate key"**
   - Data already exists
   - That's fine! Just refresh the page

### Problem 3: See data in Supabase but web still empty

**This means RLS policies are blocking reads.**

Go to Supabase SQL Editor and run:
```sql
-- Disable RLS temporarily for testing
ALTER TABLE public.clusters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_clusters DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_ingestion_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_processing_errors DISABLE ROW LEVEL SECURITY;
```

Then refresh web page. If it works now, the policies weren't set up right. Let me know!

---

## Need More Help?

Files in your project folder with more details:
- `DATABASE_SETUP.md` - Complete SQL reference
- `CLUSTERS_NOT_SHOWING_FIX.md` - Full troubleshooting guide
- `QUICK_START_CLUSTERS.md` - Quick reference

All files are in: `/home/naveen/Documents/zzxzz/`
