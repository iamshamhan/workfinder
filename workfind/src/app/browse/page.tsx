import { Metadata } from 'next'
import { Search, Filter, SlidersHorizontal, MapPin, Briefcase, Star, ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import Link from 'next/link'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'

interface BrowsePageProps {
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

const districtOptions: SelectOption[] = [
  { value: '', label: 'All Districts' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
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

// Fetch categories for the category filter
async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })
    if (res.ok) {
      const data = await res.json()
      return data.categories || []
    }
  } catch (error) {
    console.error('Failed to fetch categories:', error)
  }
  return []
}

// Fetch search results from API
async function searchListingsApi(params: URLSearchParams) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/search?${params.toString()}`, {
      next: { revalidate: 60 }, // Cache for 1 minute
    })
    if (res.ok) {
      return await res.json()
    }
  } catch (error) {
    console.error('Search API error:', error)
  }
  return { listings: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasMore: false }, filters: {} }
}

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const resolvedParams = await searchParams
  const [categories, searchResults] = await Promise.all([
    getCategories(),
    searchListingsApi(new URLSearchParams(resolvedParams as Record<string, string>)),
  ])

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'All Categories' },
    ...categories.map((c: any) => ({ value: c.slug, label: c.name })),
  ]

  const { listings, pagination, filters } = searchResults

  const hasActiveFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'sortBy' && key !== 'page' && key !== 'limit' && value !== undefined && value !== '' && value !== false
  )

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Page Header */}
      <section className="bg-white border-b border-secondary-200">
        <div className="container py-8 md:py-12">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
              Browse All Services
            </h1>
            <p className="text-secondary-600 text-lg">
              {pagination.total} {pagination.total === 1 ? 'service' : 'services'} found
              {filters.query && <span className="font-medium text-primary-600"> for &ldquo;{filters.query}&rdquo;</span>}
            </p>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters */}
              <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl border border-secondary-200 p-6 sticky top-24 h-fit">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-secondary-900">Filters</h2>
                    {hasActiveFilters && (
                      <button
                        onClick={() => window.location.href = '/browse'}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <label htmlFor="search" className="block text-sm font-medium text-secondary-700 mb-2">
                        Search Services
                      </label>
                      <Input
                        id="search"
                        placeholder="e.g., AC repair, house cleaning..."
                        value={filters.query || ''}
                        onChange={(e) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (e.target.value) params.set('q', e.target.value)
                          else params.delete('q')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                        leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-secondary-700 mb-2">
                        Category
                      </label>
                      <Select
                        id="category"
                        placeholder="All Categories"
                        options={categoryOptions}
                        value={filters.category || ''}
                        onChange={(value: string) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (value) params.set('category', value)
                          else params.delete('category')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                        leftIcon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
                      />
                    </div>

                    {/* District */}
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium text-secondary-700 mb-2">
                        District
                      </label>
                      <Select
                        id="district"
                        placeholder="All Districts"
                        options={districtOptions}
                        value={filters.district || ''}
                        onChange={(value) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (value) params.set('district', value)
                          else params.delete('district')
                          params.delete('city')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                        leftIcon={<MapPin className="w-5 h-5" aria-hidden="true" />}
                      />
                    </div>

                    {/* Price Range */}
                    <div>
                      <label className="block text-sm font-medium text-secondary-700 mb-2">
                        Price Range (LKR)
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={filters.minPrice || ''}
                          onChange={(e) => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            if (e.target.value) params.set('minPrice', e.target.value)
                            else params.delete('minPrice')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="w-24"
                        />
                        <span className="text-secondary-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            if (e.target.value) params.set('maxPrice', e.target.value)
                            else params.delete('maxPrice')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="w-24"
                        />
                      </div>
                    </div>

                    {/* Minimum Rating */}
                    <div>
                      <label htmlFor="rating" className="block text-sm font-medium text-secondary-700 mb-2">
                        Minimum Rating
                      </label>
                      <Select
                        id="rating"
                        placeholder="Any Rating"
                        options={[
                          { value: '', label: 'Any Rating' },
                          { value: '4.5', label: '4.5 & Up' },
                          { value: '4.0', label: '4.0 & Up' },
                          { value: '3.5', label: '3.5 & Up' },
                          { value: '3.0', label: '3.0 & Up' },
                        ]}
                        value={filters.minRating?.toString() || ''}
                        onChange={(value) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (value) params.set('minRating', value)
                          else params.delete('minRating')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                        leftIcon={<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />}
                      />
                    </div>

                    {/* Verified Only */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly || false}
                          onChange={(e) => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            if (e.target.checked) params.set('verified', 'true')
                            else params.delete('verified')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">Verified providers only</span>
                      </label>
                    </div>

                    {/* Pricing Type */}
                    <div>
                      <label htmlFor="pricingType" className="block text-sm font-medium text-secondary-700 mb-2">
                        Pricing Type
                      </label>
                      <Select
                        id="pricingType"
                        placeholder="Any Pricing"
                        options={pricingTypeOptions}
                        value={filters.pricingTypes?.[0] || ''}
                        onChange={(value) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (value) params.set('pricingType', value)
                          else params.delete('pricingType')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                      />
                    </div>

                    {/* Delivery Type */}
                    <div>
                      <label htmlFor="deliveryType" className="block text-sm font-medium text-secondary-700 mb-2">
                        Service Delivery
                      </label>
                      <Select
                        id="deliveryType"
                        placeholder="Any Delivery Type"
                        options={deliveryTypeOptions}
                        value={filters.deliveryTypes?.[0] || ''}
                        onChange={(value) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          if (value) params.set('deliveryType', value)
                          else params.delete('deliveryType')
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                      />
                    </div>

                    {/* Sort */}
                    <div>
                      <label htmlFor="sort" className="block text-sm font-medium text-secondary-700 mb-2">
                        Sort By
                      </label>
                      <Select
                        id="sort"
                        options={sortOptions}
                        value={filters.sortBy || 'relevant'}
                        onChange={(value) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          params.set('sort', value)
                          params.delete('page')
                          window.location.href = `/browse?${params.toString()}`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </aside>

              {/* Results */}
              <main className="flex-1 min-w-0">
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-secondary-600">
                      Showing {listings.length} of {pagination.total} results
                    </span>
                  </div>
                </div>

                {/* Active Filter Tags */}
                {hasActiveFilters && (
                  <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Active filters">
                    {filters.query && (
                      <Badge variant="primary" className="gap-1">
                        Search: {filters.query}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            params.delete('q')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="ml-1"
                          aria-label="Remove search filter"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    )}
                    {filters.category && (
                      <Badge variant="secondary" className="gap-1">
                        {categories.find((c: any) => c.slug === filters.category)?.name || filters.category}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            params.delete('category')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="ml-1"
                          aria-label="Remove category filter"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    )}
                    {filters.district && (
                      <Badge variant="secondary" className="gap-1">
                        {SRI_LANKAN_DISTRICTS.find(d => d.id === filters.district)?.name || filters.district}
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            params.delete('district')
                            params.delete('city')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="ml-1"
                          aria-label="Remove district filter"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    )}
                    {filters.minRating && (
                      <Badge variant="success" className="gap-1 flex items-center">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        {filters.minRating}+ rating
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            params.delete('minRating')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="ml-1"
                          aria-label="Remove rating filter"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    )}
                    {filters.verifiedOnly && (
                      <Badge variant="primary" className="gap-1">
                        Verified only
                        <button
                          onClick={() => {
                            const params = new URLSearchParams(resolvedParams as Record<string, string>)
                            params.delete('verified')
                            params.delete('page')
                            window.location.href = `/browse?${params.toString()}`
                          }}
                          className="ml-1"
                          aria-label="Remove verified filter"
                        >
                          <X className="w-3 h-3" aria-hidden="true" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}

                {/* Listings Grid */}
                {listings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {listings.map((listing: any) => (
                        <Link
                          key={listing.id}
                          href={`/services/${listing.id}`}
                          className="group"
                        >
                          <Card variant="elevated" padding="none" className="overflow-hidden h-full flex flex-col transition-shadow duration-200 hover:shadow-xl">
                            <div className="relative h-48">
                              <img
                                src={listing.mainImageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                {listing.verified && (
                                  <Badge variant="primary" className="gap-1">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    Verified
                                  </Badge>
                                )}
                                <Badge variant="outline" className="text-xs">
                                  {listing.pricingType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </Badge>
                              </div>
                              {listing.priceAmount && (
                                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                                  <span className="text-sm font-semibold text-secondary-900">
                                    LKR {listing.priceAmount.toLocaleString()}
                                    {listing.pricingType !== 'fixed' && (
                                      <span className="text-xs font-normal text-secondary-500 ml-1">
                                        {listing.pricingType === 'starting_from' ? '+' : `/${listing.pricingType.replace('_', ' ')}`}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              <div className="flex items-center gap-1.5 text-sm text-secondary-500 mb-2">
                                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{listing.city}, {listing.district}</span>
                              </div>
                              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1 line-clamp-1">
                                {listing.title}
                              </h3>
                              <Badge variant="secondary" size="sm" className="mb-3 w-fit">
                                {categories.find((c: any) => c.id === listing.categoryId)?.name || listing.categoryId}
                              </Badge>
                              <div className="flex items-center gap-3 mt-auto pt-3 border-t border-secondary-100">
                                <div className="flex items-center gap-1">
                                  <Avatar
                                    src={listing.providerLogoUrl}
                                    fallback={listing.providerName}
                                    size="sm"
                                  />
                                  <div>
                                    <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                                      {listing.providerName}
                                    </p>
                                    <p className="text-xs text-secondary-500">
                                      {listing.providerRating?.toFixed(1)} ({listing.providerReviewCount || 0} reviews)
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
                        onPageChange={(page) => {
                          const params = new URLSearchParams(resolvedParams as Record<string, string>)
                          params.set('page', page.toString())
                          window.location.href = `/browse?${params.toString()}`
                        }}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No services found"
                    description="Try adjusting your filters or search terms to find what you're looking for."
                    action={{
                      label: 'Clear all filters',
                      onClick: () => window.location.href = '/browse',
                      variant: 'outline',
                    }}
                  />
                )}
              </main>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export const metadata: Metadata = {
  title: 'Browse All Services',
  description: 'Browse and compare thousands of verified service providers across Sri Lanka. Filter by category, location, price, and ratings.',
}