# Webhook System - Developer Quick Reference

## API Endpoints

### POST /api/webhook
Proxy endpoint for sending webhooks to n8n.

**Request**:
```typescript
POST /api/webhook
Content-Type: application/json
X-Webhook-URL: https://n8n.example.com/webhook-test/abc123

{
  type: 'reply_all' | 'reply_one' | 'forward',
  cluster_id: string,
  cluster_title: string,
  subject: string,
  message: string,
  recipients: string[],
  original_email_data: Array<{
    id: string,
    sender: string,
    sender_email: string,
    subject: string,
    body: string,
    timestamp: string
  }>,
  email_count: number,
  timestamp: string
}
```

**Response (Success)**:
```typescript
{
  success: true,
  message: "Message sent successfully",
  data: { /* n8n response */ }
}
```

**Response (Error)**:
```typescript
{
  success: false,
  error: "Invalid webhook URL",
  message: "The webhook URL format is invalid."
}
```

**Status Codes**:
- `200` - Success
- `400` - Invalid request (missing URL, bad format)
- `404` - n8n endpoint not found
- `429` - Rate limited
- `500` - Server error

---

## Webhook Utility Functions

### detectWebhookMode(url: string)
```typescript
import { detectWebhookMode } from '@/lib/webhook'

const mode = detectWebhookMode('https://n8n.example.com/webhook-test/abc')
// Returns: 'test'

const mode = detectWebhookMode('https://n8n.example.com/webhook/xyz')
// Returns: 'production'
```

### validateWebhookUrl(url: string | null)
```typescript
import { validateWebhookUrl } from '@/lib/webhook'

const result = validateWebhookUrl('https://n8n.example.com/webhook/abc')
if (result.valid) {
  console.log('URL is valid')
} else {
  console.error(result.error)  // "Invalid webhook URL"
}
```

### getWebhookUrl()
```typescript
import { getWebhookUrl } from '@/lib/webhook'

const url = getWebhookUrl()  // Returns from localStorage or null
```

### saveWebhookUrl(url: string)
```typescript
import { saveWebhookUrl } from '@/lib/webhook'

saveWebhookUrl('https://n8n.example.com/webhook-test/abc123')
// Saves to localStorage
```

### sendWebhookReply(payload: WebhookPayload)
```typescript
import { sendWebhookReply } from '@/lib/webhook'

const result = await sendWebhookReply({
  type: 'reply_all',
  cluster_id: '123',
  cluster_title: 'Support Requests',
  subject: 'Re: Help',
  message: 'This is my response...',
  recipients: ['user@example.com', 'admin@example.com'],
  original_email_data: [
    {
      id: '1',
      sender: 'John Doe',
      sender_email: 'john@example.com',
      subject: 'Help me',
      body: 'I need help...',
      timestamp: '2024-04-20T10:00:00Z'
    }
  ],
  email_count: 1,
  timestamp: new Date().toISOString()
})

if (result.success) {
  console.log('Message sent!')
} else {
  console.error(result.message)  // User-friendly error
  console.error(result.error)    // Technical error details
}
```

### extractRecipients(emails: Email[])
```typescript
import { extractRecipients } from '@/lib/webhook'

const emails = [
  { sender_email: 'john@example.com', ... },
  { sender_email: 'jane@example.com', ... },
]

const recipients = extractRecipients(emails)
// Returns: ['john@example.com', 'jane@example.com']
```

---

## Store Integration

### Using Composer State
```typescript
import { useDashboardStore } from '@/lib/store'

export function MyComponent() {
  const {
    isComposerOpen,      // boolean
    composerType,        // 'reply_all' | 'reply_one' | 'forward' | null
    composerRecipient,   // string | null
    setComposerOpen      // function
  } = useDashboardStore()

  const handleOpenComposer = () => {
    setComposerOpen(true, 'reply_all')  // Open in reply_all mode
    // or
    setComposerOpen(true, 'reply_one', 'user@example.com')  // Single reply
    // or
    setComposerOpen(true, 'forward')  // Forward with custom recipient
  }

  return (
    <button onClick={handleOpenComposer}>
      Reply All
    </button>
  )
}
```

---

## Toast Notifications

```typescript
import { showToast } from '@/lib/toast'

// Success
showToast('Message sent successfully! 🎉', 'success')

// Error
showToast('Failed to send webhook', 'error')

// Warning
showToast('Please enter a recipient email', 'warning')

// Info (if supported)
showToast('Processing...', 'info')
```

---

## Common Scenarios

### Scenario 1: Send Reply All
```typescript
const handleReplyAll = () => {
  setComposerOpen(true, 'reply_all')
}
```

When user clicks Send in composer:
```typescript
const recipients = extractRecipients(emails)  // All senders in cluster

const result = await sendWebhookReply({
  type: 'reply_all',
  cluster_id: cluster.id,
  cluster_title: cluster.title,
  subject,
  message,
  recipients,  // All cluster senders
  original_email_data: emails.map(e => ({...})),
  email_count: emails.length,
  timestamp: new Date().toISOString()
})

if (result.success) {
  showToast('Message sent successfully!', 'success')
  setComposerOpen(false)
}
```

### Scenario 2: Send Single Reply
```typescript
const handleReply = (email: Email) => {
  setComposerOpen(true, 'reply_one', email.sender_email)
}
```

