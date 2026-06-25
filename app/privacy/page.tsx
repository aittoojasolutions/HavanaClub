import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — Havana Club Dance Studio',
  description: 'How Havana Club collects, uses, and protects your personal data under GDPR.',
}

const LAST_UPDATED = 'June 2026'
const CONTROLLER_EMAIL = 'hello@havanaclub.fi'
const CONTROLLER_NAME = 'Havana Club Dance Studio'
const CONTROLLER_ADDRESS = 'Sörnäisten rantatie 33C, 00500 Helsinki, Finland'

export default function PrivacyPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="mb-12">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Legal</p>
        <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
        <p className="text-[#9a8a72] text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-10 text-[#9a8a72] leading-relaxed">

        {/* 1. Who we are */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">1. Who we are</h2>
          <p>
            {CONTROLLER_NAME} (&quot;Havana Club&quot;, &quot;we&quot;, &quot;us&quot;) is the data controller responsible for your personal data.
          </p>
          <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 mt-4 text-sm space-y-1">
            <p><span className="text-[#f5f0e8] font-medium">Business name:</span> {CONTROLLER_NAME}</p>
            <p><span className="text-[#f5f0e8] font-medium">Address:</span> {CONTROLLER_ADDRESS}</p>
            <p><span className="text-[#f5f0e8] font-medium">Email:</span>{' '}
              <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-[#c8932a] hover:underline">{CONTROLLER_EMAIL}</a>
            </p>
          </div>
        </section>

        {/* 2. Data we collect */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">2. What data we collect and why</h2>
          <p className="mb-4">We collect only the data necessary to provide our services.</p>

          <div className="space-y-4">
            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 text-sm">
              <h3 className="font-bold text-[#f5f0e8] mb-2">Trial class reservations</h3>
              <p className="mb-2"><span className="text-[#f5f0e8]">Data collected:</span> Full name, email address, phone number</p>
              <p className="mb-2"><span className="text-[#f5f0e8]">Purpose:</span> To confirm your reservation, send class details, and contact you if anything changes</p>
              <p><span className="text-[#f5f0e8]">Legal basis:</span> Performance of a contract (Article 6(1)(b) GDPR)</p>
            </div>

            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 text-sm">
              <h3 className="font-bold text-[#f5f0e8] mb-2">Class bookings and memberships</h3>
              <p className="mb-2"><span className="text-[#f5f0e8]">Data collected:</span> Full name, email address, booking history, credit balance</p>
              <p className="mb-2"><span className="text-[#f5f0e8]">Purpose:</span> To manage your bookings, track class credits, and administer your membership</p>
              <p><span className="text-[#f5f0e8]">Legal basis:</span> Performance of a contract (Article 6(1)(b) GDPR)</p>
            </div>

            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 text-sm">
              <h3 className="font-bold text-[#f5f0e8] mb-2">Payments</h3>
              <p className="mb-2"><span className="text-[#f5f0e8]">Data collected:</span> Payment confirmation details only. Card details are processed directly by Stripe and are never stored on our servers.</p>
              <p className="mb-2"><span className="text-[#f5f0e8]">Purpose:</span> To process payments for classes, packs, and memberships</p>
              <p><span className="text-[#f5f0e8]">Legal basis:</span> Performance of a contract (Article 6(1)(b) GDPR); Legal obligation for accounting records (Article 6(1)(c) GDPR)</p>
            </div>

            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 text-sm">
              <h3 className="font-bold text-[#f5f0e8] mb-2">Website usage</h3>
              <p className="mb-2"><span className="text-[#f5f0e8]">Data collected:</span> Session cookies only (no tracking or advertising cookies, no analytics)</p>
              <p className="mb-2"><span className="text-[#f5f0e8]">Purpose:</span> To keep the site functional during your visit</p>
              <p><span className="text-[#f5f0e8]">Legal basis:</span> Legitimate interest (Article 6(1)(f) GDPR) — these cookies are strictly necessary for the site to function</p>
            </div>
          </div>
        </section>

        {/* 3. How long we keep it */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">3. How long we keep your data</h2>
          <div className="space-y-3 text-sm">
            <div className="flex gap-4 border-b border-[#2a1f10] pb-3">
              <span className="text-[#f5f0e8] font-medium w-48 flex-shrink-0">Reservation data</span>
              <span>2 years from the date of the reservation, or until you request deletion</span>
            </div>
            <div className="flex gap-4 border-b border-[#2a1f10] pb-3">
              <span className="text-[#f5f0e8] font-medium w-48 flex-shrink-0">Booking & membership data</span>
              <span>2 years from your last interaction with us</span>
            </div>
            <div className="flex gap-4 border-b border-[#2a1f10] pb-3">
              <span className="text-[#f5f0e8] font-medium w-48 flex-shrink-0">Payment records</span>
              <span>7 years, as required by Finnish accounting law (Kirjanpitolaki)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-[#f5f0e8] font-medium w-48 flex-shrink-0">Session cookies</span>
              <span>Deleted when you close your browser</span>
            </div>
          </div>
        </section>

        {/* 4. Who we share with */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">4. Who we share your data with</h2>
          <p className="mb-4">We do not sell your data. We share it only with the service providers necessary to operate our business:</p>
          <div className="space-y-3 text-sm">
            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
              <h3 className="font-bold text-[#f5f0e8] mb-1">Stripe, Inc.</h3>
              <p className="mb-1">Payment processing. Stripe is certified to PCI DSS Level 1 and compliant with GDPR. Data may be processed in the United States under Standard Contractual Clauses.</p>
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#c8932a] hover:underline text-xs">Stripe Privacy Policy →</a>
            </div>
            <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5">
              <h3 className="font-bold text-[#f5f0e8] mb-1">Supabase, Inc.</h3>
              <p className="mb-1">Database hosting. Your data is stored on servers within the European Union (EU region). A Data Processing Agreement is in place.</p>
              <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#c8932a] hover:underline text-xs">Supabase Privacy Policy →</a>
            </div>
          </div>
          <p className="mt-4 text-sm">No other third parties have access to your personal data.</p>
        </section>

        {/* 5. Your rights */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">5. Your rights under GDPR</h2>
          <p className="mb-4">As a resident of the European Union, you have the following rights:</p>
          <div className="space-y-3 text-sm">
            {[
              { right: 'Right of access', desc: 'You can request a copy of all personal data we hold about you.' },
              { right: 'Right to rectification', desc: 'You can ask us to correct inaccurate or incomplete data.' },
              { right: 'Right to erasure', desc: 'You can request that we delete your personal data, subject to legal retention requirements (e.g. accounting records).' },
              { right: 'Right to data portability', desc: 'You can request your data in a structured, machine-readable format.' },
              { right: 'Right to restriction', desc: 'You can ask us to temporarily stop processing your data while a dispute is resolved.' },
              { right: 'Right to object', desc: 'You can object to processing based on legitimate interest.' },
              { right: 'Right to withdraw consent', desc: 'Where processing is based on consent, you can withdraw it at any time without affecting prior processing.' },
            ].map(item => (
              <div key={item.right} className="flex gap-4 border-b border-[#2a1f10] pb-3 last:border-0 last:pb-0">
                <span className="text-[#c8932a] font-semibold w-52 flex-shrink-0">{item.right}</span>
                <span>{item.desc}</span>
              </div>
            ))}
          </div>
          <div className="bg-[#141008] border border-[#c8932a]/20 rounded-xl p-5 mt-5 text-sm">
            <p className="text-[#f5f0e8] font-medium mb-1">To exercise any of these rights:</p>
            <p>Email us at{' '}
              <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-[#c8932a] hover:underline">{CONTROLLER_EMAIL}</a>
              {' '}with your request. We will respond within 30 days.
            </p>
          </div>
        </section>

        {/* 6. Cookies */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">6. Cookies</h2>
          <p className="mb-3">
            We use only essential (strictly necessary) cookies that are required for the website to function. These include session cookies that keep you logged in during your visit.
          </p>
          <p>
            We do not use advertising cookies, tracking cookies, or third-party analytics. You do not need to consent to these cookies as they are strictly necessary for the service to operate.
          </p>
        </section>

        {/* 7. Data security */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">7. Data security</h2>
          <p>
            We take reasonable technical and organisational measures to protect your data, including encrypted data transmission (HTTPS), restricted access to personal data, and use of reputable, security-certified service providers. In the event of a data breach that affects your rights and freedoms, we will notify you and the relevant supervisory authority as required by law.
          </p>
        </section>

        {/* 8. Supervisory authority */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">8. Right to complain</h2>
          <p className="mb-3">
            If you believe we are processing your data unlawfully, you have the right to lodge a complaint with the Finnish data protection supervisory authority:
          </p>
          <div className="bg-[#141008] border border-[#2a1f10] rounded-xl p-5 text-sm">
            <p className="font-bold text-[#f5f0e8] mb-1">Office of the Data Protection Ombudsman</p>
            <p className="mb-0.5">Tietosuojavaltuutetun toimisto</p>
            <p className="mb-0.5">PO Box 800, FI-00521 Helsinki</p>
            <a href="https://www.tietosuoja.fi" target="_blank" rel="noopener noreferrer" className="text-[#c8932a] hover:underline">www.tietosuoja.fi →</a>
          </div>
        </section>

        {/* 9. Changes */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">9. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. When we do, we will update the &quot;Last updated&quot; date at the top of this page. Significant changes will be communicated to active clients by email.
          </p>
        </section>

        {/* 10. Contact */}
        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">10. Contact</h2>
          <p>
            For any questions about this policy or how we handle your data, contact us at{' '}
            <a href={`mailto:${CONTROLLER_EMAIL}`} className="text-[#c8932a] hover:underline">{CONTROLLER_EMAIL}</a>.
          </p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-[#2a1f10] flex flex-wrap gap-4 text-sm text-[#9a8a72]">
        <Link href="/terms" className="hover:text-[#c8932a] transition-colors">Terms of Service →</Link>
        <Link href="/contact" className="hover:text-[#c8932a] transition-colors">Contact Us →</Link>
      </div>
    </div>
  )
}
