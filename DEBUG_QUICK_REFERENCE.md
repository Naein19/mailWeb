# RPC Debugging - Quick Reference Card

## What Changed

The `fetchClusters()` function in `app/page.tsx` now includes **5-step debugging** to reveal real errors instead of empty `{}`.

## Quick Debug Checklist

### 1️⃣ Open DevTools Console
```
F12 (Windows) or Cmd+Option+I (Mac)
```

### 2️⃣ Filter for Dashboard Logs
```
Type in filter box: [Dashboard]
```

### 3️⃣ Look for These Key Messages

| Log | Meaning | Status |
|-----|---------|--------|
| `FETCH CLUSTERS START` | Fetch initiated | ℹ️ Info |
| `USER EMAIL: user@gmail.com` | User authenticated | ✅ Good |
| `USER EMAIL: undefined` | User not logged in | ❌ Error |
| `hasSession: true` | Valid auth session | ✅ Good |
| `hasSession: false` | Session expired/missing | ❌ Error |
| `RAW RPC RESPONSE: { data: [...], error: null }` | RPC succeeded | ✅ Good |
| `RAW RPC RESPONSE: { data: null, error: {...} }` | RPC failed | ❌ Error |
| `✓ Clusters loaded successfully` | All good | ✅ Success |
| `❌ FETCH ERROR OCCURRED` | Something failed | ❌ Error |
| `🔴 Network error` | Can't reach backend | ❌ Error |
| `🔴 Authentication issue` | Auth problem | ❌ Error |

---

## Error Type Detection

### Network Error
```
ERROR STRING: Error: Failed to fetch
🔴 Network error: server unreachable or CORS blocked
```
**Fix:** Check n8n/backend is running

### Session Expired
```
Session check result: { hasSession: false }
🔴 Authentication issue: no active session
```
**Fix:** Refresh page or log in again

### Wrong Account ID
```
RAW RPC RESPONSE: {
  data: null,
  error: {
    message: "No clusters found for account_id",
    hint: "account_id did not match any rows"
  }
}
```
**Fix:** Check account_id matches database

### Missing User Email
```
USER EMAIL: undefined
🔴 Authentication issue: no user email
```
**Fix:** Complete login flow

---

## Debug Flow

```
┌─ START
├─ STEP 1: USER EMAIL / USER ID logged
├─ STEP 2: Session check logged
├─ STEP 3: RPC Parameters logged
├─ RAW RPC RESPONSE logged
├─ ✓ OR ❌ (success or error)
├─ ERROR DETAILS logged (if error)
├─ Error type detected (🔴)
└─ END
```

---

## Console Filter Trick

**Copy-paste in console to see only dashboard logs:**
```javascript
// Show only [Dashboard] logs
const logs = [];
const originalError = console.error;
const originalLog = console.log;
console.error = function(...args) {
  if (String(args[0]).includes('[Dashboard]')) originalError.apply(console, args);
}
console.log = function(...args) {
  if (String(args[0]).includes('[Dashboard]')) originalLog.apply(console, args);
}
```

---

## Most Important Logs

### If debugging, focus on these:

1. **`USER EMAIL: ???`**
   - Is user logged in?
   - Do we have email?

2. **`Session check result: ???`**
   - Is session valid?
   - Not expired?

3. **`RPC Parameters: ???`**
   - Are we sending correct email?
   - Not UUID?

4. **`RAW RPC RESPONSE: ???`**
   - Did RPC succeed?
   - What's the response?

5. **`✓ Clusters loaded` OR `❌ FETCH ERROR`**
   - Did it work or fail?

---

## Before & After

### Before (Unhelpful)
```
console.error("Error:", {})
```
❌ No information at all

### After (Helpful)
```
[Dashboard] RAW RPC RESPONSE: {
  data: null,
  error: {
    message: "No clusters found for account_id",
    code: "PGRST116",
    hint: "account_id did not match any rows"
  }
}
[Dashboard] Error properties: {
  message: "No clusters found for account_id",
  code: "PGRST116",
  details: null,
  hint: "account_id did not match any rows"
}
```
✅ Clear error message explaining the problem

---

## Testing Each Step

### Test 1: Normal Login
1. Go to app
2. Open DevTools
3. Log in
4. Look for: `✓ Clusters loaded successfully`
5. Check count matches expected

### Test 2: Check User Identity
1. Log in
2. Look for: `USER EMAIL: your@email.com`
3. Should match your login

### Test 3: Check Session
1. Log in
2. Look for: `Session check result: { hasSession: true }`
3. Should be `true`

### Test 4: Check RPC Call
1. Log in
2. Look for: `RAW RPC RESPONSE: { data: [...], error: null }`
3. Should have data array

---

## File Modified

- **`app/page.tsx`** (fetchClusters function, lines 53-287)
  - Added 5-step debug process
  - Added RAW RPC RESPONSE logging
  - Enhanced error detection
  - Better error categorization

---

## Build Status

```
✓ Compiled successfully
✓ No TypeScript errors
✓ Ready for production
```

---

## Common Debugging Scenarios

### Scenario 1: Clusters Not Loading
**Check console for:**
```
[Dashboard] FETCH CLUSTERS START
[Dashboard] USER EMAIL: (should not be undefined)
[Dashboard] Session check result: { hasSession: true }
[Dashboard] RAW RPC RESPONSE: { data: [], error: null }
```
**If data: [], clusters list is empty** → Check database has data

### Scenario 2: Error When Opening App
**Check console for:**
```
[Dashboard] ❌ FETCH ERROR OCCURRED
[Dashboard] FINAL ERROR: (shows actual error)
[Dashboard] 🔴 (shows error type)
```
**Follow the 🔴 error type** → Apply specific fix

### Scenario 3: Clusters Were Loading, Now Not
**Check console for:**
```
[Dashboard] Session check result: { hasSession: false }
[Dashboard] 🔴 Authentication issue: no active session
```
**User session expired** → Refresh page or re-login

---

## Production Impact

✅ **Zero breaking changes**
- Only adds console logging
- No API changes
- No database changes
- No UI changes
- Can be removed later if needed

---

## Files with Debugging

- `app/page.tsx` → fetchClusters function
  - Complete 5-step debug process
  - Raw RPC response logging
  - Error type detection

---

## Next Time You Have an Error

1. **Open DevTools** (F12)
2. **Filter for `[Dashboard]`**
3. **Follow the logs** from START to ERROR
4. **Look for 🔴** error type
5. **Match to fix** in this guide

**The error message is now clear instead of `{}`!** ✅
