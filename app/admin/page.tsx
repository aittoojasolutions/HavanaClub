'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAdmin } from './layout'
import { DAY_LABELS, formatTime } from '@/lib/utils'

interface Instance {
  id: string
  date: string
  status: string
  leader_spots_taken: number
  follower_spots_taken: number
  general_spots_taken: number
  classes: {
    title: string
    style: string
    start_time: string
    is_pairwork: boolean
    leader_capacity: number | null
    follower_capacity: number | null
    general_capacity: number | null
  }
}

export default function AdminDashboard() {
  const { password } = useAdmin()
  const [instances, setInstances] = useState<Instance[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchInstances() {
    const res = await fetch('/api/admin/instances', { headers: { 'x-admin-password': password } })
    const data = await res.json()
    setInstances(data.instances || [])
    setLoading(false)
  }

  async function cancelInstance(id: string) {
    if (!confirm('Cancel this specific class occurrence?')) return
    await fetch('/api/admin/instances', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
      body: JSON.stringify({ id, status: 'cancelled' }),
    })
    fetchInstances()
  }

  useEffect(() => { if (password) fetchInstances() }, [password])

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Upcoming Schedule</h1>
        <Link href="/admin/classes"
          className="bg-[#c8932a] text-[#0a0805] px-4 py-2 rounded-md text-sm font-bold hover:bg-[#a87820] transition-colors">
          + Add Class
        </Link>
      </div>

      {loading ? (
        <div className="text-[#9a8a72]">Loading…</div>
      ) : instances.length === 0 ? (
        <div className="text-[#9a8a72] text-center py-12">No upcoming classes.{' '}
          <Link href="/admin/classes" className="text-[#c8932a] hover:underline">Add one →</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a1f10] text-[#9a8a72] text-left">
                <th className="py-3 pr-4">Date</th>
                <th className="py-3 pr-4">Class</th>
                <th className="py-3 pr-4">Time</th>
                <th className="py-3 pr-4">Style</th>
                <th className="py-3 pr-4">Spots</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3" />
              </tr>
            </thead>
            <tbody>
              {instances.map(inst => {
                const cls = inst.classes
                const spotsDisplay = cls.is_pairwork
                  ? `L: ${inst.leader_spots_taken}/${cls.leader_capacity} · F: ${inst.follower_spots_taken}/${cls.follower_capacity}`
                  : `${inst.general_spots_taken}/${cls.general_capacity}`
                return (
                  <tr key={inst.id} className={`border-b border-[#2a1f10]/50 ${inst.status === 'cancelled' ? 'opacity-40' : ''}`}>
                    <td className="py-3 pr-4 font-mono text-[#9a8a72]">
                      {new Date(inst.date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', weekday: 'short' })}
                    </td>
                    <td className="py-3 pr-4 font-semibold">{cls.title}</td>
                    <td className="py-3 pr-4 font-mono text-[#9a8a72]">{formatTime(cls.start_time)}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        cls.style === 'salsa' ? 'bg-orange-900/40 text-orange-300' : 'bg-purple-900/40 text-purple-300'
                      }`}>{cls.style}</span>
                    </td>
                    <td className="py-3 pr-4 text-[#9a8a72] text-xs font-mono">{spotsDisplay}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        inst.status === 'cancelled' ? 'bg-red-900/30 text-red-300' : 'bg-green-900/30 text-green-300'
                      }`}>{inst.status}</span>
                    </td>
                    <td className="py-3">
                      {inst.status === 'scheduled' && (
                        <button onClick={() => cancelInstance(inst.id)}
                          className="text-xs text-red-400 hover:text-red-300 hover:underline">
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
