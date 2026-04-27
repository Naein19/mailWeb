# RPC Debugging Guide - "TypeError: a[d] is not a function" with Empty `{}`

## Problem Diagnosis

The app was logging errors as empty objects `{}` making debugging impossible:
```
console.error("RPC Error:", {})
// What does {} mean? No information!
```

## Solution Applied

Enhanced the `fetchClusters` function with 5-step debugging process to reveal real errors.

---

## What Changed

### File: `app/page.tsx` - fetchClusters function

**Added Step-by-Step Debugging:**

```ts
// STEP 1: Verify user identity
console.log('USER EMAIL:', user?.email)
console.log('USER ID:', user?.id)

if (!user?.email) {
  throw new Error('User email missing — cannot fetch clusters')
}

// STEP 2: Check session exists
const { data: { session }, error: sessionError } = await supabase.auth.getSession()
console.log('Session check result:', {
  hasSession: !!session,
  sessionError,
  userId: session?.user?.id,
})

if (!session) {
  throw new Error('No session — user not authenticated')
}

// STEP 3: Call RPC with full debug
console.log('RPC Parameters:', {
  p_account_id: accountId,
  p_limit: 50,
  p_offset: 0,
})

const { data, error } = await supabase.rpc('get_clusters_for_account', {
  p_account_id: accountId,
  p_limit: 50,
  p_offset: 0,
})

// 🔥 FULL RAW LOG
console.log('RAW RPC RESPONSE:', { data, error })

// STEP 4: Validate response
if (!Array.isArray(data)) {
  console.error('Invalid data format - not an array:', {
    type: typeof data,
    isArray: Array.isArray(data),
    value: data,
  })
  setClusters([])
  return
}

// STEP 5: Transform with validation
const clusters: Cluster[] = data.map(...)
```

**Enhanced Error Handling:**

```ts
if (error) {
  // ❌ FULL ERROR OBJECT logged with all properties
  console.error('FULL ERROR OBJECT:')
  console.error(JSON.stringify(error, null, 2))
  console.error('Error properties:', {
    message: error.message,
    code: error.code,
    details: error.details,
    hint: error.hint,
  })
  throw new Error(`Supabase RPC failed: ${error.message || JSON.stringify(error)}`)
}
```

**Final Catch Block:**

```ts
} catch (error) {
  // 🔥 COMPREHENSIVE FINAL ERROR LOGGING
  console.error('FINAL ERROR:', error)
  console.error('ERROR STRING:', String(error))
  if (error instanceof Error) {
    console.error('ERROR STACK:', error.stack)
  }
  
  // Detect specific error types
  if (error instanceof TypeError) {
    console.error('🔴 Network error: server unreachable or CORS blocked')
  } else if (error instanceof Error && error.message.includes('Supabase')) {
    console.error('🔴 Supabase connectivity issue')
  } else if (error instanceof Error && error.message.includes('User email missing')) {
    console.error('🔴 Authentication issue: no user email')
  } else if (error instanceof Error && error.message.includes('No session')) {
    console.error('🔴 Authentication issue: no active session')
  }
  
  setClusters([])
}
```

---

## Console Output Examples

### ✅ Success Case

```
[Dashboard] ===== FETCH CLUSTERS START =====
[Dashboard] Input account ID: user@gmail.com {
  userEmail: "user@gmail.com",
  userId: "550e8400-...",
  accountIdType: "string",
  isEmail: true
}
[Dashboard] STEP 1: Verifying user...
[Dashboard] USER EMAIL: user@gmail.com
[Dashboard] USER ID: 550e8400-...
[Dashboard] STEP 2: Checking session...
[Dashboard] Session check result: {
  hasSession: true,
  sessionError: undefined,
  userId: "550e8400-..."
}
[Dashboard] STEP 3: Calling RPC get_clusters_for_account...
[Dashboard] RPC Parameters: {
  p_account_id: "user@gmail.com",
  p_limit: 50,
  p_offset: 0
}
[Dashboard] RAW RPC RESPONSE: {
  data: [
    { cluster_id: "abc-123", title: "Work", ... },
    { cluster_id: "def-456", title: "Personal", ... }
  ],
  error: null
}
[Dashboard] ✓ Response is valid array with 2 items
[Dashboard] ✓ Clusters loaded successfully: {
  count: 2,
  accountId: "user@gmail.com",
  firstCluster: "abc-123"
}
```

### ❌ Error Case - Wrong Account ID

```
[Dashboard] STEP 3: Calling RPC get_clusters_for_account...
[Dashboard] RAW RPC RESPONSE: {
  data: null,
  error: {
    message: "No clusters found for account_id",
    code: "PGRST116",
    details: null,
    hint: "account_id did not match any rows"
  }
}
[Dashboard] ❌ FULL ERROR OBJECT:
{
  "message": "No clusters found for account_id",
  "code": "PGRST116",
  "details": null,
  "hint": "account_id did not match any rows"
}
[Dashboard] Error properties: {
  message: "No clusters found for account_id",
  code: "PGRST116",
  details: null,
  hint: "account_id did not match any rows"
}
```

