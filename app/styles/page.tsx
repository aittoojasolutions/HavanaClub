import Link from 'next/link'
import { SalsaIcon, BachataIcon } from '@/components/Icons'

const salsa = {
  name: 'Cuban Salsa',
  colour: 'orange',
  tagline: 'High energy. Sharp footwork. Infectious rhythm.',
  origin: 'Cuba',
  feel: 'Upbeat · Circular · Deeply Social',
  description: [
    'Cuban Salsa is the original — born from Cuban son, mambo, and Afro-Cuban rhythms, it is the foundation from which all Latin dance culture grew. Circular, grounded, and deeply improvisational, it feels unlike any other partner dance.',
    'At Habana Club we teach authentic Cuban Salsa — Casino style, the way it\'s danced on the streets and in the casas de la trova in Havana. Expect rueda, partner work, and music that makes it impossible to stand still.',
    'Cuban Salsa is your ticket to dance floors across the world. The culture around it is vibrant, social, and welcoming — and once you start, you never really stop.',
  ],
  whatYouLearn: [
    'The basic step and Cuban timing — locking into the clave',
    'Casino footwork — the circular, improvisational movement of Cuban style',
    'Partner connection — leading and following in a relaxed, musical way',
    'Body movement and Cuban motion — the hip movement at the heart of the style',
    'Turns and combinations — expanding your partner vocabulary',
    'Rueda de Casino — the iconic Cuban group formation dance',
  ],
  music: 'Brass-heavy, percussive, joyful — Celia Cruz, Buena Vista Social Club, Los Van Van, Havana D\'Primera. Cuban music is built around the clave and it will move you.',
  level: 'Beginners welcome. The basic step is learnable in your first class.',
  classLink: '/classes?style=salsa',
}

const bachata = {
  name: 'Bachata',
  colour: 'purple',
  tagline: 'Slow. Connected. Deeply musical.',
  origin: 'Dominican Republic',
  feel: 'Intimate · Emotional · Flowing',
  description: [
    'Bachata started in the bars and streets of the Dominican Republic — raw, heartfelt, and deeply rooted in storytelling through movement. Over the past two decades it\'s exploded globally, becoming one of the most popular social dances in the world.',
    'What makes Bachata unique is its emphasis on connection. You and your partner move as one — hip sways, body waves, and a distinctive side-to-side step that looks simple but feels incredible when danced well.',
    'Modern Bachata has evolved to include sensual and fusion styles — you\'ll encounter all of it as your dancing develops. But we always start with the roots: good technique, clear connection, and the music.',
  ],
  whatYouLearn: [
    'The basic step — 3 steps and a tap, the foundation of everything',
    'Hip movement — the signature of Bachata, not as scary as it sounds',
    'Body wave and isolation — fluid upper body movement',
    'Partner connection — chest-to-chest presence and gentle leading',
    'Turns and dips — adding flair once the fundamentals are in place',
    'Musical interpretation — dancing to the lyrics, not just the beat',
  ],
  music: 'Guitar-driven, romantic, emotional — Romeo Santos, Juan Luis Guerra, Prince Royce. Bachata music tells a story. You\'ll start feeling it within a few classes.',
  level: 'Perfect for absolute beginners. Many find Bachata easier to pick up than Cuban Salsa.',
  classLink: '/classes?style=bachata',
}

