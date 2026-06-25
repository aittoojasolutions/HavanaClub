'use client'
import { useState, useEffect, useRef } from 'react'
import { useAdmin } from '../layout'

interface SalaryTier { min: number; max: number; pay: number }

interface ClassRow {
  id: string
  date: string
  instructor: string
  title: string
  style: string
  attendees: number
  pay: number
  month: string
}

interface MonthSummary {
  month: string
  classes: ClassRow[]
  totalPay: number
  totalAttendees: number
}

interface InstructorData {
  instructor: string
  months: Record<string, MonthSummary>
  allTimeTotal: number
}

interface SalaryData {
  tiers: SalaryTier[]
  instructors: InstructorData[]
  allMonths: string[]
}

function monthLabel(ym: string) {
  const [y, m] = ym.split('-').map(Number)
  return new Date(y, m - 1).toLocaleString('en', { month: 'long', year: 'numeric' })
}

function tierColor(pay: number) {
  if (pay >= 60) return 'text-green-400 bg-green-900/20 border-green-700/30'
  if (pay >= 45) return 'text-[#c8932a] bg-[#c8932a]/10 border-[#c8932a]/20'
  if (pay >= 32) return 'text-yellow-400 bg-yellow-900/20 border-yellow-700/30'
  return 'text-[#9a8a72] bg-[#141008] border-[#2a1f10]'
}

