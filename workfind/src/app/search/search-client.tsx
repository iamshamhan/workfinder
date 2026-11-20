'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, SlidersHorizontal, MapPin, Briefcase, Star, ChevronDown, X, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import { mockCategories, mockListings, mockProviders, searchListings, getProviderById, getCategoryBySlug, SearchFilters } from '@/lib/mock-data'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchClientProps {
  initialListings: any[]
  initialTotal: number
  initialFilters: any
  initialTotalPages: number
  hasActiveFilters: boolean
}

export default function SearchClient({
  initialListings,
  initialTotal,
  initialFilters,
  initialTotalPages,
  hasActiveFilters,
}: SearchClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [listings, setListings] = useState(initialListings)
  const [total, setTotal] = useState(initialTotal)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [filters, setFilters] = useState(initialFilters)
  const [page, setPage] = useState(initialFilters.page || 1)

  // Build options
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

  // Helper to build URL and navigate
  const updateUrlAndNavigate = (newFilters: any) => {
    const params = new URLSearchParams()
    if (newFilters.query) params.set('q', newFilters.query)
    if (newFilters.category) params.set('category', newFilters.category)
    if (newFilters.district) params.set('district', newFilters.district)
    if (newFilters.city) params.set('city', newFilters.city)
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice.toString())
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice.toString())
    if (newFilters.minRating) params.set('minRating', newFilters.minRating.toString())
    if (newFilters.verifiedOnly) params.set('verified', 'true')
    if (newFilters.pricingType?.length) params.set('pricingType', newFilters.pricingType[0])
    if (newFilters.serviceDeliveryType?.length) params.set('deliveryType', newFilters.serviceDeliveryType[0])
    if (newFilters.sortBy) params.set('sort', newFilters.sortBy)
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString())

    router.push(`/browse?${params.toString()}`)
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value, page: 1 }
    setFilters(newFilters)
    setPage(1)

    // Debounce search
    const { listings: newListings, total: newTotal } = searchListings({ ...newFilters, limit: 12 })
    setListings(newListings)
    setTotal(newTotal)
    setTotalPages(Math.ceil(newTotal / 12))

    updateUrlAndNavigate(newFilters)
  }

  const handlePageChange = (newPage: number) => {
    const newFilters = { ...filters, page: newPage }
    setFilters(newFilters)
    setPage(newPage)

    const { listings: newListings, total: newTotal } = searchListings({ ...newFilters, limit: 12 })
    setListings(newListings)
    setTotal(newTotal)

    updateUrlAndNavigate(newFilters)
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams()
    router.push(`/browse?${params.toString()}`)
  }

  // Build active filter badges
  const activeFilterBadges = []
  if (filters.query) {
    activeFilterBadges.push({
      label: `Search: ${filters.query}`,
      onClick: () => handleFilterChange('query', undefined),
    })
  }
  if (filters.category) {
    const cat = mockCategories.find(c => c.slug === filters.category)
    activeFilterBadges.push({
      label: cat?.name || filters.category,
      onClick: () => handleFilterChange('category', undefined),
    })
  }
  if (filters.district) {
    const district = SRI_LANKAN_DISTRICTS.find(d => d.id === filters.district)
    activeFilterBadges.push({
      label: district?.name || filters.district,
      onClick: () => handleFilterChange('district', undefined),
    })
  }
  if (filters.minRating) {
    activeFilterBadges.push({
      label: `${filters.minRating}+ rating`,
      onClick: () => handleFilterChange('minRating', undefined),
    })
  }
  if (filters.verifiedOnly) {
    activeFilterBadges.push({
      label: 'Verified only',
      onClick: () => handleFilterChange('verifiedOnly', false),
    })
  }

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
              {total} {total === 1 ? 'service' : 'services'} found
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
                    {activeFilterBadges.length > 0 && (
                      <button
                        onClick={clearAllFilters}
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
                        onChange={(e) => handleFilterChange('query', e.target.value)}
                        leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                        aria-label="Search services"
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
                        onChange={(value) => handleFilterChange('category', value || undefined)}
                        leftIcon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
                        aria-label="Filter by category"
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
                        onChange={(value) => handleFilterChange('district', value || undefined)}
                        leftIcon={<MapPin className="w-5 h-5" aria-hidden="true" />}
                        aria-label="Filter by district"
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
                          onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-24"
                          aria-label="Minimum price"
                        />
                        <span className="text-secondary-400">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={filters.maxPrice || ''}
                          onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-24"
                          aria-label="Maximum price"
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
                        onChange={(value) => handleFilterChange('minRating', value ? parseFloat(value) : undefined)}
                        leftIcon={<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />}
                        aria-label="Filter by minimum rating"
                      />
                    </div>

                    {/* Verified Only */}
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.verifiedOnly || false}
                          onChange={(e) => handleFilterChange('verifiedOnly', e.target.checked)}
                          className="w-4 h-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                          id="verified-only"
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
                        value={filters.pricingType?.[0] || ''}
                        onChange={(value) => handleFilterChange('pricingType', value ? [value] : undefined)}
                        aria-label="Filter by pricing type"
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
                        value={filters.serviceDeliveryType?.[0] || ''}
                        onChange={(value) => handleFilterChange('serviceDeliveryType', value ? [value] : undefined)}
                        aria-label="Filter by delivery type"
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
                        onChange={(value) => handleFilterChange('sortBy', value)}
                        aria-label="Sort results by"
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
                    <span className="text-sm text-secondary-600" aria-live="polite">
                      Showing {listings.length} of {total} results
                    </span>
                  </div>
                </div>

                {/* Active Filter Tags */}
                {activeFilterBadges.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Active filters">
                    {activeFilterBadges.map((badge, i) => (
                      <Badge key={i} variant="primary" className="gap-1" onClick={badge.onClick}>
                        {badge.label}
                        <X className="w-3 h-3" aria-hidden="true" />
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Listings Grid */}
                {listings.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      {listings.map((listing) => {
                        const provider = getProviderById(listing.provider_id)
                        if (!provider) return null

                        return (
                          <Link
                            key={listing.id}
                            href={`/services/${listing.id}`}
                            className="group"
                          >
                            <Card variant="elevated" padding="none" className="overflow-hidden h-full flex flex-col transition-shadow duration-200 hover:shadow-xl">
                              <div className="relative h-48">
                                <img
                                  src={listing.main_image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop'}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                  {provider.verification_status === 'verified' && (
                                    <Badge variant="primary" className="gap-1">
                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                      </svg>
                                      Verified
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {listing.pricing_type.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </Badge>
                                </div>
                                {listing.price_amount && (
                                  <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-lg">
                                    <span className="text-sm font-semibold text-secondary-900">
                                      LKR {listing.price_amount.toLocaleString()}
                                      {listing.pricing_type !== 'fixed' && (
                                        <span className="text-xs font-normal text-secondary-500 ml-1">
                                          {listing.pricing_type === 'starting_from' ? '+' : `/${listing.pricing_type.replace('_', ' ')}`}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                )}
                              </div>
                              <div className="p-5 flex-1 flex flex-col">
                                <div className="flex items-center gap-1.5 text-sm text-secondary-500 mb-2">
                                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>{provider.city}, {provider.district}</span>
                                </div>
                                <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">
                                  {listing.title}
                                </h3>
                                <Badge variant="secondary" size="sm" className="mb-3 w-fit">
                                  {getCategoryBySlug(listing.category_id)?.name || listing.category_id}
                                </Badge>
                                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-secondary-100">
                                  <div className="flex items-center gap-1">
                                    <Avatar
                                      src={provider.business_logo_url}
                                      fallback={provider.business_name}
                                      size="sm"
                                    />
                                    <div>
                                      <p className="text-sm font-medium text-secondary-900 line-clamp-1">
                                        {provider.business_name}
                                      </p>
                                      <p className="text-xs text-secondary-500">
                                        {provider.rating.toFixed(1)} ({provider.review_count} reviews)
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </Link>
                        )
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        totalItems={total}
                        itemsPerPage={12}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                ) : (
                  <EmptyState
                    title="No services found"
                    description="Try adjusting your filters or search terms to find what you're looking for."
                    action={{
                      label: 'Clear all filters',
                      onClick: clearAllFilters,
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