import type { Metadata } from 'next'
import Link from 'next/link'
import { SRI_LANKAN_DISTRICTS, SRI_LANKAN_PROVINCES } from '@/constants/sri-lanka'

export const metadata: Metadata = {
  title: 'Service Locations',
  description: 'Find service providers by Sri Lankan district.',
}

export default function LocationsPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <section className="border-b border-secondary-200 bg-white">
        <div className="container py-12 md:py-16">
          <h1 className="text-3xl font-bold text-secondary-900 md:text-4xl">Service locations</h1>
          <p className="mt-4 max-w-2xl text-lg text-secondary-600">
            Districts are managed in one list and used by search, profiles and this directory.
          </p>
        </div>
      </section>
      <section className="container grid gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
        {SRI_LANKAN_PROVINCES.map((province) => {
          const districts = SRI_LANKAN_DISTRICTS.filter((district) => district.province === province)
          return (
            <div key={province} className="rounded-2xl border border-secondary-200 bg-white p-6">
              <h2 className="font-semibold text-secondary-900">{province} Province</h2>
              <ul className="mt-4 space-y-2">
                {districts.map((district) => (
                  <li key={district.id}>
                    <Link href={`/browse?district=${district.id}`} className="text-secondary-700 hover:text-primary-700">
                      {district.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}
