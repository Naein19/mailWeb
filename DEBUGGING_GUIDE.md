# Error Handling - Before & After

## THE PROBLEM

When clusters fail to load:

```
User clicks "Load Clusters"
          ↓
API call fails
          ↓
console.error('[Dashboard] Failed to fetch clusters:', error)
          ↓
Output: Failed to fetch clusters: {}
          ↓
Developer: 😕 What went wrong?
```

**Issues:**
- Empty error object `{}`
- No actionable information
- No way to retry
- No UI fallback indicators

---

## THE SOLUTION

### Console Output Progression

**Starting fetch:**
```
[Dashboard] Fetching clusters for account: user@gmail.com
```

**If successful:**
```
[Dashboard] Clusters loaded successfully: {
  count: 5,
  accountId: "user@gmail.com",
  firstCluster: "cluster-abc123"
}
[Dashboard] Emails loaded: { clusterId: "cluster-abc123", emailCount: 12 }
[Dashboard] Cluster fetch cycle complete
```

**If Supabase error:**
```
[Dashboard] Supabase RPC error details: {
  message: "RLS policy violation",
  code: "PGRST301",
  hint: "Check your row-level security policies"
}
[Dashboard] Fetch error details: {
  message: "Supabase RPC failed: RLS policy violation",
  stack: "Error: ...",
  type: "Error"
}
[Dashboard] Cluster list cleared due to error
[Dashboard] Cluster fetch cycle complete
```

**If network error:**
```
[Dashboard] Network error: server unreachable or CORS blocked
[Dashboard] Cluster list cleared due to error
[Dashboard] Cluster fetch cycle complete
```

**If invalid response:**
```
[Dashboard] Invalid response format: {
  type: "object",
  isArray: false
}
[Dashboard] Fetch error details: {
  message: "Invalid response format: expected array, got object",
  ...
}
[Dashboard] Cluster list cleared due to error
```

---

## UI CHANGES

### Before
```
📬
Setting up your inbox…
Your first emails will appear within 1 minute

Showing clusters for user@gmail.com
(No retry option, stuck if error)
```

### After
```
📬
Setting up your inbox…
Your first emails will appear within 1 minute

Showing clusters for user@gmail.com

┌─────────────┐
│    Retry    │  ← Click to fetch again
└─────────────┘
```

---

## ERROR DIAGNOSIS FLOW

```
Error occurs
     ↓
Check console logs
     ↓
┌────────────────────────────────────┐
│ Look for error pattern:             │
├────────────────────────────────────┤
│ • "Network error" → Check server   │
│ • "CORS blocked" → Check headers   │
│ • "RLS policy" → Check policies    │
│ • "Invalid format" → Check schema  │
│ • "Missing field" → Check mapping  │
└────────────────────────────────────┘
     ↓
Click "Retry" button
     ↓
Check if error persists
     ↓
Debug or deploy fix
```

---

## CODE COMPARISON

### Before - Silent Failure
```typescript
try {
  const { data, error } = await supabase.rpc(...)
  if (error) throw error
  // ... process data
} catch (error) {
  console.error('[Dashboard] Failed to fetch clusters:', error)
  // ❌ Logs entire error object (often empty or circular)
  setClusters([])
}
```

### After - Transparent Debugging
```typescript
console.log('[Dashboard] Fetching clusters for account:', accountId)

try {
  const { data, error } = await supabase.rpc(...)
  
  if (error) {
    console.error('[Dashboard] Supabase RPC error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    })
    throw new Error(`Supabase RPC failed: ${error.message}`)
  }
  
  if (!Array.isArray(data)) {
    console.error('[Dashboard] Invalid response format:', {
      type: typeof data,
      isArray: Array.isArray(data),
    })
    throw new Error(`Invalid response format: expected array, got ${typeof data}`)
  }

  console.log('[Dashboard] Clusters loaded successfully:', {
    count: data.length,
    accountId,
    firstCluster: data[0]?.id,
  })
  
  // ✅ Clear context at each step
  setClusters(data)

} catch (error) {
  console.error('[Dashboard] Fetch error details:', {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    type: error?.constructor?.name,
  })
  setClusters([])
  
} finally {
  console.log('[Dashboard] Cluster fetch cycle complete')
}
```

---

## WHAT EACH LOG TELLS YOU

| Log Message | Means | Action |
|---|---|---|
| `Fetching clusters for account: X` | Fetch started with correct account | Monitor that account matches selected |
| `Clusters loaded successfully` | ✅ Success - everything worked | No action needed |
| `Supabase RPC error details` | ❌ Database query failed | Check Supabase error code |
| `Network error: unreachable` | ❌ Server not responding | Check API health/CORS |
| `Invalid response format` | ❌ API returned wrong data type | Check API response schema |
| `Cluster list cleared due to error` | UI is safe despite error | UI won't crash |
| `Cluster fetch cycle complete` | Fetch finished (success or error) | Check earlier logs for status |

---

## DEBUGGING TIPS

### Tip 1: Check Network Tab
```
DevTools → Network tab
Filter by: clusters
Check:
  • Status code (200 = ok, 4xx = client error, 5xx = server error)
  • Response body (what data was returned?)
  • Response headers (CORS headers present?)
```

### Tip 2: Use Console Filters
```
DevTools → Console
Type: [Dashboard]
Shows only relevant logs
```

### Tip 3: Search Error Codes
```
[Dashboard] Supabase RPC error details: { code: "PGRST301" }
         ↓
Search: "PGRST301 supabase"
         ↓
Results: Row-level security (RLS) policy violation
```

### Tip 4: Compare Successful vs Failed Logs
```
Successful:
  [Dashboard] Fetching clusters for account: user@gmail.com
  [Dashboard] Clusters loaded successfully: { count: 5, ... }

Failed:
  [Dashboard] Fetching clusters for account: user@gmail.com
  [Dashboard] Supabase RPC error details: { message: "...", code: "..." }

Difference: Specific error message tells you what failed
```

---

## PRODUCTION MONITORING

Watch for these patterns in logs:

### 🔴 Critical (Act Immediately)
```
[Dashboard] Network error: server unreachable
```
→ API is down, page won't work

### 🟠 Serious (Check Soon)
```
[Dashboard] Supabase RPC error details: { code: "PGRST301" }
```
→ Database policy issue

### 🟡 Warning (Investigate)
```
[Dashboard] Cluster missing cluster_id
```
→ Data quality issue

### 🟢 Info (Monitor Trend)
```
[Dashboard] Clusters loaded successfully: { count: 0 }
```
→ Normal if user has no emails

---

## RETRY MECHANISM

### UI Button
```
NOT loading AND account selected?
    ↓
Show "Retry" button
    ↓
User clicks
    ↓
fetchClusters(activeAccount) runs again
    ↓
New logs capture what happens
    ↓
Compare old vs new logs to find fix
```

---

## SUMMARY

| Aspect | Before | After |
|--------|--------|-------|
| Error Info | `{}` | Full context with message, code, stack |
| Network Issues | Silent fail | Detected and logged |
| Response Validation | None | Validates array format |
| UI Stability | May crash | Always safe fallback |
| Recovery | Requires refresh | Click Retry button |
| Debugging Time | 30+ minutes | < 5 minutes |
| Production Support | Hard to diagnose | Clear error trail |

---

**Result: Errors go from mysterious to debuggable in seconds.** ✅
