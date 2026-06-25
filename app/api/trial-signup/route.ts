import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { trial_class_id, name, email, phone } = await request.json()
    if (!trial_class_id || !name || !email) {
      return NextResponse.json({ error: 'Name, email and class are required' }, { status: 400 })
    }

    const db = createServiceClient()

    // Check capacity
    const { data: cls } = await db
      .from('trial_classes')
      .select('capacity, trial_signups(count)')
      .eq('id', trial_class_id)
      .single()

    if (cls) {
      const taken = (cls.trial_signups as { count: number }[])[0]?.count ?? 0
      if (taken >= cls.capacity) {
        return NextResponse.json({ error: 'This class is fully booked' }, { status: 409 })
      }
    }

    const { data, error } = await db
      .from('trial_signups')
      .insert({ trial_class_id, name: name.trim(), email: email.trim().toLowerCase(), phone })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You\'ve already signed up for this class' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ signup: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
