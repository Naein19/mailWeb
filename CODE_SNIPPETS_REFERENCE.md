# CODE IMPLEMENTATION REFERENCE

## 1. ACCOUNT DROPDOWN WITH CLICK-OUTSIDE HANDLING

**File:** `components/sidebar.tsx` (Lines 44-56)

```typescript
// Handle click outside to close dropdown
useEffect(() => {
  if (!showAccountSwitcher) return

  const handleClickOutside = (event: MouseEvent) => {
    if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target as Node)) {
      setShowAccountSwitcher(false)
    }
  }

  document.addEventListener('mousedown', handleClickOutside)
  return () => document.removeEventListener('mousedown', handleClickOutside)
}, [showAccountSwitcher])
```

**Key Features:**
- Early return optimization (no listener if dropdown closed)
- `mousedown` event (fires before blur)
- Proper cleanup in return function
- useRef for DOM reference: `ref={accountDropdownRef}`

---

## 2. COLORED AVATAR SYSTEM

**File:** `components/sidebar.tsx` (Lines 93-105)

```typescript
// Helper function to get avatar color based on email hash
const getAvatarColor = (email: string) => {
  const hash = email.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
    'from-emerald-500 to-emerald-600',
    'from-orange-500 to-orange-600',
    'from-indigo-500 to-indigo-600',
    'from-rose-500 to-rose-600',
  ]
  return colors[hash % colors.length]
}
```

**Usage:**
```typescript
<div className={cn("bg-gradient-to-br", getAvatarColor(email))}>
  {email[0].toUpperCase()}
</div>
```

**Benefits:**
- Deterministic (same email → same color)
- No API calls needed
- Instant rendering
- 8 distinct colors for variety

---

## 3. ACCOUNT DROPDOWN COMPONENT

**File:** `components/sidebar.tsx` (Lines 165-206)

```typescript
<AnimatePresence>
  {showAccountSwitcher && sidebarOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="absolute left-4 right-4 top-full mt-2 bg-[#1A1F26] border border-[#2D333B] rounded-xl shadow-2xl z-[100] p-1.5 space-y-1"
    >
      <p className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
        Select Account
      </p>
      
      <div className="max-h-[200px] overflow-y-auto scrollbar-minimal space-y-1">
        {connectedAccounts.map((acc) => (
          <button
            key={acc}
            onClick={() => handleSwitchAccount(acc)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-colors group",
              activeAccount === acc 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/[0.03]"
            )}
          >
            <div className={cn(
              "w-5 h-5 rounded-md bg-gradient-to-br flex items-center justify-center text-[10px] font-bold text-white shrink-0",
              getAvatarColor(acc)
            )}>
              {acc[0].toUpperCase()}
            </div>
            <span className="flex-1 text-left truncate">{acc}</span>
            {activeAccount === acc && <Check size={12} className="shrink-0" />}
          </button>
        ))}
      </div>

      <div className="border-t border-white/5 pt-1.5 mt-1">
        <button
          onClick={handleAddAccount}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-primary hover:bg-primary/5 transition-colors"
        >
          <Plus size={14} />
          <span>Connect Gmail</span>
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 4. UNIFIED ACCOUNT BADGE IN TOPBAR

**File:** `components/topbar.tsx` (Lines 101-117)

```typescript
<button
  onClick={() => setShowMenu(!showMenu)}
  className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.05] rounded-full transition-all group border border-border"
>
  <div className="flex items-center gap-2">
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
      {(activeAccount || user?.email)?.[0]?.toUpperCase() || 'U'}
    </div>
    <div className="flex flex-col items-start leading-none hidden sm:block">
      <p className="text-xs font-bold text-foreground">
        {(activeAccount || user?.email || 'User').split('@')[0]}
      </p>
      <p className="text-[9px] text-muted-foreground opacity-60">
        {activeAccount || user?.email}
      </p>
    </div>
  </div>
  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] flex-shrink-0" />
  <ChevronDown size={14} className="text-muted-foreground group-hover:text-foreground transition-all flex-shrink-0" />
</button>
```

**Key Points:**
- Single pill layout with border
- Responsive: name/email hidden on mobile
- Online indicator (emerald dot)
- Consistent gradient coloring

---

## 5. SEARCH FOCUS EFFECTS

**File:** `components/topbar.tsx` (Lines 46-63)

```typescript
<div className="relative group max-w-md focus-within:scale-[1.01] transition-transform">
  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-foreground transition-colors" />
  <input
    type="text"
    placeholder="Search clusters or emails..."
    onChange={(e) => setFilters({ search: e.target.value })}
    className="w-full bg-white/[0.03] border border-border rounded-xl px-9 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all placeholder:text-muted-foreground/30 shadow-sm focus:scale-105 group-focus-within:border-primary/40"
  />
  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background shadow-sm pointer-events-none opacity-60 group-focus-within:opacity-100 transition-opacity">
    <Command size={10} className="text-muted-foreground" />
    <span className="text-[10px] font-bold text-muted-foreground">K</span>
  </div>
