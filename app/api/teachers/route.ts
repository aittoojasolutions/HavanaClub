import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET() {
  try {
    const db = createServiceClient()
    const { data, error } = await db
      .from('teachers')
      .select('id, name, bio, photo_url')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
    if (error) return NextResponse.json({ teachers: [] })
    return NextResponse.json({ teachers: data ?? [] })
  } catch {
    return NextResponse.json({ teachers: [] })
  }
}
