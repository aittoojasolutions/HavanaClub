'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Sparkles } from '@/components/Icons'
import { createClient } from '@/lib/supabase-browser'

function SuccessContent() {
  const params = useSearchParams()
  const type = params.get('type') // 'pack' | 'sub' | null (booking)
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    createClient().auth.getUser().then(({ data: { user } }) => {
      setLoggedIn(!!user)
    })
  }, [])

  if (type === 'pack') {
    return (
      <>
        <Sparkles className="w-16 h-16 mb-6 mx-auto text-[#c8932a]" />
        <h1 className="text-3xl font-bold mb-4">Pack purchased!</h1>
        <p className="text-[#9a8a72] mb-3 leading-relaxed">
          Your class credits have been added to your account. You can now book any Cuban Salsa or Bachata class.
        </p>
        {loggedIn === false && (
          <div className="bg-[#141008] border border-[#c8932a]/30 rounded-xl p-4 mb-6 text-sm text-[#9a8a72]">
            <div className="text-[#c8932a] font-semibold mb-1">Sign in to use your credits</div>
            Your credits are saved to your email. Sign in (or create an account) to book classes.
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {loggedIn === false ? (
            <Link href="/login" className="bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-bold hover:bg-[#a87820] transition-colors">
              Sign in to book classes
            </Link>
          ) : (
            <Link href="/classes" className="bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-bold hover:bg-[#a87820] transition-colors">
              Book a class
            </Link>
          )}
          <Link href="/dashboard" className="border border-[#2a1f10] text-[#f5f0e8] px-6 py-3 rounded-md font-bold hover:border-[#c8932a] transition-colors">
            My Dashboard
          </Link>
        </div>
      </>
    )
  }

  if (type === 'sub') {
    return (
      <>
        <Sparkles className="w-16 h-16 mb-6 mx-auto text-[#c8932a]" />
        <h1 className="text-3xl font-bold mb-4">Welcome to the Club!</h1>
        <p className="text-[#9a8a72] mb-3 leading-relaxed">
          Your membership is now active. Book your classes from the schedule — your weekly allowance resets every Monday.
        </p>
        {loggedIn === false && (
          <div className="bg-[#141008] border border-[#c8932a]/30 rounded-xl p-4 mb-6 text-sm text-[#9a8a72]">
            <div className="text-[#c8932a] font-semibold mb-1">Sign in to start booking</div>
            Your membership is tied to your email. Sign in (or create an account) to access it.
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {loggedIn === false ? (
            <Link href="/login" className="bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-bold hover:bg-[#a87820] transition-colors">
              Sign in to book classes
            </Link>
          ) : (
            <Link href="/classes" className="bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-bold hover:bg-[#a87820] transition-colors">
              Book your first class
            </Link>
          )}
          <Link href="/dashboard" className="border border-[#2a1f10] text-[#f5f0e8] px-6 py-3 rounded-md font-bold hover:border-[#c8932a] transition-colors">
            My Dashboard
          </Link>
        </div>
      </>
    )
  }

  // Default: class booking
  return (
    <>
      <Sparkles className="w-16 h-16 mb-6 mx-auto text-[#c8932a]" />
      <h1 className="text-3xl font-bold mb-4">You&apos;re Booked!</h1>
      <p className="text-[#9a8a72] mb-8 leading-relaxed">
        Your booking is confirmed. We&apos;ll send a confirmation to your email shortly. See you on the dance floor!
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/classes" className="bg-[#c8932a] text-[#0a0805] px-6 py-3 rounded-md font-bold hover:bg-[#a87820] transition-colors">
          View Full Schedule
        </Link>
        <Link href="/dashboard" className="border border-[#2a1f10] text-[#f5f0e8] px-6 py-3 rounded-md font-bold hover:border-[#c8932a] transition-colors">
          My Bookings
        </Link>
      </div>
    </>
  )
}

export default function BookingSuccessPage() {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
        <Suspense fallback={<Sparkles className="w-16 h-16 mb-6 mx-auto text-[#c8932a]" />}>
          <SuccessContent />
        </Suspense>
      </div>
    </div>
  )
}
