'use client'
import Link from 'next/link'
import { useState } from 'react'

const faqs = [
  {
    category: 'Before your first class',
    items: [
      {
        q: 'Do I need any dance experience?',
        a: 'Not at all. Our beginner classes start from zero — no steps assumed, no experience required. Every single one of our regular students started exactly where you are now.',
      },
      {
        q: 'Do I need to bring a partner?',
        a: 'No partner needed. In our group classes you rotate partners throughout the class, so you\'ll dance with everyone in the room. This is actually one of the best parts — you meet the whole community at once.',
      },
      {
        q: 'What should I wear?',
        a: 'Comfortable clothes you can move freely in — think gym wear or casual smart. For shoes: clean indoor trainers or shoes with a smooth sole work well for beginners. Avoid rubber-soled shoes that grip the floor too much, as they can strain your knees when turning.',
      },
      {
        q: 'How early should I arrive?',
        a: 'Aim to arrive 10–15 minutes before your first class. This gives you time to find the studio, get changed, and meet your instructor without feeling rushed.',
      },
      {
        q: 'What\'s the difference between Cuban Salsa and Bachata?',
        a: 'Cuban Salsa is upbeat, circular, and energetic — rooted in Afro-Cuban rhythms, Casino footwork, and a deeply social improvisation culture. Bachata is slower, more sensual, and focuses on the close connection between partners. Both are danced socially all over the world and many of our students do both!',
      },
    ],
  },
  {
    category: 'Classes & booking',
    items: [
      {
        q: 'What happens in a 90-minute class?',
        a: 'Classes typically start with a warm-up and body movement exercises, move into technique and footwork, then partner work. The last section is usually practice time with music. It\'s structured, fun, and goes faster than you\'d expect.',
      },
      {
        q: 'What does "pairwork" mean?',
        a: 'Pairwork classes focus on leading and following — the two roles in Latin partner dancing. Leaders initiate the movement, followers respond. You choose your role when booking. Don\'t worry — both roles are taught from scratch, and you rotate so everyone gets experience.',
      },
      {
        q: 'Which class level is right for me?',
        a: 'If you\'re new to Latin dance, start with a Beginner class regardless of your general dance background. If you\'ve taken Cuban Salsa or Bachata classes before, get in touch and we\'ll help you find the right level.',
      },
      {
        q: 'Can I cancel or change a booked class?',
        a: 'Yes — you can cancel a booking up to 2 hours before the class starts from your dashboard. If you cancel with less notice, the credit is still returned to your account to use for another class.',
      },
      {
        q: 'What if a class is fully booked?',
        a: 'We\'re working on a waitlist feature — in the meantime, drop us an email at hello@havanaclub.fi and we\'ll let you know if a spot opens up.',
      },
    ],
  },
  {
    category: 'Pricing & memberships',
    items: [
      {
        q: 'Do class pack credits expire?',
        a: 'No. Class credits from packs never expire. Use them at your own pace, across any class style.',
      },
      {
        q: 'Can I use my membership for both Cuban Salsa and Bachata?',
        a: 'Yes — memberships give you access to all Cuban Salsa and Bachata classes. Mix and match as you like.',
      },
      {
        q: 'Can I pause or cancel my membership?',
        a: 'You can cancel anytime — there\'s no lock-in period. Cancellations take effect at the end of the current billing cycle. Pause options are available on request.',
      },
      {
        q: 'If I sign up for a membership after the trial class, do I get the €10 back?',
        a: 'Yes! If you sign up for any class pack or membership after your trial class, the €10 trial fee is waived from your first payment.',
      },
    ],
  },
  {
    category: 'Practical info',
    items: [
      {
        q: 'Where are your classes held?',
        a: 'We currently have one location: Sörnäisten rantatie 33C, 00500 Helsinki, where all Cuban Salsa and Bachata classes are held. More locations are coming — check our Contact page for the latest.',
      },
      {
        q: 'Is there parking nearby?',
        a: 'Street parking is available on Sörnäisten rantatie and surrounding streets. The studio is also easily accessible by tram and metro — Sörnäinen metro station is a short walk away.',
      },
      {
        q: 'Do you offer private lessons?',
        a: 'Yes — private lessons are available with our instructors for focused technique work, wedding dance preparation, or accelerated learning. Contact us at hello@havanaclub.fi to arrange.',
      },
    ],
  },
]

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl transition-colors ${open ? 'border-[#c8932a]/40 bg-[#141008]' : 'border-[#2a1f10] bg-[#141008] hover:border-[#2a1f10]'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-semibold text-[#f5f0e8] leading-snug">{q}</span>
        <span className={`text-[#c8932a] flex-shrink-0 text-xl leading-none transition-transform mt-0.5 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-[#9a8a72] leading-relaxed text-sm border-t border-[#2a1f10] pt-4">
          {a}
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Got Questions?</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">We've Got Answers</h1>
        <p className="text-[#9a8a72] text-lg">Everything you need to know before walking through the door.</p>
      </div>

      <div className="space-y-12">
        {faqs.map(section => (
          <div key={section.category}>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#c8932a] mb-4 px-1">
              {section.category}
            </h2>
            <div className="space-y-2">
              {section.items.map(item => (
                <Accordion key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-16 bg-[#141008] border border-[#2a1f10] rounded-2xl p-8 text-center">
        <h3 className="text-xl font-bold mb-2">Still have a question?</h3>
        <p className="text-[#9a8a72] mb-6">We&apos;re happy to help — send us a message and we&apos;ll get back to you quickly.</p>
        <a
          href="mailto:hello@havanaclub.fi"
          className="inline-block bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-semibold hover:bg-[#a87820] transition-colors"
        >
          Email Us
        </a>
        <div className="mt-4">
          <Link href="/contact" className="text-sm text-[#9a8a72] hover:text-[#c8932a] transition-colors">
            Or visit our Contact page →
          </Link>
        </div>
      </div>
    </div>
  )
}
