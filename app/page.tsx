import Link from 'next/link'

const testimonials = [
  { name: 'Anna K.', text: 'Best decision I made this year. The instructors are world-class and the community is incredibly welcoming!', stars: 5 },
  { name: 'Mikael P.', text: 'I went from two left feet to dancing at parties in 3 months. The beginner classes are perfectly paced.', stars: 5 },
  { name: 'Laura S.', text: 'The Bachata classes are incredible. Such attention to detail and the music selection is amazing.', stars: 5 },
]

const features = [
  { icon: '🎵', title: 'Expert Instructors', desc: 'Learn from professional dancers with international competition experience.' },
  { icon: '👥', title: 'Warm Community', desc: 'Join a friendly, inclusive community of dance lovers from all backgrounds.' },
  { icon: '📅', title: 'Flexible Scheduling', desc: 'Classes every day of the week — morning, evening, and weekends.' },
]

export default function Home() {
  return (
    <div className="pt-16">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0f05] via-[#0a0805] to-[#0a0805]" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #c8932a 0%, transparent 50%), radial-gradient(circle at 70% 80%, #8b5e1a 0%, transparent 40%)' }} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block bg-[#c8932a]/10 border border-[#c8932a]/30 text-[#c8932a] text-xs font-semibold tracking-widest uppercase px-4 py-2 rounded-full mb-6">
            Salsa & Bachata · Helsinki
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Dance Your Way.
            <span className="block text-[#c8932a]">Havana Club.</span>
          </h1>
          <p className="text-xl text-[#9a8a72] mb-10 max-w-2xl mx-auto leading-relaxed">
            Weekly Salsa and Bachata classes for all levels. From your first step to the dance floor — we&apos;re with you every beat of the way.
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Why Havana Club?</h2>
          <p className="text-[#9a8a72] text-center mb-16 max-w-xl mx-auto">We believe dance changes lives. Here&apos;s what makes our studio different.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map(f => (
              <div key={f.title} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-8 text-center hover:border-[#c8932a]/40 transition-colors">
                <div className="text-4xl mb-4">{f.icon}</div>
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
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Our Classes</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 hover:border-[#c8932a]/40 transition-colors group">
              <div className="text-5xl mb-4">💃</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#c8932a] transition-colors">Salsa</h3>
              <p className="text-[#9a8a72] leading-relaxed mb-6">
                Feel the rhythm of Cuban and New York style Salsa. High energy, dynamic footwork, and infectious music make Salsa one of the world&apos;s most loved dances.
              </p>
              <Link href="/classes?style=salsa" className="text-[#c8932a] font-semibold text-sm hover:underline">
                View Salsa Classes →
              </Link>
            </div>
            <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 hover:border-[#c8932a]/40 transition-colors group">
              <div className="text-5xl mb-4">🕺</div>
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

      {/* Testimonials */}
      <section className="py-24 px-4 bg-[#141008]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What Our Students Say</h2>
          <p className="text-[#9a8a72] text-center mb-16">Join hundreds of happy dancers</p>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-6">
                <div className="flex mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <span key={i} className="text-[#c8932a]">★</span>
                  ))}
                </div>
                <p className="text-[#9a8a72] leading-relaxed mb-4 italic">&quot;{t.text}&quot;</p>
                <div className="font-semibold text-sm">{t.name}</div>
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
              { label: 'Drop-in', price: '€20', desc: 'Try a single class with no commitment.' },
              { label: 'Class Packs', price: 'from €140', desc: '8, 16, or 32 classes — great value.' },
              { label: 'Membership', price: 'from €65/mo', desc: 'Weekly access to as many classes as you want.' },
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
