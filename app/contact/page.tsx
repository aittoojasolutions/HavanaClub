import Link from 'next/link'
import { MapPin, Train, Parking, Mail } from '@/components/Icons'

const locations = [
  {
    name: 'Sörnäinen Studio',
    address: 'Sörnäisten rantatie 33C',
    postcode: '00500',
    city: 'Helsinki',
    mapSrc: 'https://maps.google.com/maps?q=S%C3%B6rn%C3%A4isten+rantatie+33C%2C+00500+Helsinki&output=embed&z=15',
    mapsLink: 'https://maps.google.com/?q=Sörnäisten+rantatie+33C,+00500+Helsinki',
    transport: 'Sörnäinen metro station · 5 min walk',
    parking: 'Street parking on Sörnäisten rantatie',
  },
]

export default function ContactPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-14">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Find Us</p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Studio Locations</h1>
        <p className="text-[#9a8a72] text-lg max-w-xl mx-auto">
          We bring Habana Club to multiple locations across Helsinki — find the one that works best for you.
        </p>
      </div>

      {/* Locations */}
      <div className="space-y-12">
        {locations.map(loc => (
          <div key={loc.name} className="bg-[#141008] border border-[#2a1f10] rounded-2xl overflow-hidden">
            {/* Map */}
            <div className="w-full h-72 md:h-96">
              <iframe
                src={loc.mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={`Map for ${loc.name}`}
              />
            </div>

            {/* Info */}
            <div className="p-7 grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-2xl font-bold mb-1">{loc.name}</h2>
                <p className="text-[#c8932a] text-sm font-semibold mb-4">Open Now</p>
                <div className="space-y-3 text-sm text-[#9a8a72]">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c8932a]" />
                    <div>
                      <div className="text-[#f5f0e8] font-medium">{loc.address}</div>
                      <div>{loc.postcode} {loc.city}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Train className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c8932a]" />
                    <div>{loc.transport}</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Parking className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c8932a]" />
                    <div>{loc.parking}</div>
                  </div>
                </div>
                <a
                  href={loc.mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-5 bg-[#c8932a] text-[#0a0805] px-5 py-2.5 rounded-md text-sm font-semibold hover:bg-[#a87820] transition-colors"
                >
                  Open in Google Maps
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-5">
                  <h3 className="font-semibold mb-3 text-sm">Class Schedule at This Location</h3>
                  <p className="text-[#9a8a72] text-sm mb-3">All classes are held at Sörnäinen. See the full weekly schedule for times.</p>
                  <Link href="/classes" className="text-[#c8932a] text-sm font-semibold hover:underline">
                    View schedule →
                  </Link>
                </div>
                <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-5">
                  <h3 className="font-semibold mb-3 text-sm">First time here?</h3>
                  <p className="text-[#9a8a72] text-sm mb-3">Try a Cuban Salsa or Bachata class for just €10. No experience or partner needed.</p>
                  <Link href="/first-timers" className="text-[#c8932a] text-sm font-semibold hover:underline">
                    Book a trial class →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* More locations coming soon */}
      <div className="mt-10 bg-[#141008] border border-dashed border-[#2a1f10] rounded-2xl p-8 text-center">
        <MapPin className="w-8 h-8 mb-3 mx-auto text-[#c8932a]/50" />
        <h3 className="text-lg font-bold mb-2">More locations coming</h3>
        <p className="text-[#9a8a72] text-sm max-w-sm mx-auto">
          We&apos;re expanding across Helsinki. Sign up to be notified when a new studio opens near you.
        </p>
      </div>

      {/* Contact info */}
      <div className="mt-14 grid md:grid-cols-2 gap-6">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-7">
          <h3 className="font-bold text-lg mb-4">Get in touch</h3>
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 text-[#9a8a72]">
              <Mail className="w-5 h-5 flex-shrink-0 text-[#c8932a]" />
              <div>
                <div className="text-xs uppercase tracking-wider text-[#c8932a] font-semibold mb-0.5">Email</div>
                <a href="mailto:hello@havanaclub.fi" className="hover:text-[#f5f0e8] transition-colors">
                  hello@havanaclub.fi
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-7">
          <h3 className="font-bold text-lg mb-4">Quick answers</h3>
          <p className="text-[#9a8a72] text-sm mb-4">
            Common questions about dress code, parking, levels, and booking are covered in our FAQ.
          </p>
          <Link href="/faq"
            className="inline-block border border-[#2a1f10] hover:border-[#c8932a]/50 text-[#9a8a72] hover:text-[#c8932a] px-5 py-2.5 rounded-md text-sm font-semibold transition-colors">
            Read the FAQ →
          </Link>
        </div>
      </div>
    </div>
  )
}
