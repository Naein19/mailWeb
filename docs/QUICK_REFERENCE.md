# 🎯 Email Clustering Dashboard - Quick Reference Guide

## 🚀 Getting Started (60 seconds)

```bash
# 1. Navigate to project
cd /home/naveen/Documents/zzxzz

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
# Visit: http://localhost:3000
```

**Done!** Your dashboard is live. 🎉

---

## 📍 Key Files

| File | Purpose | Edit When |
|------|---------|-----------|
| `app/page.tsx` | Main dashboard | Want to change layout |
| `components/*.tsx` | UI components | Need new features |
| `lib/store.ts` | State management | Adding global state |
| `lib/api.ts` | Data service | Connecting to backend |
| `tailwind.config.ts` | Colors/theme | Want to customize |
| `app/globals.css` | Global styles | Need base changes |

---

## 🎨 Quick Customization

### Change Theme Colors
Edit `tailwind.config.ts`:
```typescript
--accent: 263 70% 50%;  // Blue (change HSL values)
--primary: 263 70% 50%; // Adjust as needed
```

### Change Sidebar Width
Edit `components/sidebar.tsx`:
```typescript
className="w-64"  // Change to w-80, w-96, etc.
```

### Change Animation Speed
Edit any component:
```typescript
transition={{ duration: 0.2 }}  // Change 0.2 to 0.3, 0.5, etc.
```

### Add New Cluster
Edit `lib/api.ts`:
```typescript
{
  id: 'cluster-6',
  title: 'New Cluster',
  summary: 'Description here',
  priority: 'medium',
  email_count: 5,
  // ... other fields
}
```

---

## 🔧 Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Quality
npm run type-check   # Check TypeScript
npm run lint         # Run linter

# Utilities
./start.sh          # Quick start script
npm install         # Install dependencies
npm update          # Update packages
```

---

## 📊 Project Structure Cheat Sheet

```
zzxzz/
├── app/             # Next.js app directory
│   ├── page.tsx     # Main dashboard
│   ├── layout.tsx   # Root layout
│   └── globals.css  # Global styles
├── components/      # React components
├── lib/             # Utilities & services
│   ├── store.ts     # Zustand store
│   ├── api.ts       # Mock data
│   └── types.ts     # TypeScript types
├── public/          # Static files
└── package.json     # Dependencies
```

---

## 🎯 UI Navigation Map

```
┌─────────────────────────────────────────────────────┐
│  Sidebar              Top Bar (Search, Settings)    │
│  - Dashboard          User Avatar                    │
│  - Clusters    ┌──────────────────────────────────┐ │
│  - Analytics   │                                  │ │
│  - Settings    │  Cluster List (Left)             │ │
│                │  ✓ Login Issues (32)             │ │
│  User Profile  │  ✓ Billing (18)                  │ │
│                │  ✓ Features (24)                 │ │
│                │                                  │ │
│                │  [Click cluster]                 │ │
│                └──────────────────────────────────┘ │
│                                                      │
│                ┌──────────────────────────────────┐ │
│                │ Cluster Detail (Right)           │ │
│                │                                  │ │
│                │ Title: Login Issues              │ │
│                │ Summary: Description...          │ │
│                │ [Mark All] [Archive] [Delete]    │ │
│                │                                  │ │
│                │ Email List:                      │ │
│                │ - John Smith: Cannot login      │ │
│                │   [Click to open]                │ │
│                │ - Sarah Johnson: 401 error      │ │
│                │   [Click to open]                │ │
│                └──────────────────────────────────┘ │
│                                                      │
│                ┌────────────────────────────────┐   │
│                │  Email Drawer (Right Slide-in) │   │
│                │  Subject: Cannot login          │   │
│                │  From: john@example.com         │   │
│                │  Date: Jan 15, 2:30 PM          │   │
│                │                                │   │
│                │  [Full Email Content]          │   │
│                │                                │   │
│                │  [Reply] [Forward] [✭] [Tag]   │   │
│                └────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 Connecting to Supabase

