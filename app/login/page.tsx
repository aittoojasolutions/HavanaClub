'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

type AuthTab = 'link' | 'password'
type PasswordMode = 'signin' | 'signup' | 'reset'

function LoginForm() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'
  const authError = searchParams.get('error')
  const router = useRouter()

  const [tab, setTab] = useState<AuthTab>('link')
  const [passwordMode, setPasswordMode] = useState<PasswordMode>('signin')

  // Magic link state
  const [linkEmail, setLinkEmail] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [linkSent, setLinkSent] = useState(false)

  // Password state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(authError === 'auth_failed' ? 'Login link expired. Please try again.' : '')
  const [successMsg, setSuccessMsg] = useState('')

  const inputClass = 'w-full bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none focus:ring-1 focus:ring-[#c8932a]/30 transition-all text-base'

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('remember_me', rememberMe ? '30d' : 'session')
    }
    const { error } = await supabase.auth.signInWithOtp({
      email: linkEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
        shouldCreateUser: true,
      },
    })
    if (error) { setError(error.message); setLoading(false); return }
    setLinkSent(true)
    setLoading(false)
  }

  async function signInWithPassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push(next)
  }

  async function signUpWithPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${lastName}`.trim(),
          first_name: firstName,
          last_name: lastName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setPasswordMode('signin')
    setSuccessMsg('Account created! Check your email to confirm, then sign in.')
  }

  async function sendResetEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setResetSent(true)
  }

  return (
    <>
      <div className="text-center mb-8">
        <Link href="/" className="inline-block text-2xl font-bold text-[#c8932a] tracking-wider mb-6">
          HABANA CLUB
        </Link>
        <h1 className="text-2xl font-bold mb-1">
          {tab === 'password' && passwordMode === 'signup' ? 'Create Account'
            : tab === 'password' && passwordMode === 'reset' ? 'Reset Password'
            : 'Welcome back'}
        </h1>
        <p className="text-[#9a8a72] text-sm">
          {tab === 'link' ? "Enter your email and we'll send a login link — no password needed."
            : passwordMode === 'signup' ? 'Fill in your details to create an account.'
            : passwordMode === 'reset' ? 'Enter your email to receive a reset link.'
            : 'Sign in with your email and password.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#0a0805] border border-[#2a1f10] rounded-xl p-1 mb-6">
        <button onClick={() => { setTab('link'); setError(''); setSuccessMsg('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'link' ? 'bg-[#c8932a] text-[#0a0805]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'}`}>
          Magic Link
        </button>
        <button onClick={() => { setTab('password'); setError(''); setSuccessMsg('') }}
          className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === 'password' ? 'bg-[#c8932a] text-[#0a0805]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'}`}>
          Password
        </button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-3 rounded-xl mb-5 text-sm text-center">
          {successMsg}
        </div>
      )}

      {/* Magic link tab */}
      {tab === 'link' && (
        linkSent ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#c8932a]/10 border border-[#c8932a]/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-2xl">📬</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Check your email</h2>
            <p className="text-[#9a8a72] text-sm mb-1">We sent a login link to</p>
            <p className="font-semibold text-[#c8932a] mb-5">{linkEmail}</p>
            <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4 text-sm text-[#9a8a72] text-left mb-6">
              <p className="mb-1">✓ Click the link in the email to sign in</p>
              <p className="mb-1">✓ Link expires in 1 hour</p>
              <p>✓ Check your spam folder if you don&apos;t see it</p>
            </div>
            <button onClick={() => { setLinkSent(false); setLinkEmail('') }}
              className="text-sm text-[#9a8a72] hover:text-[#c8932a] transition-colors underline underline-offset-2">
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={sendMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Email address</label>
              <input type="email" required value={linkEmail} onChange={e => setLinkEmail(e.target.value)}
                placeholder="you@example.com" autoFocus className={inputClass} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative flex-shrink-0">
                <input type="checkbox" className="sr-only" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${rememberMe ? 'bg-[#c8932a]' : 'bg-[#2a1f10]'}`} />
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${rememberMe ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-sm text-[#f5f0e8]">Remember me
                <span className="text-xs text-[#9a8a72] ml-2">{rememberMe ? '30 days' : 'Session only'}</span>
              </span>
            </label>
            <button type="submit" disabled={loading}
              className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
              {loading ? 'Sending…' : 'Send Login Link →'}
            </button>
          </form>
        )
      )}

      {/* Password tab */}
      {tab === 'password' && (
        <>
          {passwordMode === 'signin' && (
            <form onSubmit={signInWithPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoFocus className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
              <div className="flex justify-between text-xs text-[#9a8a72] pt-1">
                <button type="button" onClick={() => { setPasswordMode('reset'); setError(''); setSuccessMsg('') }}
                  className="hover:text-[#c8932a] transition-colors">Forgot password?</button>
                <button type="button" onClick={() => { setPasswordMode('signup'); setError(''); setSuccessMsg('') }}
                  className="hover:text-[#c8932a] transition-colors">Create account</button>
              </div>
            </form>
          )}

          {passwordMode === 'signup' && (
            <form onSubmit={signUpWithPassword} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">First name</label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)}
                    placeholder="First" autoFocus className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Last name</label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)}
                    placeholder="Last" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Email</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Confirm password</label>
                <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password" className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>
              <button type="button" onClick={() => { setPasswordMode('signin'); setError(''); setSuccessMsg('') }}
                className="w-full text-xs text-[#9a8a72] hover:text-[#c8932a] transition-colors pt-1">
                Already have an account? Sign in
              </button>
            </form>
          )}

          {passwordMode === 'reset' && (
            resetSent ? (
              <div className="text-center">
                <div className="w-16 h-16 bg-[#c8932a]/10 border border-[#c8932a]/30 rounded-full flex items-center justify-center mx-auto mb-5">
                  <span className="text-2xl">📬</span>
                </div>
                <h2 className="text-xl font-bold mb-2">Reset link sent</h2>
                <p className="text-[#9a8a72] text-sm mb-5">Check your email for a password reset link.</p>
                <button onClick={() => { setPasswordMode('signin'); setResetSent(false) }}
                  className="text-sm text-[#c8932a] hover:underline">Back to sign in</button>
              </div>
            ) : (
              <form onSubmit={sendResetEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" autoFocus className={inputClass} />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
                  {loading ? 'Sending…' : 'Send Reset Link →'}
                </button>
                <button type="button" onClick={() => { setPasswordMode('signin'); setError('') }}
                  className="w-full text-xs text-[#9a8a72] hover:text-[#c8932a] transition-colors pt-1">
                  ← Back to sign in
                </button>
              </form>
            )
          )}
        </>
      )}

      <div className="mt-6 pt-6 border-t border-[#2a1f10] text-center space-y-2">
        <p className="text-xs text-[#9a8a72]">
          New to Habana Club?{' '}
          <Link href="/first-timers" className="text-[#c8932a] hover:underline font-medium">
            Try a trial class first
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
