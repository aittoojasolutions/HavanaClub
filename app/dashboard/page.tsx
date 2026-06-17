'use client'
import { useState } from 'react'
import { formatTime, addMinutes } from '@/lib/utils'

interface Booking {
  id: string
  customer_name: string
  role: string
  booking_type: string
  created_at: string
  class_instances: {
    date: string
    classes: {
      title: string
      style: string
      start_time: string
      duration_minutes: number
      location: string
    }
  }
}

interface Customer {
  subscription_tier: number | null
  pack_credits_remaining: number
}

export default function DashboardPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function lookup() {
    if (!email.trim()) return
    setLoading(true)
    setError('')
    const [bRes, cRes] = await Promise.all([
      fetch(`/api/bookings?email=${encodeURIComponent(email)}`),
      fetch(`/api/customer?email=${encodeURIComponent(email)}`),
    ])
    const bData = await bRes.json()
    const cData = await cRes.json()
    if (!bRes.ok) { setError(bData.error || 'Error'); setLoading(false); return }
    setBookings(bData.bookings || [])
    setCustomer(cData.customer || null)
    setSubmitted(true)
    setLoading(false)
  }

  async function manageSubscription() {
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (!submitted) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-2">My Bookings</h1>
          <p className="text-[#9a8a72] text-center mb-8">Enter your email to see your bookings and credits.</p>
          <div className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              onKeyDown={e => e.key === 'Enter' && lookup()}
              className="w-full bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
            {error && <div className="text-red-400 text-sm">{error}</div>}
            <button onClick={lookup} disabled={loading}
              className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
              {loading ? 'Loading…' : 'View My Bookings'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <button onClick={() => setSubmitted(false)} className="text-[#9a8a72] text-sm hover:text-[#f5f0e8]">
          Switch account
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
          <div className="text-[#9a8a72] text-sm mb-1">Class Credits</div>
          <div className="text-3xl font-bold text-[#c8932a]">{customer?.pack_credits_remaining ?? 0}</div>
          <div className="text-[#9a8a72] text-xs mt-1">remaining</div>
        </div>
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
          <div className="text-[#9a8a72] text-sm mb-1">Membership</div>
          <div className="text-2xl font-bold">
            {customer?.subscription_tier ? `${customer.subscription_tier}×/week` : 'None'}
          </div>
          {customer?.subscription_tier && (
            <button onClick={manageSubscription} className="text-[#c8932a] text-xs mt-1 hover:underline">
              Manage →
            </button>
          )}
        </div>
      </div>

      {/* Upcoming bookings */}
      <h2 className="text-xl font-bold mb-4">Upcoming Classes</h2>
      {bookings.length === 0 ? (
        <div className="text-[#9a8a72] text-center py-12">
          No upcoming bookings.{' '}
          <a href="/classes" className="text-[#c8932a] hover:underline">Browse schedule</a>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => {
            const cls = b.class_instances?.classes
            if (!cls) return null
            const endTime = addMinutes(cls.start_time, cls.duration_minutes)
            return (
              <div key={b.id} className="bg-[#141008] border border-[#2a1f10] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold">{cls.title}</div>
                  <div className="text-[#9a8a72] text-sm">
                    {new Date(b.class_instances.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {' · '}{formatTime(cls.start_time)}–{formatTime(endTime)}
                    {b.role !== 'general' && ` · ${b.role}`}
                  </div>
                </div>
                <span className="text-xs bg-green-900/30 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full">
                  Confirmed
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
