import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-[#2a1f10] bg-[#141008] mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="text-xl font-bold text-[#c8932a] tracking-wider mb-3">HAVANA CLUB</div>
          <p className="text-[#9a8a72] text-sm leading-relaxed">
            Salsa & Bachata classes for all levels. Join our vibrant dance community.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm tracking-wide uppercase text-[#9a8a72]">Quick Links</div>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/classes', 'Schedule'], ['/pricing', 'Pricing'], ['/subscriptions', 'Memberships']].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-[#9a8a72] hover:text-[#c8932a] transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3 text-sm tracking-wide uppercase text-[#9a8a72]">Contact</div>
          <ul className="space-y-2 text-sm text-[#9a8a72]">
            <li>📍 123 Dance Street, Helsinki</li>
            <li>✉️ hello@havanaclub.fi</li>
            <li>📸 <a href="#" className="hover:text-[#c8932a] transition-colors">@havanaclub.fi</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#2a1f10] text-center py-4 text-xs text-[#9a8a72]">
        © {new Date().getFullYear()} Havana Club Dance Studio. All rights reserved.
      </div>
    </footer>
  )
}
