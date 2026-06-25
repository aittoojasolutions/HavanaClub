'use client'
import { useState, useEffect } from 'react'
import { useAdmin } from '../layout'

interface Analytics {
  snapshot: {
    totalMembers: number
    activeMembers: number
    mrr: number
    dropInRevenue30d: number
    atRiskCount: number
    avgClassesPerActive: string
  }
  segments: {
    subscribers: number
    packHolders: number
    dropInOnly: number
    subsByTier: { tier: number; count: number }[]
  }
  funnel: {
    trialSignups: number
    trialConverted: number
    conversionRate: number
    trialSignupsLast30: number
  }
  trends: {
    newMembersPerMonth: { month: string; count: number }[]
    bookingsPerMonth: { month: string; drop_in: number; pack: number; subscription: number }[]
  }
  retention: {
    atRisk: { name: string; email: string; tier: number | null; credits: number; lastBooking: string | null; daysSince: number | null }[]
    neverBooked: { name: string; email: string; tier: number | null; credits: number }[]
    lowCredits: { name: string; email: string; credits: number }[]
  }
  classes: {
    fillRates: { title: string; style: string; avgFill: number; count: number }[]
    profitability: {
      instanceId: string; date: string; title: string; style: string; instructor: string
      capacity: number; attendees: number; fillPct: number
      revenue: number; instructorCost: number; profit: number; margin: number | null
      bookingMix: { drop_in: number; pack: number; subscription: number }
    }[]
  }
}

// ─── Mini bar chart ───────────────────────────────────────────────────────────

