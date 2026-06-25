'use client'
import { useState } from 'react'
import { PRICES } from '@/lib/prices'

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

  async function startCheckout(key: string) {
    const email = prompt('Enter your email:')
    if (!email) return
    const name = prompt('Your full name:')
    if (!name) return
    setLoading(true)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: key, email, name }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert(data.error || 'Error'); setLoading(false) }
  }

  const current = tiers[active]

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Memberships</h1>
        <p className="text-[#9a8a72] text-lg max-w-xl mx-auto">
          A membership means you show up. And when you show up consistently, you dance.
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
              <div className="text-[#9a8a72] text-xs mb-6">per month · cancel anytime</div>
              <button onClick={() => startCheckout(current.key)} disabled={loading}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
                {loading ? 'Loading…' : 'Start Membership'}
              </button>
              <div className="text-[#9a8a72] text-xs mt-3">No contracts. Cancel anytime.</div>
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
                ['Monthly price', '€65', '€89', '€109'],
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
    </div>
  )
}
