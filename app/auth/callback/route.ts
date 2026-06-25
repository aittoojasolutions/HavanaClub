import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Ensure a customer record exists for this auth user
      const db = createServiceClient()
      const email = data.user.email!
      const { data: existing } = await db
        .from('customers')
        .select('id')
        .eq('email', email)
        .single()

      if (!existing) {
        await db.from('customers').insert({
          email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          auth_user_id: data.user.id,
        })
      } else {
        // Link auth_user_id if not already set
        await db.from('customers')
          .update({ auth_user_id: data.user.id })
          .eq('email', email)
          .is('auth_user_id', null)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
