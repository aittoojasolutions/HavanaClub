'use client'
import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { formatTime, addMinutes, DAY_LABELS } from '@/lib/utils'
import { createClient } from '@/lib/supabase-browser'
import { User, Users } from '@/components/Icons'
import Link from 'next/link'
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
  name: string
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
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const [authLoading, setAuthLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [role, setRole] = useState<'leader' | 'follower' | 'general'>('general')
  const [paymentType, setPaymentType] = useState<string>('')
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [instanceId, setInstanceId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // phone removed — collected at trial signup, saved to profile

  // Auth gate — redirect to login if not signed in
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        const currentUrl = `/book/${classId}${date ? `?date=${date}` : ''}`
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`)
        return
      }
      setUserEmail(user.email!)

      // Fetch class, customer, and instance ID in parallel
      const [classRes, custRes, instanceRes] = await Promise.all([
        fetch('/api/classes'),
        fetch(`/api/customer?email=${encodeURIComponent(user.email!)}`),
        date ? fetch(`/api/classes/instance?class_id=${classId}&date=${date}`) : Promise.resolve(null),
      ])
      const classData = await classRes.json()
      const custData = await custRes.json()
      if (instanceRes) {
        const instanceData = await instanceRes.json()
        setInstanceId(instanceData.instanceId || null)
      }

      const found = classData.classes?.find((c: ClassData) => c.id === classId)
      setCls(found || null)
      if (custData.customer) {
        setCustomer(custData.customer)
        setUserName(custData.customer.name || user.email!.split('@')[0])
      } else {
        setUserName(user.email!.split('@')[0])
      }

      // Skip straight to role/payment step
      setStep(found?.is_pairwork ? 1 : 2)
      setAuthLoading(false)
    })
  }, [classId, date, router])

  async function handleBook() {
    if (!paymentType) { setError('Please select a payment method.'); return }
    setLoading(true)
    setError('')

    if (!instanceId) {
      setError('Could not find this class session. Please go back and try again.')
      setLoading(false)
      return
    }

    if (paymentType === 'pack' || paymentType === 'subscription') {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: userEmail,
          customer_name: userName,
          class_instance_id: instanceId,
          role: cls?.is_pairwork ? role : 'general',
          booking_type: paymentType,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Booking failed'); setLoading(false); return }
      router.push('/booking-success?type=credit')
    } else {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'drop_in',
          email: userEmail,
          name: userName,
          classInstanceId: instanceId,
          role: cls?.is_pairwork ? role : 'general',
        }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setError('Failed to start checkout'); setLoading(false) }
    }
  }

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <svg className="animate-spin h-8 w-8 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        <span className="text-[#9a8a72] text-sm">Loading…</span>
      </div>
    )
  }

  if (!cls) return (
    <div className="text-center text-[#9a8a72] py-20">Class not found.</div>
  )

  const endTime = addMinutes(cls.start_time, cls.duration_minutes)
  const dateDisplay = date
    ? new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
    : DAY_LABELS[cls.day_of_week]

  const steps = cls.is_pairwork ? [1, 2] : [2]
  const totalSteps = steps.length

  return (
    <div className="max-w-lg mx-auto">
      {/* Class summary card */}
      <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[#9a8a72] text-sm mb-1">{dateDisplay}</div>
            <h2 className="text-2xl font-bold mb-1">{cls.title}</h2>
            <div className="text-[#9a8a72] text-sm">
              {formatTime(cls.start_time)} – {formatTime(endTime)} · {cls.location}
            </div>
            <div className="text-[#9a8a72] text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 flex-shrink-0" />{cls.instructor}</div>
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${
            cls.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'
          }`}>{cls.style}</span>
        </div>
        {/* Signed-in as */}
        <div className="mt-4 pt-4 border-t border-[#2a1f10] flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-[#9a8a72]">
            <div className="w-6 h-6 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            Booking as <span className="text-[#f5f0e8] font-medium">{userName}</span>
          </div>
          <Link href="/dashboard" className="text-xs text-[#9a8a72] hover:text-[#c8932a] transition-colors">
            Not you?
          </Link>
        </div>
      </div>

      {/* Step indicator — only show if pairwork (2 steps) */}
      {cls.is_pairwork && (
        <div className="flex items-center gap-2 mb-8">
          {[1, 2].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                step === s ? 'bg-[#c8932a] text-[#0a0805]'
                : step > s ? 'bg-[#2a1f10] text-[#c8932a]'
                : 'bg-[#141008] border border-[#2a1f10] text-[#9a8a72]'
              }`}>{s}</div>
              {i < totalSteps - 1 && <div className="flex-1 h-px bg-[#2a1f10]" />}
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Role selection (pairwork only) */}
      {step === 1 && cls.is_pairwork && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-1">Choose your role</h3>
            <p className="text-[#9a8a72] text-sm">This is a pairwork class — you&apos;ll need to join as a Leader or Follower.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { val: 'leader', label: 'Leader', Icon: User, spots: cls.leader_capacity },
              { val: 'follower', label: 'Follower', Icon: Users, spots: cls.follower_capacity },
            ].map(r => (
              <button key={r.val} onClick={() => setRole(r.val as 'leader' | 'follower')}
                className={`p-6 rounded-2xl border-2 transition-all text-center ${
                  role === r.val
                    ? 'border-[#c8932a] bg-[#c8932a]/10 shadow-lg shadow-[#c8932a]/10'
                    : 'border-[#2a1f10] bg-[#141008] hover:border-[#c8932a]/40'
                }`}>
                <r.Icon className="w-10 h-10 mb-2 mx-auto text-[#c8932a]" />
                <div className="font-bold text-lg">{r.label}</div>
                <div className="text-[#9a8a72] text-sm">{r.spots} spots</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(2)}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold hover:bg-[#a87820] active:scale-[0.98] transition-all shadow-lg shadow-[#c8932a]/20">
            Continue →
          </button>
        </div>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold mb-1">How would you like to pay?</h3>
            {cls.is_pairwork && (
              <p className="text-[#9a8a72] text-sm">Joining as <span className="text-[#c8932a] font-medium capitalize">{role}</span></p>
            )}
          </div>

          <div className="space-y-3">
            {customer?.subscription_tier && (
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentType === 'subscription' ? 'border-[#c8932a] bg-[#c8932a]/5' : 'border-[#2a1f10] bg-[#141008] hover:border-[#c8932a]/30'
              }`}>
                <input type="radio" name="payment" value="subscription" checked={paymentType === 'subscription'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
                <div className="flex-1">
                  <div className="font-semibold">Membership</div>
                  <div className="text-[#9a8a72] text-sm">{customer.subscription_tier}×/week plan · included</div>
                </div>
                <span className="text-xs bg-green-900/30 text-green-300 border border-green-700/30 px-2 py-0.5 rounded-full font-semibold">Free</span>
              </label>
            )}

            {customer && customer.pack_credits_remaining > 0 && (
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentType === 'pack' ? 'border-[#c8932a] bg-[#c8932a]/5' : 'border-[#2a1f10] bg-[#141008] hover:border-[#c8932a]/30'
              }`}>
                <input type="radio" name="payment" value="pack" checked={paymentType === 'pack'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
                <div className="flex-1">
                  <div className="font-semibold">Class Credits</div>
                  <div className="text-[#9a8a72] text-sm">{customer.pack_credits_remaining} credits remaining</div>
                </div>
                <span className="text-xs bg-[#c8932a]/10 text-[#c8932a] border border-[#c8932a]/20 px-2 py-0.5 rounded-full font-semibold">1 credit</span>
              </label>
            )}

            <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              paymentType === 'drop_in' ? 'border-[#c8932a] bg-[#c8932a]/5' : 'border-[#2a1f10] bg-[#141008] hover:border-[#c8932a]/30'
            }`}>
              <input type="radio" name="payment" value="drop_in" checked={paymentType === 'drop_in'} onChange={e => setPaymentType(e.target.value)} className="accent-[#c8932a]" />
              <div className="flex-1">
                <div className="font-semibold">Drop-in</div>
                <div className="text-[#9a8a72] text-sm">Pay now, no commitment</div>
              </div>
              <span className="text-xs font-bold text-[#f5f0e8]">€24</span>
            </label>
          </div>

          <button onClick={handleBook} disabled={loading || !paymentType}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-xl font-bold hover:bg-[#a87820] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#c8932a]/20">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Processing…
              </span>
            ) : paymentType === 'drop_in' ? 'Pay €24 & Confirm' : 'Confirm Booking'}
          </button>

          {cls.is_pairwork && (
            <button onClick={() => setStep(1)} className="w-full text-[#9a8a72] text-sm hover:text-[#f5f0e8] py-2 transition-colors">
              ← Change role
            </button>
          )}

          {!customer?.subscription_tier && !customer?.pack_credits_remaining && (
            <p className="text-center text-xs text-[#9a8a72]">
              Save with a{' '}
              <Link href="/pricing" className="text-[#c8932a] hover:underline">class pack</Link>
              {' '}or{' '}
              <Link href="/subscriptions" className="text-[#c8932a] hover:underline">membership</Link>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default function BookPage() {
  return (
    <div className="pt-24 pb-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">Book a Class</h1>
      <Suspense fallback={
        <div className="flex justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      }>
        <BookingContent />
      </Suspense>
    </div>
  )
}