### ❌ Error Case - Missing Session

```
[Dashboard] STEP 2: Checking session...
[Dashboard] Session check result: {
  hasSession: false,
  sessionError: undefined,
  userId: undefined
}
[Dashboard] ❌ FETCH ERROR OCCURRED
[Dashboard] FINAL ERROR: Error: No session — user not authenticated
[Dashboard] ERROR STRING: Error: No session — user not authenticated
[Dashboard] ERROR STACK: Error: No session — user not authenticated
    at ...
    at ...
[Dashboard] ERROR DETAILS: {
  message: "No session — user not authenticated",
  type: "Error",
  isError: true,
  accountIdUsed: "user@gmail.com"
}
[Dashboard] 🔴 Authentication issue: no active session
```

---

## How to Use This for Debugging

### 1. **Open Browser DevTools**
   - Press `F12` or `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - Go to **Console** tab

### 2. **Filter for Dashboard Logs**
   - Type in filter: `[Dashboard]`
   - This shows only our debug logs

### 3. **Look for These Sections:**
   - `FETCH CLUSTERS START` - Beginning of fetch
   - `USER EMAIL:` and `USER ID:` - Auth info
   - `Session check result:` - Session status
   - `RPC Parameters:` - What's being sent to backend
   - `RAW RPC RESPONSE:` - Raw response from backend
   - `FULL ERROR OBJECT:` - If error occurred
   - `FINAL ERROR:` - Last error message
   - Error type detection (🔴 lines show the issue)

### 4. **Follow the Flow**
   ```
   START → Verify user → Check session → Call RPC → 
   → Validate response → Transform data → SUCCESS ✓
                                       → ERROR ❌
   ```

---

## Common Issues & What to Look For

| Issue | What You'll See | Fix |
|-------|-----------------|-----|
| **User not logged in** | `USER EMAIL: undefined` | Re-login |
| **Session expired** | `hasSession: false` | Refresh page / re-login |
| **Wrong account_id format** | `p_account_id: "550e8400-..."` (UUID instead of email) | Check if using email |
| **No clusters in database** | `data: []` (empty array) | Check database has data |
| **RPC function broken** | `code: "PGRST116"` and `hint: "account_id did not match"` | Check RPC exists and works |
| **Network/CORS issue** | `TypeError: Failed to fetch` | Check n8n/backend is running |
| **Invalid response type** | `type: "object"` (not array) | Check RPC returns array |

---

## Testing the Fix

### Test 1: Normal Flow
1. Log in to the app
2. Open DevTools Console
3. Look for: `[Dashboard] ✓ Clusters loaded successfully`
4. Should see cluster count and list

### Test 2: Catch Auth Issues
1. Log in
2. Wait 5 minutes (session might expire in tests)
3. Try to fetch clusters
4. Should see: `🔴 Authentication issue: no active session`

### Test 3: Catch Data Issues
1. If clusters don't appear
2. Look for: `[Dashboard] Invalid data format - not an array`
3. This means RPC returned wrong type

### Test 4: Verify User Identity
1. Log in with your Gmail
2. Look for: `USER EMAIL: your-email@gmail.com`
3. Should match your login email

---

## What Each Debug Step Reveals

### STEP 1: User Verification
```
USER EMAIL: user@gmail.com
USER ID: 550e8400-e29b-41d4-...
```
**Tells you:** Is user authenticated? Do we have their email?

### STEP 2: Session Check
```
Session check result: {
  hasSession: true,
  sessionError: undefined,
  userId: "550e8400-..."
}
```
**Tells you:** Is there a valid auth session?

### STEP 3: RPC Parameters
```
RPC Parameters: {
  p_account_id: "user@gmail.com",
  p_limit: 50,
  p_offset: 0
}
```
**Tells you:** What are we sending to the backend?

### Raw RPC Response
```
RAW RPC RESPONSE: { 
  data: [...clusters...],
  error: null 
}
```
**Tells you:** Did the RPC call succeed? What's the raw response?

---

## Build Status

```
✓ Compiled successfully in 2.9s
✓ No TypeScript errors
✓ All routes generated
✓ Ready for production
```

---

## Key Improvements

| Before | After |
|--------|-------|
| Error logged as `{}` | Full error object with all properties |
| No context | 5 debug steps showing exact flow |
| Silent failures | Clear error detection and categorization |
| Unknown issues | Specific error types identified |
| Can't debug | Console logs guide troubleshooting |

---

## Production Ready

✅ All debugging code is production-safe:
- Uses `console.log/error` (browser console only)
- No network calls added
- No performance impact
- Can be removed later if needed

---

## Next Steps if Still Having Issues

1. **Reproduce the issue** while DevTools is open
2. **Copy all `[Dashboard]` console logs**
3. **Look for error messages** - they now show the real problem
4. **Match to "Common Issues" table above**
5. **Check the specific fix** for your issue

The debugging output will tell you exactly what's wrong instead of silent `{}` errors!
