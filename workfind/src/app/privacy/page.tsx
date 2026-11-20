import type { Metadata } from 'next'
import { PublicPage } from '@/components/layout/PublicPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How WorkFind handles account, contact and listing information.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <PublicPage
      eyebrow="Legal"
      title="Privacy policy"
      description="This policy explains what information the marketplace stores and who can see it. It is a working draft for the Sri Lankan launch."
    >
      <div className="space-y-6 leading-relaxed text-secondary-700">
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Information we store</h2>
          <p className="mt-2">
            Account email, role, profile name, provider business details, phone and WhatsApp numbers, service locations, listings, job requests, messages, reviews and uploaded images.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">What other people can see</h2>
          <p className="mt-2">
            Published provider profiles, listings, prices and reviews are public. Private conversations, saved providers, dashboards and unpublished listings are limited to the people allowed to see them. Providers can keep an email address off the public profile.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">How it is used</h2>
          <p className="mt-2">
            Information is used to operate search, accounts, enquiries, notifications and moderation. It is not sold as a contact list. Payment details are not collected in the current product.
          </p>
        </section>
        <section>
          <h2 className="text-lg font-semibold text-secondary-900">Contact</h2>
          <p className="mt-2">
            Privacy questions can be sent to support@workfind.lk. You may request a correction or deletion of your account information, subject to records we must keep for security and moderation.
          </p>
        </section>
      </div>
    </PublicPage>
  )
}
