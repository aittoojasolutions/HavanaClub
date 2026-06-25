'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PRICES } from '@/lib/prices'
import { createClient } from '@/lib/supabase-browser'

type Tier = '1x' | '2x' | '3x'

const tiers: Record<Tier, {
  label: string
  price: string
  perHour: string
  classesPerWeek: number
  key: string
  perks: string[]
  desc: string
}> = {
  '1x': {
    label: '1× per week',
    price: PRICES.sub1x.display,
    perHour: PRICES.sub1x.perHour,
    classesPerWeek: 1,
    key: 'sub_1x',
    desc: 'Perfect for getting started. One class per week at your own pace.',
    perks: [
      'Book 1 class per week (any day, Mon–Sun)',
      'Choose any Cuban Salsa or Bachata class',
      'Switch styles week to week',
      'Cancel anytime — no fees',
      'Access to beginner workshops',
    ],
  },
  '2x': {
    label: '2× per week',
    price: PRICES.sub2x.display,
    perHour: PRICES.sub2x.perHour,
    classesPerWeek: 2,
    key: 'sub_2x',
    desc: 'The most popular plan. Two classes a week builds real rhythm and technique.',
    perks: [
      'Book 2 classes per week (any day, Mon–Sun)',
      'Mix Cuban Salsa and Bachata freely',
      'Priority booking for popular classes',
      'Cancel anytime — no fees',
      'Access to beginner workshops',
      'Monthly progress check-in with instructor',
    ],
  },
  '3x': {
    label: '3× per week',
    price: PRICES.sub3x.display,
    perHour: PRICES.sub3x.perHour,
    classesPerWeek: 3,
    key: 'sub_3x',
    desc: 'For the dedicated dancer. Three classes a week for rapid progression.',
    perks: [
      'Book 3 classes per week (any day, Mon–Sun)',
      'Unlimited style mixing',
      'Priority booking — always',
      'Cancel anytime — no fees',
      'All workshops included',
      'Monthly 1-on-1 feedback session',
      'Invite to exclusive social events',
    ],
  },
}

