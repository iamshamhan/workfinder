import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, Star, MapPin, Phone, MessageSquare, Mail, Shield, Calendar, CheckCircle, X, ArrowLeft, Heart, Share2, Clock, MapPin as MapPinIcon, Truck, Home, Globe, AlertTriangle, Briefcase, Award, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface ServicePageProps {
  params: Promise<{ id: string }>
}

// Helper to convert snake_case to camelCase
function toCamelCase<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    result[camelKey] = value
  }
  return result as T
}

const pricingTypeLabels: Record<string, string> = {
  fixed: 'Fixed Price',
  starting_from: 'Starting From',
  hourly: 'Hourly Rate',
  daily: 'Daily Rate',
  negotiable: 'Negotiable',
  quotation: 'Request Quotation',
}

const deliveryTypeLabels: Record<string, string> = {
  business_location: 'At Business Location',
  customer_location: 'At Your Location',
  remote: 'Remote/Online',
  multiple_locations: 'Multiple Locations',
}

const deliveryTypeIcons: Record<string, React.ReactNode> = {
  business_location: <Home className="w-4 h-4" aria-hidden="true" />,
  customer_location: <MapPinIcon className="w-4 h-4" aria-hidden="true" />,
  remote: <Globe className="w-4 h-4" aria-hidden="true" />,
  multiple_locations: <Truck className="w-4 h-4" aria-hidden="true" />,
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('service_listings')
    .select(`
      *,
      provider:provider_profiles!provider_id (business_name, business_logo_url, rating, review_count, whatsapp, phone)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!listing) {
    return { title: 'Service Not Found' }
  }

  return {
    title: `${listing.title} | WorkFind`,
    description: listing.description,
    openGraph: {
      title: listing.title,
      description: listing.description,
      images: listing.main_image_url ? [listing.main_image_url] : [],
    },
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch listing with provider
  const { data: listing, error: listingError } = await supabase
    .from('service_listings')
    .select(`
      *,
      provider:provider_profiles!provider_id (
        id,
        business_name,
        business_logo_url,
        cover_image_url,
        short_intro,
        description,
        rating,
        review_count,
        verification_status,
        verified_at,
        years_experience,
        languages,
        availability,
        service_delivery_types,
        district,
        city,
        phone,
        whatsapp,
        email,
        service_coverage
      ),
      category:categories!category_id (id, name, slug),
      subcategory:subcategories!subcategory_id (id, name, slug)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (listingError || !listing) {
    notFound()
  }

  const camelListing = toCamelCase(listing)
  const provider = camelListing.provider ? toCamelCase(camelListing.provider) : null

  // Fetch other listings by same provider
  const { data: providerListingsData } = await supabase
    .from('service_listings')
    .select(`
      *,
      category:categories!category_id (id, name, slug)
    `)
    .eq('provider_id', camelListing.providerId)
    .neq('id', resolvedParams.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(5)

  const providerListings = (providerListingsData || []).map(toCamelCase)

  // Fetch reviews for this provider
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', camelListing.providerId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  const reviews = (reviewsData || []).map(toCamelCase)

  // WhatsApp link helper
  const whatsappNumber = provider?.whatsapp || provider?.phone
  const whatsappLink = whatsappNumber ? `https://wa.me/94${whatsappNumber.replace(/\D/g, '')}` : '#'

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-secondary-200 py-4" aria-label="Breadcrumb">
        <div className="container">
          <div className="flex items-center gap-2 text-sm text-secondary-500 max-w-6xl mx-auto">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <Link href="/browse" className="hover:text-primary-600 transition-colors">Browse</Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {provider && (
              <>
                <Link href={`/providers/${provider.id}`} className="hover:text-primary-600 transition-colors truncate max-w-[200px]">
                  {provider.businessName}
                </Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
              </>
            )}
            <span className="text-secondary-900 font-medium truncate max-w-[300px]" aria-current="page">{camelListing.title}</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <section className="py-8">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Images & Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Image Gallery */}
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-secondary-100">
                    <img
                      src={camelListing.mainImageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=500&fit=crop'}
                      alt={camelListing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      {provider?.verificationStatus === 'verified' && (
                        <Badge variant="primary" className="gap-1.5">
                          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                          Verified Provider
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-sm">
                        {pricingTypeLabels[camelListing.pricingType] || camelListing.pricingType}
                      </Badge>
                    </div>
                    {camelListing.priceAmount && (
                      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
                        <span className="text-lg font-bold text-secondary-900">
                          {formatCurrency(camelListing.priceAmount, camelListing.priceCurrency)}
                          {camelListing.pricingType !== 'fixed' && (
                            <span className="text-sm font-normal text-secondary-500 ml-1">
                              {camelListing.pricingType === 'starting_from' ? '+' : `/${camelListing.pricingType.replace('_', ' ')}`}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title & Provider Info */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary" size="sm">
                        {camelListing.category?.name || camelListing.categoryId}
                      </Badge>
                      {camelListing.subcategoryId && camelListing.subcategory && (
                        <Badge variant="outline" size="sm">
                          {camelListing.category?.name || ''} {' > '} {camelListing.subcategory.name}
                        </Badge>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-3">
                      {camelListing.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-600 mb-4">
                      {provider && (
                        <>
                          <Link href={`/providers/${provider.id}`} className="flex items-center gap-1 hover:text-primary-600 transition-colors">
                            <Avatar src={provider.businessLogoUrl} fallback={provider.businessName} size="sm" />
                            <span className="font-medium text-secondary-900">{provider.businessName}</span>
                          </Link>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                            {provider.rating.toFixed(1)} ({provider.reviewCount} reviews)
                          </span>
                        </>
                      )}
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" aria-hidden="true" />
                        {camelListing.city}, {camelListing.district}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" aria-hidden="true" />
                        {camelListing.experienceRequired || 'Experienced professionals'}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 md:w-auto">
                    <Button size="lg" className="w-full md:w-auto min-w-[160px]" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                      Send Enquiry
                    </Button>
                    <Button size="lg" variant="outline" className="w-full md:w-auto min-w-[160px]" rightIcon={<Phone className="w-5 h-5" aria-hidden="true" />}>
                      Request Callback
                    </Button>
                    {provider && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="lg" variant="secondary" className="w-full md:w-auto min-w-[160px]" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                          WhatsApp
                        </Button>
                      </a>
                    )}
                  </div>
                </div>

                {/* Tabs */}
                <Tabs
                  tabs={[
                    { value: 'details', label: 'Details', icon: <span className="w-5 h-5">📋</span> },
                    { value: 'pricing', label: 'Pricing', icon: <span className="w-5 h-5">💰</span> },
                    { value: 'reviews', label: `Reviews (${reviews.length})`, icon: <span className="w-5 h-5">⭐</span> },
                    { value: 'provider', label: 'Provider', icon: <span className="w-5 h-5">👤</span> },
                  ]}
                  defaultValue="details"
                />
              </div>

              {/* Right Sidebar - Similar Services */}
              <aside className="lg:col-span-1 space-y-6">
                <Card variant="elevated" padding="lg" className="sticky top-24">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Similar Services</h3>
                  <div className="space-y-4">
                    {providerListings.length > 0 ? (
                      providerListings.map((similarListing) => (
                        <Link
                          key={similarListing.id}
                          href={`/services/${similarListing.id}`}
                          className="group block"
                        >
                          <div className="flex gap-3">
                            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                              <img
                                src={similarListing.mainImageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop'}
                                alt=""
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-secondary-900 group-hover:text-primary-600 transition-colors truncate mb-1">
                                {similarListing.title}
                              </h4>
                              <p className="text-sm text-secondary-500 truncate mb-2">
                                {similarListing.description}
                              </p>
                              <div className="flex items-center gap-2">
                                {similarListing.priceAmount && (
                                  <span className="font-semibold text-secondary-900">
                                    {formatCurrency(similarListing.priceAmount, similarListing.priceCurrency)}
                                  </span>
                                )}
                                <Badge variant="outline" size="sm">
                                  {pricingTypeLabels[similarListing.pricingType] || similarListing.pricingType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-secondary-500 text-center py-4">No similar services found</p>
                    )}
                  </div>
                  {providerListings.length > 5 && provider && (
                    <div className="mt-4 text-center">
                      <Link
                        href={`/browse?provider=${provider.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-center gap-1"
                      >
                        View all {providerListings.length} services by this provider
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                  )}
                </Card>

                {/* Share */}
                <Card variant="outlined" padding="lg" className="sticky top-24" style={{ top: 'calc(24px + 400px)' }}>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4">Share this Service</h3>
                  <div className="flex gap-3">
                    <button className="flex-1 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Share2 className="w-5 h-5" aria-hidden="true" />
                      Share
                    </button>
                    <button className="flex-1 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                      <MessageSquare className="w-5 h-5" aria-hidden="true" />
                      WhatsApp
                    </button>
                  </div>
                  <p className="text-sm text-secondary-500 mt-3 text-center">
                    Help others find this great service!
                  </p>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Details Tab Content */}
      <section className="py-8 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div id="tabpanel-details" className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Service Description</h3>
                <Card variant="outlined" padding="lg">
                  <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
                    {camelListing.description}
                  </p>
                </Card>
              </div>

              {/* Service Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card variant="outlined" padding="md">
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    Service Location
                  </h4>
                  <div className="space-y-2">
                    <p className="text-secondary-700">
                      <span className="font-medium">District:</span> {camelListing.district}
                    </p>
                    <p className="text-secondary-700">
                      <span className="font-medium">City:</span> {camelListing.city}
                    </p>
                    <p className="text-secondary-700">
                      <span className="font-medium">Coverage:</span>{' '}
                      {camelListing.serviceCoverage.length > 0
                        ? camelListing.serviceCoverage.map((d: string) => SRI_LANKAN_DISTRICTS.find(s => s.id === d)?.name || d).join(', ')
                        : 'Provider\'s primary area'}
                    </p>
                  </div>
                </Card>

                <Card variant="outlined" padding="md">
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    Service Delivery
                  </h4>
                  <div className="space-y-2">
                    {camelListing.locationType && (
                      <div className="flex items-center gap-2 p-3 bg-secondary-50 rounded-lg">
                        {deliveryTypeIcons[camelListing.locationType]}
                        <div>
                          <p className="font-medium text-secondary-900">
                            {deliveryTypeLabels[camelListing.locationType] || camelListing.locationType}
                          </p>
                          <p className="text-sm text-secondary-500">
                            {camelListing.locationType === 'customer_location' && 'Provider comes to your location'}
                            {camelListing.locationType === 'business_location' && 'Service at provider\'s business location'}
                            {camelListing.locationType === 'remote' && 'Service delivered online/remotely'}
                            {camelListing.locationType === 'multiple_locations' && 'Available at multiple locations'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                <Card variant="outlined" padding="md">
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    Requirements
                  </h4>
                  <div className="space-y-2">
                    {camelListing.experienceRequired && (
                      <p className="text-secondary-700">
                        <span className="font-medium">Experience:</span> {camelListing.experienceRequired}
                      </p>
                    )}
                    {camelListing.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {camelListing.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" size="sm">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>

                <Card variant="outlined" padding="md">
                  <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    Availability
                  </h4>
                  <div className="space-y-2">
                    <p className="text-secondary-700">
                      {provider?.availability ? (
                        <>
                          Available {Object.entries(provider.availability).filter(([_, v]: [string, any]) => v.isAvailable).length} days a week
                        </>
                      ) : (
                        'Contact provider for schedule'
                      )}
                    </p>
                    {provider?.serviceDeliveryTypes && (
                      <div className="flex flex-wrap gap-2">
                        {provider.serviceDeliveryTypes.map((type) => (
                          <Badge key={type} variant="outline" size="sm">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>

            {/* Pricing Tab Content */}
            <div id="tabpanel-pricing" className="space-y-6" style={{ display: 'none' }}>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Pricing Details</h3>
                <Card variant="outlined" padding="lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary-50 rounded-xl">
                      <div>
                        <p className="text-sm text-secondary-500">Total Price</p>
                        <p className="text-2xl font-bold text-secondary-900">
                          {camelListing.priceAmount
                            ? formatCurrency(camelListing.priceAmount, camelListing.priceCurrency)
                            : 'Contact for quotation'}
                        </p>
                      </div>
                      <Badge variant={camelListing.pricingType === 'fixed' ? 'primary' : 'secondary'} size="lg">
                        {pricingTypeLabels[camelListing.pricingType] || camelListing.pricingType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-secondary-50 rounded-xl">
                        <p className="text-sm text-secondary-500 mb-1">Currency</p>
                        <p className="font-medium text-secondary-900">{camelListing.priceCurrency}</p>
                      </div>
                      <div className="p-4 bg-secondary-50 rounded-xl">
                        <p className="text-sm text-secondary-500 mb-1">Pricing Model</p>
                        <p className="font-medium text-secondary-900">
                          {pricingTypeLabels[camelListing.pricingType] || camelListing.pricingType}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-secondary-200">
                      <h4 className="font-medium text-secondary-900 mb-3">What's Included</h4>
                      <ul className="space-y-2 text-secondary-700">
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" aria-hidden="true" />
                          Professional service by verified provider
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" aria-hidden="true" />
                          Quality materials and tools
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" aria-hidden="true" />
                          Clean-up after service
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0" aria-hidden="true" />
                          {camelListing.pricingType === 'quotation' ? 'Free consultation and quote' : 'Transparent pricing - no hidden fees'}
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Payment Options</h3>
                <Card variant="outlined" padding="lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { icon: <span className="w-6 h-6">💵</span>, title: 'Cash on Completion', desc: 'Pay after service is completed to your satisfaction' },
                      { icon: <span className="w-6 h-6">🏦</span>, title: 'Bank Transfer', desc: 'Direct bank transfer to provider account' },
                      { icon: <span className="w-6 h-6">📱</span>, title: 'Mobile Payment', desc: 'E-wallet payments (eZ Cash, Genie, etc.)' },
                    ].map((option, i) => (
                      <div key={i} className="p-4 bg-secondary-50 rounded-xl">
                        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
                          {option.icon}
                        </div>
                        <h4 className="font-medium text-secondary-900 mb-1">{option.title}</h4>
                        <p className="text-sm text-secondary-600">{option.desc}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>

            {/* Reviews Tab Content */}
            <div id="tabpanel-reviews" className="space-y-6" style={{ display: 'none' }}>
              <div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-3">Customer Reviews</h3>
                {reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <Card key={review.id} variant="outlined" padding="lg">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Avatar fallback="Customer" size="md" />
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-200'}`}
                                      aria-hidden="true"
                                    />
                                  ))}
                                  <span className="text-sm text-secondary-500 ml-2">
                                    {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {review.title && (
                              <h4 className="font-semibold text-secondary-900 mb-1">{review.title}</h4>
                            )}
                            <p className="text-secondary-700 leading-relaxed">{review.content}</p>
                            {review.isVerifiedPurchase && (
                              <Badge variant="success" size="sm" className="mt-2">
                                <CheckCircle className="w-3 h-3" aria-hidden="true" />
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No reviews yet"
                    description="Be the first to review this service after booking!"
                  />
                )}
              </div>
            </div>

            {/* Provider Tab Content */}
            <div id="tabpanel-provider" className="space-y-6" style={{ display: 'none' }}>
              {provider && (
                <>
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-900 mb-3">About {provider.businessName}</h3>
                    <Card variant="outlined" padding="lg">
                      <div className="flex items-start gap-6">
                        <Avatar
                          src={provider.businessLogoUrl}
                          fallback={provider.businessName}
                          size="2xl"
                        />
                        <div className="flex-1">
                          <h4 className="text-xl font-semibold text-secondary-900 mb-2">
                            {provider.businessName}
                          </h4>
                          <p className="text-secondary-700 leading-relaxed mb-4">
                            {provider.description || provider.shortIntro || 'No description provided.'}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {provider.languages.map((lang: string) => (
                              <Badge key={lang} variant="outline" size="sm">
                                {lang}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card variant="outlined" padding="md">
                      <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary-600" aria-hidden="true" />
                        Service Area
                      </h4>
                      <div className="space-y-2">
                        <p className="text-secondary-700"><span className="font-medium">District:</span> {provider.district}</p>
                        <p className="text-secondary-700"><span className="font-medium">City:</span> {provider.city}</p>
                        {provider.serviceCoverage.length > 0 && (
                          <p className="text-secondary-700"><span className="font-medium">Also covers:</span> {provider.serviceCoverage.map((d: string) => SRI_LANKAN_DISTRICTS.find(s => s.id === d)?.name || d).join(', ')}</p>
                        )}
                      </div>
                    </Card>

                    <Card variant="outlined" padding="md">
                      <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-600" aria-hidden="true" />
                        Availability
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(provider.availability).map(([day, avail]: [string, any]) => (
                          <div key={day} className="flex justify-between py-1 px-2 rounded hover:bg-secondary-50">
                            <span className="text-sm font-medium text-secondary-700 capitalize">{day}</span>
                            <span className="text-sm text-secondary-600">
                              {avail.isAvailable ? `${avail.startTime} - ${avail.endTime}` : 'Closed'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card variant="outlined" padding="md">
                      <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5 text-primary-600" aria-hidden="true" />
                        Experience & Stats
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                          <span className="text-secondary-600">Years Experience</span>
                          <span className="font-bold text-secondary-900">{provider.yearsExperience}+</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                          <span className="text-secondary-600">Profile Views</span>
                          <span className="font-bold text-secondary-900">{provider.profileViews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                          <span className="text-secondary-600">Services Listed</span>
                          <span className="font-bold text-secondary-900">{providerListings.length + 1}</span>
                        </div>
                        <div className="flex justify-between p-3 bg-secondary-50 rounded-lg">
                          <span className="text-secondary-600">Response Rate</span>
                          <span className="font-bold text-secondary-900">94%</span>
                        </div>
                      </div>
                    </Card>

                    <Card variant="outlined" padding="md">
                      <h4 className="font-medium text-secondary-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary-600" aria-hidden="true" />
                        Verification Status
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-primary-600" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="font-medium text-secondary-900">Verified Provider</p>
                            <p className="text-sm text-secondary-500">
                              Verified on {provider.verifiedAt ? new Date(provider.verifiedAt).toLocaleDateString('en-LK') : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm text-secondary-600">
                          Background checks, license verification, and insurance validation completed.
                        </p>
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-primary-600 text-white">
        <div className="container text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Book {camelListing.title}?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Contact the provider directly to discuss your requirements and get a personalized quote.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" className="w-full sm:w-auto min-w-[180px]" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
              Send Enquiry Now
            </Button>
            {provider && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="w-full sm:w-auto min-w-[180px] bg-green-600 hover:bg-green-700" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                  Chat on WhatsApp
                </Button>
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}