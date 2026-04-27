'use client'

import type { Email } from './types'

export interface WebhookPayload {
  type?: 'reply_all' | 'reply_one' | 'forward'
  cluster_id: string
  cluster_title: string
  account_id: string
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
  webhookUrl?: string
}

export interface WebhookResponse {
  success: boolean
  message: string
  error?: string
}

/**
 * Detect webhook mode (test vs production)
 * @param url - The webhook URL
 * @returns 'test' or 'production'
 */
export function detectWebhookMode(url: string): 'test' | 'production' {
  return url.includes('/webhook-test/') ? 'test' : 'production'
}

/**
 * Get webhook URL from localStorage
 * Client-side only execution
 */
export function getWebhookUrl(): string | null {
  if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_N8N_REPLY_WEBHOOK || null
  return localStorage.getItem('n8n_webhook_url')
    || process.env.NEXT_PUBLIC_N8N_REPLY_WEBHOOK
    || null
}

/**
 * Save webhook URL to localStorage
 * Client-side only execution
 */
export function saveWebhookUrl(url: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('n8n_webhook_url', url)
}

/**
 * Validate webhook URL format
 */
export function validateWebhookUrl(url: string | null): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: false, error: 'Webhook URL missing' }
  }

  try {
    new URL(url)
    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid webhook URL' }
  }
}

/**
 * Send reply via webhook with smart handling
 * 
 * Flow:
 * 1. Validate webhook URL
 * 2. Detect if test or production mode
 * 3. If test mode -> warn user
 * 4. Send to /api/webhook proxy (not directly to n8n)
 * 5. Handle response and errors
 * 
 * Client-side only execution
 */
export async function sendWebhookReply(
  payload: WebhookPayload,
  webhookUrl?: string
): Promise<WebhookResponse> {
  // Ensure client-side only execution
  if (typeof window === 'undefined') {
    return {
      success: false,
      message: 'Webhook calls must be made from the client (browser)',
      error: 'SSR execution not allowed',
    }
  }

  try {
    const url = webhookUrl || getWebhookUrl()

    // Validate URL
    const validation = validateWebhookUrl(url)
    if (!validation.valid) {
      return {
        success: false,
        message: validation.error || 'Webhook URL missing. Please set it in Settings.',
        error: validation.error,
      }
    }

    // Detect webhook mode
    const mode = detectWebhookMode(url!)
    console.log(`[Webhook] Mode: ${mode}`)
    console.log(`[Webhook] URL: ${url}`)
    console.log(`[Webhook] Payload type: ${payload.type || 'unknown'}`)

    // Warn user if in test mode
    if (mode === 'test') {
      const testWarning = `Test Mode Active: Make sure to click "Listen for test event" in your n8n webhook node before sending.`
      console.warn(`[Webhook] ${testWarning}`)
    }

    // Forward to API proxy instead of calling n8n directly
    // This avoids CORS issues
    const response = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-url': url!,
      },
      body: JSON.stringify(payload),
    })

    const data = (await response.json()) as WebhookResponse & { error?: string }

    if (!response.ok) {
      console.error(`[Webhook] Error (${response.status}):`, data.message)
      return {
        success: false,
        message: data.message || 'Failed to send webhook',
        error: data.error,
      }
    }

    console.log(`[Webhook] Success: ${data.message}`)
    return {
      success: true,
      message: data.message || 'Reply sent successfully!',
    }
  } catch (error) {
    console.error('[Webhook] Network error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    let userMessage = 'Network blocked or webhook unreachable'
    if (errorMessage.includes('Failed to fetch')) {
      userMessage = 'Network error. Check that n8n is running and accessible.'
    } else if (errorMessage.includes('CORS')) {
      userMessage = 'CORS error. The webhook endpoint may not allow requests.'
    }

    return {
      success: false,
      message: userMessage,
      error: errorMessage,
    }
  }
}

/**
 * Extract unique email addresses from emails
 */
export function extractRecipients(emails: Email[]): string[] {
  const recipients = new Set<string>()
  emails.forEach((email) => {
    if (email.sender_email) {
      recipients.add(email.sender_email)
    }
  })
  return Array.from(recipients)
}
