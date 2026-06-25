'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { formatTime, addMinutes } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Booking {
  id: string
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
  name: string
  subscription_tier: number | null
  pack_credits_remaining: number
  pack_expires_at: string | null
  pack_credits_lapsed: number
}

const SUB_LABELS: Record<number, string> = {
  1: '1× per week — €79/mo',
  2: '2× per week — €129/mo',
  3: '3× per week — €169/mo',
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      setUser({ email: user.email! })

      const [custRes, bookRes] = await Promise.all([
        fetch(`/api/customer?email=${encodeURIComponent(user.email!)}`),
        fetch(`/api/bookings?email=${encodeURIComponent(user.email!)}`),
      ])
      const custData = await custRes.json()
      const bookData = await bookRes.json()
      setCustomer(custData.customer)
      setBookings(bookData.bookings || [])
      setLoading(false)
    })
  }, [router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  async function manageSubscription() {
    if (!user) return
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
  }

  if (loading) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="text-[#9a8a72]">Loading your dashboard…</div>
      </div>
    )
  }

  const upcoming = bookings.filter(b => new Date(b.class_instances?.date) >= new Date())
  const past = bookings.filter(b => new Date(b.class_instances?.date) < new Date()).slice(0, 5)

  const now = new Date()
  const expiryDate = customer?.pack_expires_at ? new Date(customer.pack_expires_at) : null
  const packExpired = expiryDate ? expiryDate < now : false
  const daysUntilExpiry = expiryDate && !packExpired
    ? Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="pt-24 pb-16 px-4 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">
            {customer?.name ? `Hey, ${customer.name.split(' ')[0]}` : 'My Dashboard'}
          </h1>
          <div className="text-[#9a8a72] text-sm">{user?.email}</div>
        </div>
        <button onClick={signOut} className="text-sm text-[#9a8a72] hover:text-red-400 transition-colors">
          Sign out
        </button>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        <div className={`bg-[#141008] rounded-xl p-5 border-2 ${packExpired ? 'border-red-700/50' : daysUntilExpiry !== null && daysUntilExpiry <= 14 ? 'border-amber-600/50' : 'border-[#2a1f10]'}`}>
          <div className="text-[#9a8a72] text-sm mb-1">Class Credits</div>
          <div className={`text-4xl font-bold ${packExpired ? 'text-red-400' : 'text-[#c8932a]'}`}>{customer?.pack_credits_remaining ?? 0}</div>
          {packExpired ? (
            <>
              <div className="text-red-400 text-xs mt-1">Pack expired</div>
              {(customer?.pack_credits_lapsed ?? 0) > 0 && (
                <div className="text-[#9a8a72] text-xs mt-1">{customer!.pack_credits_lapsed} credit{customer!.pack_credits_lapsed > 1 ? 's' : ''} will be restored on next purchase</div>
              )}
              <Link href="/pricing" className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">Buy a pack to reactivate →</Link>
            </>
          ) : customer?.pack_expires_at ? (
            <>
              <div className={`text-xs mt-1 ${daysUntilExpiry !== null && daysUntilExpiry <= 14 ? 'text-amber-400' : 'text-[#9a8a72]'}`}>
                Expires {new Date(customer.pack_expires_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                {daysUntilExpiry !== null && daysUntilExpiry <= 14 && ` — ${daysUntilExpiry} day${daysUntilExpiry !== 1 ? 's' : ''} left`}
              </div>
              {daysUntilExpiry !== null && daysUntilExpiry <= 14 && (
                <Link href="/pricing" className="text-xs text-amber-400 hover:underline mt-1 inline-block">Top up now →</Link>
              )}
            </>
          ) : (
            <div className="text-[#9a8a72] text-xs mt-1">remaining</div>
          )}
          {(customer?.pack_credits_remaining ?? 0) === 0 && !packExpired && (
            <Link href="/pricing" className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">Buy a pack →</Link>
          )}
        </div>
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
          <div className="text-[#9a8a72] text-sm mb-1">Membership</div>
          {customer?.subscription_tier ? (
            <>
              <div className="text-lg font-bold">{customer.subscription_tier}×/week</div>
              <div className="text-[#9a8a72] text-xs mt-1">
                {SUB_LABELS[customer.subscription_tier]}
              </div>
              <button onClick={manageSubscription}
                className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">
                Manage →
              </button>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-[#9a8a72]">None</div>
              <Link href="/subscriptions"
                className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">
                Get a membership →
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Upcoming Classes</h2>
          <Link href="/classes" className="text-sm text-[#c8932a] hover:underline">Browse schedule →</Link>
        </div>
        {upcoming.length === 0 ? (
          <div className="text-[#9a8a72] text-sm bg-[#141008] border border-[#2a1f10] rounded-xl p-6 text-center">
            No upcoming bookings.{' '}
            <Link href="/classes" className="text-[#c8932a] hover:underline">Book a class</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map(b => <BookingRow key={b.id} b={b} />)}
          </div>
        )}
      </div>

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 text-[#9a8a72]">Recent Classes</h2>
          <div className="space-y-3 opacity-60">
            {past.map(b => <BookingRow key={b.id} b={b} />)}
          </div>
        </div>
      )}
    </div>
  )
}

function BookingRow({ b }: { b: Booking }) {
  const cls = b.class_instances?.classes
  if (!cls) return null
  const endTime = addMinutes(cls.start_time, cls.duration_minutes)
  const isPast = new Date(b.class_instances.date) < new Date()

  return (
    <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-4 flex items-center justify-between">
      <div>
        <div className="font-semibold">{cls.title}</div>
        <div className="text-[#9a8a72] text-sm">
          {new Date(b.class_instances.date + 'T00:00:00').toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'short',
          })}
          {' · '}{formatTime(cls.start_time)}–{formatTime(endTime)}
          {b.role !== 'general' && ` · ${b.role}`}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full border ${
        isPast
          ? 'bg-[#2a1f10] text-[#9a8a72] border-[#2a1f10]'
          : 'bg-green-900/30 text-green-300 border-green-700/30'
      }`}>
        {isPast ? 'Attended' : 'Confirmed'}
      </span>
    </div>
  )
}
