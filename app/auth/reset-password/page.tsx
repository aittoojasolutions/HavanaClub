'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const inputClass = 'w-full bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none focus:ring-1 focus:ring-[#c8932a]/30 transition-all text-base'

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Passwords do not match'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  return (
    <div className="pt-16 min-h-screen flex items-center justify-center px-4 bg-[#0a0805]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(ellipse at 50% 40%, rgba(200,147,42,0.06) 0%, transparent 60%)' }} />
      <div className="relative w-full max-w-sm">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block text-2xl font-bold text-[#c8932a] tracking-wider mb-6">
              HABANA CLUB
            </Link>
            <h1 className="text-2xl font-bold mb-1">Set new password</h1>
            <p className="text-[#9a8a72] text-sm">Choose a new password for your account.</p>
          </div>

          {done ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✓</div>
              <h2 className="text-xl font-bold mb-2">Password updated</h2>
              <p className="text-[#9a8a72] text-sm">Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              {error && (
                <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl text-sm text-center">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">New password</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" autoFocus className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#9a8a72] mb-1.5">Confirm password</label>
                <input type="password" required value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat password" className={inputClass} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all disabled:opacity-50 shadow-lg shadow-[#c8932a]/20">
                {loading ? 'Saving…' : 'Set New Password →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
