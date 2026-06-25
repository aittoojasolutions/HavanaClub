'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeacherLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/teacher/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
    router.push('/teacher')
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0a0805]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(200,147,42,0.05) 0%, transparent 60%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-xl font-bold text-[#c8932a] tracking-wider mb-5">
              HAVANA CLUB
            </Link>
            <div className="w-12 h-12 bg-[#c8932a]/10 border border-[#c8932a]/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🎤</span>
            </div>
            <h1 className="text-xl font-bold mb-1">Teacher Portal</h1>
            <p className="text-[#9a8a72] text-sm">Sign in to see your schedule and salary</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm text-[#9a8a72] mb-1.5">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoFocus
                placeholder="you@example.com"
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none focus:ring-1 focus:ring-[#c8932a]/20 transition-all" />
            </div>
            <div>
              <label className="block text-sm text-[#9a8a72] mb-1.5">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none focus:ring-1 focus:ring-[#c8932a]/20 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold hover:bg-[#a87820] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
