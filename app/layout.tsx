import type { Metadata } from 'next'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Havana Club Dance Studio',
  description: 'Salsa & Bachata classes in a warm, welcoming community. Book your first class today.',
  openGraph: {
    title: 'Havana Club Dance Studio',
    description: 'Salsa & Bachata classes for all levels. Weekly schedule, packs & subscriptions.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0805] text-[#f5f0e8]">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