function BarChart({ data, keys, colors, height = 120 }: {
  data: Record<string, number | string>[]
  keys: string[]
  colors: string[]
  height?: number
}) {
  const maxVal = Math.max(...data.map(d => keys.reduce((s, k) => s + (Number(d[k]) || 0), 0)), 1)
  return (
    <div className="flex items-end gap-1" style={{ height }}>
      {data.map((d, i) => {
        const total = keys.reduce((s, k) => s + (Number(d[k]) || 0), 0)
        return (
          <div key={i} className="flex-1 flex flex-col justify-end gap-0.5 group relative">
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#0a0805] border border-[#2a1f10] rounded-lg px-2 py-1 text-xs text-[#f5f0e8] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {keys.map((k, ki) => (
                <div key={k}><span style={{ color: colors[ki] }}>■</span> {k}: {Number(d[k]) || 0}</div>
              ))}
            </div>
            {keys.map((k, ki) => {
              const val = Number(d[k]) || 0
              const pct = (val / maxVal) * 100
              return pct > 0 ? (
                <div key={k} style={{ height: `${pct}%`, backgroundColor: colors[ki] }}
                  className="rounded-sm min-h-[2px] transition-all" />
              ) : null
            })}
            <div className="text-[9px] text-[#9a8a72] text-center mt-1 truncate">
              {String(d.month || d.label || '').slice(5)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Donut chart ─────────────────────────────────────────────────────────────

function DonutChart({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0)
  if (total === 0) return <div className="text-[#9a8a72] text-sm text-center py-4">No data yet</div>

  let offset = 0
  const r = 40, cx = 56, cy = 56, circumference = 2 * Math.PI * r

  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 112 112" className="w-24 h-24 flex-shrink-0">
        {segments.map((seg, i) => {
          const pct = seg.value / total
          const dash = pct * circumference
          const gap = circumference - dash
          const rotation = offset * 360 - 90
          offset += pct
          return (
            <circle key={i} r={r} cx={cx} cy={cy} fill="none"
              stroke={seg.color} strokeWidth="18"
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={0}
              transform={`rotate(${rotation} ${cx} ${cy})`}
            />
          )
        })}
        <circle r={28} cx={cx} cy={cy} fill="#0a0805" />
        <text x={cx} y={cy + 5} textAnchor="middle" fill="#f5f0e8" fontSize="13" fontWeight="bold">{total}</text>
      </svg>
      <div className="space-y-1.5 flex-1">
        {segments.map(seg => (
          <div key={seg.label} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-[#9a8a72]">{seg.label}</span>
            </div>
            <span className="font-bold text-[#f5f0e8]">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Funnel ───────────────────────────────────────────────────────────────────

function Funnel({ steps }: { steps: { label: string; value: number; color: string }[] }) {
  const max = steps[0]?.value || 1
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={step.label}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-[#9a8a72]">{step.label}</span>
            <div className="flex items-center gap-2">
              {i > 0 && steps[i - 1].value > 0 && (
                <span className="text-xs text-[#9a8a72]">
                  {Math.round((step.value / steps[i - 1].value) * 100)}%
                </span>
              )}
              <span className="font-bold text-[#f5f0e8]">{step.value}</span>
            </div>
          </div>
          <div className="h-7 bg-[#141008] rounded-lg overflow-hidden">
            <div className="h-full rounded-lg flex items-center px-3 text-xs font-bold transition-all"
              style={{ width: `${Math.max((step.value / max) * 100, 4)}%`, backgroundColor: step.color, color: '#0a0805' }}>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function Stat({ label, value, sub, accent, icon }: {
  label: string; value: string | number; sub?: string; accent?: boolean; icon?: string
}) {
  return (
    <div className={`bg-[#141008] border rounded-2xl p-5 ${accent ? 'border-[#c8932a]/30' : 'border-[#2a1f10]'}`}>
      <div className="flex items-start justify-between mb-1">
        <div className="text-[#9a8a72] text-xs uppercase tracking-widest font-medium">{label}</div>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className={`text-3xl font-bold ${accent ? 'text-[#c8932a]' : 'text-[#f5f0e8]'}`}>{value}</div>
      {sub && <div className="text-xs text-[#9a8a72] mt-1">{sub}</div>}
    </div>
  )
}

// ─── Fill rate bar ────────────────────────────────────────────────────────────

function FillBar({ pct, style }: { pct: number; style: string }) {
  const color = pct >= 80 ? '#22c55e' : pct >= 50 ? '#c8932a' : '#ef4444'
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 h-1.5 bg-[#2a1f10] rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-9 text-right" style={{ color }}>{pct}%</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { password } = useAdmin()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!password) return
    fetch('/api/admin/analytics', { headers: { 'x-admin-password': password } })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setError('Failed to load analytics'); setLoading(false) })
  }, [password])

  if (loading) return (
    <div className="flex justify-center py-24">
      <svg className="animate-spin h-8 w-8 text-[#c8932a]" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>
  )

  if (error || !data) return (
    <div className="text-center text-red-400 py-20">{error || 'No data'}</div>
  )

  const { snapshot, segments, funnel, trends, retention, classes } = data

  // Estimated monthly revenue
  const estMonthlyRevenue = snapshot.mrr + snapshot.dropInRevenue30d
  const activeRate = snapshot.totalMembers > 0
    ? Math.round((snapshot.activeMembers / snapshot.totalMembers) * 100)
    : 0

  const monthLabel = (ym: string) => {
    const [y, m] = ym.split('-')
    return new Date(parseInt(y), parseInt(m) - 1).toLocaleString('en', { month: 'short' })
  }

  return (
    <div className="space-y-10">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-[#9a8a72] text-sm mt-0.5">Customer lifetime value · Retention · Revenue</p>
        </div>
        <div className="text-xs text-[#9a8a72] bg-[#141008] border border-[#2a1f10] rounded-lg px-3 py-1.5">
          Live data · {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* ── Snapshot KPIs ──────────────────────────────────────────────── */}
      <div>
        <h2 className="text-xs uppercase tracking-widest text-[#9a8a72] font-semibold mb-4">Key Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Est. MRR" value={`€${snapshot.mrr}`} sub="subscription revenue" accent icon="💶" />
          <Stat label="Est. Monthly" value={`€${estMonthlyRevenue}`} sub="sub + drop-ins (30d)" icon="📈" />
          <Stat label="Total Members" value={snapshot.totalMembers} sub="all time" icon="👥" />
          <Stat label="Active (30d)" value={`${snapshot.activeMembers}`} sub={`${activeRate}% of members`} icon="✅" />
          <Stat label="Avg Classes" value={snapshot.avgClassesPerActive} sub="per active member / 30d" icon="🎯" />
          <Stat label="At Risk" value={snapshot.atRiskCount} sub="21+ days inactive" accent={snapshot.atRiskCount > 0} icon="⚠️" />
        </div>
      </div>

      {/* ── Revenue + Bookings trend ────────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold">Bookings by Type</h2>
            <span className="text-xs text-[#9a8a72]">last 6 months</span>
          </div>
          <p className="text-xs text-[#9a8a72] mb-5">How customers are paying — subscriptions are the most valuable</p>
          <BarChart
            data={trends.bookingsPerMonth.map(d => ({ ...d, month: d.month }))}
            keys={['subscription', 'pack', 'drop_in']}
            colors={['#c8932a', '#7c5c2a', '#3a2a1a']}
            height={130}
          />
          <div className="flex gap-4 mt-3">
            {[['subscription', '#c8932a', 'Subscription'], ['pack', '#7c5c2a', 'Pack'], ['drop_in', '#3a2a1a', 'Drop-in']].map(([k, c, l]) => (
              <div key={k} className="flex items-center gap-1.5 text-xs text-[#9a8a72]">
                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: c }} />{l}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-bold">New Members</h2>
            <span className="text-xs text-[#9a8a72]">last 6 months</span>
          </div>
          <p className="text-xs text-[#9a8a72] mb-5">Growth rate — are you acquiring more customers over time?</p>
          <BarChart
            data={trends.newMembersPerMonth.map(d => ({ month: d.month, count: d.count }))}
            keys={['count']}
            colors={['#c8932a']}
            height={130}
          />
        </div>
      </div>

      {/* ── Customer segments + Funnel ──────────────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Segment donut */}
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
          <h2 className="font-bold mb-1">Customer Mix</h2>
          <p className="text-xs text-[#9a8a72] mb-5">
            Subscribers are worth ~3–5× more LTV than drop-in customers.
            Grow this slice.
          </p>
          <DonutChart segments={[
            { label: 'Subscribers', value: segments.subscribers, color: '#c8932a' },
            { label: 'Pack holders', value: segments.packHolders, color: '#7c5c2a' },
            { label: 'Drop-in only', value: segments.dropInOnly, color: '#2a1f10' },
          ]} />

          {/* Tier breakdown */}
          {segments.subscribers > 0 && (
            <div className="mt-5 pt-5 border-t border-[#2a1f10]">
              <div className="text-xs text-[#9a8a72] uppercase tracking-widest mb-3">Subscription Tiers</div>
              <div className="space-y-2">
                {segments.subsByTier.map(s => (
                  <div key={s.tier} className="flex items-center gap-3">
                    <span className="text-sm text-[#9a8a72] w-16">{s.tier}×/week</span>
                    <div className="flex-1 h-2 bg-[#2a1f10] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[#c8932a]"
                        style={{ width: `${segments.subscribers > 0 ? (s.count / segments.subscribers) * 100 : 0}%` }} />
                    </div>
                    <span className="text-sm font-bold text-[#f5f0e8] w-6 text-right">{s.count}</span>
                    <span className="text-xs text-[#9a8a72] w-12">€{[65, 89, 109][s.tier - 1]}/mo</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Conversion funnel */}
        <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
          <h2 className="font-bold mb-1">Conversion Funnel</h2>
          <p className="text-xs text-[#9a8a72] mb-5">
            How well you turn trial visitors into paying members. Target: &gt;30% conversion.
          </p>
          <Funnel steps={[
            { label: 'Trial signups', value: funnel.trialSignups, color: '#3a2a1a' },
            { label: 'Became members', value: funnel.trialConverted, color: '#7c5c2a' },
            { label: 'Subscribers', value: segments.subscribers, color: '#c8932a' },
          ]} />

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-3 text-center">
              <div className={`text-2xl font-bold ${funnel.conversionRate >= 30 ? 'text-green-400' : funnel.conversionRate >= 15 ? 'text-[#c8932a]' : 'text-red-400'}`}>
                {funnel.conversionRate}%
              </div>
              <div className="text-xs text-[#9a8a72]">trial → member</div>
            </div>
            <div className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-[#f5f0e8]">{funnel.trialSignupsLast30}</div>
              <div className="text-xs text-[#9a8a72]">trials last 30d</div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#0a0805] border border-[#2a1f10] rounded-xl">
            <div className="text-xs text-[#9a8a72] leading-relaxed">
              <strong className="text-[#f5f0e8]">LTV impact:</strong>{' '}
              A subscriber at €89/mo retained for 8 months = <strong className="text-[#c8932a]">€712 LTV</strong>{' '}
              vs a drop-in customer averaging 2 visits = <strong className="text-[#9a8a72]">€48</strong>. Every trial conversion matters enormously.
            </div>
          </div>
        </div>
      </div>

      {/* ── Class fill rates ────────────────────────────────────────────── */}
      <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold">Class Fill Rates</h2>
          <span className="text-xs text-[#9a8a72]">avg over last 30 days</span>
        </div>
        <p className="text-xs text-[#9a8a72] mb-5">
          <span className="text-green-400">●</span> ≥80% healthy &nbsp;
          <span className="text-[#c8932a]">●</span> 50–79% room to grow &nbsp;
          <span className="text-red-400">●</span> &lt;50% under-subscribed — promote or reconsider
        </p>
        {classes.fillRates.length === 0 ? (
          <div className="text-[#9a8a72] text-sm text-center py-6">No class instances in the last 30 days yet.</div>
        ) : (
          <div className="space-y-3">
            {classes.fillRates.map(c => (
              <div key={c.title} className="flex items-center gap-4">
                <div className="flex items-center gap-2 w-48 flex-shrink-0">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${c.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
                    {c.style}
                  </span>
                  <span className="text-sm font-medium truncate">{c.title}</span>
                </div>
                <FillBar pct={c.avgFill} style={c.style} />
                <span className="text-xs text-[#9a8a72] w-16 text-right flex-shrink-0">{c.count} session{c.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Class profitability ─────────────────────────────────────────── */}
      <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold">Class Profitability</h2>
          <span className="text-xs text-[#9a8a72]">last 30 days · per session</span>
        </div>
        <p className="text-xs text-[#9a8a72] mb-1">
          Revenue estimated from booking type mix (drop-in €24, pack avg €17.50, sub avg €10.25). Instructor cost from attendance tier.
        </p>
        <p className="text-xs text-[#9a8a72] mb-5">
          <span className="text-green-400">●</span> Profitable &nbsp;
          <span className="text-[#c8932a]">●</span> Break-even &nbsp;
          <span className="text-red-400">●</span> Loss — high sub/pack ratio on low-attendance classes
        </p>
        {classes.profitability.length === 0 ? (
          <div className="text-[#9a8a72] text-sm text-center py-6">No class sessions in the last 30 days.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a1f10] text-[#9a8a72] text-xs">
                  <th className="text-left py-2 pr-4 font-medium">Date</th>
                  <th className="text-left py-2 pr-4 font-medium">Class</th>
                  <th className="text-left py-2 pr-4 font-medium hidden md:table-cell">Instructor</th>
                  <th className="text-right py-2 pr-4 font-medium">Fill</th>
                  <th className="text-right py-2 pr-4 font-medium">Revenue</th>
                  <th className="text-right py-2 pr-4 font-medium hidden sm:table-cell">Cost</th>
                  <th className="text-right py-2 font-medium">Profit</th>
                  <th className="text-right py-2 pl-3 font-medium hidden lg:table-cell">Margin</th>
                </tr>
              </thead>
              <tbody>
                {classes.profitability.map(row => {
                  const isProfit = (row.profit ?? 0) > 0
                  const isBreakeven = row.profit === 0
                  const marginColor = isProfit ? 'text-green-400' : isBreakeven ? 'text-[#c8932a]' : 'text-red-400'
                  return (
                    <tr key={row.instanceId} className="border-b border-[#2a1f10]/40 last:border-0 hover:bg-[#0a0805]/50">
                      <td className="py-2.5 pr-4 text-[#9a8a72] text-xs whitespace-nowrap">
                        {new Date(row.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </td>
                      <td className="py-2.5 pr-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold px-1 py-0.5 rounded ${row.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'}`}>
                            {row.style[0].toUpperCase()}
                          </span>
                          <span className="font-medium text-[#f5f0e8] truncate max-w-[120px]">{row.title}</span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-4 text-[#9a8a72] text-xs hidden md:table-cell">{row.instructor}</td>
                      <td className="py-2.5 pr-4 text-right">
                        <span className={`text-xs font-bold ${row.fillPct >= 80 ? 'text-green-400' : row.fillPct >= 50 ? 'text-[#c8932a]' : 'text-red-400'}`}>
                          {row.attendees}/{row.capacity}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-[#f5f0e8] font-medium">€{row.revenue}</td>
                      <td className="py-2.5 pr-4 text-right text-[#9a8a72] hidden sm:table-cell">€{row.instructorCost}</td>
                      <td className={`py-2.5 text-right font-bold ${marginColor}`}>
                        {row.profit >= 0 ? '+' : ''}€{row.profit}
                      </td>
                      <td className={`py-2.5 pl-3 text-right text-xs font-bold hidden lg:table-cell ${marginColor}`}>
                        {row.margin !== null ? `${row.margin}%` : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Retention alerts ────────────────────────────────────────────── */}
      <div className="grid md:grid-cols-3 gap-6">

        {/* At-risk */}
        <div className="md:col-span-2 bg-[#141008] border border-[#2a1f10] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <span>⚠️</span>
            <h2 className="font-bold">At-Risk Members</h2>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-bold ${retention.atRisk.length > 0 ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'}`}>
              {retention.atRisk.length}
            </span>
          </div>
          <p className="text-xs text-[#9a8a72] mb-4">
            Paying customers (subscription or pack) who haven&apos;t booked in 21+ days. Reach out before they cancel.
          </p>
          {retention.atRisk.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-3xl mb-2">🎉</div>
              <div className="text-green-400 font-semibold text-sm">All active members are engaged!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {retention.atRisk.map(m => (
                <div key={m.email} className="flex items-center gap-3 bg-[#0a0805] border border-[#2a1f10] rounded-xl px-4 py-3">
                  <div className="w-7 h-7 rounded-full bg-red-900/30 border border-red-700/30 flex items-center justify-center text-red-300 text-xs font-bold flex-shrink-0">
                    {(m.name || m.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.name || m.email}</div>
                    <div className="text-xs text-[#9a8a72] truncate">{m.email}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {m.tier ? (
                      <span className="text-xs text-[#c8932a] font-semibold">{m.tier}×/wk sub</span>
                    ) : (
                      <span className="text-xs text-[#9a8a72]">{m.credits} credit{m.credits !== 1 ? 's' : ''}</span>
                    )}
                    <div className={`text-xs font-bold ${(m.daysSince ?? 0) >= 30 ? 'text-red-400' : 'text-orange-400'}`}>
                      {m.daysSince === null ? 'never booked' : `${m.daysSince}d ago`}
                    </div>
                  </div>
                  <a href={`mailto:${m.email}`}
                    className="flex-shrink-0 text-xs text-[#c8932a] hover:underline border border-[#c8932a]/30 rounded-lg px-2 py-1">
                    Email
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low credits + never booked */}
        <div className="space-y-6">
          <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span>🟡</span>
              <h2 className="font-semibold text-sm">Low Credits</h2>
              <span className="ml-auto text-xs text-[#9a8a72]">{retention.lowCredits.length}</span>
            </div>
            <p className="text-xs text-[#9a8a72] mb-3">1–3 credits left — good moment to upsell a bigger pack.</p>
            {retention.lowCredits.length === 0 ? (
              <div className="text-xs text-[#9a8a72] text-center py-3">None right now</div>
            ) : (
              <div className="space-y-2">
                {retention.lowCredits.map(m => (
                  <div key={m.email} className="flex items-center justify-between text-sm">
                    <span className="text-[#f5f0e8] truncate flex-1 min-w-0 mr-2">{m.name || m.email}</span>
                    <span className="text-[#c8932a] font-bold flex-shrink-0">{m.credits} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[#141008] border border-[#2a1f10] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <span>😶</span>
              <h2 className="font-semibold text-sm">Never Booked</h2>
              <span className="ml-auto text-xs text-[#9a8a72]">{retention.neverBooked.length}</span>
            </div>
            <p className="text-xs text-[#9a8a72] mb-3">Paying customers with 0 bookings — something blocked them.</p>
            {retention.neverBooked.length === 0 ? (
              <div className="text-xs text-[#9a8a72] text-center py-3">All good!</div>
            ) : (
              <div className="space-y-2">
                {retention.neverBooked.map(m => (
                  <div key={m.email} className="flex items-center justify-between text-sm">
                    <span className="text-[#f5f0e8] truncate flex-1 min-w-0 mr-2">{m.name || m.email}</span>
                    <a href={`mailto:${m.email}`} className="text-xs text-[#c8932a] hover:underline flex-shrink-0">Email</a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── LTV insight callout ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-[#c8932a]/10 to-transparent border border-[#c8932a]/20 rounded-2xl p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2"><span>💡</span> LTV Optimization Playbook</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          {[
            {
              step: '1. Convert trials faster',
              desc: 'Email every trial signup within 24h with a first-month discount. A 10% bump in conversion rate is worth more than doubling ad spend.',
              color: 'text-orange-400',
            },
            {
              step: '2. Upgrade pack → subscription',
              desc: 'When pack credits drop to 3, auto-trigger an email: "You have 3 classes left — subscribe and never worry about credits again."',
              color: 'text-[#c8932a]',
            },
            {
              step: '3. Re-engage at-risk members',
              desc: 'A personal email at day 21 of inactivity recovers ~25% of churning subscribers. Use the list above to send them.',
              color: 'text-green-400',
            },
          ].map(item => (
            <div key={item.step} className="bg-[#0a0805] border border-[#2a1f10] rounded-xl p-4">
              <div className={`font-semibold mb-1 ${item.color}`}>{item.step}</div>
              <div className="text-[#9a8a72] text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
