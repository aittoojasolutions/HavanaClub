'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const links = [
  { href: '/classes', label: 'Schedule' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/subscriptions', label: 'Memberships' },
]

export default function Nav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#2a1f10] bg-[#0a0805]/95 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-wider text-[#c8932a]">
          HAVANA CLUB
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm font-medium transition-colors hover:text-[#c8932a] ${
                pathname === l.href ? 'text-[#c8932a]' : 'text-[#9a8a72]'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/classes"
            className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#a87820] transition-colors"
          >
            Book a Class
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-[#9a8a72]" onClick={() => setOpen(!open)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            }
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-[#0a0805] border-t border-[#2a1f10] px-4 py-4 flex flex-col gap-4">
          {links.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="text-[#9a8a72] hover:text-[#c8932a] font-medium">
              {l.label}
            </Link>
          ))}
          <Link href="/classes" onClick={() => setOpen(false)}
            className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-md text-sm font-semibold text-center">
            Book a Class
          </Link>
        </div>
      )}
    </nav>
  )
}
