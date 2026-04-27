'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, LogIn, ChevronDown } from 'lucide-react'
import { signIn, signInWithGoogle } from '@/lib/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true)
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="glass rounded-2xl p-8 border border-white/10 shadow-2xl relative">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-5 shadow-lg shadow-blue-500/25"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Cluex
            </h1>
            <p className="text-sm text-gray-400 mt-2">AI-powered Gmail cluster dashboard</p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button
            onClick={handleGoogleLogin}
            disabled={googleLoading || isLoading}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl mb-3"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting to Google...' : 'Continue with Google Gmail'}
          </motion.button>

          <p className="text-center text-xs text-gray-500 mb-5">
            Grants Gmail read/send access so Cluex can cluster your emails
          </p>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <button
              onClick={() => setShowEmailForm((value) => !value)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              Sign in with email
              <motion.div animate={{ rotate: showEmailForm ? 180 : 0 }}>
                <ChevronDown className="w-3 h-3" />
              </motion.div>
            </button>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <AnimatePresence>
            {showEmailForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleEmailLogin}
                className="space-y-3 overflow-hidden"
              >
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors text-sm"
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-colors text-sm"
                    />
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading || googleLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium py-2.5 rounded-lg hover:shadow-lg hover:shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <LogIn className="w-4 h-4" />
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
                <p className="text-center text-xs text-gray-500">
                  Don't have an account?{' '}
                  <a href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
                    Sign up
                  </a>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-3 gap-3">
            {[
              { icon: '🤖', label: 'AI Clustering' },
              { icon: '📊', label: 'Analytics' },
              { icon: '⚡', label: 'Real-time' },
            ].map((feature) => (
              <div key={feature.label} className="text-center">
                <div className="text-xl mb-1">{feature.icon}</div>
                <p className="text-xs text-gray-500">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
