import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { trial_class_id, first_name, last_name, email, phone, age } = await request.json()
    if (!trial_class_id || !first_name || !last_name || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required' }, { status: 400 })
    }

    const fullName = `${first_name.trim()} ${last_name.trim()}`
    const cleanEmail = email.trim().toLowerCase()

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
      .insert({ trial_class_id, name: fullName, email: cleanEmail, phone })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You\'ve already signed up for this class' }, { status: 409 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Save/update customer profile
    await db.from('customers').upsert({
      email: cleanEmail,
      name: fullName,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      phone: phone?.trim() || null,
      age: age ? parseInt(age) : null,
    }, { onConflict: 'email' })

    return NextResponse.json({ signup: data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
