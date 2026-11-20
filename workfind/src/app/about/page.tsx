import type { Metadata } from 'next'
import { PublicPage } from '@/components/layout/PublicPage'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'About Us',
  description: 'WorkFind is a Sri Lankan marketplace for discovering and contacting service providers.',
}

export default function AboutPage() {
  return (
    <PublicPage
      eyebrow="Company"
      title="About WorkFind"
      description="WorkFind helps people in Sri Lanka find electricians, plumbers, contractors, freelancers and other service providers, then compare them before making contact."
    >
      <div className="space-y-8 text-secondary-700 leading-relaxed">
        <section className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-secondary-900">What the platform is for</h2>
          <p className="mt-3">
            Customers search by service, category and location. Providers publish a business profile, service listings and photos of completed work. Administrators review listings and reported content before they stay public.
          </p>
        </section>
        <section className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-secondary-900">Who it is for</h2>
          <p className="mt-3">
            The first market is Sri Lanka. Prices are shown in LKR, phone numbers use the +94 country code, and locations are organised by district and city. The interface is English first, with room for Sinhala and Tamil later.
          </p>
        </section>
        <section className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h2 className="text-xl font-semibold text-secondary-900">How trust is handled</h2>
          <p className="mt-3">
            Verification badges, reviews and listing approval are part of the product design. A badge is shown only when a provider record is marked verified. Reviews are tied to completed work and are not invented for display.
          </p>
        </section>
        <Button href="/contact" variant="outline">
          Contact the team
        </Button>
      </div>
    </PublicPage>
  )
}