const faqs = [
  { q: 'When does my membership renew?', a: 'Your membership renews monthly on the same date you signed up. You\'ll receive an email reminder 3 days before each renewal.' },
  { q: 'Can I book any day of the week?', a: 'Yes! All memberships allow you to book on any day from Monday to Sunday. You choose which classes fit your schedule.' },
  { q: 'What if I miss a class?', a: 'Missed classes don\'t carry over — your weekly allowance resets each Monday. We recommend booking in advance to secure your spot.' },
  { q: 'Can I change my plan?', a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect from the next billing cycle.' },
  { q: 'How do I cancel?', a: 'Cancel anytime from your account dashboard or by emailing us. No notice period, no cancellation fee.' },
  { q: 'Can I pause my membership?', a: 'Yes — if you\'re traveling or need a break, you can pause for up to 4 weeks per year. Contact us to arrange this.' },
]

export default function SubscriptionsPage() {
  const [active, setActive] = useState<Tier>('2x')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ key: string } | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [modalError, setModalError] = useState('')

  async function startCheckout(key: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email) {
      const res = await fetch(`/api/customer?email=${encodeURIComponent(user.email)}`)
      const data = await res.json()
      await goToCheckout(key, user.email, data.customer?.name || user.email)
    } else {
      setModal({ key }); setEmail(''); setName(''); setModalError('')
    }
  }

  async function goToCheckout(key: string, userEmail: string, userName: string) {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: key, email: userEmail, name: userName }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
      else { setLoading(false); setModalError(data.error || 'Something went wrong.') }
    } catch {
      setLoading(false)
      setModalError('Something went wrong. Please try again.')
    }
  }

  async function submitModal() {
    if (!modal) return
    if (!email.trim() || !name.trim()) { setModalError('Please fill in both fields.'); return }
    setModal(null)
    await goToCheckout(modal.key, email.trim(), name.trim())
  }

  const current = tiers[active]

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Memberships</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the Club</h1>
        <p className="text-[#9a8a72] text-lg max-w-xl mx-auto">
          Choose your rhythm — and when you show up consistently, you dance.
        </p>
      </div>

      {/* Tier tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-1 flex">
          {(Object.keys(tiers) as Tier[]).map(t => (
            <button key={t} onClick={() => setActive(t)}
              className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                active === t ? 'bg-[#c8932a] text-[#0a0805]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'
              }`}>
              {tiers[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Tier detail card */}
      <div className="bg-[#141008] border-2 border-[#c8932a]/40 rounded-2xl p-8 md:p-12 mb-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
          <div className="flex-1">
            <div className="inline-block bg-[#c8932a]/10 border border-[#c8932a]/30 text-[#c8932a] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
              {current.classesPerWeek} class{current.classesPerWeek > 1 ? 'es' : ''} / week
            </div>
            <h2 className="text-3xl font-bold mb-3">{current.label}</h2>
            <p className="text-[#9a8a72] mb-6 leading-relaxed">{current.desc}</p>
            <ul className="space-y-3">
              {current.perks.map(p => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <span className="text-[#c8932a] mt-0.5 flex-shrink-0">✓</span>
                  <span className="text-[#9a8a72]">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:w-64 md:flex-shrink-0">
            <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-6 text-center">
              <div className="text-[#9a8a72] text-sm mb-1">Monthly price</div>
              <div className="text-5xl font-bold text-[#c8932a] mb-1">{current.price}</div>
              <div className="text-[#c8932a] text-sm font-medium mb-1">{current.perHour}</div>
              <div className="text-[#9a8a72] text-xs mb-4">per month · 3-month minimum</div>
              <div className="bg-[#c8932a]/5 border border-[#c8932a]/20 rounded-lg px-3 py-2.5 text-xs text-[#9a8a72] mb-4 text-left">
                <div className="text-[#c8932a] font-semibold mb-1">How billing works</div>
                Your first charge covers the remaining days of this month (prorated). From the 1st of next month, you&apos;ll be billed {current.price} on the 1st of each month.
              </div>
              <button onClick={() => startCheckout(current.key)} disabled={loading}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
                {loading ? 'Loading…' : 'Start Membership'}
              </button>
              <div className="text-[#9a8a72] text-xs mt-3">3-month minimum · cancel anytime after</div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison */}
      <div className="mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a1f10]">
                <th className="text-left py-3 text-[#9a8a72] font-medium">Feature</th>
                {(Object.keys(tiers) as Tier[]).map(t => (
                  <th key={t} className={`text-center py-3 font-bold ${active === t ? 'text-[#c8932a]' : 'text-[#f5f0e8]'}`}>
                    {tiers[t].label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Monthly price', '€79', '€129', '€169'],
                ['Classes per week', '1', '2', '3'],
                ['Any day (Mon–Sun)', '✓', '✓', '✓'],
                ['Cuban Salsa & Bachata', '✓', '✓', '✓'],
                ['Priority booking', '—', '✓', '✓'],
                ['Monthly feedback', '—', '✓', '✓'],
                ['Social events', '—', '—', '✓'],
                ['1-on-1 sessions', '—', '—', '✓'],
              ].map(([label, ...vals]) => (
                <tr key={label} className="border-b border-[#2a1f10]/50">
                  <td className="py-3 text-[#9a8a72]">{label}</td>
                  {vals.map((v, i) => (
                    <td key={i} className={`text-center py-3 ${v === '—' ? 'text-[#2a1f10]' : 'text-[#f5f0e8]'}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {faqs.map(faq => (
            <div key={faq.q} className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
              <div className="font-semibold mb-2">{faq.q}</div>
              <div className="text-[#9a8a72] text-sm leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Guest checkout modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => { setModal(null); setLoading(false) }}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-[#0f0c07] border border-[#2a1f10] rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-1">Almost there</h2>
            <p className="text-[#9a8a72] text-sm mb-5">Enter your details to continue to checkout.</p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs text-[#9a8a72] mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com" autoFocus
                  onKeyDown={e => e.key === 'Enter' && submitModal()}
                  className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs text-[#9a8a72] mb-1">Full name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name"
                  onKeyDown={e => e.key === 'Enter' && submitModal()}
                  className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
              </div>
            </div>
            {modalError && <p className="text-red-400 text-xs mb-3">{modalError}</p>}
            <button onClick={submitModal}
              className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors mb-2">
              Continue to Checkout
            </button>
            <p className="text-[#9a8a72] text-xs text-center">
              Already have an account?{' '}
              <Link href="/login" className="text-[#c8932a] hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