```typescript
// In lib/api.ts, replace:
export const mockDataService = {

// With:
import { supabase } from './supabase'

export const dataService = {
  async getClusters() {
    const { data } = await supabase
      .from('clusters')
      .select('*')
      .order('updated_at', { ascending: false })
    return data || []
  }
  // ... more queries
}
```

Then update `app/page.tsx`:
```typescript
// Change from:
import { mockDataService } from '@/lib/api'

// To:
import { dataService } from '@/lib/api'
```

---

## 🎛️ Zustand Store Usage

```typescript
// Get state
const clusters = useDashboardStore((state) => state.clusters)

// Get action
const { setClusters } = useDashboardStore()

// Use action
setClusters(newClusters)

// Get computed selector
const filtered = useDashboardStore((state) => 
  state.getFilteredClusters()
)
```

---

## 🚢 Deployment Checklist

- [ ] Review environment variables
- [ ] Build locally: `npm run build`
- [ ] Test production build: `npm start`
- [ ] Push to git
- [ ] Connect to Vercel/hosting
- [ ] Set environment variables in hosting
- [ ] Deploy
- [ ] Test live URL
- [ ] Set up custom domain (optional)

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `lsof -i :3000` → `kill -9 PID` |
| Dependencies fail | `rm -rf node_modules && npm install` |
| Build errors | `rm -rf .next && npm run build` |
| Styles not showing | Clear cache, restart dev server |
| TypeScript errors | `npm run type-check` to see all |

---

## 📈 Performance Tips

1. **Use production build when testing performance**
   ```bash
   npm run build
   npm start
   ```

2. **Check bundle size**
   ```bash
   npm install -D next-bundle-analyzer
   ```

3. **Monitor with DevTools**
   - Chrome: F12 → Network → Throttle
   - Firefox: Ctrl+Shift+E → Network

---

## 🔐 Security Checklist

- [x] TypeScript strict mode enabled
- [x] No console.logs with secrets
- [x] Environment variables in .env.local
- [x] XSS protection (React default)
- [ ] HTTPS enabled (when deployed)
- [ ] Rate limiting (add if needed)
- [ ] Authentication (implement with Supabase)

---

## 📚 Resources

```
Next.js:      https://nextjs.org/docs
TypeScript:   https://www.typescriptlang.org/docs/
Tailwind:     https://tailwindcss.com/docs
Framer:       https://www.framer.com/motion/
Zustand:      https://github.com/pmndrs/zustand
```

---

## 💡 Tips & Tricks

### Tip 1: Fast Component Creation
```typescript
// Use template
import type { ComponentProps } from 'react'
import { motion } from 'framer-motion'

export function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      Content here
    </motion.div>
  )
}
```

### Tip 2: Add Loading State
```typescript
const [isLoading, setIsLoading] = useState(false)

// Use in JSX
{isLoading && <Loader className="animate-spin" />}
```

### Tip 3: Color Gradient Text
```html
<h1 class="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
  Gradient Text
</h1>
```

---

## 🎓 Learning Path

1. **Day 1:** Understand the layout & components
2. **Day 2:** Explore state management (Zustand)
3. **Day 3:** Customize colors & theme
4. **Day 4:** Add new features
5. **Day 5:** Connect real backend (Supabase)
6. **Day 6:** Deploy to production

---

## 🚀 Next Steps

1. **Explore UI** - Click around, try search
2. **Read Code** - Start with `app/page.tsx`
3. **Customize** - Change colors in tailwind.config.ts
4. **Extend** - Add new features in components/
5. **Deploy** - Use `vercel` CLI or GitHub
6. **Monitor** - Use Vercel Analytics

---

## 📞 Quick Help

- **Stuck?** Check SETUP_GUIDE.md
- **Feature list?** See FEATURE_CHECKLIST.md
- **Want details?** Read IMPLEMENTATION_SUMMARY.md
- **Need code?** Look at specific component files

---

## ✅ You're Ready!

You have everything needed to:
- ✅ Run the app locally
- ✅ Understand the code
- ✅ Customize the design
- ✅ Add features
- ✅ Deploy to production

**Happy building! 🚀**

---

*Last updated: April 13, 2026*
*Version: 1.0.0 Production-Ready*
