import Link from 'next/link'
import { MapPin, Mail } from '@/components/Icons'

export default function Footer() {
  return (
    <footer className="border-t border-[#2a1f10] bg-[#141008] mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1">
          <div className="text-xl font-bold text-[#c8932a] tracking-wider mb-3">HAVANA CLUB</div>
          <p className="text-[#9a8a72] text-sm leading-relaxed">
            Salsa & Bachata classes for all levels in Helsinki. Join our vibrant dance community.
          </p>
        </div>

        <div>
          <div className="font-semibold mb-4 text-xs tracking-widest uppercase text-[#9a8a72]">Classes</div>
          <ul className="space-y-2 text-sm">
            {[
              ['/first-timers', 'Trial Class — €10'],
              ['/classes', 'Schedule'],
              ['/pricing', 'Pricing'],
              ['/subscriptions', 'Memberships'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-[#9a8a72] hover:text-[#c8932a] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-4 text-xs tracking-widest uppercase text-[#9a8a72]">Studio</div>
          <ul className="space-y-2 text-sm">
            {[
              ['/about', 'About Us'],
              ['/styles', 'Dance Styles'],
              ['/teachers', 'Our Team'],
              ['/events', 'Events'],
              ['/faq', 'FAQ'],
              ['/contact', 'Contact & Locations'],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-[#9a8a72] hover:text-[#c8932a] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="font-semibold mb-4 text-xs tracking-widest uppercase text-[#9a8a72]">Contact</div>
          <ul className="space-y-3 text-sm text-[#9a8a72]">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#c8932a]" />
              <span>Sörnäisten rantatie 33C<br />00500 Helsinki</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 flex-shrink-0 text-[#c8932a]" />
              <a href="mailto:hello@havanaclub.fi" className="hover:text-[#c8932a] transition-colors">
                hello@havanaclub.fi
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a1f10] py-4 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#9a8a72]">
        <span>© {new Date().getFullYear()} Havana Club Dance Studio. All rights reserved.</span>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-[#c8932a] transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-[#c8932a] transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
