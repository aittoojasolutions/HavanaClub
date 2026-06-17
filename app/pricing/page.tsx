'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PRICES } from '@/lib/prices'

type Tab = 'packs' | 'subscriptions' | 'dropin'

export default function PricingPage() {
  const [tab, setTab] = useState<Tab>('packs')
  const [loading, setLoading] = useState<string | null>(null)

  async function startCheckout(type: string) {
    const email = prompt('Enter your email to continue:')
    if (!email) return
    const name = prompt('Your full name:')
    if (!name) return
    setLoading(type)
    const res = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, email, name }),
    })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    else { alert('Error: ' + (data.error || 'Unknown error')); setLoading(null) }
  }

  const packs = [
    { key: 'pack_8', ...PRICES.pack8 },
    { key: 'pack_16', ...PRICES.pack16 },
    { key: 'pack_32', ...PRICES.pack32 },
  ]

  const subs = [
    { key: 'sub_1x', ...PRICES.sub1x },
    { key: 'sub_2x', ...PRICES.sub2x },
    { key: 'sub_3x', ...PRICES.sub3x },
  ]

  return (
    <div className="pt-24 pb-16 px-4 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Pricing</h1>
        <p className="text-[#9a8a72] text-lg max-w-xl mx-auto">No hidden fees. No long-term contracts. Pick what works for you.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-10">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-1 flex">
          {([['packs', 'Class Packs'], ['subscriptions', 'Memberships'], ['dropin', 'Drop-in']] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? 'bg-[#c8932a] text-[#0a0805]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'
              }`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Class Packs */}
      {tab === 'packs' && (
        <div className="grid md:grid-cols-3 gap-6">
          {packs.map(pack => (
            <div key={pack.key} className={`bg-[#141008] rounded-2xl border-2 p-8 flex flex-col relative ${
              'bestValue' in pack && pack.bestValue ? 'border-[#c8932a]' : 'border-[#2a1f10]'
            }`}>
              {'bestValue' in pack && pack.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8932a] text-[#0a0805] text-xs font-bold px-3 py-1 rounded-full">
                  BEST VALUE
                </div>
              )}
              <div className="text-[#9a8a72] text-sm font-medium mb-2">{pack.label}</div>
              <div className="text-4xl font-bold mb-1">{pack.display}</div>
              {'perClass' in pack && (
                <div className="text-[#c8932a] text-sm mb-6">{'perClass' in pack ? pack.perClass : ''} per class</div>
              )}
              <ul className="space-y-2 text-sm text-[#9a8a72] mb-8 flex-1">
                {'classes' in pack && <li>✓ {'classes' in pack ? pack.classes : ''} classes total</li>}
                <li>✓ Valid for all styles</li>
                <li>✓ No expiry date</li>
                <li>✓ Book any class anytime</li>
              </ul>
              <button onClick={() => startCheckout(pack.key)} disabled={loading === pack.key}
                className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
                {loading === pack.key ? 'Loading…' : 'Buy Pack'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Memberships */}
      {tab === 'subscriptions' && (
        <div>
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {subs.map(sub => (
              <div key={sub.key} className={`bg-[#141008] rounded-2xl border-2 p-8 flex flex-col relative ${
                'bestValue' in sub && sub.bestValue ? 'border-[#c8932a]' : 'border-[#2a1f10]'
              }`}>
                {'bestValue' in sub && sub.bestValue && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c8932a] text-[#0a0805] text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <div className="text-[#9a8a72] text-sm font-medium mb-2">{sub.label}</div>
                <div className="text-4xl font-bold mb-1">{sub.display}<span className="text-lg font-normal text-[#9a8a72]">/mo</span></div>
                <div className="text-[#c8932a] text-sm mb-6">{sub.classesPerWeek} class{sub.classesPerWeek > 1 ? 'es' : ''}/week</div>
                <ul className="space-y-2 text-sm text-[#9a8a72] mb-8 flex-1">
                  <li>✓ Book any day Mon–Sun</li>
                  <li>✓ Salsa & Bachata included</li>
                  <li>✓ Cancel anytime</li>
                  <li>✓ {sub.classesPerWeek * 4}+ classes/month</li>
                </ul>
                <button onClick={() => startCheckout(sub.key)} disabled={loading === sub.key}
                  className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
                  {loading === sub.key ? 'Loading…' : 'Start Membership'}
                </button>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/subscriptions" className="text-[#c8932a] hover:underline text-sm">
              See full membership details and FAQs →
            </Link>
          </div>
        </div>
      )}

      {/* Drop-in */}
      {tab === 'dropin' && (
        <div className="max-w-sm mx-auto">
          <div className="bg-[#141008] border-2 border-[#2a1f10] rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4">🎟️</div>
            <h3 className="text-2xl font-bold mb-2">Single Class</h3>
            <div className="text-5xl font-bold text-[#c8932a] mb-2">{PRICES.dropIn.display}</div>
            <div className="text-[#9a8a72] text-sm mb-6">Per class · No commitment</div>
            <ul className="space-y-2 text-sm text-[#9a8a72] mb-8 text-left">
              <li>✓ Book any class</li>
              <li>✓ Salsa or Bachata</li>
              <li>✓ Pay as you go</li>
              <li>✓ Perfect for trying us out</li>
            </ul>
            <Link href="/classes"
              className="block w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors">
              Browse Classes
            </Link>
          </div>
        </div>
      )}

      {/* FAQ row */}
      <div className="mt-16 grid md:grid-cols-2 gap-6">
        {[
          { q: 'Can I use credits for any class?', a: 'Yes — class pack credits and memberships work for all Salsa and Bachata classes.' },
          { q: 'Do credits expire?', a: 'Class pack credits never expire. Use them at your own pace.' },
          { q: 'Can I cancel my membership?', a: 'Yes, cancel anytime from your dashboard. No cancellation fees.' },
          { q: 'Is there a trial class?', a: 'Your first drop-in class is a great way to try us out before committing to a pack or membership.' },
        ].map(faq => (
          <div key={faq.q} className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
            <div className="font-semibold mb-2">{faq.q}</div>
            <div className="text-[#9a8a72] text-sm">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