When user clicks Send:
```typescript
const result = await sendWebhookReply({
  type: 'reply_one',
  cluster_id: cluster.id,
  cluster_title: cluster.title,
  subject,
  message,
  recipients: [composerRecipient],  // Single recipient
  original_email_data: [selectedEmail],
  email_count: 1,
  timestamp: new Date().toISOString()
})
```

### Scenario 3: Forward Email
```typescript
const handleForward = () => {
  setComposerOpen(true, 'forward')
}
```

User enters recipient and clicks Send:
```typescript
const result = await sendWebhookReply({
  type: 'forward',
  cluster_id: cluster.id,
  cluster_title: cluster.title,
  subject,
  message,
  recipients: [userEnteredEmail],  // Custom recipient
  original_email_data: [selectedEmail],
  email_count: 1,
  timestamp: new Date().toISOString()
})
```

---

## Error Handling Patterns

### Pattern 1: Catch and Toast
```typescript
try {
  const result = await sendWebhookReply(payload)
  if (result.success) {
    showToast(result.message, 'success')
  } else {
    showToast(result.message, 'error')
    console.error(result.error)  // Log technical details
  }
} catch (error) {
  console.error('Unexpected error:', error)
  showToast('An unexpected error occurred', 'error')
}
```

### Pattern 2: With Loading State
```typescript
const [isSending, setIsSending] = useState(false)

const handleSend = async () => {
  try {
    setIsSending(true)
    const result = await sendWebhookReply(payload)
    
    if (result.success) {
      showToast('Sent!', 'success')
      handleClose()
    } else {
      showToast(result.message, 'error')
    }
  } finally {
    setIsSending(false)
  }
}
```

### Pattern 3: Validation Before Send
```typescript
const handleSend = async () => {
  // Validate inputs
  if (!subject.trim()) {
    showToast('Subject is required', 'warning')
    return
  }
  
  if (!message.trim()) {
    showToast('Message cannot be empty', 'warning')
    return
  }

  if (composerType === 'forward' && !forwardRecipient.trim()) {
    showToast('Please enter a recipient email', 'warning')
    return
  }

  // Then send
  const result = await sendWebhookReply(payload)
  // ...
}
```

---

## Debugging

### Enable Detailed Logging
```typescript
// In browser console
localStorage.setItem('debug_webhook', 'true')

// Check for logs:
// [Webhook] Mode: test
// [Webhook] URL: https://n8n.example.com/webhook-test/...
// [Webhook] Payload type: reply_all
// [Webhook API] Forwarding to: ...
// [Webhook API] Success: Message sent to n8n
```

### Check Webhook Configuration
```typescript
// In browser console
console.log(localStorage.getItem('n8n_webhook_url'))

// Should output:
// https://n8n.example.com/webhook-test/abc123def456
```

### Monitor Network Requests
1. Open DevTools (F12)
2. Go to Network tab
3. Send a reply
4. Look for `/api/webhook` request
5. Check Response for success/error details

---

## Type Definitions

```typescript
// WebhookPayload
interface WebhookPayload {
  type?: 'reply_all' | 'reply_one' | 'forward'
  cluster_id: string
  cluster_title: string
  subject: string
  message?: string
  reply_body?: string
  recipients: string[]
  original_email_data: Array<{
    id: string
    sender: string
    sender_email: string
    subject: string
    body: string
    timestamp: string
  }>
  email_count: number
  timestamp: string
}

// WebhookResponse
interface WebhookResponse {
  success: boolean
  message: string
  error?: string
}

// Webhook Mode
type WebhookMode = 'test' | 'production'
```

---

## Files to Modify When Adding Features

| File | Purpose |
|------|---------|
| `lib/webhook.ts` | Core webhook utilities |
| `app/api/webhook/route.ts` | API proxy endpoint |
| `components/composer-panel.tsx` | UI for composing replies |
| `lib/store.ts` | State management (composer state) |
| `lib/toast.ts` | Toast notifications |
| `components/cluster-detail.tsx` | Reply All button |
| `components/email-drawer.tsx` | Reply/Forward buttons |

---

## Performance Tips

1. **Avoid repeated webhook calls** - Use loading state to disable button during send
2. **Validate early** - Check inputs before API call
3. **Cache webhook URL** - Use localStorage to store URL
4. **Batch operations** - Don't send multiple webhooks simultaneously
5. **Log strategically** - Only log in development, be quiet in production

---

## Security Considerations

1. ✅ **No direct webhook URLs in frontend** - Passed via header to API route
2. ✅ **Always validate URLs** - Catch malformed URLs early
3. ✅ **Use API proxy** - Backend controls n8n communication
4. ✅ **Sanitize errors** - User-friendly messages don't expose details
5. ✅ **HTTPS only** - Webhook URLs should use HTTPS
6. ✅ **Rate limiting** - API proxy can add rate limiting if needed

---

## Troubleshooting Checklist

- [ ] Webhook URL configured in Settings
- [ ] n8n webhook created and running
- [ ] "Listen for test event" clicked (for test mode)
- [ ] DevTools console shows [Webhook] logs
- [ ] Network tab shows `/api/webhook` request with 200 status
- [ ] n8n webhook received the data
- [ ] Toast notification shows success or error
- [ ] Browser console shows no errors

---

## Related Documentation

- `WEBHOOK_IMPLEMENTATION_GUIDE.md` - Complete implementation guide with testing
- `CRITICAL_FIXES_BEFORE_AFTER.md` - Before/after code comparisons
- GitHub Issue: Link to issue that led to these fixes

---

**Questions? Check the console logs first!** 🔍
