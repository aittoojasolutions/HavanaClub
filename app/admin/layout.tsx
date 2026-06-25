'use client'
import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const AdminCtx = createContext<{ password: string }>({ password: '' })
export const useAdmin = () => useContext(AdminCtx)

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState('')
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_pw')
    if (saved) setPassword(saved)
  }, [])

  async function verify() {
    const res = await fetch('/api/admin/classes', {
      headers: { 'x-admin-password': input },
    })
    if (res.ok) {
      sessionStorage.setItem('admin_pw', input)
      setPassword(input)
    } else {
      setError(true)
    }
  }

  if (!password) {
    return (
      <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
        <div className="max-w-sm w-full">
          <div className="text-center mb-8">
            <div className="text-3xl mb-2">🔒</div>
            <h1 className="text-2xl font-bold">Admin Access</h1>
          </div>
          <div className="space-y-4">
            <input type="password" value={input} onChange={e => { setInput(e.target.value); setError(false) }}
              placeholder="Admin password"
              onKeyDown={e => e.key === 'Enter' && verify()}
              className="w-full bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-3 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none" />
            {error && <div className="text-red-400 text-sm text-center">Incorrect password</div>}
            <button onClick={verify}
              className="w-full bg-[#c8932a] text-[#0a0805] py-3 rounded-lg font-bold hover:bg-[#a87820] transition-colors">
              Enter Admin
            </button>
          </div>
        </div>
      </div>
    )
  }

  const navLinks = [
    ['/admin', 'Dashboard'],
    ['/admin/analytics', 'Analytics'],
    ['/admin/teachers', 'Teachers'],
    ['/admin/events', 'Events'],
    ['/admin/classes', 'Manage Classes'],
    ['/admin/trial-classes', 'Trial Classes'],
    ['/admin/members', 'Members'],
    ['/admin/salary', 'Salary'],
  ]

  return (
    <AdminCtx.Provider value={{ password }}>
      <div className="pt-16 min-h-screen">
        <div className="bg-[#141008] border-b border-[#2a1f10] px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center gap-6">
            <div className="text-[#c8932a] font-bold text-sm uppercase tracking-widest">Admin</div>
            {navLinks.map(([href, label]) => (
              <Link key={href} href={href}
                className={`text-sm font-medium ${pathname === href ? 'text-[#c8932a]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'}`}>
                {label}
              </Link>
            ))}
            <button onClick={() => { sessionStorage.removeItem('admin_pw'); setPassword('') }}
              className="ml-auto text-xs text-[#9a8a72] hover:text-red-400">
              Logout
            </button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">{children}</div>
      </div>
    </AdminCtx.Provider>
  )
}
