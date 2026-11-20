import type { Metadata } from 'next'
import { Search, Users, Briefcase } from 'lucide-react'
import { PublicPage } from '@/components/layout/PublicPage'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Search, compare and contact service providers on WorkFind.',
}

const steps = [
  {
    title: 'Search for a service',
    description:
      'Enter the work you need, choose a category and select a district. Results stay in the page address, so you can share a filtered search.',
    icon: Search,
  },
  {
    title: 'Compare available professionals',
    description:
      'Open profiles and listings to review location, ratings, prices, portfolio photos and verification status before you decide.',
    icon: Users,
  },
  {
    title: 'Contact and hire the right person',
    description:
      'Call, message on WhatsApp, send an enquiry or request a quotation using the details published on the provider profile.',
    icon: Briefcase,
  },
]

export default function HowItWorksPage() {
  return (
    <PublicPage
      eyebrow="For customers"
      title="How WorkFind works"
      description="Find a professional in three steps. The catalogue on these pages is prototype data until the live database is connected."
    >
      <ol className="grid gap-6">
        {steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl border border-secondary-200 bg-white p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-700">
                <step.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary-700">Step {index + 1}</p>
                <h2 className="mt-1 text-xl font-semibold text-secondary-900">{step.title}</h2>
                <p className="mt-2 leading-relaxed text-secondary-600">{step.description}</p>
              </div>
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button href="/browse">Browse services</Button>
        <Button href="/auth/register?role=provider" variant="secondary">
          Advertise a service
        </Button>
      </div>
    </PublicPage>
  )
}
