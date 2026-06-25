'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Music, Users, Calendar, Gift, Timer, SalsaIcon, BachataIcon } from '@/components/Icons'

interface Teacher { id: string; name: string; bio: string | null; photo_url: string | null }

function TeacherAvatar({ t }: { t: Teacher }) {
  const initials = t.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
  if (t.photo_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={t.photo_url} alt={t.name}
        className="w-32 h-32 mx-auto rounded-full object-cover border-2 border-[#c8932a]/50 group-hover:border-[#c8932a] transition-colors" />
    )
  }
  return (
    <div className="w-32 h-32 mx-auto rounded-full bg-[#c8932a]/20 border-2 border-[#c8932a]/50 group-hover:border-[#c8932a] transition-colors flex items-center justify-center">
      <span className="text-3xl font-bold text-[#c8932a]">{initials}</span>
    </div>
  )
}

function TeachersSection() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  useEffect(() => {
    fetch('/api/teachers').then(r => r.json()).then(d => setTeachers(d.teachers ?? []))
  }, [])
  if (teachers.length === 0) return null
  return (
    <section className="py-24 px-4 bg-[#141008]">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">The Team</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Instructors</h2>
          <p className="text-[#9a8a72] max-w-xl mx-auto">Years of professional dance experience — in every class, every week.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-12">
          {teachers.map(t => (
            <div key={t.id} className="flex flex-col items-center text-center group w-44">
              <div className="transition-transform group-hover:scale-105 duration-300">
                <TeacherAvatar t={t} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">{t.name}</h3>
              {t.bio && <p className="mt-2 text-[#9a8a72] text-xs leading-relaxed line-clamp-3">{t.bio}</p>}
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/teachers" className="text-[#c8932a] text-sm font-semibold hover:underline">
            See all instructors →
          </Link>
        </div>
      </div>
    </section>
  )
}

const testimonials = [
  {
    name: 'Anna K.',
    detail: 'Cuban Salsa · Member since 2024',
    text: 'I came in with zero rhythm and zero confidence. Six months later I\'m going to socials every week and I\'ve made some of my best friends here. The beginner class is the best place to start — no judgment, just fun.',
    initials: 'AK',
  },
  {
    name: 'Mikael P.',
    detail: 'Bachata & Cuban Salsa · Pack → Membership',
    text: 'I\'d tried other dance schools and always dropped out. Something about the way the instructors teach here is different — they actually break things down so your body understands it. Three months in I booked a membership.',
    initials: 'MP',
  },
  {
    name: 'Laura S.',
    detail: 'Bachata · Trial class convert',
    text: 'Almost didn\'t go to the trial class because I was sure I\'d be the worst one there. I was. And it didn\'t matter at all. The whole class was rooting for each other. Best €10 I\'ve spent.',
    initials: 'LS',
  },
]

const features = [
  { Icon: Music, title: 'Expert Instructors', desc: 'Learn from professional dancers with international competition experience.' },
  { Icon: Users, title: 'Warm Community', desc: 'Join a friendly, inclusive community of dance lovers from all backgrounds.' },
  { Icon: Calendar, title: 'Flexible Scheduling', desc: 'Classes every day of the week — morning, evening, and weekends.' },
]

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero.mp4"
        />
        <div className="absolute inset-0 bg-[#0a0805]/70" />
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c8932a 0%, transparent 50%), radial-gradient(circle at 70% 80%, #8b5e1a 0%, transparent 40%)' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block bg-[#c8932a]/10 border border-[#c8932a]/30 text-[#c8932a] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            Cuban Salsa & Bachata · Helsinki
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Dance Your Way.
            <span className="block text-[#c8932a]">Habana Club.</span>
          </h1>
          <p className="text-xl text-[#9a8a72] mb-10 max-w-2xl mx-auto leading-relaxed">
            Weekly Cuban Salsa and Bachata classes for all levels. From your first step to the dance floor — we&apos;re with you every beat of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/classes"
              className="bg-[#c8932a] text-[#0a0805] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a87820] transition-all hover:scale-105">
              View Schedule
            </Link>
            <Link href="/pricing"
              className="border border-[#2a1f10] text-[#f5f0e8] px-8 py-4 rounded-md font-bold text-lg hover:border-[#c8932a] hover:text-[#c8932a] transition-all">
              See Pricing
            </Link>
          </div>

          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-[#9a8a72]">
            <div className="text-center"><span className="block text-3xl font-bold text-[#f5f0e8]">500+</span>Students</div>
            <div className="h-8 w-px bg-[#2a1f10]" />
            <div className="text-center"><span className="block text-3xl font-bold text-[#f5f0e8]">7</span>Days/Week</div>
            <div className="h-8 w-px bg-[#2a1f10]" />
            <div className="text-center"><span className="block text-3xl font-bold text-[#f5f0e8]">2</span>Dance Styles</div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-[#c8932a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-[#141008]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 reveal">Why Habana Club?</h2>
          <p className="text-[#9a8a72] text-center mb-16 max-w-xl mx-auto reveal">We believe dance changes lives. Here&apos;s what makes our studio different.</p>
          <div className="grid md:grid-cols-3 gap-8 reveal-stagger">
            {features.map(f => (
              <div key={f.title} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-8 text-center hover:border-[#c8932a]/40 transition-colors">
                <f.Icon className="w-10 h-10 mb-4 text-[#c8932a] mx-auto" />
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-[#9a8a72] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dance Styles */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 reveal">Our Classes</h2>
          <div className="grid md:grid-cols-2 gap-8 reveal-stagger">
            <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 hover:border-[#c8932a]/40 transition-colors group">
              <SalsaIcon className="w-14 h-14 mb-4 text-orange-400" />
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#c8932a] transition-colors">Cuban Salsa</h3>
              <p className="text-[#9a8a72] leading-relaxed mb-6">
                Circular, grounded, and deeply improvisational — Cuban Salsa (Casino style) is the original. High energy, infectious rhythm, and a culture that takes over the dance floor.
              </p>
              <Link href="/classes?style=salsa" className="text-[#c8932a] font-semibold text-sm hover:underline">
                View Cuban Salsa Classes →
              </Link>
            </div>
            <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 hover:border-[#c8932a]/40 transition-colors group">
              <BachataIcon className="w-14 h-14 mb-4 text-purple-400" />
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#c8932a] transition-colors">Bachata</h3>
              <p className="text-[#9a8a72] leading-relaxed mb-6">
                Sensual, connected, and deeply emotional. Bachata&apos;s intimate partner connection and distinctive hip movement create a dance experience unlike any other.
              </p>
              <Link href="/classes?style=bachata" className="text-[#c8932a] font-semibold text-sm hover:underline">
                View Bachata Classes →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <TeachersSection />

      {/* Trial Class Banner */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#1a0f05] via-[#141008] to-[#1a0f05] border-y border-[#c8932a]/20">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-block bg-[#c8932a]/10 border border-[#c8932a]/30 text-[#c8932a] text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full mb-4">
                New Here? Start Here.
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                Try Your First Class.<br />
                <span className="text-[#c8932a]">Just €10.</span>
              </h2>
              <p className="text-[#9a8a72] mb-4 leading-relaxed">
                No experience, no partner needed. Come as you are, move to the music, and find out why hundreds of people have made this their favourite part of the week.
              </p>
              <p className="text-[#c8932a] font-semibold mb-8 flex items-center gap-2">
                <Gift className="w-4 h-4 flex-shrink-0" />
                Join any plan afterwards and the trial class is on us.
              </p>
              <Link href="/first-timers"
                className="inline-block bg-[#c8932a] text-[#0a0805] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a87820] transition-all hover:scale-105">
                See Trial Class Dates →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 reveal-stagger">
              {[
                { Icon: Music, title: 'All levels welcome', desc: 'Complete beginners to experienced dancers — everyone starts somewhere.' },
                { Icon: Users, title: 'No partner needed', desc: 'Come solo — you\'ll rotate, meet everyone, and leave with new friends.' },
                { Icon: Gift, title: 'Join a plan → trial free', desc: 'Sign up for any pack or membership and the trial class is on us.' },
                { Icon: Timer, title: 'Full 90-min class', desc: 'Real instruction, real music, real experience — not a short taster.' },
              ].map(item => (
                <div key={item.title} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4 hover:border-[#c8932a]/30 transition-colors">
                  <item.Icon className="w-6 h-6 mb-2 text-[#c8932a]" />
                  <div className="font-semibold text-sm mb-1">{item.title}</div>
                  <div className="text-[#9a8a72] text-xs leading-relaxed">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-[#141008]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Real Students</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">What Our Students Say</h2>
            <p className="text-[#9a8a72]">From trial class to community member — in their own words.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 reveal-stagger">
            {testimonials.map(t => (
              <div key={t.name} className="bg-[#0a0805] border border-[#2a1f10] rounded-2xl p-7 flex flex-col">
                <div className="flex text-[#c8932a] mb-5 text-lg">★★★★★</div>
                <p className="text-[#9a8a72] leading-relaxed mb-6 flex-1 italic">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-[#2a1f10]">
                  <div className="w-9 h-9 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/40 flex items-center justify-center text-[#c8932a] text-xs font-bold flex-shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-[#f5f0e8]">{t.name}</div>
                    <div className="text-xs text-[#9a8a72]">{t.detail}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Flexible Plans for Every Dancer</h2>
          <p className="text-[#9a8a72] mb-12 max-w-xl mx-auto">Try a class, buy a pack, or commit to a membership. No long-term contracts.</p>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Drop-in', price: '€24', desc: 'Try a single class with no commitment.' },
              { label: 'Class Packs', price: 'from €140', desc: '8, 16, or 32 classes — great value.' },
              { label: 'Membership', price: 'from €69/mo', desc: 'Weekly access to as many classes as you want.' },
            ].map(p => (
              <div key={p.label} className="bg-[#141008] border border-[#2a1f10] rounded-xl p-6 text-left hover:border-[#c8932a]/40 transition-colors">
                <div className="text-[#9a8a72] text-sm font-medium mb-1">{p.label}</div>
                <div className="text-2xl font-bold text-[#c8932a] mb-2">{p.price}</div>
                <div className="text-[#9a8a72] text-sm">{p.desc}</div>
              </div>
            ))}
          </div>
          <Link href="/pricing"
            className="inline-block bg-[#c8932a] text-[#0a0805] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a87820] transition-all hover:scale-105">
            See Full Pricing
          </Link>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-4 bg-[#c8932a]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0a0805] mb-4">Ready to Start Dancing?</h2>
          <p className="text-[#0a0805]/70 mb-8 text-lg">Your first class is just one click away. See what&apos;s on this week.</p>
          <Link href="/classes"
            className="inline-block bg-[#0a0805] text-[#f5f0e8] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#1a0f05] transition-colors">
            Book Your First Class
          </Link>
        </div>
      </section>
    </div>
  )
}
