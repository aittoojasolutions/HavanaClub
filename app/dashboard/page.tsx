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
}

const SUB_LABELS: Record<number, string> = {
  1: '1× per week — €65/mo',
  2: '2× per week — €89/mo',
  3: '3× per week — €109/mo',
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
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
          <div className="text-[#9a8a72] text-sm mb-1">Class Credits</div>
          <div className="text-4xl font-bold text-[#c8932a]">{customer?.pack_credits_remaining ?? 0}</div>
          <div className="text-[#9a8a72] text-xs mt-1">remaining</div>
          {(customer?.pack_credits_remaining ?? 0) === 0 && (
            <Link href="/pricing" className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">
              Buy a pack →
            </Link>
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