</div>
```

**Focus Effects:**
- Parent: `focus-within:scale-[1.01]`
- Input: `focus:ring-2 focus:scale-105`
- Border: `focus:border-primary/40`
- Badge opacity: `group-focus-within:opacity-100`

---

## 6. CLUSTER CARD HOVER STATES

**File:** `components/cluster-card.tsx` (Full implementation)

### Hover Container:
```typescript
<button
  onClick={onClick}
  className={cn(
    "w-full text-left px-5 py-4 transition-all duration-200 group relative border-l-2 hover:translate-y-[-1px]",
    isActive
      ? "bg-primary/[0.05] border-primary shadow-sm"
      : "hover:bg-white/[0.02] border-transparent hover:shadow-sm"
  )}
>
```

### Left Accent Bar:
```typescript
{!isActive && (
  <div className={cn(
    "absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-r opacity-0 group-hover:opacity-100 transition-opacity",
    accentColor
  )} />
)}
```

### Quick Action Icons:
```typescript
<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
  <button
    onClick={(e) => { e.stopPropagation() }}
    className="p-1 hover:bg-white/[0.05] rounded transition-colors text-muted-foreground hover:text-foreground"
    title="Reply All"
  >
    <MessageCircle size={12} />
  </button>
  {/* Forward and Archive buttons follow same pattern */}
</div>
```

**Accent Color Mapping:**
```typescript
const accentColor = {
  urgent: 'bg-destructive',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}[cluster.priority] || 'bg-primary'
```

---

## 7. IMPROVED EMPTY STATE WITH SEARCH HANDLING

**File:** `components/cluster-list.tsx` (Lines 70-105)

```typescript
{filteredClusters.length === 0 ? (
  <div className="h-full flex flex-col items-center justify-center text-center px-6 py-8">
    {hasSearchFilter ? (
      <>
        <p className="text-xs font-bold text-muted-foreground mb-2">
          No results for "{filters.search}"
        </p>
        <p className="text-[10px] text-muted-foreground/60 mb-4">
          Try a different search term
        </p>
        <button
          onClick={handleClearSearch}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs text-foreground transition-colors"
        >
          <X size={12} />
          Clear search
        </button>
      </>
    ) : (
      <>
        <p className="text-xs font-bold text-muted-foreground mb-1">
          No clusters yet
        </p>
        <p className="text-[10px] text-muted-foreground/60">
          Your inbox is quiet — connecting your first Gmail account will start the clustering process
        </p>
      </>
    )}
  </div>
) : (
  // Cluster list...
)}
```

---

## 8. ACTIVE ACCOUNT IN MAIN PAGE EMPTY STATE

**File:** `app/page.tsx` (Lines 59-81)

```typescript
{selectedClusterId ? (
  <ClusterDetail />
) : (
  <div className="h-full flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="text-6xl inline-block animate-pulse">📬</div>
      <div className="space-y-2">
        <p className="text-lg font-medium text-foreground">
          {isLoading ? 'Loading clusters...' : 'Setting up your inbox…'}
        </p>
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Please wait while we fetch your email clusters' : 'Your first emails will appear within 1 minute'}
        </p>
      </div>
      {!isLoading && activeAccount && (
        <p className="text-xs text-muted-foreground opacity-70 pt-2">
          Showing clusters for <span className="text-primary font-semibold">{activeAccount}</span>
        </p>
      )}
    </div>
  </div>
)}
```

---

## 9. HEALTH WIDGET WITH INTERACTIVITY

**File:** `components/sidebar.tsx` (Lines 251-289)

```typescript
{sidebarOpen && (
  <div className="px-3 py-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-4 shadow-sm group hover:bg-white/[0.03] transition-colors">
    <div className="flex items-center justify-between">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
        System Health
      </p>
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
        <span className="text-[10px] font-bold text-foreground">Healthy</span>
      </div>
    </div>
    
    <div className="relative flex items-center justify-center py-2 group/health cursor-help" title="92% of emails processed successfully in the last 24 hours">
      <svg className="w-24 h-24 transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r="34"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          className="text-white/[0.05]"
        />
        <circle
          cx="48"
          cy="48"
          r="34"
          stroke="currentColor"
          strokeWidth="6"
          fill="transparent"
          strokeDasharray="213"
          strokeDashoffset={213 - (213 * 0.92)}
          strokeLinecap="round"
          className="text-emerald-500 transition-all group-hover/health:text-emerald-400"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-foreground">92%</span>
      </div>
    </div>

    <div className="text-center space-y-1">
      <p className="text-[11px] font-bold text-foreground">Success Rate</p>
      <p className="text-[10px] text-muted-foreground">Last 24 hours</p>
      <p className="text-[10px] text-muted-foreground opacity-50">Hover for details</p>
    </div>

    <button className="w-full py-2 px-3 flex items-center justify-between bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 rounded-xl transition-all group/btn">
      <span className="text-[10px] font-bold text-foreground">View Analytics</span>
      <ArrowRight size={12} className="text-muted-foreground transition-transform group-hover/btn:translate-x-0.5" />
    </button>
  </div>
)}
```

---

## 10. ACCOUNT SWITCHING HANDLER

**File:** `components/sidebar.tsx` (Lines 108-113)

```typescript
const handleSwitchAccount = (email: string) => {
  setActiveAccount(email)
  setActiveAccountStorage(email)
  setShowAccountSwitcher(false)
}

