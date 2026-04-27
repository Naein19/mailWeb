'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { supabase, saveTokensToN8n, addConnectedAccount, setActiveAccountStorage } from '@/lib/auth'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'saving' | 'done' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let cancelled = false

    const handleCallback = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300))
        const { data: { session }, error } = await supabase.auth.getSession()

        if (cancelled) return

        if (error || !session) {
          setStatus('error')
          setErrorMsg(error?.message || 'No session found after Google login.')
          console.error('[Callback] Session error:', error)
          setTimeout(() => router.replace('/login?error=no_session'), 3000)
          return
        }

        const { user, provider_token, provider_refresh_token } = session

        // Log token extraction for debugging
        console.log('[Callback] User email:', user?.email)
        console.log('[Callback] Provider token present:', !!provider_token)
        console.log('[Callback] Provider refresh token present:', !!provider_refresh_token)
        console.log('[Callback] Session keys:', Object.keys(session))

        if (!user?.email) {
          setStatus('error')
          setErrorMsg('Could not read user email from session.')
          console.error('[Callback] Missing user email')
          setTimeout(() => router.replace('/login?error=no_email'), 3000)
          return
        }

        setStatus('saving')

        addConnectedAccount(user.email)
        setActiveAccountStorage(user.email)

        if (provider_token && provider_refresh_token) {
          console.log('[Callback] Calling saveTokensToN8n with real tokens...')
          await saveTokensToN8n(user.id, user.email, provider_token, provider_refresh_token)
        } else {
          console.warn('[Callback] Missing tokens:', {
            provider_token: !!provider_token,
            provider_refresh_token: !!provider_refresh_token,
          })
          console.warn('[Callback] If n8n has no token for this account, revoke access and sign in again.')
        }

        if (cancelled) return
        setStatus('done')
        router.replace('/')
      } catch (err: any) {
        if (cancelled) return
        console.error('[Callback] Error:', err)
        setStatus('error')
        setErrorMsg(err.message || 'Something went wrong.')
        setTimeout(() => router.replace('/login?error=callback_error'), 3000)
      }
    }

    handleCallback()
    return () => { cancelled = true }
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-10 border border-white/10 text-center max-w-sm w-full"
      >
        {status === 'error' ? (
          <>
            <div className="text-5xl mb-5">❌</div>
            <h2 className="text-lg font-semibold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-400">{errorMsg}</p>
            <p className="text-xs text-gray-500 mt-3">Redirecting to login...</p>
          </>
        ) : (
          <>
            <div className="relative w-14 h-14 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
              <div className="absolute inset-0 rounded-full border-2 border-t-blue-500 animate-spin" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <span className="text-xl">{status === 'done' ? '✓' : status === 'saving' ? '📧' : '🔑'}</span>
              </div>
            </div>
            <h2 className="text-lg font-semibold mb-2">
              {status === 'done' ? 'All set!' : status === 'saving' ? 'Connecting Gmail...' : 'Signing you in...'}
            </h2>
            <p className="text-sm text-gray-400">
              {status === 'saving'
                ? 'Saving credentials so we can start clustering your emails.'
                : status === 'done'
                  ? 'Redirecting to your dashboard...'
                  : 'Verifying your Google account...'}
            </p>
            {status === 'saving' && (
              <div className="mt-4 flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-blue-400"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  )
}
