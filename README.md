# ✦ Email Clustering Dashboard

> A cinematic, high-clarity email intelligence workspace built with Next.js, Supabase, and motion-rich UI patterns.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Connected-3ECF8E?logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)

## Overview

This project turns raw email data into an organized, cluster-driven dashboard with:

- **Real cluster browsing** powered by Supabase
- **Cluster-specific email loading** with no cross-cluster bleed
- **Modern glass UI** with smooth Framer Motion transitions
- **Analytics and detail views** designed for fast triage
- **Mock-data blending** for local development without breaking the live flow

The UI, animations, and effects stay intact. Backend behavior is unchanged except for safe data-access fixes needed to make cluster data display correctly.

## Live Experience

- **Clusters panel** for browsing grouped email threads
- **Cluster detail view** for reading the selected email set
- **Email drawer** for deep inspection
- **Analytics screens** for summary-level visibility
- **Settings page** for local preferences and toggles

## Tech Stack

- **Frontend:** Next.js 15, React 18, TypeScript, Tailwind CSS
- **Motion:** Framer Motion
- **State:** Zustand
- **Icons:** Lucide React
- **Backend/Data:** Supabase

## Project Structure

```text
app/          Next.js routes, API handlers, and pages
components/   Dashboard UI components
lib/          API helpers, store, utilities, and types
docs/         Archived markdown notes, fixes, and setup guides
```

## Getting Started

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Run the production build
npm run lint        # Lint the codebase
npm run type-check  # TypeScript validation
```

## Environment Variables

Create or update `.env.local` with your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_ENABLE_MOCK_DATA=true
```

## Data Model

The app uses only these tables:

- `emails`
- `clusters`
- `email_clusters`

It does **not** rely on `users` or `profiles`.

## What Was Kept Safe

- No UI/UX redesigns
- No animation or effect changes
- No backend behavior changes beyond data selection and filtering logic
- No dependency on user/profile tables

## Documentation

All supporting markdown files were moved to `docs/` so the project root stays clean.

Suggested entry points:

- `docs/SUPABASE_TESTING_GUIDE.md`
- `docs/SCHEMA_VALIDATION_REPORT.md`
- `docs/SYSTEM_STATUS.md`
- `docs/QUICK_REFERENCE.md`

## Deployment Notes

This app is ready for deployment after:

1. Setting production Supabase env vars
2. Running `npm run build`
3. Starting with `npm run start`

If deploying to Vercel, add the same environment variables in the project settings.

## Verification

Useful checks:

```bash
bash verify-setup.sh
npx tsx validate-schema.ts
npm run build
```

## Snapshot

- **Status:** Stable and deployable
- **Focus:** Email clustering dashboard
- **Docs:** Cleaned into `docs/`
- **Theme:** Kept local and untouched in behavior

---

Built for teams that need a fast, clean, and confident way to inspect clustered email data.
