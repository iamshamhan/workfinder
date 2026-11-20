import type { Metadata } from 'next'
import { PublicPage } from '@/components/layout/PublicPage'

export const metadata: Metadata = {
  title: 'Terms and Conditions',
  description: 'Terms for using the WorkFind marketplace.',
}

export default function TermsPage() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Terms and conditions"
      description="These terms describe how customers, service providers and WorkFind use the marketplace. They are a working draft for the product and should be reviewed before a public launch."
    >
      <div className="space-y-6 leading-relaxed text-secondary-700">
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Accounts</h2>
          <p className="mt-2">
            You must provide accurate account information. Customers and service providers choose a role at registration. Administrator access cannot be self-assigned. You are responsible for activity under your login.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Listings and profiles</h2>
          <p className="mt-2">
            Providers may advertise only services they are able to perform. Listings can be submitted as drafts and may remain unpublished until approved. WorkFind may reject, suspend or remove listings and accounts that are misleading, unlawful or abusive.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Contact between users</h2>
          <p className="mt-2">
            WorkFind introduces customers and providers. A contract for the work itself is between those parties. Prices shown in LKR are set by the provider and may be fixed, hourly, daily, negotiable or quoted on request.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Reviews and reports</h2>
          <p className="mt-2">
            Reviews must describe a real completed engagement. Self-reviews and duplicate reviews for the same job are not allowed. Users can report content for moderation.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Acceptable use</h2>
          <p className="mt-2">
            Do not post unlawful content, attempt to access another user’s private messages, or interfere with the platform. Sri Lankan law applies to use of the service.
          </p>
        </section>
      </div>
    </PublicPage>
  )
}
