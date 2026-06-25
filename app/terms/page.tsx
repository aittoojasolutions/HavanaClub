import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — Havana Club Dance Studio',
  description: 'Terms and conditions for using Havana Club Dance Studio services.',
}

const LAST_UPDATED = 'June 2026'
const CONTACT_EMAIL = 'hello@havanaclub.fi'

export default function TermsPage() {
  return (
    <div className="pt-24 pb-20 px-4 max-w-3xl mx-auto">
      <div className="mb-12">
        <p className="text-[#c8932a] uppercase tracking-widest text-xs font-semibold mb-3">Legal</p>
        <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
        <p className="text-[#9a8a72] text-sm">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="space-y-10 text-[#9a8a72] leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">1. About these terms</h2>
          <p>
            These Terms of Service govern your use of Havana Club Dance Studio&apos;s classes, website, and related services. By booking a class or purchasing a product, you agree to these terms. Please read them before making a booking.
          </p>
          <p className="mt-3">
            The service is provided by Havana Club Dance Studio, Sörnäisten rantatie 33C, 00500 Helsinki, Finland (<a href={`mailto:${CONTACT_EMAIL}`} className="text-[#c8932a] hover:underline">{CONTACT_EMAIL}</a>).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">2. Classes and bookings</h2>
          <div className="space-y-3 text-sm">
            <p>Classes must be booked in advance through our website or by contacting us directly.</p>
            <p>We reserve the right to cancel or reschedule a class due to low attendance, instructor illness, or circumstances beyond our control. In such cases, you will be notified as early as possible and any credits used will be returned to your account.</p>
            <p>We reserve the right to refuse entry to anyone who is under the influence of alcohol or drugs, behaves aggressively or disrespectfully, or poses a risk to themselves or other participants.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">3. Trial classes</h2>
          <div className="space-y-3 text-sm">
            <p>Trial classes cost €10, payable on site at the end of the class (cash or card).</p>
            <p>If you join any class pack or membership after attending a trial class, the €10 trial fee is refunded to you as a credit.</p>
            <p>To cancel a trial class reservation, please contact us at least 24 hours in advance so we can offer the spot to someone else. Repeated no-shows without notice may result in removal from future trial bookings.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">4. Class packs</h2>
          <div className="space-y-3 text-sm">
            <p>Class pack credits are valid from the date of purchase: 8-class packs for 2 months, 16-class packs for 3 months, and 32-class packs for 6 months. Credits expire at the end of the validity period regardless of usage.</p>
            <p>Class packs are non-transferable and personal to the purchaser.</p>
            <p>Class packs are non-refundable once purchased, except where required by Finnish consumer protection law.</p>
            <p>Credits are deducted at the time of booking. If you cancel a booked class with more than 24 hours notice, the credit is returned to your account. Cancellations with less than 24 hours notice or no-shows will result in the credit being forfeited.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">5. Memberships</h2>
          <div className="space-y-3 text-sm">
            <p>Memberships are billed monthly via Stripe on the same date each month.</p>
            <p>You may cancel your membership at any time from your account dashboard or by emailing us. Cancellation takes effect at the end of the current billing period — you retain access to your remaining classes for that month.</p>
            <p>Weekly class allowances do not carry over to the following week.</p>
            <p>Memberships may be paused for up to 4 weeks per calendar year for reasons such as travel or illness. Contact us to arrange a pause.</p>
            <p>We reserve the right to adjust membership pricing with 30 days written notice by email.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">6. Payments and refunds</h2>
          <div className="space-y-3 text-sm">
            <p>All prices are in euros (€) and inclusive of VAT where applicable.</p>
            <p>Payments are processed securely by Stripe. We do not store your card details.</p>
            <p>Under Finnish consumer protection law (kuluttajansuojalaki), distance contracts for services may have specific cancellation rights. If you have purchased a service and wish to cancel, contact us and we will assess your request in accordance with applicable law.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">7. Health, safety and participation</h2>
          <div className="space-y-3 text-sm">
            <p>Dance is a physical activity. By participating in our classes you confirm that you are in suitable physical health to do so. If you have any medical condition, injury, or concern, please consult a doctor before attending and inform your instructor at the start of class.</p>
            <p>We are not liable for injuries sustained during classes, provided they were not caused by our negligence. Participants are responsible for their own physical wellbeing.</p>
            <p>Participants are expected to treat instructors and fellow students with respect. Harassment, discrimination, or inappropriate behaviour of any kind will result in immediate removal from class without refund.</p>
            <p>Wear comfortable clothing and indoor shoes suitable for dancing. We are not responsible for loss or damage to personal belongings.</p>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">8. Age requirements</h2>
          <p className="text-sm">
            Our classes are intended for adults aged 18 and over. Participants aged 16–17 may attend with written consent from a parent or guardian. Please contact us before booking if this applies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">9. Intellectual property</h2>
          <p className="text-sm">
            All content on this website — including text, images, videos, and design — is owned by Havana Club Dance Studio and may not be reproduced or distributed without our permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">10. Limitation of liability</h2>
          <p className="text-sm">
            To the extent permitted by Finnish law, Havana Club Dance Studio is not liable for indirect, incidental, or consequential damages arising from use of our services. Our total liability to you shall not exceed the amount you paid for the service in question.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">11. Governing law</h2>
          <p className="text-sm">
            These terms are governed by Finnish law. Any disputes shall be resolved in the courts of Helsinki, Finland. As a consumer, you also have the right to refer disputes to the Consumer Disputes Board (Kuluttajariitalautakunta) at <a href="https://www.kuluttajariita.fi" target="_blank" rel="noopener noreferrer" className="text-[#c8932a] hover:underline">www.kuluttajariita.fi</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">12. Changes to these terms</h2>
          <p className="text-sm">
            We may update these terms from time to time. The current version is always available on this page. Continued use of our services after a change constitutes acceptance of the updated terms.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#f5f0e8] mb-3">13. Contact</h2>
          <p className="text-sm">
            Questions about these terms? Email us at{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#c8932a] hover:underline">{CONTACT_EMAIL}</a>.
          </p>
        </section>

      </div>

      <div className="mt-14 pt-8 border-t border-[#2a1f10] flex flex-wrap gap-4 text-sm text-[#9a8a72]">
        <Link href="/privacy" className="hover:text-[#c8932a] transition-colors">Privacy Policy →</Link>
        <Link href="/contact" className="hover:text-[#c8932a] transition-colors">Contact Us →</Link>
      </div>
    </div>
  )
}
