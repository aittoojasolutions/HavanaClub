import Link from 'next/link'
import { Sparkles } from '@/components/Icons'

export default function BookingSuccess() {
  return (
    <div className="pt-24 pb-16 px-4 min-h-screen flex items-center justify-center">
      <div className="text-center max-w-md">
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
      </div>
    </div>
  )
}