function TierTable({ tiers }: { tiers: SalaryTier[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#2a1f10]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#141008] border-b border-[#2a1f10]">
            <th className="text-left px-4 py-2.5 text-[#9a8a72] font-medium text-xs uppercase tracking-wide">Attendees</th>
            <th className="text-left px-4 py-2.5 text-[#9a8a72] font-medium text-xs uppercase tracking-wide">Pay per class</th>
            <th className="text-left px-4 py-2.5 text-[#9a8a72] font-medium text-xs uppercase tracking-wide hidden sm:table-cell">Notes</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => (
            <tr key={i} className="border-b border-[#2a1f10]/50 last:border-0">
              <td className="px-4 py-3 text-[#f5f0e8] font-medium">
                {t.max === Infinity ? `${t.min}+` : `${t.min}–${t.max}`}
              </td>
              <td className="px-4 py-3">
                <span className={`text-sm font-bold px-2.5 py-1 rounded-lg border ${tierColor(t.pay)}`}>
                  €{t.pay}
                </span>
              </td>
              <td className="px-4 py-3 text-[#9a8a72] text-xs hidden sm:table-cell">
                {t.pay === 60 ? '🏆 Maximum rate' : t.pay >= 45 ? 'High attendance' : t.pay >= 32 ? 'Growing class' : 'Starting out'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PrintableReport({ instructor, month, summary }: {
  instructor: string
  month: string
  summary: MonthSummary
}) {
  const ref = useRef<HTMLDivElement>(null)

  function print() {
    const w = window.open('', '_blank')
    if (!w || !ref.current) return
    w.document.write(`
      <html><head><title>${instructor} — ${monthLabel(month)}</title>
      <style>
        body { font-family: system-ui, sans-serif; color: #1a1a1a; padding: 32px; max-width: 700px; margin: 0 auto; }
        h1 { font-size: 22px; margin-bottom: 4px; }
        .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
        table { width: 100%; border-collapse: collapse; font-size: 13px; }
        th { text-align: left; padding: 8px 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-size: 11px; text-transform: uppercase; letter-spacing: .05em; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; background: #f9f9f9; }
        .pay { font-weight: bold; }
        .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #ddd; font-size: 11px; color: #999; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        .badge-salsa { background: #fff3e0; color: #e65100; }
        .badge-bachata { background: #f3e5f5; color: #6a1b9a; }
      </style></head><body>
      <h1>Salary Report — ${instructor}</h1>
      <div class="sub">${monthLabel(month)} · Havana Club Dance Studio</div>
      <table>
        <thead><tr><th>Date</th><th>Class</th><th>Style</th><th>Attendees</th><th>Pay</th></tr></thead>
        <tbody>
          ${summary.classes.map(c => `
            <tr>
              <td>${new Date(c.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
              <td>${c.title}</td>
              <td><span class="badge badge-${c.style}">${c.style}</span></td>
              <td>${c.attendees}</td>
              <td class="pay">€${c.pay}</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="3">TOTAL</td>
            <td>${summary.totalAttendees} attendees</td>
            <td class="pay">€${summary.totalPay}</td>
          </tr>
        </tbody>
      </table>
      <div class="footer">Generated ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} · Havana Club</div>
      </body></html>
    `)
    w.document.close()
    w.print()
  }

  return (
    <div ref={ref}>
      <button onClick={print}
        className="flex items-center gap-1.5 text-xs text-[#9a8a72] hover:text-[#c8932a] border border-[#2a1f10] hover:border-[#c8932a]/30 rounded-lg px-3 py-1.5 transition-colors">
        🖨 Print / PDF
      </button>
    </div>
  )
}

function InstructorCard({ data, selectedMonth }: { data: InstructorData; selectedMonth: string }) {
  const [expanded, setExpanded] = useState(false)

  const monthsToShow = selectedMonth
    ? Object.values(data.months).filter(m => m.month === selectedMonth)
    : Object.values(data.months).sort((a, b) => b.month.localeCompare(a.month))

  const displayMonth = monthsToShow[0]
  const totalClasses = Object.values(data.months).reduce((s, m) => s + m.classes.length, 0)

  // Initials avatar
  const initials = data.instructor.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  if (monthsToShow.length === 0) return null

  return (
    <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-[#c8932a]/15 border border-[#c8932a]/30 flex items-center justify-center text-[#c8932a] font-bold text-sm flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-[#f5f0e8]">{data.instructor}</div>
          <div className="text-xs text-[#9a8a72]">{totalClasses} classes total</div>
        </div>
        {/* Month total */}
        {selectedMonth && displayMonth && (
          <div className="text-right">
            <div className="text-2xl font-bold text-[#c8932a]">€{displayMonth.totalPay}</div>
            <div className="text-xs text-[#9a8a72]">{displayMonth.classes.length} class{displayMonth.classes.length !== 1 ? 'es' : ''}</div>
          </div>
        )}
        {!selectedMonth && (
          <div className="text-right">
            <div className="text-lg font-bold text-[#f5f0e8]">€{data.allTimeTotal}</div>
            <div className="text-xs text-[#9a8a72]">all time (shown)</div>
          </div>
        )}
      </div>

      {/* Month reports */}
      {monthsToShow.map(summary => (
        <div key={summary.month} className="border-t border-[#2a1f10]">
          {/* Month header */}
          <div className="px-5 py-3 flex items-center justify-between bg-[#0d0b07]">
            <div className="flex items-center gap-3">
              <button onClick={() => setExpanded(e => !e)}
                className="text-sm font-semibold text-[#f5f0e8] hover:text-[#c8932a] transition-colors flex items-center gap-2">
                <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {monthLabel(summary.month)}
              </button>
              <span className="text-xs text-[#9a8a72]">{summary.classes.length} class{summary.classes.length !== 1 ? 'es' : ''} · {summary.totalAttendees} attendees</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-[#c8932a]">€{summary.totalPay}</span>
              <PrintableReport instructor={data.instructor} month={summary.month} summary={summary} />
            </div>
          </div>

          {/* Class rows */}
          {expanded && (
            <div className="border-t border-[#2a1f10]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2a1f10]">
                    <th className="text-left px-5 py-2 text-[#9a8a72] text-xs font-medium">Date</th>
                    <th className="text-left px-3 py-2 text-[#9a8a72] text-xs font-medium">Class</th>
                    <th className="text-left px-3 py-2 text-[#9a8a72] text-xs font-medium hidden sm:table-cell">Style</th>
                    <th className="text-right px-3 py-2 text-[#9a8a72] text-xs font-medium">Attendees</th>
                    <th className="text-right px-5 py-2 text-[#9a8a72] text-xs font-medium">Pay</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.classes
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map(cls => (
                    <tr key={cls.id} className="border-b border-[#2a1f10]/40 last:border-0 hover:bg-[#0a0805]/50">
                      <td className="px-5 py-2.5 text-[#9a8a72] text-xs whitespace-nowrap">
                        {new Date(cls.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-[#f5f0e8]">{cls.title}</td>
                      <td className="px-3 py-2.5 hidden sm:table-cell">
                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cls.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
                          {cls.style}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border text-xs ${tierColor(cls.pay)}`}>
                          {cls.attendees}
                        </span>
                      </td>
                      <td className="px-5 py-2.5 text-right font-bold text-[#c8932a]">€{cls.pay}</td>
                    </tr>
                  ))}
                  {/* Month subtotal */}
                  <tr className="bg-[#0d0b07] font-bold">
                    <td className="px-5 py-3 text-[#9a8a72] text-xs">Total</td>
                    <td className="px-3 py-3" />
                    <td className="px-3 py-3 hidden sm:table-cell" />
                    <td className="px-3 py-3 text-right text-[#f5f0e8]">{summary.totalAttendees}</td>
                    <td className="px-5 py-3 text-right text-[#c8932a] text-lg">€{summary.totalPay}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function SalaryPage() {
  const { password } = useAdmin()
  const [data, setData] = useState<SalaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedInstructor, setSelectedInstructor] = useState('')

  useEffect(() => {
    if (!password) return
    const params = selectedMonth ? `?month=${selectedMonth}` : ''
    fetch(`/api/admin/salary${params}`, { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [password, selectedMonth])

  const instructors = data?.instructors ?? []
  const visible = selectedInstructor
    ? instructors.filter(i => i.instructor === selectedInstructor)
    : instructors

  // Summary for selected month across all instructors
  const monthTotal = selectedMonth
    ? instructors.reduce((sum, i) => sum + (i.months[selectedMonth]?.totalPay ?? 0), 0)
    : null

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Instructor Salary</h1>
        <p className="text-[#9a8a72] text-sm mt-0.5">
          Pay is calculated per class based on attendance. Use the filters to generate monthly reports.
        </p>
      </div>

      {/* ── Salary Tier Table ─────────────────────────────────────────── */}
      <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
        <h2 className="font-bold mb-1">Pay Scale</h2>
        <p className="text-xs text-[#9a8a72] mb-4">
          Each class is paid individually based on confirmed attendees that session.
        </p>
        {data ? <TierTable tiers={data.tiers} /> : (
          <div className="animate-pulse h-40 bg-[#0a0805] rounded-xl" />
        )}
        <p className="text-xs text-[#9a8a72] mt-3">
          To adjust rates, update <code className="bg-[#0a0805] px-1 rounded">SALARY_TIERS</code> in{' '}
          <code className="bg-[#0a0805] px-1 rounded">app/api/admin/salary/route.ts</code>
        </p>
      </div>

      {/* ── Filters ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Month</label>
          <select value={selectedMonth} onChange={e => { setSelectedMonth(e.target.value); setLoading(true) }}
            className="bg-[#141008] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm">
            <option value="">All months (last 6)</option>
            {data?.allMonths.map(m => (
              <option key={m} value={m}>{monthLabel(m)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-[#9a8a72] mb-1">Instructor</label>
          <select value={selectedInstructor} onChange={e => setSelectedInstructor(e.target.value)}
            className="bg-[#141008] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm">
            <option value="">All instructors</option>
            {instructors.map(i => (
              <option key={i.instructor} value={i.instructor}>{i.instructor}</option>
            ))}
          </select>
        </div>

        {/* Month total summary */}
        {selectedMonth && monthTotal !== null && (
          <div className="ml-auto bg-[#c8932a]/10 border border-[#c8932a]/30 rounded-xl px-5 py-2 text-right">
            <div className="text-xs text-[#9a8a72]">Total payroll — {monthLabel(selectedMonth)}</div>
            <div className="text-2xl font-bold text-[#c8932a]">€{monthTotal}</div>
          </div>
        )}
      </div>

      {/* ── Instructor cards ──────────────────────────────────────────── */}
      {loading ? (
        <div className="flex justify-center py-16">
          <svg className="animate-spin h-7 w-7 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </div>
      ) : visible.length === 0 ? (
        <div className="text-center text-[#9a8a72] py-16 bg-[#141008] border border-[#2a1f10] rounded-2xl">
          No class data yet. Classes with instructors will appear here once scheduled and attended.
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map(inst => (
            <InstructorCard key={inst.instructor} data={inst} selectedMonth={selectedMonth} />
          ))}
        </div>
      )}

    </div>
  )
}
