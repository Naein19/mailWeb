'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, Lock, User } from 'lucide-react'
import { signUp } from '@/lib/auth'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await signUp(email, password, name)
      router.push('/login')
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[400px]"
      >
        <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-10 text-center space-y-3">
            <div className="flex flex-col items-center gap-4">
              <img src="/logo.svg" alt="Cluex Logo" className="w-12 h-12" />
              <h1 className="text-2xl font-bold text-white tracking-tight">Cluex</h1>
            </div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Join the ecosystem</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignUp} className="space-y-6">
            {error && (
              <div className="p-3 rounded bg-red-500/5 border border-red-500/10 text-red-500 text-[13px] font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded bg-[#0B0F14] border border-[#1F2937] text-white text-[13px] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded bg-[#0B0F14] border border-[#1F2937] text-white text-[13px] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded bg-[#0B0F14] border border-[#1F2937] text-white text-[13px] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-600" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded bg-[#0B0F14] border border-[#1F2937] text-white text-[13px] focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <button
              disabled={isLoading}
              className="btn-primary w-full h-11"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>

            <p className="text-center text-[13px] text-slate-500">
              Already have an account?{' '}
              <a href="/login" className="text-blue-500 hover:underline font-semibold">Sign in here</a>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
