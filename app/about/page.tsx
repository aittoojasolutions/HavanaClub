import Link from 'next/link'
import { Globe, Handshake, TrendingUp, Music } from '@/components/Icons'

const values = [
  {
    Icon: Globe,
    title: 'Authentic to the culture',
    desc: 'We teach authentic Cuban Salsa (Casino style) and Bachata the way they\'re danced on social floors worldwide — not a watered-down fitness version, but the real thing.',
  },
  {
    Icon: Handshake,
    title: 'Community first',
    desc: 'A dance class is only as good as the people in it. We work hard to create a space where everyone feels welcome, supported, and encouraged from day one.',
  },
  {
    Icon: TrendingUp,
    title: 'Structured progression',
    desc: 'We don\'t just repeat the same moves every week. Our curriculum is designed so you can see your own progress — from your first step to leading or following with confidence.',
  },
  {
    Icon: Music,
    title: 'Music that moves you',
    desc: 'Great Latin dancing starts with loving the music. We teach musicality alongside movement so you don\'t just follow beats — you respond to them.',
  },
]

export default function AboutPage() {
  return (
    <div className="pt-24 pb-20 px-4">

      {/* Hero */}
      <section className="max-w-4xl mx-auto text-center mb-20 reveal">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-4">Our Story</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          We Started Habana Club<br />
          <span className="text-[#c8932a]">Because Helsinki Deserved Better.</span>
        </h1>
        <p className="text-[#9a8a72] text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          Latin dance in Helsinki had a ceiling. Great talent, but nowhere to consistently learn and grow with other serious dancers. So we built Habana Club — a place with real instruction, real music, and a community that keeps you coming back.
        </p>
      </section>

      {/* Story section */}
      <section className="max-w-5xl mx-auto mb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="rounded-2xl overflow-hidden aspect-[4/3] reveal-left">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
              src="/about-studio.mp4"
            />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-5">From a single class to a full community</h2>
            <div className="space-y-4 text-[#9a8a72] leading-relaxed">
              <p>
                Habana Club started with a single weekly Cuban Salsa class and a small group of dedicated students. Word spread fast — not because of marketing, but because people kept bringing their friends.
              </p>
              <p>
                Today we run classes seven days a week across multiple styles and levels. Students come for the dancing and stay for the people. That hasn't changed.
              </p>
              <p>
                Our instructors have competed internationally, performed on stages across Europe, and most importantly — they love teaching. Every class is prepared. Every student is noticed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-6xl mx-auto mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">What we stand for</h2>
          <p className="text-[#9a8a72] max-w-xl mx-auto">These aren't marketing words — they're the decisions we make every week about how to run our classes.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 reveal-stagger">
          {values.map(v => (
            <div key={v.title} className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-7 hover:border-[#c8932a]/30 transition-colors">
              <v.Icon className="w-8 h-8 mb-4 text-[#c8932a]" />
              <h3 className="text-xl font-bold mb-3">{v.title}</h3>
              <p className="text-[#9a8a72] leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="max-w-5xl mx-auto mb-20 bg-[#141008] border border-[#2a1f10] rounded-2xl px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center reveal-stagger">
          {[
            { num: '500+', label: 'Students taught' },
            { num: '7', label: 'Days a week' },
            { num: '2', label: 'Dance styles' },
            { num: '€10', label: 'Trial class' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-4xl md:text-5xl font-bold text-[#c8932a] mb-2">{s.num}</div>
              <div className="text-[#9a8a72] text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the team */}
      <section className="max-w-5xl mx-auto mb-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the people who teach</h2>
        <p className="text-[#9a8a72] mb-8 max-w-xl mx-auto">
          Our instructors aren't just dancers — they're teachers who care about your progress. Every one of them started as a student too.
        </p>
        <Link
          href="/teachers"
          className="inline-block border border-[#c8932a]/50 text-[#c8932a] px-8 py-4 rounded-md font-semibold hover:bg-[#c8932a] hover:text-[#0a0805] transition-all"
        >
          Meet our instructors →
        </Link>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#1a0f05] via-[#141008] to-[#1a0f05] border border-[#c8932a]/20 rounded-2xl py-16 px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">The best way to understand us is to dance with us.</h2>
        <p className="text-[#9a8a72] mb-8 max-w-lg mx-auto">Try your first Cuban Salsa or Bachata class for just €10. No partner, no experience, no pressure.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/first-timers"
            className="bg-[#c8932a] text-[#0a0805] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a87820] transition-all hover:scale-105"
          >
            Book a Trial Class — €10
          </Link>
          <Link
            href="/contact"
            className="border border-[#2a1f10] text-[#f5f0e8] px-8 py-4 rounded-md font-bold text-lg hover:border-[#c8932a] hover:text-[#c8932a] transition-all"
          >
            Find Us
          </Link>
        </div>
      </section>
    </div>
  )
}