function StyleSection({ s, reverse }: { s: typeof salsa; reverse?: boolean }) {
  const isOrange = s.colour === 'orange'
  const accent = isOrange ? 'text-orange-400' : 'text-purple-400'
  const bg = isOrange ? 'bg-orange-900/20 border-orange-800/30' : 'bg-purple-900/20 border-purple-800/30'
  const bar = isOrange ? 'bg-orange-500' : 'bg-purple-500'
  const badge = isOrange
    ? 'bg-orange-900/30 text-orange-300 border-orange-700/30'
    : 'bg-purple-900/30 text-purple-300 border-purple-700/30'
  const btn = isOrange
    ? 'bg-orange-600 hover:bg-orange-500 text-white'
    : 'bg-purple-700 hover:bg-purple-600 text-white'

  return (
    <section className="max-w-6xl mx-auto mb-24">
      <div className={`grid md:grid-cols-2 gap-12 items-start ${reverse ? 'md:grid-flow-dense' : ''}`}>

        {/* Text */}
        <div className={reverse ? 'md:col-start-2' : ''}>
          <div className="flex items-center gap-3 mb-4">
            {isOrange
              ? <SalsaIcon className="w-14 h-14 text-orange-400 flex-shrink-0" />
              : <BachataIcon className="w-14 h-14 text-purple-400 flex-shrink-0" />
            }
            <div>
              <span className={`text-xs font-bold uppercase tracking-widest ${accent} block mb-0.5`}>{s.feel}</span>
              <h2 className="text-4xl font-bold">{s.name}</h2>
            </div>
          </div>
          <p className={`text-lg font-semibold mb-6 ${accent}`}>{s.tagline}</p>

          <div className="space-y-4 mb-8">
            {s.description.map((para, i) => (
              <p key={i} className="text-[#9a8a72] leading-relaxed">{para}</p>
            ))}
          </div>

          <div className="flex gap-3 flex-wrap">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge}`}>
              Origin: {s.origin}
            </span>
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${badge}`}>
              {s.level.split('.')[0]}
            </span>
          </div>
        </div>

        {/* Info card */}
        <div className={reverse ? 'md:col-start-1 md:row-start-1' : ''}>
          <div className={`rounded-2xl border ${bg} overflow-hidden`}>
            <div className={`h-1.5 w-full ${bar}`} />
            <div className="p-7 space-y-6">

              <div>
                <h3 className={`text-xs font-bold uppercase tracking-widest ${accent} mb-3`}>What you&apos;ll learn</h3>
                <ul className="space-y-2">
                  {s.whatYouLearn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-[#9a8a72]">
                      <span className={`${accent} font-bold flex-shrink-0 mt-0.5`}>→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-[#2a1f10] pt-5">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${accent} mb-2`}>The music</h3>
                <p className="text-sm text-[#9a8a72] leading-relaxed">{s.music}</p>
              </div>

              <Link href={s.classLink}
                className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${btn}`}>
                View {s.name} Classes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function StylesPage() {
  return (
    <div className="pt-24 pb-20 px-4">

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-20">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-4">What We Teach</p>
        <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
          Two Dances.<br />
          <span className="text-[#c8932a]">One Community.</span>
        </h1>
        <p className="text-[#9a8a72] text-lg leading-relaxed">
          Cuban Salsa and Bachata are two of the most loved partner dances in the world. Different in feel, equal in joy. Here&apos;s everything you need to know before picking your first class.
        </p>
      </div>

      {/* Salsa */}
      <StyleSection s={salsa} />

      {/* Bachata */}
      <StyleSection s={bachata} reverse />

      {/* Which one? */}
      <section className="max-w-4xl mx-auto mb-20">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold mb-2 text-center">Which one should I start with?</h2>
          <p className="text-[#9a8a72] text-center mb-10">Short answer: either. Long answer:</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-orange-900/10 border border-orange-800/20 rounded-xl p-6">
              <SalsaIcon className="w-8 h-8 mb-3 text-orange-400" />
              <h3 className="font-bold text-lg mb-3 text-orange-300">Start with Cuban Salsa if…</h3>
              <ul className="space-y-2 text-sm text-[#9a8a72]">
                {[
                  'You love fast, high-energy music',
                  'You want to build sharp footwork and technique',
                  'You\'re drawn to a dance you can take to clubs worldwide',
                  'You enjoy something that feels like a workout',
                ].map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-orange-400 flex-shrink-0">✓</span>{item}</li>)}
              </ul>
            </div>
            <div className="bg-purple-900/10 border border-purple-800/20 rounded-xl p-6">
              <BachataIcon className="w-8 h-8 mb-3 text-purple-400" />
              <h3 className="font-bold text-lg mb-3 text-purple-300">Start with Bachata if…</h3>
              <ul className="space-y-2 text-sm text-[#9a8a72]">
                {[
                  'You prefer slower, more emotional music',
                  'You\'re drawn to the connection between partners',
                  'You want something that feels more natural to the body',
                  'You\'d like a gentler entry point into partner dancing',
                ].map((item, i) => <li key={i} className="flex items-start gap-2"><span className="text-purple-400 flex-shrink-0">✓</span>{item}</li>)}
              </ul>
            </div>
          </div>
          <p className="text-center text-[#9a8a72] text-sm mt-8">
            Most of our students end up doing both — and that&apos;s when it really gets fun.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto text-center bg-gradient-to-r from-[#1a0f05] via-[#141008] to-[#1a0f05] border border-[#c8932a]/20 rounded-2xl py-16 px-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">The best way to choose is to try.</h2>
        <p className="text-[#9a8a72] mb-8 max-w-lg mx-auto">
          Our €10 trial class lets you experience either style — or book one of each and decide for yourself.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/first-timers"
            className="bg-[#c8932a] text-[#0a0805] px-8 py-4 rounded-md font-bold text-lg hover:bg-[#a87820] transition-all hover:scale-105">
            Book a Trial Class — €10
          </Link>
          <Link href="/classes"
            className="border border-[#2a1f10] text-[#f5f0e8] px-8 py-4 rounded-md font-bold text-lg hover:border-[#c8932a] hover:text-[#c8932a] transition-all">
            View Full Schedule
          </Link>
        </div>
      </section>
    </div>
  )
}
