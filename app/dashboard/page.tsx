'use client'
import { useState, useEffect, useCallback } from 'react'
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
  first_name: string | null
  last_name: string | null
  phone: string | null
  age: number | null
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

type CancelStep = 'idle' | 'confirm' | 'options' | 'done'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelStep, setCancelStep] = useState<CancelStep>('idle')
  const [cancelData, setCancelData] = useState<{ cancelAt: string; pastMinimum: boolean } | null>(null)
  const [cancelWorking, setCancelWorking] = useState(false)
  const [convertData, setConvertData] = useState<{ credits: number; expiresAt: string } | null>(null)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '', phone: '', age: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState('')

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
      if (custData.customer) {
        setProfileForm({
          first_name: custData.customer.first_name || '',
          last_name: custData.customer.last_name || '',
          phone: custData.customer.phone || '',
          age: custData.customer.age?.toString() || '',
        })
      }
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

  const refreshCustomer = useCallback(async (email: string) => {
    const res = await fetch(`/api/customer?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setCustomer(data.customer)
  }, [])

  async function confirmCancel() {
    if (!user) return
    setCancelWorking(true)
    const res = await fetch('/api/stripe/cancel-subscription', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
    const data = await res.json()
    setCancelWorking(false)
    if (res.ok) {
      setCancelData(data)
      setCancelStep(data.pastMinimum ? 'options' : 'done')
    }
  }

  async function convertToPack() {
    if (!user) return
    setCancelWorking(true)
    const res = await fetch('/api/stripe/convert-to-pack', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email }),
    })
    const data = await res.json()
    setCancelWorking(false)
    if (res.ok) {
      setConvertData(data)
      setCancelStep('done')
      await refreshCustomer(user.email)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileSaving(true); setProfileMsg('')
    const res = await fetch(`/api/customer?email=${encodeURIComponent(user.email)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: profileForm.first_name,
        last_name: profileForm.last_name,
        phone: profileForm.phone,
        age: profileForm.age ? parseInt(profileForm.age) : null,
      }),
    })
    setProfileSaving(false)
    if (res.ok) {
      const data = await res.json()
      setCustomer(prev => prev ? { ...prev, ...data.customer } : data.customer)
      setEditingProfile(false)
      setProfileMsg('Profile updated.')
    }
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
              <div className="text-[#9a8a72] text-xs mt-1">{SUB_LABELS[customer.subscription_tier]}</div>
              <div className="flex gap-3 mt-2">
                <button onClick={manageSubscription} className="text-xs text-[#c8932a] hover:underline">Manage →</button>
                <button onClick={() => setCancelStep('confirm')} className="text-xs text-red-400 hover:underline">Cancel</button>
              </div>
            </>
          ) : (
            <>
              <div className="text-lg font-bold text-[#9a8a72]">None</div>
              <Link href="/subscriptions" className="text-xs text-[#c8932a] hover:underline mt-2 inline-block">Get a membership →</Link>
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

      {/* Profile */}
      <div className="mt-10 border-t border-[#2a1f10] pt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Profile</h2>
          {!editingProfile && (
            <button onClick={() => { setEditingProfile(true); setProfileMsg('') }}
              className="text-sm text-[#c8932a] hover:underline">Edit</button>
          )}
        </div>

        {profileMsg && (
          <div className="text-green-400 text-sm mb-4">{profileMsg}</div>
        )}

        {editingProfile ? (
          <form onSubmit={saveProfile} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#9a8a72] mb-1">First name</label>
                <input value={profileForm.first_name} onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="First name"
                  className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#9a8a72] mb-1">Last name</label>
                <input value={profileForm.last_name} onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="Last name"
                  className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#9a8a72] mb-1">Phone</label>
              <input type="tel" value={profileForm.phone} onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                placeholder="+358 40 123 4567"
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[#9a8a72] mb-1">Age</label>
              <input type="number" min="10" max="99" value={profileForm.age} onChange={e => setProfileForm(p => ({ ...p, age: e.target.value }))}
                placeholder="Age"
                className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
            </div>
            <div>
              <label className="block text-xs text-[#9a8a72] mb-1">Email</label>
              <div className="bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#9a8a72] text-sm">{user?.email}</div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={profileSaving}
                className="bg-[#c8932a] text-[#0a0805] px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#a87820] transition-colors disabled:opacity-50">
                {profileSaving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditingProfile(false)}
                className="text-sm text-[#9a8a72] hover:text-[#f5f0e8] transition-colors">Cancel</button>
            </div>
          </form>
        ) : (
          <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 space-y-3 text-sm">
            {[
              { label: 'Name', value: customer?.first_name ? `${customer.first_name} ${customer.last_name || ''}`.trim() : customer?.name },
              { label: 'Email', value: user?.email },
              { label: 'Phone', value: customer?.phone || '—' },
              { label: 'Age', value: customer?.age?.toString() || '—' },
            ].map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-[#9a8a72]">{row.label}</span>
                <span className="text-[#f5f0e8]">{row.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel subscription modal */}
      {cancelStep !== 'idle' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => !cancelWorking && setCancelStep('idle')}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-[#0f0c07] border border-[#2a1f10] rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>

            {/* Step 1: Confirm */}
            {cancelStep === 'confirm' && (
              <>
                <h2 className="text-xl font-bold mb-2">Cancel your membership?</h2>
                <p className="text-[#9a8a72] text-sm mb-6">
                  Your membership includes a 3-month minimum commitment. If you cancel now, your access will remain active until your commitment period ends — you won&apos;t lose any classes you&apos;re entitled to.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setCancelStep('idle')}
                    className="flex-1 py-2.5 rounded-lg border border-[#2a1f10] text-[#f5f0e8] hover:bg-[#1a1208] transition-colors text-sm font-medium">
                    Keep my membership
                  </button>
                  <button onClick={confirmCancel} disabled={cancelWorking}
                    className="flex-1 py-2.5 rounded-lg bg-red-900/40 border border-red-700/40 text-red-300 hover:bg-red-900/60 transition-colors text-sm font-medium disabled:opacity-50">
                    {cancelWorking ? 'Processing…' : 'Yes, cancel'}
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Options (past minimum) */}
            {cancelStep === 'options' && cancelData && (
              <>
                <h2 className="text-xl font-bold mb-2">How would you like to cancel?</h2>
                <p className="text-[#9a8a72] text-sm mb-5">Choose what happens to your remaining time this billing period.</p>
                <div className="space-y-3 mb-5">
                  <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-4">
                    <div className="font-semibold text-sm mb-1">Cancel at end of period</div>
                    <div className="text-[#9a8a72] text-xs">
                      Access until {new Date(cancelData.cancelAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}. Already scheduled.
                    </div>
                    <div className="text-green-400 text-xs mt-1">✓ Cancellation confirmed</div>
                  </div>
                  <div className="bg-[#141008] border border-[#c8932a]/30 rounded-xl p-4">
                    <div className="font-semibold text-sm mb-1">Convert remaining time to a class pack</div>
                    <div className="text-[#9a8a72] text-xs mb-3">
                      Cancel immediately and receive class credits for your unused time. Credits valid for 6 months.
                    </div>
                    <button onClick={convertToPack} disabled={cancelWorking}
                      className="w-full py-2 rounded-lg bg-[#c8932a] text-[#0a0805] text-sm font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
                      {cancelWorking ? 'Converting…' : 'Convert to class pack'}
                    </button>
                  </div>
                </div>
                <button onClick={() => setCancelStep('idle')} className="text-xs text-[#9a8a72] hover:text-[#f5f0e8] transition-colors">
                  Close
                </button>
              </>
            )}

            {/* Done */}
            {cancelStep === 'done' && (
              <>
                <div className="text-2xl mb-3">✓</div>
                {convertData ? (
                  <>
                    <h2 className="text-xl font-bold mb-2">Converted to class pack</h2>
                    <p className="text-[#9a8a72] text-sm mb-1">
                      Your subscription has been cancelled and <span className="text-[#c8932a] font-semibold">{convertData.credits} class credit{convertData.credits !== 1 ? 's' : ''}</span> have been added to your account.
                    </p>
                    <p className="text-[#9a8a72] text-sm mb-5">
                      Credits valid until {new Date(convertData.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.
                    </p>
                  </>
                ) : cancelData ? (
                  <>
                    <h2 className="text-xl font-bold mb-2">Cancellation confirmed</h2>
                    <p className="text-[#9a8a72] text-sm mb-5">
                      Your membership will remain active until{' '}
                      <span className="text-[#f5f0e8] font-semibold">
                        {new Date(cancelData.cancelAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>.
                      You can keep booking classes until then.
                    </p>
                  </>
                ) : null}
                <button onClick={() => setCancelStep('idle')}
                  className="w-full py-2.5 rounded-lg bg-[#2a1f10] text-[#f5f0e8] text-sm font-medium hover:bg-[#3a2f20] transition-colors">
                  Close
                </button>
              </>
            )}
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
