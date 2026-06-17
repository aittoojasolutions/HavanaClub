'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { formatTime, addMinutes, DAY_LABELS } from '@/lib/utils'
import { Suspense } from 'react'

interface ClassData {
  id: string
  title: string
  style: string
  instructor: string
  day_of_week: string
  start_time: string
  duration_minutes: number
  is_pairwork: boolean
  leader_capacity: number | null
  follower_capacity: number | null
  general_capacity: number | null
  location: string
}

interface CustomerData {
  subscription_tier: number | null
  pack_credits_remaining: number
}

function BookingContent() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const classId = params.id as string
  const date = searchParams.get('date') || ''

  const [cls, setCls] = useState<ClassData | null>(null)
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'leader' | 'follower' | 'general'>('general')
  const [paymentType, setPaymentType] = useState<string>('')
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/classes`)
      .then(r => r.json())
      .then(data => {
        const found = data.classes?.find((c: ClassData) => c.id === classId)
        setCls(found || null)
      })
  }, [classId])

  async function checkCustomer() {
    if (!email) return
    const res = await fetch(`/api/bookings?email=${encodeURIComponent(email)}`)
    // Also fetch customer credits
    const custRes = await fetch(`/api/customer?email=${encodeURIComponent(email)}`)
    if (custRes.ok) {
      const data = await custRes.json()
      setCustomer(data.customer)
    }
  }

  async function handleProceed() {
    if (!name.trim() || !email.trim()) { setError('Please fill in your name and email.'); return }
    setError('')
    await checkCustomer()
    setStep(cls?.is_pairwork ? 2 : 3)
  }

  async function handleBook() {
    if (!paymentType) { setError('Please select a payment method.'); return }
    setLoading(true)
    setError('')

    if (paymentType === 'pack' || paymentType === 'subscription') {
      // Book directly (no Stripe needed)
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: email,
          customer_name: name,
          class_instance_id: classId, // simplified - using class id as proxy
          role: cls?.is_pairwork ? role : 'general',
          booking_type: paymentType,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed'); setLoading(false); return }
      router.push('/booking-success?type=credit')
    } else {
      // Redirect to Stripe
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drop_in',
          email,
          name,
          classInstanceId: classId,
          role: cls?.is_pairwork ? role : 'general',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setError('Failed to start checkout'); setLoading(false) }
    }
  }

  if (!cls) return <div className="text-center text-[#9a8a72] py-20">Loading class…</div>

  const endTime = addMinutes(cls.start_time, cls.duration_minutes)
  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : DAY_LABELS[cls.day_of_week]

  return (
    <div className="max-w-xl mx-auto">
      {/* Class summary */}
      <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-6 mb-8">
        <div className="text-[#9a8a72] text-sm mb-1">{dateDisplay}</div>
        <h2 className="text-2xl font-bold mb-1">{cls.title}</h2>
        <div className="text-[#9a8a72] text-sm space-y-0.5">
          <div>{formatTime(cls.start_time)} – {formatTime(endTime)}</div>
          <div>👤 {cls.instructor} · 📍 {cls.location}</div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, cls.is_pairwork ? 2 : null, 3].filter(Boolean).map((s, i, arr) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step === s ? 'bg-[#c8932a] text-[#0a0805]' : step > (s || 0) ? 'bg-[#2a1f10] text-[#c8932a]' : 'bg-[#141008] border border-[#2a1f10] text-[#9a8a72]'
            }`}>{s}</div>
            {i < arr.length - 1 && <div className="flex-1 h-px bg-[#2a1f10] w-8" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Contact info */}
      {step === 1 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Your Details</h3>
          <div>
            <label className="block text-sm text-[#9a8a72] mb-1">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Anna Korhonen"
              className="w-full bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none transition-colors" />
          </div>
          <div>
            <label className="block text-sm text-[#9a8a72] mb-1">Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="anna@example.com"
              className="w-full bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none transition-colors" />
          </div>
          <button onClick={handleProceed}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Role selection (pairwork only) */}
      {step === 2 && cls.is_pairwork && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Choose Your Role</h3>
          <p className="text-[#9a8a72] text-sm">This is a pairwork class. Select whether you&apos;ll be dancing as a Leader or Follower.</p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: 'leader', label: 'Leader', icon: '🕺', desc: `${cls.leader_capacity} spots` },
              { val: 'follower', label: 'Follower', icon: '💃', desc: `${cls.follower_capacity} spots` },
            ].map(r => (
              <button key={r.val} onClick={() => setRole(r.val as 'leader' | 'follower')}
                className={`p-6 rounded-xl border-2 transition-all text-center ${
                  role === r.val ? 'border-[#c8932a] bg-[#c8932a]/10' : 'border-[#2a1f10] bg-[#141008] hover:border-[#c8932a]/40'
                }`}>
                <div className="text-4xl mb-2">{r.icon}</div>
                <div className="font-bold">{r.label}</div>
                <div className="text-[#9a8a72] text-sm">{r.desc}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(3)}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors">
            Continue →
          </button>
          <button onClick={() => setStep(1)} className="w-full text-[#9a8a72] text-sm hover:text-[#f5f0e8] py-2">← Back</button>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold">Payment Method</h3>
          <div className="space-y-3">
            {customer?.subscription_tier && (
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentType === 'subscription' ? 'border-[#c8932a] bg-[#c8932a]/10' : 'border-[#2a1f10] bg-[#141008]'
              }`}>
                <input type="radio" name="payment" value="subscription" checked={paymentType === 'subscription'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
                <div>
                  <div className="font-semibold">Use Membership</div>
                  <div className="text-[#9a8a72] text-sm">Active {customer.subscription_tier}×/week plan · Free</div>
                </div>
              </label>
            )}
            {customer && customer.pack_credits_remaining > 0 && (
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentType === 'pack' ? 'border-[#c8932a] bg-[#c8932a]/10' : 'border-[#2a1f10] bg-[#141008]'
              }`}>
                <input type="radio" name="payment" value="pack" checked={paymentType === 'pack'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
                <div>
                  <div className="font-semibold">Use Class Credits</div>
                  <div className="text-[#9a8a72] text-sm">{customer.pack_credits_remaining} credits remaining</div>
                </div>
              </label>
            )}
            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentType === 'drop_in' ? 'border-[#c8932a] bg-[#c8932a]/10' : 'border-[#2a1f10] bg-[#141008]'
            }`}>
              <input type="radio" name="payment" value="drop_in" checked={paymentType === 'drop_in'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
              <div>
                <div className="font-semibold">Drop-in — €20</div>
                <div className="text-[#9a8a72] text-sm">Pay now, no commitment</div>
              </div>
            </label>
          </div>

          <button onClick={handleBook} disabled={loading || !paymentType}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Processing…' : paymentType === 'drop_in' ? 'Pay €20 & Book' : 'Confirm Booking'}
          </button>
          <button onClick={() => setStep(cls.is_pairwork ? 2 : 1)} className="w-full text-[#9a8a72] text-sm hover:text-[#f5f0e8] py-2">← Back</button>

          <p className="text-center text-xs text-[#9a8a72]">
            Don&apos;t have credits?{' '}
            <a href="/pricing" className="text-[#c8932a] hover:underline">Buy a class pack</a> or{' '}
            <a href="/subscriptions" className="text-[#c8932a] hover:underline">get a membership</a>.
          </p>
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  return (
    <div className="pt-24 pb-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Book a Class</h1>
      <Suspense fallback={<div className="text-center text-[#9a8a72]">Loading…</div>}>
        <BookingContent />
      </Suspense>
    </div>
  )
}
