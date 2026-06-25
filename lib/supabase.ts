import { createClient } from '@supabase/supabase-js'

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
export type DanceStyle = 'salsa' | 'bachata'
export type BookingRole = 'leader' | 'follower' | 'general'
export type BookingType = 'drop_in' | 'pack' | 'subscription'

export interface Class {
  id: string
  title: string
  style: DanceStyle
  instructor: string
  day_of_week: DayOfWeek
  start_time: string
  duration_minutes: number
  is_recurring: boolean
  is_pairwork: boolean
  leader_capacity: number | null
  follower_capacity: number | null
  general_capacity: number | null
  location: string
  created_at: string
}

export interface ClassInstance {
  id: string
  class_id: string
  date: string
  status: 'scheduled' | 'cancelled'
  leader_spots_taken: number
  follower_spots_taken: number
  general_spots_taken: number
  classes?: Class
}

export interface Booking {
  id: string
  customer_email: string
  customer_name: string
  class_instance_id: string
  role: BookingRole
  booking_type: BookingType
  stripe_payment_intent_id: string | null
  status: 'confirmed' | 'cancelled'
  created_at: string
}

export interface Customer {
  id: string
  email: string
  name: string
  stripe_customer_id: string | null
  pack_credits_remaining: number
  pack_expires_at: string | null
  pack_credits_lapsed: number
  subscription_tier: 1 | 2 | 3 | null
  subscription_stripe_id: string | null
  created_at: string
}

export function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
