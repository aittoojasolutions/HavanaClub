import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import { ScrollAnimations } from '@/components/ScrollAnimations'
import CookieBanner from '@/components/CookieBanner'

export const metadata: Metadata = {
  title: 'Habana Club Dance Studio',
  description: 'Cuban Salsa & Bachata classes in a warm, welcoming community. Book your first class today.',
  openGraph: {
    title: 'Habana Club Dance Studio',
    description: 'Cuban Salsa & Bachata classes for all levels. Weekly schedule, packs & subscriptions.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0805] text-[#f5f0e8]">
        <Nav />
        <ScrollAnimations />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}
