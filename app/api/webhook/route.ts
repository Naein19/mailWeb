import { NextRequest, NextResponse } from 'next/server'

/**
 * API Proxy route for n8n webhook
 * 
 * This endpoint proxies webhook requests from the frontend to n8n,
 * avoiding CORS issues that occur when calling n8n directly from the browser.
 * 
 * Frontend flow:
 * 1. Frontend sends POST to /api/webhook with webhook data
 * 2. Backend receives request and validates
 * 3. Backend forwards to n8n webhook URL
 * 4. Backend returns response to frontend
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract webhook URL from request headers, body, or environment variable
    const webhookUrl = request.headers.get('x-webhook-url')
      || body.webhookUrl
      || process.env.NEXT_PUBLIC_N8N_REPLY_WEBHOOK
      || null

    // Validate webhook URL exists
    if (!webhookUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Webhook URL missing',
          message: 'Webhook URL not provided. Please configure it in Settings.',
        },
        { status: 400 }
      )
    }

    // Validate webhook URL format
    try {
      new URL(webhookUrl)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid webhook URL',
          message: 'The webhook URL format is invalid.',
        },
        { status: 400 }
      )
    }

    console.log(`[Webhook API] Forwarding to: ${webhookUrl}`)
    console.log(`[Webhook API] Payload type: ${body.type || 'unknown'}`)

    // Remove webhookUrl from payload before sending to n8n
    const { webhookUrl: _, ...payload } = body

    // Forward request to n8n
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    // Handle response
    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[Webhook API] n8n error: ${response.status} - ${errorText}`)

      // Determine specific error message based on response status
      let errorMessage = 'Failed to send webhook'
      if (response.status === 404) {
        errorMessage = 'Webhook endpoint not found. Check your n8n webhook URL.'
      } else if (response.status === 429) {
        errorMessage = 'Too many requests. Please try again later.'
      } else if (response.status >= 500) {
        errorMessage = 'n8n server error. Please check your n8n instance.'
      }

      return NextResponse.json(
        {
          success: false,
          error: `Webhook failed: ${response.status}`,
          message: errorMessage,
        },
        { status: response.status }
      )
    }

    // Get response data
    let responseData
    try {
      responseData = await response.json()
    } catch {
      responseData = {}
    }

    console.log(`[Webhook API] Success: Message sent to n8n`)

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        data: responseData,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error(`[Webhook API] Error:`, error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred'

    return NextResponse.json(
      {
        success: false,
        error: 'Network error',
        message: `Failed to send webhook: ${errorMessage}. Check that n8n is running and accessible.`,
      },
      { status: 500 }
    )
  }
}
