'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      
      if (error) throw error
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign up')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600/20 rounded-2xl border border-emerald-500/30 mb-4">
            <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-tactical-100 mb-2">Check your email</h2>
          <p className="text-tactical-400 mb-6">
            We've sent a confirmation link to <span className="text-tactical-200">{email}</span>
          </p>
          <Link
            href="/login"
            className="text-accent-400 hover:text-accent-300 font-medium"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-600/20 rounded-2xl border border-accent-500/30 mb-4">
            <svg className="w-10 h-10 text-accent-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 2.18l7 3.12v5.7c0 4.47-3.07 8.67-7 9.77-3.93-1.1-7-5.3-7-9.77V6.3l7-3.12z"/>
              <path d="M12 6l-4 1.8v3.2c0 2.68 1.84 5.2 4 5.87 2.16-.67 4-3.19 4-5.87V7.8L12 6z" opacity="0.6"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-accent-400">GUARDIAN</span>
            <span className="text-tactical-300 ml-2">Wellness</span>
          </h1>
          <p className="text-tactical-500 text-sm mt-1">Officer Support System</p>
        </div>

        {/* Card */}
        <div className="bg-tactical-900/80 border border-tactical-700 rounded-2xl p-8 backdrop-blur-sm">
          <h2 className="text-xl font-semibold text-tactical-100 mb-6 text-center">
            Create your account
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-tactical-200 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@department.gov"
                required
                className="w-full px-4 py-3 bg-tactical-800 border border-tactical-600 rounded-lg text-tactical-100 placeholder:text-tactical-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-tactical-200 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-4 py-3 bg-tactical-800 border border-tactical-600 rounded-lg text-tactical-100 placeholder:text-tactical-500 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-tactical-200 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-tactical-800 border border-tactical-600 rounded-lg text-tactical-100 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-accent-600 hover:bg-accent-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-tactical-400">
            Already have an account?{' '}
            <Link href="/login" className="text-accent-400 hover:text-accent-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-tactical-600">
          Your information is confidential and secure.
        </p>
      </div>
    </div>
  )
}