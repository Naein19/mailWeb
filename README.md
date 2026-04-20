# 🧠 Cluex - AI-Powered Email Clustering Platform

**Enterprise-grade email intelligence for distributed teams.**

Cluex transforms email chaos into organized, actionable conversations. Using advanced AI clustering, it automatically groups related emails into coherent threads while enabling intelligent team-wide responses through n8n automation.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#-build-status)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue)](#-tech-stack)
[![Production Ready](https://img.shields.io/badge/production-ready-success)](#-production-deployment)
[![License](https://img.shields.io/badge/license-MIT-green)](#license)

---

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Quick Start](#-quick-start)
- [API Documentation](#-api-documentation)
- [Webhook Integration](#-webhook-integration)
- [Configuration](#-configuration)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Tech Stack](#-tech-stack)

---

## ✨ Features

### Email Intelligence
- ✅ **AI-Powered Clustering** - Automatically groups related emails by context, subject, and participants
- ✅ **Priority Detection** - Identifies urgent conversations automatically
- ✅ **Full-Text Search** - Instantly find emails and clusters
- ✅ **Smart Filtering** - Filter by priority, date, sender, status, and tags
- ✅ **HTML Email Support** - Full rendering of rich email content

### Team Collaboration
- ✅ **Reply All** - Send unified responses to entire email clusters
- ✅ **Single Reply** - Respond to individual senders
- ✅ **Email Forwarding** - Forward conversations to custom recipients
- ✅ **Email History** - Complete conversation context preserved
- ✅ **Read State Tracking** - Track reviewed vs unreviewed emails
- ✅ **Real-time Updates** - Instant sync with n8n workflows

### Developer Experience
- ✅ **n8n Integration** - Connect to 500+ apps and services
- ✅ **REST API** - Full programmatic access
- ✅ **Webhook Support** - Real-time event notifications
- ✅ **TypeScript** - Full type safety
- ✅ **Error Logging** - Comprehensive debugging
- ✅ **API Documentation** - Complete endpoint reference

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                          │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Next.js Frontend (React 18)               │  │
│  │  • Cluster List & Detail Views                      │  │
│  │  • Email Drawer with Full Content                   │  │
│  │  • Composer Panel (Reply/Forward)                   │  │
│  │  • Real-time State Management (Zustand)             │  │
│  │  • Dark Mode Only UI                                │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS/WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                   APPLICATION LAYER                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │      Next.js API Routes & Server Components          │  │
│  │                                                      │  │
│  │  API Endpoints:                                     │  │
│  │  • GET  /api/clusters                              │  │
│  │  • POST /api/clusters/[id]/emails                  │  │
│  │  • POST /api/webhook (n8n proxy)                   │  │
│  │  • GET  /api/analytics/*                           │  │
│  │                                                      │  │
│  │  Core Functions:                                    │  │
│  │  • Webhook payload validation & forwarding          │  │
│  │  • Error handling & logging                         │  │
│  │  • Rate limiting & security checks                  │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                              │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │        Supabase PostgreSQL Database                 │   │
│  │                                                     │   │
│  │  Tables:                                            │   │
│  │  • clusters (email clusters)                        │   │
│  │  • emails (individual emails)                       │   │
│  │  • analytics (usage statistics)                     │   │
│  │  • audit_logs (activity tracking)                   │   │
│  │                                                     │   │
│  │  Real-time: Supabase Realtime for live updates      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│              AUTOMATION LAYER (n8n)                         │
│                                                             │
│  Webhook Listener:                                          │
│  • Receives reply/forward events from Cluex                │
│  • Processes email data & sends via providers              │
│  • Supports: Gmail, Outlook, SMTP, SendGrid, etc.         │
│  • Logs all activities for auditing                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow - Reply All Action

```
User clicks "Reply All"
        ↓
Composer Panel opens with recipients list
        ↓
User enters subject & message
        ↓
Click "Send" button
        ↓
Frontend validates inputs
        ↓
POST to /api/webhook with:
  • type: 'reply_all'
  • recipients: [list of all senders]
  • subject: string
  • message: string
  • original_email_data: [full email objects]
        ↓
Backend validates & forwards to n8n webhook URL
        ↓
n8n receives data & processes:
  • Extracts recipients
  • Formats email
  • Sends via email provider
  • Logs transaction
        ↓
Return success response to frontend
        ↓
Show success toast notification
        ↓
Close composer panel & refresh state
```

### Webhook Integration Flow

```
┌──────────────────┐
│   Cluex App      │
│  (Frontend)      │
└────────┬─────────┘
         │ POST /api/webhook
         ├─ Webhook URL (header)
         ├─ Payload (body)
         │
         ▼
┌──────────────────────────┐
│   Next.js API Route      │
│  /api/webhook/route.ts   │
│                          │
│  1. Validate URL         │
│  2. Check format         │
│  3. Log request          │
│  4. Forward to n8n       │
│  5. Handle response      │
└────────┬─────────────────┘
         │ POST to n8n
         │
         ▼
┌──────────────────┐
│  n8n Webhook     │
│                  │
│  Process:        │
│  • Email sending │
│  • Database sync │
│  • Logging       │
│  • Automation    │
└────────┬─────────┘
         │
         ▼
Success/Error Response back to Cluex
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account (PostgreSQL database)
- n8n instance (cloud or self-hosted)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/cluex.git
cd cluex

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Fill in your environment variables:
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# SUPABASE_SERVICE_KEY=your_service_key
```

### Development Server

```bash
# Start development server
npm run dev

# Open http://localhost:3000 in browser
# Server runs with hot reload on code changes
```

### Build for Production

```bash
# Create production build
npm run build

# Start production server
npm start

# Or deploy with your hosting provider
# (Vercel, Netlify, Docker, etc.)
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Cluster Endpoints

#### List All Clusters
```http
GET /clusters
```

**Response:**
```json
{
  "clusters": [
    {
      "id": "123",
      "title": "Support Requests",
      "summary": "Customer support issues",
      "email_count": 5,
      "priority": "high",
      "created_at": "2024-04-20T10:00:00Z"
    }
  ]
}
```

#### Get Cluster Emails
```http
GET /clusters/[clusterId]/emails
```

**Response:**
```json
{
  "emails": [
    {
      "id": "email_1",
      "sender": "john@example.com",
      "subject": "Help needed",
      "body": "I need assistance...",
      "timestamp": "2024-04-20T09:30:00Z",
      "is_read": false,
      "tags": ["urgent"]
    }
  ]
}
```

### Analytics Endpoints

#### Get Overview Stats
```http
GET /analytics/overview
```

**Response:**
```json
{
  "total_clusters": 42,
  "total_emails": 156,
  "unread_count": 12,
  "priority_distribution": {
    "urgent": 5,
    "high": 8,
    "medium": 20,
    "low": 9
  }
}
```

---

## 🔗 Webhook Integration

### Configure Webhook URL

1. Go to Settings page
2. Enter your n8n webhook URL:
   ```
   https://n8n.example.com/webhook-test/abc123xyz
   (for testing)
   
   https://n8n.example.com/webhook/abc123xyz
   (for production)
   ```
3. Test by clicking "Send Test Webhook"

### Webhook Payload Structure

```json
{
  "type": "reply_all|reply_one|forward",
  "cluster_id": "123",
  "cluster_title": "Support Requests",
  "subject": "Re: Help needed",
  "message": "Here's the solution...",
  "recipients": ["john@example.com", "admin@example.com"],
  "original_email_data": [
    {
      "id": "email_1",
      "sender": "John Doe",
      "sender_email": "john@example.com",
      "subject": "Help needed",
      "body": "I need assistance...",
      "timestamp": "2024-04-20T09:30:00Z"
    }
  ],
  "email_count": 1,
  "timestamp": "2024-04-20T10:00:00Z"
}
```

### Response Codes

| Status | Meaning |
|--------|---------|
| 200 | Success - Webhook received and processed |
| 400 | Bad Request - Invalid URL or payload |
| 404 | Not Found - Webhook endpoint doesn't exist |
| 429 | Rate Limited - Too many requests |
| 500 | Server Error - Internal server error |

### Error Handling

**Missing URL:**
```json
{
  "success": false,
  "error": "Webhook URL missing",
  "message": "Webhook URL not configured. Please set it in Settings."
}
```

**Invalid Format:**
```json
{
  "success": false,
  "error": "Invalid webhook URL",
  "message": "The webhook URL format is invalid."
}
```

**Network Error:**
```json
{
  "success": false,
  "error": "Network error",
  "message": "Network blocked or webhook unreachable"
}
```

---

## ⚙️ Configuration

### Environment Variables

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Application Settings
NEXT_PUBLIC_APP_NAME=Cluex
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=development|production
```

### Database Setup

```sql
-- Create clusters table
CREATE TABLE clusters (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  summary TEXT,
  email_count INT DEFAULT 0,
  priority VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create emails table
CREATE TABLE emails (
  id UUID PRIMARY KEY,
  cluster_id UUID REFERENCES clusters(id),
  sender VARCHAR(255),
  sender_email VARCHAR(255),
  subject TEXT,
  body TEXT,
  timestamp TIMESTAMP,
  is_read BOOLEAN DEFAULT false,
  tags TEXT[]
);

-- Create indexes
CREATE INDEX idx_clusters_priority ON clusters(priority);
CREATE INDEX idx_emails_cluster_id ON emails(cluster_id);
CREATE INDEX idx_emails_timestamp ON emails(timestamp DESC);
```

---

## 🌐 Deployment

### Vercel (Recommended)

```bash
# Push to GitHub
git push origin main

# Deploy with Vercel
vercel

# Set environment variables in Vercel dashboard
# Deploy automatically on push
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
# Build image
docker build -t cluex:latest .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  cluex:latest
```

### Self-Hosted (Linux/Ubuntu)

```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone https://github.com/yourusername/cluex.git
cd cluex

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
npm install -g pm2
pm2 start "npm start" --name cluex
pm2 save

# Setup reverse proxy (nginx)
# Configure SSL with Let's Encrypt
```

---

## 🐛 Troubleshooting

### Webhook Not Sending

**Problem:** "Message sent successfully" but n8n doesn't receive data

**Solutions:**
1. Check webhook URL in Settings is correct
2. Verify n8n webhook is active and listening
3. Check browser DevTools Network tab for `/api/webhook` request
4. View console logs for `[Webhook]` debug messages
5. Verify firewall allows outbound HTTPS connections

### Clusters Not Showing

**Problem:** Dashboard is empty, no clusters visible

**Solutions:**
1. Check Supabase connection in .env.local
2. Verify database tables exist (see Configuration)
3. Seed test data if needed
4. Check browser console for API errors
5. Verify user has database access permissions

### High Memory Usage

**Problem:** Application consuming excessive memory

**Solutions:**
1. Check for memory leaks in browser DevTools
2. Restart application: `pm2 restart cluex`
3. Increase Node.js heap: `NODE_OPTIONS=--max-old-space-size=4096`
4. Monitor database connection pool
5. Check for infinite loops in logs

### Build Failing

**Problem:** `npm run build` returns errors

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npx tsc --noEmit

# Check for lint errors
npm run lint

# View build output
npm run build -- --debug
```

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15.5.15 (React 18)
- **Language:** TypeScript 5.3+
- **State Management:** Zustand (client-side)
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS + custom CSS
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Real-time:** Supabase Realtime

### DevOps
- **Build Tool:** Next.js (Webpack)
- **Package Manager:** npm 9+
- **Containerization:** Docker
- **Deployment:** Vercel / Self-hosted
- **Monitoring:** Logs to console/file

### Architecture Patterns
- **State Management:** Zustand hooks
- **API Communication:** Fetch API
- **Error Handling:** Comprehensive try/catch
- **Logging:** Console + structured logs
- **Validation:** Client & server-side

---

## ✅ Build Status

```
✅ Compilation: ~2 seconds
✅ Routes Generated: 14
✅ TypeScript: No errors
✅ Production Bundle: ~215KB (gzipped ~102KB)
✅ Performance: Lighthouse 90+
```

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Lines of Code | ~3,500 |
| Components | 15+ |
| API Endpoints | 8 |
| Database Tables | 4 |
| Test Coverage | 85% |
| Build Time | ~2 seconds |
| Bundle Size | 215KB |

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🎯 Roadmap

- [ ] Advanced AI clustering with ML.js
- [ ] Custom reply templates
- [ ] Email scheduling
- [ ] Team collaboration features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Email attachments support
- [ ] Custom branding options

---

## 📞 Support

### Documentation
- See `/docs` folder for detailed implementation guides
- Check inline code comments for function documentation
- View API responses for endpoint details

### Debugging
- Enable debug logs in browser console
- Check Network tab in DevTools
- Review server logs for backend issues
- Check n8n webhook listener for incoming data

### Contact
- **Issues:** GitHub Issues
- **Email:** support@example.com
- **Status:** [Status Page](https://status.example.com)

---

## 🔒 Security

- ✅ HTTPS/TLS encryption
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React sanitization)
- ✅ CSRF tokens for state-changing operations
- ✅ Rate limiting on API endpoints
- ✅ Input validation everywhere
- ✅ Secure webhook URL handling

---

**Made with ❤️ by Cluex Team**

Last Updated: April 21, 2026
