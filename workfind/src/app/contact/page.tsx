import type { Metadata } from 'next'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PublicPage } from '@/components/layout/PublicPage'
import { ContactForm } from '@/components/marketplace/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact WorkFind support in Sri Lanka.',
}

export default function ContactPage() {
  return (
    <PublicPage
      eyebrow="Support"
      title="Contact us"
      description="Questions about an account, a listing or the platform can be sent to the WorkFind support desk."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a href="tel:+94112345678" className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-white p-4 hover:border-primary-300">
            <Phone className="h-5 w-5 text-primary-700" aria-hidden="true" />
            <span>+94 11 234 5678</span>
          </a>
          <a href="mailto:support@workfind.lk" className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-white p-4 hover:border-primary-300">
            <Mail className="h-5 w-5 text-primary-700" aria-hidden="true" />
            <span>support@workfind.lk</span>
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-secondary-200 bg-white p-4">
            <MapPin className="h-5 w-5 text-primary-700" aria-hidden="true" />
            <span>Colombo, Sri Lanka</span>
          </div>
        </div>
        <div className="rounded-2xl border border-secondary-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-secondary-900">Write to support</h2>
          <ContactForm />
        </div>
      </div>
    </PublicPage>
  )
}
