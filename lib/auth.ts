import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export type AuthUser = {
  id: string
  email: string
  user_metadata?: { name?: string }
}

export async function signUp(email: string, password: string, name?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name: name || email.split('@')[0] } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  clearAllAccounts()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ? {
      id: session.user.id,
      email: session.user.email!,
      user_metadata: session.user.user_metadata,
    } : null)
  })
  return () => subscription?.unsubscribe()
}

export async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
        'openid', 'email', 'profile',
      ].join(' '),
      queryParams: { access_type: 'offline', prompt: 'consent' },
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })
  if (error) throw error
}

export async function signInWithGoogleAddAccount() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
        'openid', 'email', 'profile',
      ].join(' '),
      queryParams: { access_type: 'offline', prompt: 'select_account consent' },
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
    },
  })
  if (error) throw error
}

export async function saveTokensToN8n(
  userId: string,
  email: string,
  accessToken: string,
  refreshToken: string
): Promise<void> {
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_TOKEN_WEBHOOK
  if (!webhookUrl) {
    console.warn('[Auth] NEXT_PUBLIC_N8N_TOKEN_WEBHOOK not set — skipping')
    return
  }
  
  const payload = {
    user_id: userId,
    email,
    access_token: accessToken,
    refresh_token: refreshToken,
    token_expiry: new Date(Date.now() + 3600 * 1000).toISOString(),
  }
  
  console.log('[Auth] Sending tokens to n8n:')
  console.log('[Auth] - Email:', email)
  console.log('[Auth] - User ID:', userId)
  console.log('[Auth] - Access token first 20 chars:', accessToken?.substring(0, 20) + '...')
  console.log('[Auth] - Refresh token present:', !!refreshToken)
  console.log('[Auth] - Webhook URL:', webhookUrl)
  console.log('[Auth] - Full payload:', JSON.stringify(payload, null, 2))
  
  try {
    const res = await fetch('/api/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-webhook-url': webhookUrl,
      },
      body: JSON.stringify(payload),
    })
    
    const responseText = await res.text()
    console.log('[Auth] Response status:', res.status)
    console.log('[Auth] Response body:', responseText)
    
    if (!res.ok) {
      console.error('[Auth] n8n token webhook error:', res.status, responseText)
    } else {
      console.log('[Auth] ✅ Tokens saved to n8n for:', email)
    }
  } catch (err) {
    console.error('[Auth] Failed to POST to n8n:', err)
  }
}

export function getConnectedAccounts(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem('connected_accounts') || '[]') }
  catch { return [] }
}

export function addConnectedAccount(email: string): void {
  if (typeof window === 'undefined') return
  const accounts = getConnectedAccounts()
  if (!accounts.includes(email)) {
    accounts.push(email)
    localStorage.setItem('connected_accounts', JSON.stringify(accounts))
  }
}

export function getActiveAccount(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('active_account')
}

export function setActiveAccountStorage(email: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('active_account', email)
}

export function clearAllAccounts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('connected_accounts')
  localStorage.removeItem('active_account')
}
