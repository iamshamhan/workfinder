import { Metadata } from 'next'
import { Search, Filter, SlidersHorizontal, MapPin, Briefcase, Star, ChevronDown, X, ChevronRight } from 'lucide-react'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import { mockCategories, mockListings, mockProviders, searchListings, getProviderById, getCategoryBySlug, SearchFilters } from '@/lib/mock-data'
import Link from 'next/link'
import SearchClient from './search-client'
import { SelectOption } from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'

export const metadata: Metadata = {
  title: 'Search Services',
  description: 'Search for service providers in Sri Lanka. Find electricians, plumbers, cleaners, and more.',
}

const districtOptions: SelectOption[] = [
  { value: '', label: 'All Districts' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
]

const categoryOptions: SelectOption[] = [
  { value: '', label: 'All Categories' },
  ...mockCategories.map(c => ({ value: c.slug, label: c.name })),
]

const pricingTypeOptions: SelectOption[] = [
  { value: '', label: 'Any Pricing' },
  { value: 'fixed', label: 'Fixed Price' },
  { value: 'starting_from', label: 'Starting From' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'daily', label: 'Daily Rate' },
  { value: 'negotiable', label: 'Negotiable' },
  { value: 'quotation', label: 'Request Quotation' },
]

const sortOptions: SelectOption[] = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

const deliveryTypeOptions: SelectOption[] = [
  { value: '', label: 'Any Delivery Type' },
  { value: 'business_location', label: 'At Business Location' },
  { value: 'customer_location', label: 'At Your Location' },
  { value: 'remote', label: 'Remote/Online' },
  { value: 'multiple_locations', label: 'Multiple Locations' },
]

interface SearchOption {
  value: string
  label: string
}

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    district?: string
    city?: string
    minPrice?: string
    maxPrice?: string
    minRating?: string
    verified?: string
    pricingType?: string
    deliveryType?: string
    sort?: string
    page?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams

  const filters: SearchFilters = {
    query: resolvedParams.q || undefined,
    category: resolvedParams.category || undefined,
    district: resolvedParams.district || undefined,
    city: resolvedParams.city || undefined,
    minPrice: resolvedParams.minPrice ? parseInt(resolvedParams.minPrice) : undefined,
    maxPrice: resolvedParams.maxPrice ? parseInt(resolvedParams.maxPrice) : undefined,
    minRating: resolvedParams.minRating ? parseFloat(resolvedParams.minRating) : undefined,
    verifiedOnly: resolvedParams.verified === 'true',
    pricingType: resolvedParams.pricingType ? [resolvedParams.pricingType] : undefined,
    serviceDeliveryType: resolvedParams.deliveryType ? [resolvedParams.deliveryType] : undefined,
    sortBy: (resolvedParams.sort as SearchFilters['sortBy']) || 'relevant',
    page: resolvedParams.page ? parseInt(resolvedParams.page) : 1,
    limit: 12,
  }

  const { listings, total } = searchListings(filters)
  const totalPages = Math.ceil(total / 12)

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== 'relevant' && v !== 1 && v !== false)

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Search Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
              Search Services
            </h1>
            <p className="text-lg text-secondary-600 mb-8 max-w-2xl mx-auto">
              Find exactly what you need. Search by service name, category, or keyword.
            </p>

            {/* Large Search Bar */}
            <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6 space-y-4 md:space-y-0 md:grid md:grid-cols-[1fr_1fr_1fr_auto] md:items-end gap-4 max-w-4xl mx-auto">
              <div className="md:col-span-2">
                <label htmlFor="hero-search" className="visually-hidden">
                  What service do you need?
                </label>
                <Input
                  id="hero-search"
                  placeholder="e.g., Electrician, House Cleaning, AC Repair..."
                  leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                />
              </div>
              <div>
                <label htmlFor="hero-category" className="visually-hidden">
                  Category
                </label>
                <Select
                  id="hero-category"
                  placeholder="Select Category"
                  options={categoryOptions}
                  leftIcon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
                  onChange={(value) => {
                    const params = new URLSearchParams()
                    if (value) params.set('category', value)
                    window.location.href = `/browse?${params.toString()}`
                  }}
                />
              </div>
              <div>
                <label htmlFor="hero-location" className="visually-hidden">
                  Location
                </label>
                <Select
                  id="hero-location"
                  placeholder="Select District"
                  options={districtOptions}
                  leftIcon={<MapPin className="w-5 h-5" aria-hidden="true" />}
                  onChange={(value) => {
                    const params = new URLSearchParams()
                    if (value) params.set('district', value)
                    window.location.href = `/browse?${params.toString()}`
                  }}
                />
              </div>
              <Button size="lg" className="w-full md:w-auto min-w-[160px] h-12 md:h-14" onClick={() => {
                const searchInput = document.getElementById('hero-search') as HTMLInputElement
                const params = new URLSearchParams()
                if (searchInput?.value) params.set('q', searchInput.value)
                window.location.href = `/browse?${params.toString()}`
              }} rightIcon={<Search className="w-5 h-5" aria-hidden="true" />}>
                Search
              </Button>
            </div>

            {/* Popular Search Suggestions */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-secondary-500">
              <span>Popular searches:</span>
              {['Electrician', 'Plumber', 'House Cleaning', 'AC Repair', 'Tutor', 'Web Developer', 'House Moving', 'Painter', 'Gardener', 'Mobile Repair'].map((term, i) => (
                <Link
                  key={term}
                  href={`/browse?q=${encodeURIComponent(term)}`}
                  className="px-3 py-1.5 bg-white border border-secondary-200 rounded-full hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-colors text-secondary-600"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Access */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 mb-8 text-center">
              Browse by Category
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {mockCategories.filter(c => c.is_active).slice(0, 15).map((category) => {
                const count = mockListings.filter(l => l.category_id === category.id && l.status === 'published').length
                return (
                  <Link
                    key={category.id}
                    href={`/browse?category=${category.slug}`}
                    className="group"
                  >
                    <Card variant="interactive" padding="md" className="text-center h-full">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-3xl">
                        <CategoryIcon slug={category.slug} />
                      </div>
                      <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-sm text-secondary-500 mt-1">
                        {count} services
                      </p>
                    </Card>
                  </Link>
                )
              })}
            </div>
            <div className="text-center mt-8">
              <Link href="/categories" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium">
                View all categories
                <ChevronRight className="w-5 h-5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Tips */}
      <section className="py-12 bg-secondary-50">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-secondary-900 text-center mb-10">
              Search Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Search className="w-6 h-6" aria-hidden="true" />,
                  title: 'Use Specific Keywords',
                  desc: 'Search for specific services like "AC repair" or "bathroom renovation" instead of broad terms.'
                },
                {
                  icon: <MapPin className="w-6 h-6" aria-hidden="true" />,
                  title: 'Filter by Location',
                  desc: 'Narrow results to your district or city to find providers who service your area.'
                },
                {
                  icon: <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" aria-hidden="true" />,
                  title: 'Check Ratings & Reviews',
                  desc: 'Sort by highest rated or most reviewed to find the most trusted professionals.'
                },
              ].map((tip, i) => (
                <Card key={i} variant="outlined" padding="lg" className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    {tip.icon}
                  </div>
                  <h3 className="font-semibold text-secondary-900 mb-2">{tip.title}</h3>
                  <p className="text-secondary-600">{tip.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Post a job request and let qualified providers send you quotes. It's free and only takes a minute.
          </p>
          <Link href="/jobs/create">
            <Button size="lg" variant="secondary" className="w-full md:w-auto min-w-[200px]" rightIcon={<ChevronRight className="w-5 h-5" aria-hidden="true" />}>
              Post a Job Request
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export type { SearchFilters } from '@/lib/mock-data'