const handleAddAccount = async () => {
  try {
    setShowAccountSwitcher(false)
    await signInWithGoogleAddAccount()
  } catch (error) {
    console.error('Failed to start add account flow:', error)
  }
}
```

---

## TAILWIND CLASSES USED (New)

```tailwind
/* Colors & Backgrounds */
from-blue-500 to-blue-600        /* Avatar gradient */
from-purple-500 to-purple-600
from-pink-500 to-pink-600
from-cyan-500 to-cyan-600
from-emerald-500 to-emerald-600
from-orange-500 to-orange-600
from-indigo-500 to-indigo-600
from-rose-500 to-rose-600
bg-gradient-to-br                /* Gradient direction */
text-emerald-400                 /* Hover color */
bg-[#1A1F26]                     /* Dark dropdown bg */
border-[#2D333B]                 /* Dark border */

/* Animations */
animate-pulse                    /* Pulsing indicator */
hover:translate-y-[-1px]         /* Card lift */
hover:scale-[1.01]              /* Input scale */
focus:scale-105                 /* Input focus scale */
focus:ring-2                    /* Stronger focus ring */

/* Layout */
rounded-full                    /* Pill shape */
rounded-xl                      /* Rounded corners */
rounded-2xl                     /* Larger border radius */
group-hover:opacity-100         /* Icon fade on hover */
group-focus-within:             /* Focus within parent */
flex-shrink-0                   /* Prevent shrinking */

/* Spacing */
shadow-2xl                      /* Large shadow */
shadow-sm                       /* Small shadow */
```

---

## STATE MANAGEMENT CHANGES

**No new store properties needed.** Using existing:
- `activeAccount` - Current selected account
- `connectedAccounts` - List of all connected emails
- `setActiveAccount()` - Update active account
- `setConnectedAccounts()` - Update list
- `filters` - Search/filter state
- `setFilters()` - Update filters

---

## EVENTS & HANDLERS

```typescript
// Click events
onClick={() => setShowAccountSwitcher(!showAccountSwitcher)}
onClick={() => handleSwitchAccount(acc)}
onClick={handleAddAccount}

// Input events
onChange={(e) => setFilters({ search: e.target.value })}

// Document events
document.addEventListener('mousedown', handleClickOutside)
document.removeEventListener('mousedown', handleClickOutside)

// Stop propagation for quick actions
onClick={(e) => { e.stopPropagation() }}
```

---

## PERFORMANCE CONSIDERATIONS

- Event listeners cleaned up in useEffect return
- Animations use GPU acceleration (transform, opacity)
- No expensive re-renders
- Memoization not needed (simple components)
- Ref cleanup prevents memory leaks
- Conditional rendering for visibility

---

## FUTURE ENHANCEMENT POINTS

1. **Health Widget Thresholds:**
   ```typescript
   const getHealthColor = (rate: number) => 
     rate >= 80 ? 'emerald' : rate >= 50 ? 'amber' : 'red'
   ```

2. **Quick Action Handlers:**
   ```typescript
   const handleReplyAll = () => { /* ... */ }
   const handleForward = () => { /* ... */ }
   const handleArchive = () => { /* ... */ }
   ```

3. **Supabase Account Query:**
   ```typescript
   const { data: accounts } = await supabase
     .from('user_gmail_tokens')
     .select('email')
     .eq('user_id', user.id)
   ```
