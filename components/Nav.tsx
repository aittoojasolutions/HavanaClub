'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

const links = [
  { href: '/first-timers', label: 'First Timers' },
  { href: '/classes', label: 'Schedule' },
  { href: '/styles', label: 'Dance Styles' },
  { href: '/events', label: 'Events' },
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/contact', label: 'Contact' },
]

export default function Nav() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<{ email: string; initials: string; name: string } | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user?.email) return
      // Try to get name from customers table
      const res = await fetch(`/api/customer?email=${encodeURIComponent(user.email)}`)
      const data = await res.json()
      const name = data.customer?.name || user.email.split('@')[0]
      const parts = name.trim().split(' ')
      const initials = parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase()
      setUser({ email: user.email, initials, name })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
  }

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

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(d => !d)}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/40 flex items-center justify-center text-[#c8932a] text-xs font-bold group-hover:border-[#c8932a] transition-colors">
                  {user.initials}
                </div>
                <span className="text-sm text-[#9a8a72] group-hover:text-[#f5f0e8] transition-colors">
                  {user.name.split(' ')[0]}
                </span>
                <svg className={`w-3 h-3 text-[#9a8a72] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 top-10 z-20 bg-[#141008] border border-[#2a1f10] rounded-xl shadow-2xl py-1 w-44">
                    <Link href="/dashboard" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#9a8a72] hover:text-[#f5f0e8] hover:bg-[#2a1f10]/50 transition-colors">
                      <span>📋</span> My Dashboard
                    </Link>
                    <div className="border-t border-[#2a1f10] my-1" />
                    <button onClick={signOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#9a8a72] hover:text-red-300 hover:bg-[#2a1f10]/50 transition-colors text-left">
                      <span>→</span> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-[#9a8a72] hover:text-[#c8932a] transition-colors"
            >
              Sign In
            </Link>
          )}

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
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="text-[#9a8a72] hover:text-[#c8932a] font-medium flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#c8932a]/20 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs font-bold">
                  {user.initials}
                </div>
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={() => { signOut(); setOpen(false) }}
                className="text-[#9a8a72] hover:text-red-300 font-medium text-left">
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/login" onClick={() => setOpen(false)}
              className="text-[#9a8a72] hover:text-[#c8932a] font-medium">
              Sign In
            </Link>
          )}
          <Link href="/classes" onClick={() => setOpen(false)}
            className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-md text-sm font-semibold text-center">
            Book a Class
          </Link>
        </div>
      )}
    </nav>
  )
}
