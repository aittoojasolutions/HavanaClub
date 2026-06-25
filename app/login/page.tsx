'use client'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const authError = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authError === 'auth_failed' ? 'Login link expired. Please try again.' : '')

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()

    // Store remember-me preference for the callback to use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('remember_me', rememberMe ? '30d' : 'session')
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 bg-[#c8932a]/10 border border-[#c8932a]/30 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">📬</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Check your email</h2>
        <p className="text-[#9a8a72] text-sm mb-1">We sent a login link to</p>
        <p className="font-semibold text-[#c8932a] mb-5">{email}</p>
        <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4 text-sm text-[#9a8a72] text-left mb-6">
          <p className="mb-1">✓ Click the link in the email to sign in</p>
          <p className="mb-1">✓ Link expires in 1 hour</p>
          <p>✓ Check your spam folder if you don&apos;t see it</p>
        </div>
        <button onClick={() => { setSent(false); setEmail('') }}
          className="text-sm text-[#9a8a72] hover:text-[#c8932a] transition-colors underline underline-offset-2">
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-bold text-[#c8932a] tracking-wider mb-6">
          HAVANA CLUB
        </Link>
        <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
        <p className="text-[#9a8a72] text-sm">Enter your email and we&apos;ll send you a login link — no password needed.</p>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={sendMagicLink} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Email address</label>
          <input
            type="email" required value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com" autoFocus
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none focus:ring-1 focus:ring-[#c8932a]/30 transition-all text-base"
          />
        </div>

        {/* Remember me */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0">
            <input type="checkbox" className="sr-only" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
            <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${rememberMe ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
          <div>
            <span className="text-sm font-medium text-[#f5f0e8]">Remember me</span>
            <span className="text-xs text-[#9a8a72] ml-2">
              {rememberMe ? 'Stay signed in for 30 days' : 'Sign out when browser closes'}
            </span>
          </div>
        </label>

        <button type="submit" disabled={loading}
          className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Sending…
            </span>
          ) : 'Send Login Link →'}
        </button>
      </form>

      <div className="mt-6 pt-6 border-t border-[#2a1f10] text-center space-y-2">
        <p className="text-xs text-[#9a8a72]">
          New to Havana Club?{' '}
          <Link href="/first-timers" className="text-[#c8932a] hover:underline font-medium">
            Try a free trial class first
          </Link>
        </p>
        <p className="text-xs text-[#9a8a72]">
          Just browsing?{' '}
          <Link href="/classes" className="text-[#c8932a] hover:underline font-medium">
            View the schedule
          </Link>
        </p>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0a0805]">
      {/* Glow effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(200,147,42,0.06) 0%, transparent 60%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 shadow-2xl">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
