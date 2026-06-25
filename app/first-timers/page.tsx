'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User, Zap, Gift, ClipboardCheck, Music, Users, CreditCard, Shield, Sparkles, SalsaIcon, BachataIcon } from '@/components/Icons'

interface TrialClass {
  id: string
  style: 'salsa' | 'bachata'
  date: string
  start_time: string
  instructor: string
  location: string
  capacity: number
  trial_signups: { count: number }[]
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatTime(t: string) {
  const [h, m] = t.split(':')
  const hour = parseInt(h)
  return `${hour > 12 ? hour - 12 : hour}:${m} ${hour >= 12 ? 'PM' : 'AM'}`
}

function daysUntil(dateStr: string) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

// ─── Signup Modal ────────────────────────────────────────────────────────────

function SignupModal({ cls, onClose, onSuccess }: {
  cls: TrialClass
  onClose: () => void
  onSuccess: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const taken = cls.trial_signups?.[0]?.count ?? 0
  const spotsLeft = cls.capacity - taken

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const res = await fetch('/api/trial-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trial_class_id: cls.id, name, email, phone }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || 'Signup failed'); setLoading(false); return }
    onSuccess()
  }

  const isSalsa = cls.style === 'salsa'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative bg-[#141008] border border-[#c8932a]/30 rounded-2xl p-8 max-w-md w-full shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-[#9a8a72] hover:text-[#f5f0e8] text-xl leading-none">✕</button>

        {/* Header */}
        <div className="mb-5">
          <div className={`flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mb-2 ${isSalsa ? 'text-orange-400' : 'text-purple-400'}`}>
            {isSalsa ? <SalsaIcon className="w-4 h-4" /> : <BachataIcon className="w-4 h-4" />}
            {isSalsa ? 'Cuban Salsa' : 'Bachata'} Trial Class
          </div>
          <h3 className="text-2xl font-bold mb-1">Reserve Your Spot</h3>
          <div className="text-[#9a8a72] text-sm">
            {formatDate(cls.date)} · {formatTime(cls.start_time)} · {cls.location}
          </div>
          {spotsLeft <= 5 && spotsLeft > 0 && (
            <div className="mt-2 text-sm font-semibold text-orange-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 flex-shrink-0" /> Only {spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>

        {/* Value reminder */}
        <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4 mb-5 text-sm space-y-1.5">
          <div className="flex gap-2 text-[#9a8a72]"><span className="text-green-400">✓</span> No experience or partner needed</div>
          <div className="flex gap-2 text-[#9a8a72]"><span className="text-green-400">✓</span> Full 90-min class · <strong className="text-[#f5f0e8]">€10 on site</strong></div>
          <div className="flex gap-2 text-[#9a8a72]"><Gift className="w-4 h-4 text-[#c8932a] flex-shrink-0 mt-0.5" /> Join any plan → <strong className="text-[#c8932a]">trial class on us</strong></div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700/40 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-3">
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name *"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address *"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none" />
          <input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number *"
            className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] placeholder-[#4a3a28] focus:border-[#c8932a] focus:outline-none" />
          <button type="submit" disabled={loading}
            className="w-full bg-[#c8932a] text-[#0a0805] py-3.5 rounded-lg font-bold text-lg hover:bg-[#a87820] transition-colors disabled:opacity-50">
            {loading ? 'Reserving…' : 'Reserve My Free Spot →'}
          </button>
          <p className="text-center text-xs text-[#9a8a72]">€10 paid on site · no card needed to reserve</p>
          <p className="text-center text-xs text-[#9a8a72]/70 mt-1">
            By reserving a spot you agree to our{' '}
            <a href="/privacy" target="_blank" className="underline hover:text-[#c8932a]">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  )
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <div className="relative bg-[#141008] border border-[#c8932a]/30 rounded-2xl p-10 max-w-md w-full text-center shadow-2xl">
        <Sparkles className="w-16 h-16 mb-4 mx-auto text-[#c8932a]" />
        <h3 className="text-2xl font-bold mb-2">You&apos;re In!</h3>
        <p className="text-[#9a8a72] mb-5">Confirmation sent to your email. See you on the dance floor!</p>
        <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4 mb-6 text-sm text-left space-y-1.5">
          <div className="text-[#c8932a] font-semibold mb-2">Before you come:</div>
          <div className="text-[#9a8a72]">• Arrive 10 min early, wear comfortable clothes</div>
          <div className="text-[#9a8a72]">• Pay <strong className="text-[#f5f0e8]">€10 cash or card on site</strong> after the class</div>
          <div className="text-[#9a8a72]">• Join any plan → <strong className="text-[#c8932a]">€10 trial fee waived</strong></div>
        </div>
        <button onClick={onClose}
          className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors">
          See You There!
        </button>
      </div>
    </div>
  )
}

// ─── Date Card ───────────────────────────────────────────────────────────────

function DateCard({ cls, accent, onSignup }: {
  cls: TrialClass
  accent: string
  onSignup: () => void
}) {
  const taken = cls.trial_signups?.[0]?.count ?? 0
  const spotsLeft = cls.capacity - taken
  const full = spotsLeft <= 0
  const days = daysUntil(cls.date)
  const urgent = spotsLeft > 0 && spotsLeft <= 10

  return (
    <div className={`relative bg-[#0d0b07] border rounded-2xl p-5 transition-all ${
      full ? 'border-[#2a1f10] opacity-60' : `border-[#2a1f10] hover:border-${accent}-500/40`
    }`}>
      {urgent && (
        <div className="absolute -top-3 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">
          Almost Full!
        </div>
      )}
      <div className="mb-3">
        <span className="text-[#c8932a] font-black uppercase tracking-[0.2em] text-xs"
          style={{ fontVariant: 'small-caps', letterSpacing: '0.18em' }}>
          ✦ Tryout Class ✦
        </span>
      </div>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#f5f0e8] text-base leading-snug">
            {formatDate(cls.date)}
          </div>
          <div className="text-[#9a8a72] text-sm mt-0.5">
            {formatTime(cls.start_time)} · 90 min · {cls.location}
          </div>
          <div className="text-[#9a8a72] text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 flex-shrink-0" />{cls.instructor}</div>
        </div>
        <div className="text-right flex-shrink-0">
          {days === 0 && <div className="text-xs font-bold text-[#c8932a] mb-1">Today!</div>}
          {days === 1 && <div className="text-xs font-bold text-[#c8932a] mb-1">Tomorrow</div>}
          {days > 1 && days <= 7 && <div className="text-xs font-bold text-orange-400 mb-1">In {days} days</div>}
          {full ? (
            <span className="text-xs bg-red-900/30 text-red-300 border border-red-700/30 px-2 py-0.5 rounded-full">Fully booked</span>
          ) : urgent ? (
            <span className="text-xs font-semibold text-orange-400">Only a few spots left!</span>
          ) : null}
        </div>
      </div>
      <button
        onClick={() => !full && onSignup()}
        disabled={full}
        className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
          full
            ? 'bg-[#2a1f10] text-[#9a8a72] cursor-not-allowed'
            : 'bg-[#c8932a] text-[#0a0805] hover:bg-[#a87820] hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-[#c8932a]/20'
        }`}
      >
        {full ? 'Fully Booked' : 'Reserve My Spot →'}
      </button>
    </div>
  )
}

// ─── Style Section ────────────────────────────────────────────────────────────

function StyleSection({ style, classes, onSignup }: {
  style: 'salsa' | 'bachata'
  classes: TrialClass[]
  onSignup: (cls: TrialClass) => void
}) {
  const isSalsa = style === 'salsa'
  const next = classes[0]
  const rest = classes.slice(1)

  const COPY = {
    salsa: {
      Icon: SalsaIcon,
      tagline: 'High energy. Pure joy. Instant hook.',
      desc: 'Cuban Salsa is the original Latin partner dance — circular, energetic, and deeply social. You\'ll be moving to the beat within the first 15 minutes, no partner needed.',
      bullets: ['No experience needed', 'Solo attendees welcome', 'Full 90-min class'],
      accent: 'orange',
      gradient: 'from-orange-900/20 via-[#141008] to-[#141008]',
      border: 'border-orange-700/20',
      tag: 'bg-orange-900/40 text-orange-300',
    },
    bachata: {
      Icon: BachataIcon,
      tagline: 'Smooth. Sensual. Easy to learn.',
      desc: 'Bachata is one of the most beginner-friendly partner dances in the world. Slow enough to follow, expressive enough to feel incredible.',
      bullets: ['No partner required', 'Beginner-friendly', 'Full 90-min class'],
      accent: 'purple',
      gradient: 'from-purple-900/20 via-[#141008] to-[#141008]',
      border: 'border-purple-700/20',
      tag: 'bg-purple-900/40 text-purple-300',
    },
  }

  const c = COPY[style]

  return (
    <section id={style} className={`scroll-mt-20 py-20 px-4 bg-gradient-to-br ${c.gradient}`}>
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left — copy */}
          <div>
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4 ${c.tag}`}>
              <c.Icon className="w-4 h-4" />
              {isSalsa ? 'Cuban Salsa' : 'Bachata'} Tryout Class
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              {isSalsa ? 'Next Cuban Salsa' : 'Next Bachata'}
              <span className="block text-[#c8932a]">Tryout Classes</span>
            </h2>
            <p className="text-lg text-[#c8932a] font-semibold italic mb-3">&ldquo;{c.tagline}&rdquo;</p>
            <p className="text-[#9a8a72] leading-relaxed mb-6">{c.desc}</p>
            <ul className="space-y-2 mb-8">
              {c.bullets.map(b => (
                <li key={b} className="flex items-center gap-2 text-sm text-[#f5f0e8]">
                  <span className="w-5 h-5 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs flex-shrink-0">✓</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* Price callout */}
            <div className={`bg-[#141008] border ${c.border} rounded-2xl p-5`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold">€10</span>
                <span className="text-xs text-[#9a8a72]">paid on site after class</span>
              </div>
              <div className="text-sm text-[#9a8a72]">
                Join any plan afterwards → <strong className="text-[#c8932a]">trial class is on us</strong>
              </div>
            </div>
          </div>

          {/* Right — dates */}
          <div>
            {classes.length === 0 ? (
              <div className={`bg-[#141008] border ${c.border} rounded-2xl p-8 text-center`}>
                <c.Icon className="w-12 h-12 mx-auto mb-3 text-[#9a8a72]/40" />
                <p className="text-[#9a8a72] text-sm leading-relaxed">
                  No {isSalsa ? 'Salsa' : 'Bachata'} tryout classes scheduled right now.<br />
                  Check back soon or{' '}
                  <a href="mailto:hello@havanaclub.fi" className="text-[#c8932a] hover:underline">contact us</a> to be notified.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="text-xs text-[#9a8a72] uppercase tracking-widest font-semibold mb-4">
                  {classes.length} date{classes.length !== 1 ? 's' : ''} available
                </div>

                {/* Next / first date — featured */}
                {next && (
                  <div className="relative">
                    <div className="absolute -top-3 left-4 z-10">
                      <span className="bg-[#c8932a] text-[#0a0805] text-xs font-bold px-3 py-0.5 rounded-full">
                        Next date
                      </span>
                    </div>
                    <div className={`bg-[#0d0b07] border-2 border-[#c8932a]/40 rounded-2xl p-5 pt-6`}>
                      <div className="mb-3">
                        <span className="text-[#c8932a] font-black uppercase tracking-[0.2em] text-xs"
                          style={{ fontVariant: 'small-caps', letterSpacing: '0.18em' }}>
                          ✦ Tryout Class ✦
                        </span>
                      </div>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="font-bold text-[#f5f0e8] text-lg leading-snug">
                            {formatDate(next.date)}
                          </div>
                          <div className="text-[#9a8a72] text-sm mt-0.5">
                            {formatTime(next.start_time)} · 90 min · {next.location}
                          </div>
                          <div className="text-[#9a8a72] text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5 flex-shrink-0" />{next.instructor}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {(() => {
                            const days = daysUntil(next.date)
                            const taken = next.trial_signups?.[0]?.count ?? 0
                            const spotsLeft = next.capacity - taken
                            const full = spotsLeft <= 0
                            return (
                              <div className="space-y-1">
                                {days === 0 && <div className="text-xs font-bold text-[#c8932a]">Today!</div>}
                                {days === 1 && <div className="text-xs font-bold text-[#c8932a]">Tomorrow</div>}
                                {days > 1 && days <= 7 && <div className="text-xs font-bold text-orange-400">In {days} days</div>}
                                {full ? (
                                  <span className="text-xs bg-red-900/30 text-red-300 border border-red-700/30 px-2 py-0.5 rounded-full block">Fully booked</span>
                                ) : spotsLeft <= 10 ? (
                                  <span className="text-xs font-semibold block text-orange-400">Only a few spots left!</span>
                                ) : null}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          const taken = next.trial_signups?.[0]?.count ?? 0
                          if (next.capacity - taken > 0) onSignup(next)
                        }}
                        disabled={(next.trial_signups?.[0]?.count ?? 0) >= next.capacity}
                        className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-xl font-bold text-base hover:bg-[#a87820] transition-all active:scale-[0.98] shadow-lg shadow-[#c8932a]/25 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reserve My Spot →
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional dates — all shown immediately */}
                {rest.map(cls => (
                  <DateCard key={cls.id} cls={cls} accent={c.accent} onSignup={() => onSignup(cls)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FirstTimersPage() {
  const [classes, setClasses] = useState<TrialClass[]>([])
  const [loading, setLoading] = useState(true)
  const [activeSignup, setActiveSignup] = useState<TrialClass | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch('/api/trial-classes')
      .then(r => r.json())
      .then(d => { setClasses(d.classes || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const salsa = classes.filter(c => c.style === 'salsa')
  const bachata = classes.filter(c => c.style === 'bachata')

  return (
    <div className="pt-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f05] via-[#0a0805] to-[#0a0805]" />
        <div className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 60%, #c8932a 0%, transparent 50%), radial-gradient(circle at 80% 30%, #8b4513 0%, transparent 40%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-block bg-[#c8932a]/10 border border-[#c8932a]/30 text-[#c8932a] text-xs font-bold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            First Time at Havana Club?
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Find Your New Hobby.
            <span className="block text-[#c8932a]">Meet Your People.</span>
          </h1>
          <p className="text-xl text-[#9a8a72] mb-3 leading-relaxed max-w-2xl mx-auto">
            A trial Cuban Salsa or Bachata class for just €10 — no experience, no partner, no prior dance background needed. Just show up and see what happens.
          </p>
          <p className="text-[#c8932a] font-semibold mb-10 text-lg flex items-center justify-center gap-2">
            <Gift className="w-5 h-5 flex-shrink-0" />
            Join any plan afterwards and the trial class is on us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#salsa"
              className="inline-flex items-center justify-center gap-2 bg-orange-500/10 border border-orange-500/30 text-orange-300 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-orange-500/20 transition-all hover:scale-105">
              <SalsaIcon className="w-5 h-5 flex-shrink-0" />
              Cuban Salsa Tryout
            </a>
            <a href="#bachata"
              className="inline-flex items-center justify-center gap-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-purple-500/20 transition-all hover:scale-105">
              <BachataIcon className="w-5 h-5 flex-shrink-0" />
              Bachata Tryout
            </a>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-[#141008] border-y border-[#2a1f10]">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { step: '1', Icon: ClipboardCheck, title: 'Reserve Your Spot', desc: 'Name + email. No card needed.' },
              { step: '2', Icon: Music, title: 'Show Up & Dance', desc: 'Wear comfortable clothes and indoor shoes. We handle everything else.' },
              { step: '3', Icon: Users, title: 'Meet the Community', desc: 'Rotate partners, make connections, discover a new passion.' },
              { step: '4', Icon: CreditCard, title: 'Pay €10 on the Way Out', desc: 'Cash or card on site. Join a plan and it\'s on us.' },
            ].map(s => (
              <div key={s.step}>
                <div className="w-9 h-9 bg-[#c8932a] rounded-full flex items-center justify-center text-[#0a0805] font-bold mx-auto mb-2 text-sm">{s.step}</div>
                <s.Icon className="w-6 h-6 mx-auto mb-1 text-[#c8932a]/60" />
                <div className="font-bold text-sm mb-0.5">{s.title}</div>
                <div className="text-[#9a8a72] text-xs leading-relaxed">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Salsa section ────────────────────────────────────────────────── */}
      {loading ? (
        <section className="py-24 flex justify-center">
          <svg className="animate-spin h-8 w-8 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </section>
      ) : (
        <>
          <StyleSection style="salsa" classes={salsa} onSignup={setActiveSignup} />

          {/* Divider with objection busters */}
          <section className="py-12 px-4 bg-[#141008] border-y border-[#2a1f10]">
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-4">
              {[
                { q: '"I have no rhythm"', a: 'Neither did most of our students. Rhythm is learned — we teach you exactly how, step by step.' },
                { q: '"I need a partner"', a: "You don't. Solo attendees welcome. You'll rotate and meet the whole group." },
                { q: '"I might not like it"', a: "That's why you pay after, not before. Walk in curious, walk out with no regrets." },
              ].map(item => (
                <div key={item.q} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-5">
                  <div className="text-[#c8932a] font-bold mb-2 italic text-sm">{item.q}</div>
                  <div className="text-[#9a8a72] text-sm leading-relaxed">{item.a}</div>
                </div>
              ))}
            </div>
          </section>

          <StyleSection style="bachata" classes={bachata} onSignup={setActiveSignup} />
        </>
      )}

      {/* ── Guarantee ────────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-[#141008] border-t border-[#2a1f10]">
        <div className="max-w-2xl mx-auto text-center">
          <Shield className="w-12 h-12 mb-3 mx-auto text-[#c8932a]/60" />
          <h3 className="text-xl font-bold mb-2">The Easiest Way to Start</h3>
          <p className="text-[#9a8a72] leading-relaxed">
            Show up, dance, meet people — and see if it clicks. Hundreds of our regular members started exactly this way.{' '}
            <span className="text-[#c8932a] font-semibold">Join a plan after your trial and it&apos;s on us.</span>
          </p>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 bg-[#c8932a]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a0805] mb-3">The Hardest Part is Showing Up.</h2>
          <p className="text-[#0a0805]/70 mb-8 text-lg">We promise the rest is just music, movement, and a lot of fun.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#salsa" className="bg-[#0a0805] text-[#f5f0e8] px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-[#1a0f05] transition-colors">
              Cuban Salsa Tryout
            </a>
            <a href="#bachata" className="bg-[#0a0805] text-[#f5f0e8] px-8 py-3.5 rounded-xl font-bold text-lg hover:bg-[#1a0f05] transition-colors">
              Bachata Tryout
            </a>
          </div>
        </div>
      </section>

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {activeSignup && !success && (
        <SignupModal
          cls={activeSignup}
          onClose={() => setActiveSignup(null)}
          onSuccess={() => { setActiveSignup(null); setSuccess(true) }}
        />
      )}
      {success && <SuccessModal onClose={() => setSuccess(false)} />}
    </div>
  )
}
