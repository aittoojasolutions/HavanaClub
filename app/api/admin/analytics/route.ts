import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { salaryForAttendees } from '../salary/route'

function checkAdmin(req: NextRequest) {
  return req.headers.get('x-admin-password') === process.env.ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const db = createServiceClient()
    const today = new Date()
    const todayStr = today.toISOString().split('T')[0]

    // Rolling date helpers
    const daysAgo = (n: number) => {
      const d = new Date(today); d.setDate(d.getDate() - n)
      return d.toISOString().split('T')[0]
    }
    const monthsAgo = (n: number) => {
      const d = new Date(today); d.setMonth(d.getMonth() - n)
      return d.toISOString().split('T')[0]
    }

    // Fetch all customers
    const { data: customers } = await db
      .from('customers')
      .select('id, email, name, subscription_tier, pack_credits_remaining, created_at')
      .order('created_at', { ascending: true })

    // Fetch all bookings (last 6 months for performance)
    const { data: bookings } = await db
      .from('bookings')
      .select('id, customer_email, booking_type, status, created_at, class_instances(date, classes(title, style))')
      .gte('created_at', monthsAgo(6))
      .eq('status', 'confirmed')
      .order('created_at', { ascending: true })

    // Fetch trial signups
    const { data: trialSignups } = await db
      .from('trial_signups')
      .select('id, email, created_at, status')
      .order('created_at', { ascending: true })

    // Fetch classes for fill rate
    const { data: classInstances } = await db
      .from('class_instances')
      .select('id, date, leader_spots_taken, follower_spots_taken, general_spots_taken, classes(title, style, leader_capacity, follower_capacity, general_capacity, is_pairwork)')
      .gte('date', daysAgo(30))
      .lte('date', todayStr)
      .order('date', { ascending: false })

    const allCustomers = customers ?? []
    const allBookings = bookings ?? []
    const allTrials = trialSignups ?? []
    const instances = classInstances ?? []

    // ── Customer counts ───────────────────────────────────────────────────
    const totalMembers = allCustomers.length
    const subMembers = allCustomers.filter(c => c.subscription_tier)
    const packMembers = allCustomers.filter(c => !c.subscription_tier && c.pack_credits_remaining > 0)
    const dropInOnly = allCustomers.filter(c => !c.subscription_tier && c.pack_credits_remaining === 0)

    const subsByTier = [1, 2, 3].map(t => ({
      tier: t,
      count: subMembers.filter(c => c.subscription_tier === t).length,
    }))

    // New members per month (last 6 months)
    const newPerMonth: Record<string, number> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today); d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7) // YYYY-MM
      newPerMonth[key] = 0
    }
    allCustomers.forEach(c => {
      const key = c.created_at?.slice(0, 7)
      if (key && newPerMonth[key] !== undefined) newPerMonth[key]++
    })

    // ── Revenue estimates (from DB, no Stripe yet) ────────────────────────
    // Sub MRR from tier × price
    const SUB_PRICES: Record<number, number> = { 1: 65, 2: 89, 3: 109 }
    const mrr = subMembers.reduce((sum, c) => sum + (SUB_PRICES[c.subscription_tier!] ?? 0), 0)

    // Revenue from bookings (last 30 days)
    const DROP_IN_PRICE = 24
    const recentBookings = allBookings.filter(b => b.created_at >= daysAgo(30))
    const dropInRevenue30d = recentBookings.filter(b => b.booking_type === 'drop_in').length * DROP_IN_PRICE

    // ── Booking frequency per customer (last 30d) ─────────────────────────
    const bookingsByEmail: Record<string, { last: string; count30: number; total: number }> = {}
    allBookings.forEach(b => {
      const e = b.customer_email
      if (!bookingsByEmail[e]) bookingsByEmail[e] = { last: b.created_at, count30: 0, total: 0 }
      bookingsByEmail[e].total++
      if (b.created_at >= daysAgo(30)) bookingsByEmail[e].count30++
      if (b.created_at > bookingsByEmail[e].last) bookingsByEmail[e].last = b.created_at
    })

    // Active = booked at least once in last 30d
    const activeEmails = new Set(
      Object.entries(bookingsByEmail)
        .filter(([, v]) => v.count30 > 0)
        .map(([k]) => k)
    )
    const activeMembers = allCustomers.filter(c => activeEmails.has(c.email)).length

    // At-risk: customer with credits or sub who hasn't booked in 21–45 days
    const atRisk = allCustomers.filter(c => {
      const hasValue = c.subscription_tier || c.pack_credits_remaining > 0
      if (!hasValue) return false
      const info = bookingsByEmail[c.email]
      if (!info) return true // never booked
      const daysSince = Math.floor((today.getTime() - new Date(info.last).getTime()) / 86400000)
      return daysSince >= 21
    })

    // Inactive = paying customer, 0 bookings ever
    const neverBooked = allCustomers.filter(c =>
      (c.subscription_tier || c.pack_credits_remaining > 0) && !bookingsByEmail[c.email]
    )

    // ── Conversion funnel ─────────────────────────────────────────────────
    const trialEmails = new Set(allTrials.map(t => t.email))
    const trialConverted = allCustomers.filter(c => trialEmails.has(c.email)).length
    const conversionRate = allTrials.length > 0
      ? Math.round((trialConverted / allTrials.length) * 100)
      : 0

    // ── Bookings per month ────────────────────────────────────────────────
    const bookingsPerMonth: Record<string, { drop_in: number; pack: number; subscription: number }> = {}
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today); d.setMonth(d.getMonth() - i)
      const key = d.toISOString().slice(0, 7)
      bookingsPerMonth[key] = { drop_in: 0, pack: 0, subscription: 0 }
    }
    allBookings.forEach(b => {
      const key = b.created_at?.slice(0, 7)
      if (key && bookingsPerMonth[key]) {
        const type = b.booking_type as 'drop_in' | 'pack' | 'subscription'
        if (bookingsPerMonth[key][type] !== undefined) bookingsPerMonth[key][type]++
      }
    })

    // ── Class fill rates ──────────────────────────────────────────────────
    const fillRates = instances.map(inst => {
      const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as { title: string; style: string; leader_capacity: number; follower_capacity: number; general_capacity: number; is_pairwork: boolean } | null
      if (!cls) return null
      const capacity = cls.is_pairwork
        ? (cls.leader_capacity + cls.follower_capacity)
        : cls.general_capacity
      const taken = cls.is_pairwork
        ? ((inst.leader_spots_taken ?? 0) + (inst.follower_spots_taken ?? 0))
        : (inst.general_spots_taken ?? 0)
      return {
        title: cls.title,
        style: cls.style,
        date: inst.date,
        capacity,
        taken,
        fillPct: capacity > 0 ? Math.round((taken / capacity) * 100) : 0,
      }
    }).filter(Boolean)

    // Avg fill rate by class title
    const fillByClass: Record<string, { title: string; style: string; totalPct: number; count: number }> = {}
    fillRates.forEach(f => {
      if (!f) return
      if (!fillByClass[f.title]) fillByClass[f.title] = { title: f.title, style: f.style, totalPct: 0, count: 0 }
      fillByClass[f.title].totalPct += f.fillPct
      fillByClass[f.title].count++
    })
    const classFillRates = Object.values(fillByClass)
      .map(c => ({ ...c, avgFill: Math.round(c.totalPct / c.count) }))
      .sort((a, b) => b.avgFill - a.avgFill)

    // ── Class profitability (last 30d) ────────────────────────────────────
    // Pricing assumptions: drop_in = €24, pack ≈ €17.50 avg, subscription ≈ €10.25 avg per class
    const REVENUE_BY_TYPE: Record<string, number> = { drop_in: 24, pack: 17.5, subscription: 10.25 }

    // Group bookings by class_instance_id
    const bookingsByInstance: Record<string, { drop_in: number; pack: number; subscription: number }> = {}
    allBookings.forEach(b => {
      const cid = (b as unknown as { class_instance_id?: string }).class_instance_id
      if (!cid) return
      if (!bookingsByInstance[cid]) bookingsByInstance[cid] = { drop_in: 0, pack: 0, subscription: 0 }
      const t = b.booking_type as 'drop_in' | 'pack' | 'subscription'
      if (bookingsByInstance[cid][t] !== undefined) bookingsByInstance[cid][t]++
    })

    const classProfitability = instances.map(inst => {
      const cls = (Array.isArray(inst.classes) ? inst.classes[0] : inst.classes) as { title: string; style: string; instructor: string; leader_capacity: number; follower_capacity: number; general_capacity: number; is_pairwork: boolean } | null
      if (!cls) return null
      const capacity = cls.is_pairwork ? (cls.leader_capacity + cls.follower_capacity) : cls.general_capacity
      const taken = cls.is_pairwork
        ? ((inst.leader_spots_taken ?? 0) + (inst.follower_spots_taken ?? 0))
        : (inst.general_spots_taken ?? 0)

      const bkCounts = bookingsByInstance[inst.id] ?? { drop_in: 0, pack: 0, subscription: 0 }
      const attendees = bkCounts.drop_in + bkCounts.pack + bkCounts.subscription || taken

      const revenue = Math.round(
        bkCounts.drop_in * REVENUE_BY_TYPE.drop_in +
        bkCounts.pack * REVENUE_BY_TYPE.pack +
        bkCounts.subscription * REVENUE_BY_TYPE.subscription
      )
      const instructorCost = salaryForAttendees(attendees)
      const profit = revenue - instructorCost
      const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : null

      return {
        instanceId: inst.id,
        date: inst.date,
        title: cls.title,
        style: cls.style,
        instructor: cls.instructor,
        capacity,
        attendees,
        fillPct: capacity > 0 ? Math.round((attendees / capacity) * 100) : 0,
        revenue,
        instructorCost,
        profit,
        margin,
        bookingMix: bkCounts,
      }
    }).filter(Boolean).sort((a, b) => (b!.date).localeCompare(a!.date)).slice(0, 20)

    // ── Credits expiry risk ───────────────────────────────────────────────
    // Members with low credits (1-3 left) who might churn
    const lowCredits = allCustomers.filter(c => !c.subscription_tier && c.pack_credits_remaining > 0 && c.pack_credits_remaining <= 3)

    // ── Avg classes per active member (30d) ──────────────────────────────
    const avgClassesPerActive = activeMembers > 0
      ? (recentBookings.length / activeMembers).toFixed(1)
      : '0'

    return NextResponse.json({
      snapshot: {
        totalMembers,
        activeMembers,
        mrr,
        dropInRevenue30d,
        atRiskCount: atRisk.length,
        avgClassesPerActive,
      },
      segments: {
        subscribers: subMembers.length,
        packHolders: packMembers.length,
        dropInOnly: dropInOnly.length,
        subsByTier,
      },
      funnel: {
        trialSignups: allTrials.length,
        trialConverted,
        conversionRate,
        trialSignupsLast30: allTrials.filter(t => t.created_at >= daysAgo(30)).length,
      },
      trends: {
        newMembersPerMonth: Object.entries(newPerMonth).map(([month, count]) => ({ month, count })),
        bookingsPerMonth: Object.entries(bookingsPerMonth).map(([month, types]) => ({ month, ...types })),
      },
      retention: {
        atRisk: atRisk.slice(0, 10).map(c => ({
          name: c.name,
          email: c.email,
          tier: c.subscription_tier,
          credits: c.pack_credits_remaining,
          lastBooking: bookingsByEmail[c.email]?.last ?? null,
          daysSince: bookingsByEmail[c.email]
            ? Math.floor((today.getTime() - new Date(bookingsByEmail[c.email].last).getTime()) / 86400000)
            : null,
        })),
        neverBooked: neverBooked.slice(0, 5).map(c => ({ name: c.name, email: c.email, tier: c.subscription_tier, credits: c.pack_credits_remaining })),
        lowCredits: lowCredits.slice(0, 8).map(c => ({ name: c.name, email: c.email, credits: c.pack_credits_remaining })),
      },
      classes: {
        fillRates: classFillRates,
        profitability: classProfitability,
      },
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 })
  }
}
