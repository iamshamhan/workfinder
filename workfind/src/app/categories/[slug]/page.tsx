import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, Star, MapPin, Briefcase, Users, Award, Shield } from 'lucide-react'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import { mockCategories, mockListings, mockProviders, mockSubcategories, getCategoryBySlug, getListingsByCategory, getSubcategoriesByCategory, getProviderById, getCitiesByDistrict } from '@/lib/mock-data'
import Link from 'next/link'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const category = getCategoryBySlug(resolvedParams.slug)

  if (!category) {
    return { title: 'Category Not Found' }
  }

  return {
    title: `${category.name} Services`,
    description: category.description || `Find verified ${category.name.toLowerCase()} service providers in Sri Lanka.`,
  }
}

const districtOptions = [
  { value: '', label: 'All Districts' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
]

const sortOptions = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
]

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params
  const category = getCategoryBySlug(resolvedParams.slug)

  if (!category) {
    notFound()
  }

  const subcategories = getSubcategoriesByCategory(category.id)
  const listings = getListingsByCategory(category.slug)
  const providers = mockProviders.filter(p =>
    p.main_category_id === category.id && p.verification_status === 'verified'
  )

  // Get unique districts from providers
  const providerDistricts = [...new Set(providers.map(p => p.district).filter(Boolean))]

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Category Hero */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-12 md:py-16">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <nav className="flex items-center gap-2 text-sm text-secondary-500 mb-6" aria-label="Breadcrumb">
              <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <Link href="/categories" className="hover:text-primary-600 transition-colors">Categories</Link>
              <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              <span className="text-secondary-900 font-medium" aria-current="page">{category.name}</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Badge variant="primary" className="mb-3 text-sm">
                  <CategoryIcon slug={category.slug} className="h-4 w-4" />
                  {category.name}
                </Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
                  {category.name} Services in Sri Lanka
                </h1>
                <p className="text-lg text-secondary-600 max-w-2xl">
                  {category.description || `Find trusted ${category.name.toLowerCase()} professionals near you.`}
                </p>
              </div>
              <div className="flex items-center gap-4 text-sm text-secondary-600">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" aria-hidden="true" />
                  {providers.length} providers
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" aria-hidden="true" />
                  {listings.length} services
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-secondary-900 text-white py-8">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center max-w-4xl mx-auto">
            <div>
              <p className="text-3xl font-bold">{providers.length}</p>
              <p className="text-secondary-400 text-sm">Verified Providers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{listings.length}</p>
              <p className="text-secondary-400 text-sm">Available Services</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{providerDistricts.length}</p>
              <p className="text-secondary-400 text-sm">Districts Covered</p>
            </div>
            <div>
              <p className="text-3xl font-bold">
                {providers.length > 0
                  ? (providers.reduce((sum, p) => sum + p.rating, 0) / providers.length).toFixed(1)
                  : '0.0'}
              </p>
              <p className="text-secondary-400 text-sm">Average Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <section className="py-12 bg-white">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 mb-6">
                {category.name} Subcategories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {subcategories.map((subcategory) => {
                  const subListings = listings.filter(l => l.subcategory_id === subcategory.id)
                  return (
                    <Link
                      key={subcategory.id}
                      href={`/browse?category=${category.slug}&subcategory=${subcategory.slug}`}
                      className="group"
                    >
                      <Card variant="interactive" padding="md" className="text-center h-full">
                        <div className="text-3xl mb-3">{category.icon}</div>
                        <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors">
                          {subcategory.name}
                        </h3>
                        {subcategory.description && (
                          <p className="text-sm text-secondary-500 mt-1 line-clamp-2">
                            {subcategory.description}
                          </p>
                        )}
                        <p className="text-xs text-secondary-400 mt-2">
                          {subListings.length} services
                        </p>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Providers */}
      {providers.length > 0 && (
        <section className="py-12 bg-secondary-50">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                    Top {category.name} Providers
                  </h2>
                  <p className="text-secondary-600">
                    Verified professionals with highest ratings and reviews
                  </p>
                </div>
                <Link
                  href={`/browse?category=${category.slug}`}
                  className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                >
                  View all providers
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {providers.slice(0, 6).map((provider) => {
                  const providerListings = listings.filter(l => l.provider_id === provider.id)
                  const minPrice = providerListings
                    .filter(l => l.price_amount !== null)
                    .reduce((min, l) => Math.min(min, l.price_amount!), Infinity)

                  return (
                    <Link
                      key={provider.id}
                      href={`/providers/${provider.id}`}
                      className="group"
                    >
                      <Card variant="elevated" padding="none" className="overflow-hidden h-full flex flex-col transition-shadow duration-200 hover:shadow-xl">
                        <div className="relative h-40">
                          <img
                            src={provider.cover_image_url || provider.business_logo_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop'}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                          <div className="absolute top-3 right-3">
                            {provider.verification_status === 'verified' && (
                              <Badge variant="primary" className="gap-1">
                                <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <div className="flex items-center gap-1.5 text-sm text-secondary-500 mb-2">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{provider.city}, {provider.district}</span>
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar
                              src={provider.business_logo_url}
                              fallback={provider.business_name}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors truncate">
                                {provider.business_name}
                              </h3>
                              <p className="text-sm text-secondary-500 truncate">
                                {provider.short_intro || `${provider.years_experience}+ years experience`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" size="sm">
                              {provider.years_experience}+ years
                            </Badge>
                            {provider.languages.length > 0 && (
                              <Badge variant="outline" size="sm">
                                {provider.languages.join(', ')}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-auto pt-3 border-t border-secondary-100 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                              <span className="font-medium text-secondary-900">{provider.rating.toFixed(1)}</span>
                              <span className="text-sm text-secondary-500">({provider.review_count})</span>
                            </div>
                            {minPrice !== Infinity && (
                              <div className="text-right">
                                <p className="text-xs text-secondary-500">Starting from</p>
                                <p className="font-semibold text-secondary-900">LKR {minPrice.toLocaleString()}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* All Services in Category */}
      <section className="py-12 bg-white">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-secondary-900 mb-2">
                  All {category.name} Services
                </h2>
                <p className="text-secondary-600">
                  {listings.length} services available across {providerDistricts.length} districts
                </p>
              </div>
              <label htmlFor="sort-select" className="sr-only">Sort services by</label>
              <select
                id="sort-select"
                className="w-full md:w-48 px-4 py-2 border border-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                onChange={(e) => {
                  const params = new URLSearchParams()
                  params.set('sort', e.target.value)
                  window.location.href = `/browse?category=${category.slug}&${params.toString()}`
                }}
                defaultValue="relevant"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map((listing) => {
                  const provider = getProviderById(listing.provider_id)
                  if (!provider) return null

                  return (
                    <Link
                      key={listing.id}
                      href={`/services/${listing.id}`}
                      className="group block"
                    >
                      <Card variant="outlined" padding="none" className="overflow-hidden transition-all duration-200 hover:border-primary-300 hover:shadow-lg">
                        <div className="flex flex-col md:flex-row">
                          <div className="relative md:w-64 h-40 md:h-auto min-h-[200px] flex-shrink-0">
                            <img
                              src={listing.main_image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop'}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                              {provider.verification_status === 'verified' && (
                                <Badge variant="primary" className="gap-1">
                                  <Shield className="w-3 h-3" aria-hidden="true" />
                                  Verified
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {listing.pricing_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                          <div className="p-5 flex-1 flex flex-col md:flex-row md:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 text-sm text-secondary-500 mb-2">
                                <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>{provider.city}, {provider.district}</span>
                              </div>
                              <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">
                                {listing.title}
                              </h3>
                              <p className="text-secondary-600 text-sm line-clamp-2 mb-3">
                                {listing.description}
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {listing.tags.slice(0, 4).map((tag) => (
                                  <Badge key={tag} variant="outline" size="sm">
                                    {tag}
                                  </Badge>
                                ))}
                                {listing.tags.length > 4 && (
                                  <Badge variant="outline" size="sm">
                                    +{listing.tags.length - 4} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 md:w-48 flex-shrink-0">
                              <div className="flex items-center gap-2">
                                <Avatar
                                  src={provider.business_logo_url}
                                  fallback={provider.business_name}
                                  size="md"
                                />
                                <div className="text-right">
                                  <p className="font-medium text-secondary-900 text-sm truncate max-w-[140px]">
                                    {provider.business_name}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                                    <span className="text-sm font-medium text-secondary-900">{provider.rating.toFixed(1)}</span>
                                    <span className="text-xs text-secondary-500">({provider.review_count})</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-full md:w-auto text-right">
                                <Button variant="outline" size="sm" className="w-full md:w-auto">
                                  View Details
                                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        </Card>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title={`No ${category.name.toLowerCase()} services found`}
                description="Be the first to list your service in this category!"
                action={{
                  label: 'Post a Service',
                  onClick: () => window.location.href = '/register?role=provider',
                  variant: 'primary',
                }}
              />
            )}
          </div>
        </div>
      </section>

      {/* Service Areas */}
      {providerDistricts.length > 0 && (
        <section className="py-12 bg-secondary-50">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-secondary-900 mb-4">
                {category.name} Services Across Sri Lanka
              </h2>
              <p className="text-secondary-600 mb-8 max-w-2xl mx-auto">
                Find {category.name.toLowerCase()} professionals in your district and city
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {providerDistricts.map((districtId) => {
                  const district = SRI_LANKAN_DISTRICTS.find(d => d.id === districtId)
                  if (!district) return null
                  return (
                    <Link
                      key={district.id}
                      href={`/browse?category=${category.slug}&district=${district.id}`}
                      className="px-4 py-2 bg-white border border-secondary-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600 transition-colors font-medium text-secondary-700"
                    >
                      {district.name}
                    </Link>
                  )
                })}
              </div>
              <p className="mt-6 text-sm text-secondary-500">
                Available in {providerDistricts.length} district{providerDistricts.length !== 1 ? 's' : ''} across Sri Lanka
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Why Choose WorkFind for this category */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Choose WorkFind for {category.name}?
            </h2>
            <p className="text-primary-100 mb-10 max-w-2xl mx-auto">
              We verify every provider, protect your payments, and make it easy to find the right professional.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Shield, title: 'Verified Professionals', desc: 'Background checks, license verification, and insurance validation' },
                { icon: Award, title: 'Quality Guarantee', desc: 'Ratings, reviews, and work samples help you choose with confidence' },
                { icon: Users, title: 'Easy Comparison', desc: 'Compare prices, portfolios, and availability side by side' },
              ].map((benefit, i) => (
                <div key={i} className="p-6 bg-primary-700/50 rounded-2xl">
                  <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-xl flex items-center justify-center">
                    <benefit.icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-primary-200 text-sm">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}