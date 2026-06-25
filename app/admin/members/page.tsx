'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAdmin } from '../layout'

interface Member {
  id: string
  email: string
  name: string
  pack_credits_remaining: number
  subscription_tier: number | null
  stripe_customer_id: string | null
  created_at: string
}

interface Booking {
  id: string
  role: string
  booking_type: string
  status: string
  created_at: string
  class_instances: {
    date: string
    classes: { title: string; style: string; start_time: string }
  }
}

const SUB_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: '1× / week — €65/mo' },
  { value: 2, label: '2× / week — €89/mo' },
  { value: 3, label: '3× / week — €109/mo' },
]

function MemberDrawer({ member, password, onClose, onSaved }: {
  member: Member
  password: string
  onClose: () => void
  onSaved: (m: Member) => void
}) {
  const [credits, setCredits] = useState(member.pack_credits_remaining)
  const [tier, setTier] = useState(member.subscription_tier ?? 0)
  const [name, setName] = useState(member.name)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [saving, setSaving] = useState(false)
  const [creditDelta, setCreditDelta] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch(`/api/admin/bookings?email=${encodeURIComponent(member.email)}`, {
      // reuse bookings API — add email filter
    })
    // Fetch member bookings via the existing bookings endpoint
    fetch(`/api/bookings?email=${encodeURIComponent(member.email)}`)
      .then(r => r.json())
      .then(d => setBookings(d.bookings || []))
  }, [member.email])

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id: member.id, pack_credits_remaining: credits, subscription_tier: tier, name }),
    })
    const data = await res.json()
    if (res.ok) { onSaved(data.member); setSaved(true); setTimeout(() => setSaved(false), 2000) }
    setSaving(false)
  }

  function applyDelta() {
    const n = parseInt(creditDelta)
    if (!isNaN(n)) { setCredits(c => Math.max(0, c + n)); setCreditDelta('') }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-[#0a0805] border-l border-[#2a1f10] w-full max-w-lg h-full overflow-y-auto p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">{member.name}</h2>
            <div className="text-[#9a8a72] text-sm">{member.email}</div>
          </div>
          <button onClick={onClose} className="text-[#9a8a72] hover:text-[#f5f0e8] text-xl">✕</button>
        </div>

        {saved && (
          <div className="bg-green-900/20 border border-green-700/40 text-green-300 px-4 py-2 rounded-lg mb-4 text-sm">
            ✓ Saved
          </div>
        )}

        {/* Edit section */}
        <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 mb-6 space-y-5">
          <div>
            <label className="block text-sm text-[#9a8a72] mb-1">Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
          </div>

          <div>
            <label className="block text-sm text-[#9a8a72] mb-1">Membership</label>
            <select value={tier} onChange={e => setTier(parseInt(e.target.value))}
              className="w-full bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-2 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm">
              {SUB_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {member.stripe_customer_id && (
              <p className="text-xs text-[#9a8a72] mt-1">
                Note: this overrides the DB record only. To cancel Stripe billing, use the{' '}
                <a href={`https://dashboard.stripe.com/customers/${member.stripe_customer_id}`}
                  target="_blank" rel="noopener noreferrer" className="text-[#c8932a] hover:underline">
                  Stripe dashboard
                </a>.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm text-[#9a8a72] mb-2">Class Credits</label>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl font-bold text-[#c8932a]">{credits}</div>
              <div className="flex gap-1">
                {[-5, -1, +1, +5, +8, +16, +32].map(n => (
                  <button key={n} onClick={() => setCredits(c => Math.max(0, c + n))}
                    className={`text-xs px-2 py-1 rounded border transition-colors ${
                      n > 0
                        ? 'border-[#c8932a]/40 text-[#c8932a] hover:bg-[#c8932a]/10'
                        : 'border-red-700/40 text-red-400 hover:bg-red-900/10'
                    }`}>
                    {n > 0 ? `+${n}` : n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input type="number" value={creditDelta} onChange={e => setCreditDelta(e.target.value)}
                placeholder="Custom ±amount"
                className="flex-1 bg-[#0a0805] border border-[#2a1f10] rounded-lg px-3 py-1.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm" />
              <button onClick={applyDelta}
                className="px-3 py-1.5 bg-[#2a1f10] text-[#f5f0e8] rounded-lg text-sm hover:bg-[#3a2f20] transition-colors">
                Apply
              </button>
            </div>
          </div>

          <button onClick={save} disabled={saving}
            className="w-full bg-[#c8932a] text-[#0a0805] py-2.5 rounded-lg font-bold hover:bg-[#a87820] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>

        {/* Booking history */}
        <div>
          <h3 className="font-bold mb-3 text-[#9a8a72] text-sm uppercase tracking-wide">Booking History</h3>
          {bookings.length === 0 ? (
            <div className="text-[#9a8a72] text-sm text-center py-6">No bookings yet</div>
          ) : (
            <div className="space-y-2">
              {bookings.map(b => {
                const cls = b.class_instances?.classes
                if (!cls) return null
                const dateObj = new Date(b.class_instances.date + 'T00:00:00')
                const isPast = dateObj < new Date()
                return (
                  <div key={b.id} className="bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-3 flex items-center justify-between text-sm">
                    <div>
                      <div className="font-medium">{cls.title}</div>
                      <div className="text-[#9a8a72] text-xs">
                        {dateObj.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                        {' · '}{b.booking_type.replace('_', ' ')}
                        {b.role !== 'general' && ` · ${b.role}`}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      b.status === 'cancelled' ? 'bg-red-900/30 text-red-300'
                      : isPast ? 'bg-[#2a1f10] text-[#9a8a72]'
                      : 'bg-green-900/30 text-green-300'
                    }`}>
                      {b.status === 'cancelled' ? 'Cancelled' : isPast ? 'Attended' : 'Upcoming'}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminMembersPage() {
  const { password } = useAdmin()
  const [members, setMembers] = useState<Member[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<Member | null>(null)

  const DEMO_MEMBERS: Member[] = [
    { id: 'demo-1', email: 'anna.k.test@example.com', name: 'Anna Korhonen (test)', pack_credits_remaining: 6, subscription_tier: null, stripe_customer_id: null, created_at: '2026-04-10T10:00:00Z' },
    { id: 'demo-2', email: 'mikael.p.test@example.com', name: 'Mikael Peltonen (test)', pack_credits_remaining: 0, subscription_tier: 2, stripe_customer_id: 'cus_test123', created_at: '2026-03-22T14:30:00Z' },
    { id: 'demo-3', email: 'laura.s.test@example.com', name: 'Laura Saarinen (test)', pack_credits_remaining: 14, subscription_tier: 3, stripe_customer_id: 'cus_test456', created_at: '2026-05-01T09:15:00Z' },
  ]

  const fetchMembers = useCallback(async (q: string) => {
    setLoading(true)
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : ''
      const res = await fetch(`/api/admin/members${params}`, {
        headers: { 'x-admin-password': password },
      })
      const data = await res.json()
      const real = data.members || []
      // Show demo members when DB is not yet connected
      setMembers(real.length > 0 ? real : DEMO_MEMBERS.filter(m =>
        !q || m.name.toLowerCase().includes(q.toLowerCase()) || m.email.toLowerCase().includes(q.toLowerCase())
      ))
    } catch {
      setMembers(DEMO_MEMBERS)
    }
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [password])

  useEffect(() => { if (password) fetchMembers('') }, [password, fetchMembers])

  useEffect(() => {
    const t = setTimeout(() => { if (password) fetchMembers(search) }, 300)
    return () => clearTimeout(t)
  }, [search, password, fetchMembers])

  function onSaved(updated: Member) {
    setMembers(ms => ms.map(m => m.id === updated.id ? updated : m))
    setSelected(updated)
  }

  const tierBadge = (tier: number | null) => {
    if (!tier) return <span className="text-xs text-[#9a8a72]">—</span>
    return (
      <span className="text-xs bg-[#c8932a]/10 text-[#c8932a] border border-[#c8932a]/20 px-2 py-0.5 rounded-full font-semibold">
        {tier}×/week
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-[#9a8a72] text-sm mt-0.5">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full max-w-sm bg-[#141008] border border-[#2a1f10] rounded-lg px-4 py-2.5 text-[#f5f0e8] focus:border-[#c8932a] focus:outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="text-[#9a8a72] text-sm">Loading…</div>
      ) : members.length === 0 ? (
        <div className="text-center text-[#9a8a72] py-16">
          {search ? 'No members found.' : 'No members yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a1f10] text-[#9a8a72] text-left">
                <th className="py-3 pr-4 font-medium">Name</th>
                <th className="py-3 pr-4 font-medium">Email</th>
                <th className="py-3 pr-4 font-medium">Membership</th>
                <th className="py-3 pr-4 font-medium">Credits</th>
                <th className="py-3 pr-4 font-medium">Joined</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id} className="border-b border-[#2a1f10]/50 hover:bg-[#141008]/50 transition-colors">
                  <td className="py-3 pr-4 font-medium">{m.name}</td>
                  <td className="py-3 pr-4 text-[#9a8a72]">{m.email}</td>
                  <td className="py-3 pr-4">{tierBadge(m.subscription_tier)}</td>
                  <td className="py-3 pr-4">
                    <span className={`font-bold ${m.pack_credits_remaining > 0 ? 'text-[#c8932a]' : 'text-[#9a8a72]'}`}>
                      {m.pack_credits_remaining}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-[#9a8a72] text-xs">
                    {new Date(m.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3">
                    <button onClick={() => setSelected(m)}
                      className="text-xs text-[#c8932a] hover:underline font-medium">
                      Edit →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <MemberDrawer
          member={selected}
          password={password}
          onClose={() => setSelected(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
