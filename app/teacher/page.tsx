'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

interface Teacher {
  id: string; name: string; email: string; phone: string; bio: string; photo_url: string; is_active: boolean
}
interface UpcomingClass {
  id: string; date: string; title: string; style: string; taken: number; capacity: number
}
interface SalaryMonth {
  month: string
  totalPay: number
  classes: { date: string; title: string; style: string; attendees: number; pay: number }[]
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1).toLocaleString('en', { month: 'long', year: 'numeric' })
}

function SalaryCard({ month }: { month: SalaryMonth }) {
  const [open, setOpen] = useState(false)
  const isCurrentMonth = month.month === new Date().toISOString().slice(0, 7)

  return (
    <div className={`bg-[#141008] border rounded-2xl overflow-hidden ${isCurrentMonth ? 'border-[#c8932a]/30' : 'border-[#2a1f10]'}`}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-[#0d0b07] transition-colors">
        <div className="flex items-center gap-3">
          <svg className={`w-4 h-4 text-[#9a8a72] transition-transform ${open ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <div className="font-semibold text-[#f5f0e8] flex items-center gap-2">
              {monthLabel(month.month)}
              {isCurrentMonth && <span className="text-xs bg-[#c8932a]/20 text-[#c8932a] border border-[#c8932a]/20 px-2 py-0.5 rounded-full">Current</span>}
            </div>
            <div className="text-xs text-[#9a8a72]">{month.classes.length} class{month.classes.length !== 1 ? 'es' : ''} taught</div>
          </div>
        </div>
        <div className="text-2xl font-bold text-[#c8932a]">€{month.totalPay}</div>
      </button>

      {open && (
        <div className="border-t border-[#2a1f10]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a1f10]">
                <th className="text-left px-5 py-2 text-[#9a8a72] text-xs font-medium">Date</th>
                <th className="text-left px-3 py-2 text-[#9a8a72] text-xs font-medium">Class</th>
                <th className="text-right px-3 py-2 text-[#9a8a72] text-xs font-medium">Attendees</th>
                <th className="text-right px-5 py-2 text-[#9a8a72] text-xs font-medium">Pay</th>
              </tr>
            </thead>
            <tbody>
              {month.classes.sort((a, b) => a.date.localeCompare(b.date)).map((c, i) => (
                <tr key={i} className="border-b border-[#2a1f10]/40 last:border-0">
                  <td className="px-5 py-2.5 text-[#9a8a72] text-xs whitespace-nowrap">
                    {new Date(c.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
                        {c.style[0].toUpperCase()}
                      </span>
                      <span className="text-[#f5f0e8] font-medium">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-right text-[#9a8a72]">{c.attendees}</td>
                  <td className="px-5 py-2.5 text-right font-bold text-[#c8932a]">€{c.pay}</td>
                </tr>
              ))}
              <tr className="bg-[#0d0b07]">
                <td colSpan={3} className="px-5 py-2.5 font-bold text-xs text-[#9a8a72]">Total</td>
                <td className="px-5 py-2.5 text-right font-bold text-[#c8932a] text-lg">€{month.totalPay}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function TeacherPortal() {
  const router = useRouter()
  const [teacher, setTeacher] = useState<Teacher | null>(null)
  const [upcoming, setUpcoming] = useState<UpcomingClass[]>([])
  const [salary, setSalary] = useState<SalaryMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'schedule' | 'salary'>('schedule')

  useEffect(() => {
    fetch('/api/teacher/me')
      .then(r => { if (r.status === 401) { router.push('/teacher/login'); return null } return r.json() })
      .then(d => {
        if (!d) return
        setTeacher(d.teacher)
        setUpcoming(d.upcoming ?? [])
        setSalary(d.salary ?? [])
        setLoading(false)
      })
  }, [router])

  async function signOut() {
    await fetch('/api/teacher/auth', { method: 'DELETE' })
    router.push('/teacher/login')
  }

  if (loading) return (
    <div className="pt-20 flex justify-center py-24">
      <svg className="animate-spin h-8 w-8 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (!teacher) return null

  const initials = teacher.name.trim().split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)
  const currentMonth = new Date().toISOString().slice(0, 7)
  const currentSalary = salary.find(s => s.month === currentMonth)

  return (
    <div className="pt-16 min-h-screen bg-[#0a0805]">
      {/* Top bar */}
      <div className="bg-[#141008] border-b border-[#2a1f10] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-[#c8932a] font-bold tracking-wider text-sm">HAVANA CLUB</Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {teacher.photo_url ? (
                <div className="w-7 h-7 rounded-full overflow-hidden">
                  <Image src={teacher.photo_url} alt={teacher.name} width={28} height={28} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#c8932a]/15 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xs font-bold">
                  {initials}
                </div>
              )}
              <span className="text-sm text-[#f5f0e8] font-medium">{teacher.name.split(' ')[0]}</span>
            </div>
            <button onClick={signOut} className="text-xs text-[#9a8a72] hover:text-red-400 transition-colors">Sign out</button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

        {/* Welcome + this month summary */}
        <div className="bg-[#141008] border border-[#c8932a]/20 rounded-2xl p-6 flex items-center gap-5">
          {teacher.photo_url ? (
            <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
              <Image src={teacher.photo_url} alt={teacher.name} width={64} height={64} className="object-cover w-full h-full" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#c8932a]/15 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] text-xl font-bold flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-[#9a8a72] mb-0.5">Welcome back</div>
            <div className="text-xl font-bold">{teacher.name}</div>
            <div className="text-[#9a8a72] text-sm">{teacher.email}</div>
          </div>
          {currentSalary ? (
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-[#9a8a72]">This month</div>
              <div className="text-3xl font-bold text-[#c8932a]">€{currentSalary.totalPay}</div>
              <div className="text-xs text-[#9a8a72]">{currentSalary.classes.length} classes</div>
            </div>
          ) : (
            <div className="text-right flex-shrink-0">
              <div className="text-xs text-[#9a8a72]">This month</div>
              <div className="text-2xl font-bold text-[#9a8a72]">€0</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#141008] border border-[#2a1f10] rounded-xl p-1 w-fit">
          {(['schedule', 'salary'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-[#c8932a] text-[#0a0805]' : 'text-[#9a8a72] hover:text-[#f5f0e8]'
              }`}>
              {t === 'schedule' ? '📅 Schedule' : '💶 Salary'}
            </button>
          ))}
        </div>

        {/* Schedule tab */}
        {tab === 'schedule' && (
          <div className="space-y-4">
            <h2 className="font-bold text-lg">Upcoming Classes</h2>
            {upcoming.length === 0 ? (
              <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-10 text-center text-[#9a8a72]">
                No upcoming classes scheduled yet.
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map(cls => {
                  const fillPct = cls.capacity > 0 ? Math.round((cls.taken / cls.capacity) * 100) : 0
                  const daysAway = Math.ceil((new Date(cls.date + 'T00:00:00').getTime() - new Date().getTime()) / 86400000)
                  return (
                    <div key={cls.id} className="bg-[#141008] border border-[#2a1f10] rounded-xl px-5 py-4 flex items-center gap-4">
                      <div className="text-center w-12 flex-shrink-0">
                        <div className="text-xs text-[#9a8a72]">
                          {new Date(cls.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-bold text-[#f5f0e8] leading-none">
                          {new Date(cls.date + 'T00:00:00').getDate()}
                        </div>
                        <div className="text-xs text-[#9a8a72]">
                          {new Date(cls.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' })}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cls.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
                            {cls.style}
                          </span>
                          <span className="font-semibold text-[#f5f0e8]">{cls.title}</span>
                        </div>
                        {/* Fill bar */}
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-[#2a1f10] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${fillPct >= 80 ? 'bg-green-400' : fillPct >= 50 ? 'bg-[#c8932a]' : 'bg-red-400'}`}
                              style={{ width: `${fillPct}%` }} />
                          </div>
                          <span className="text-xs text-[#9a8a72] w-16 text-right">{cls.taken}/{cls.capacity} signed up</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {daysAway === 0 && <div className="text-xs font-bold text-[#c8932a]">Today</div>}
                        {daysAway === 1 && <div className="text-xs font-bold text-[#c8932a]">Tomorrow</div>}
                        {daysAway > 1 && <div className="text-xs text-[#9a8a72]">in {daysAway}d</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Salary tab */}
        {tab === 'salary' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg">Salary History</h2>
              <div className="text-xs text-[#9a8a72]">Pay is per class based on attendance</div>
            </div>

            {/* Pay scale reference */}
            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-4">
              <div className="text-xs text-[#9a8a72] uppercase tracking-widest font-semibold mb-2">Your Pay Scale</div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[
                  { label: '0–4', pay: 20 }, { label: '5–8', pay: 25 }, { label: '9–12', pay: 32 },
                  { label: '13–16', pay: 38 }, { label: '17–20', pay: 45 }, { label: '21–22', pay: 52 },
                  { label: '23+', pay: 60 },
                ].map(t => (
                  <div key={t.label} className="text-center bg-[#0a0805] rounded-lg px-2 py-2">
                    <div className="text-xs text-[#9a8a72]">{t.label}</div>
                    <div className={`text-sm font-bold ${t.pay === 60 ? 'text-green-400' : t.pay >= 45 ? 'text-[#c8932a]' : 'text-[#f5f0e8]'}`}>€{t.pay}</div>
                  </div>
                ))}
              </div>
            </div>

            {salary.length === 0 ? (
              <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-10 text-center text-[#9a8a72]">
                No past classes recorded yet.
              </div>
            ) : (
              <div className="space-y-3">
                {salary.map(m => <SalaryCard key={m.month} month={m} />)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
