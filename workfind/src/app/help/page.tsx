import type { Metadata } from 'next'
import { PublicPage } from '@/components/layout/PublicPage'

export const metadata: Metadata = {
  title: 'Help and FAQ',
  description: 'Answers to common questions about finding and advertising services on WorkFind.',
}

const faqs = [
  {
    question: 'How do I find a service provider?',
    answer:
      'Use the search on the homepage or open Browse services. You can filter by category, district, price, rating, verification and how the service is delivered.',
  },
  {
    question: 'Is the catalogue live data?',
    answer:
      'The public pages currently show a separate prototype catalogue so the interface can be reviewed. Production records will come from the database, and those records are not mixed into the page components.',
  },
  {
    question: 'How do I contact a provider?',
    answer:
      'Open the provider profile. Call, WhatsApp, enquiry and quotation actions use the phone numbers and listing details stored for that provider.',
  },
  {
    question: 'How do I advertise a service?',
    answer:
      'Create a service provider account from Post a service. After your profile is created you can add listings, prices, coverage areas and portfolio photos.',
  },
  {
    question: 'Can I register as an administrator?',
    answer:
      'No. Registration offers customer and service provider roles only. Administrator access is assigned separately.',
  },
  {
    question: 'Which currency and locations are supported?',
    answer:
      'Prices are shown in Sri Lankan rupees. Locations use the central district and city lists, starting with all 25 districts.',
  },
]

export default function HelpPage() {
  return (
    <PublicPage
      eyebrow="Support"
      title="Help and frequently asked questions"
      description="Short answers for customers and service providers using WorkFind."
    >
      <div className="space-y-3">
        {faqs.map((item) => (
          <details key={item.question} className="rounded-xl border border-secondary-200 bg-white px-5 py-4">
            <summary className="cursor-pointer font-medium text-secondary-900">{item.question}</summary>
            <p className="mt-3 leading-relaxed text-secondary-600">{item.answer}</p>
          </details>
        ))}
      </div>
    </PublicPage>
  )
}
