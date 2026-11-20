import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ChevronRight, Star, MapPin, Phone, MessageSquare, Mail, Shield, Award, Users, Clock, Calendar, CheckCircle, MapPin as MapPinIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

interface ProviderPageProps {
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

export async function generateMetadata({ params }: ProviderPageProps): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: provider } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      category:categories!main_category_id (name, slug)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (!provider) {
    return { title: 'Provider Not Found' }
  }

  const camelProvider = toCamelCase(provider)

  return {
    title: `${camelProvider.businessName} | WorkFind`,
    description: camelProvider.shortIntro || camelProvider.description || `Verified ${camelProvider.businessName} - ${camelProvider.rating} stars, ${camelProvider.reviewCount} reviews.`,
    openGraph: {
      title: camelProvider.businessName,
      description: camelProvider.shortIntro || camelProvider.description || '',
      images: camelProvider.coverImageUrl ? [camelProvider.coverImageUrl] : [],
    },
  }
}

export default async function ProviderPage({ params }: ProviderPageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch provider profile
  const { data: provider, error: providerError } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      category:categories!main_category_id (id, name, slug)
    `)
    .eq('id', resolvedParams.id)
    .single()

  if (providerError || !provider) {
    notFound()
  }

  const camelProvider = toCamelCase(provider)

  // Fetch active listings
  const { data: listingsData } = await supabase
    .from('service_listings')
    .select(`
      *,
      category:categories!category_id (id, name, slug),
      subcategory:subcategories!subcategory_id (id, name, slug)
    `)
    .eq('provider_id', resolvedParams.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const listings = (listingsData || []).map(toCamelCase)

  // Fetch reviews
  const { data: reviewsData } = await supabase
    .from('reviews')
    .select('*')
    .eq('provider_id', resolvedParams.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10)

  const reviews = (reviewsData || []).map(toCamelCase)

  // Format availability for display
  const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  // WhatsApp link helper
  const whatsappNumber = camelProvider.whatsapp || camelProvider.phone
  const whatsappLink = whatsappNumber ? `https://wa.me/94${whatsappNumber.replace(/\D/g, '')}` : '#'

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header with Cover Image */}
      <section className="relative h-[350px] md:h-[450px]">
        <div className="absolute inset-0">
          {camelProvider.coverImageUrl ? (
            <img
              src={camelProvider.coverImageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="relative h-full container flex items-end pb-8">
          <div className="w-full max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 text-white">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Badge variant={camelProvider.verificationStatus === 'verified' ? 'primary' : 'outline'} className="gap-1.5">
                    <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                    {camelProvider.verificationStatus === 'verified' ? 'Verified' : camelProvider.verificationStatus}
                  </Badge>
                  {camelProvider.yearsExperience && (
                    <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                      {camelProvider.yearsExperience}+ years experience
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                  <Avatar
                    src={camelProvider.businessLogoUrl}
                    fallback={camelProvider.businessName}
                    size="2xl"
                    className="ring-4 ring-white"
                  />
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">{camelProvider.businessName}</h1>
                    {camelProvider.shortIntro && (
                      <p className="text-primary-100 text-lg mt-1">{camelProvider.shortIntro}</p>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-primary-100">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" aria-hidden="true" />
                    {camelProvider.city}, {camelProvider.district}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" aria-hidden="true" />
                    <span className="font-semibold">{camelProvider.rating.toFixed(1)}</span>
                    <span className="text-primary-200">({camelProvider.reviewCount} reviews)</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" aria-hidden="true" />
                    {listings.length} services
                  </span>
                  {camelProvider.languages.length > 0 && (
                    <span className="flex items-center gap-1">
                      <span className="w-4 h-4" aria-hidden="true">🌐</span>
                      {camelProvider.languages.join(', ')}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-3 md:flex-row md:w-auto">
                <Button size="lg" variant="secondary" className="w-full md:w-auto min-w-[160px]" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                  Send Enquiry
                </Button>
                <Button size="lg" className="w-full md:w-auto min-w-[160px]" rightIcon={<Phone className="w-5 h-5" aria-hidden="true" />}>
                  Call Now
                </Button>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="w-full md:w-auto min-w-[160px] border-white text-white hover:bg-white/10" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                    WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 -mt-6 relative z-10">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <main className="lg:col-span-2 space-y-8">
                {/* About Section */}
                <section>
                  <h2 className="text-2xl font-bold text-secondary-900 mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 text-lg">ℹ️</span>
                    </span>
                    About {camelProvider.businessName}
                  </h2>
                  <Card variant="outlined" padding="lg">
                    <p className="text-secondary-700 leading-relaxed whitespace-pre-line">
                      {camelProvider.description || 'No description provided.'}
                    </p>
                  </Card>
                </section>

                {/* Services Offered */}
                {listings.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 text-lg">📋</span>
                        </span>
                        Services Offered
                      </h2>
                      <Link
                        href={`/browse?provider=${resolvedParams.id}`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                      >
                        View all {listings.length} services
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {listings.slice(0, 6).map((listing) => (
                        <Link
                          key={listing.id}
                          href={`/services/${listing.id}`}
                          className="group"
                        >
                          <Card variant="interactive" padding="md" className="h-full">
                            <div className="flex items-start gap-4">
                              <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                                <img
                                  src={listing.mainImageUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop'}
                                  alt=""
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  loading="lazy"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1 truncate">
                                  {listing.title}
                                </h3>
                                <p className="text-sm text-secondary-500 line-clamp-2 mb-3">
                                  {listing.description}
                                </p>
                                <div className="flex items-center gap-3">
                                  {listing.priceAmount && (
                                    <span className="font-semibold text-secondary-900">
                                      {formatCurrency(listing.priceAmount, listing.priceCurrency)}
                                      {listing.pricingType !== 'fixed' && (
                                        <span className="text-sm font-normal text-secondary-500">
                                          {listing.pricingType === 'starting_from' ? '+' : `/${listing.pricingType.replace('_', ' ')}`}
                                        </span>
                                      )}
                                    </span>
                                  )}
                                  <Badge variant="outline" size="sm">
                                    {listing.pricingType.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Reviews Section */}
                {reviews.length > 0 && (
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
                        <span className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center">
                          <span className="text-primary-600 text-lg">⭐</span>
                        </span>
                        Customer Reviews
                      </h2>
                      <Link
                        href={`/providers/${resolvedParams.id}/reviews`}
                        className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1"
                      >
                        View all {reviews.length} reviews
                        <ChevronRight className="w-4 h-4" aria-hidden="true" />
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <Card key={review.id} variant="outlined" padding="lg">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <Avatar
                                  fallback={`User ${review.customerId?.slice(-4) || 'Anonymous'}`}
                                  size="md"
                                />
                                <div>
                                  <p className="font-medium text-secondary-900">Customer</p>
                                  <div className="flex items-center gap-1">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-200'}`}
                                        aria-hidden="true"
                                      />
                                    ))}
                                    <span className="text-sm text-secondary-500 ml-1">
                                      {review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-LK', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {review.title && (
                                <h4 className="font-semibold text-secondary-900 mb-1">{review.title}</h4>
                              )}
                              <p className="text-secondary-700 leading-relaxed">{review.content}</p>
                              {review.images.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                  {review.images.slice(0, 4).map((img: string, i: number) => (
                                    <img
                                      key={i}
                                      src={img}
                                      alt={`Review image ${i + 1}`}
                                      className="w-20 h-20 rounded-lg object-cover"
                                      loading="lazy"
                                    />
                                  ))}
                                </div>
                              )}
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
                  </section>
                )}
              </main>

              {/* Sidebar */}
              <aside className="lg:col-span-1 space-y-6">
                {/* Contact Card */}
                <Card variant="elevated" padding="lg" className="sticky top-24">
                  <h3 className="text-lg font-semibold text-secondary-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600">📞</span>
                    </span>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    {camelProvider.phone && (
                      <a
                        href={`tel:${camelProvider.phone}`}
                        className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Phone</p>
                          <p className="font-medium text-secondary-900">{camelProvider.phone}</p>
                        </div>
                      </a>
                    )}
                    {camelProvider.whatsapp && (
                      <a
                        href={`https://wa.me/94${camelProvider.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <MessageSquare className="w-5 h-5 text-green-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">WhatsApp</p>
                          <p className="font-medium text-secondary-900">{camelProvider.whatsapp}</p>
                        </div>
                      </a>
                    )}
                    {camelProvider.email && (
                      <a
                        href={`mailto:${camelProvider.email}`}
                        className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors"
                      >
                        <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                          <Mail className="w-5 h-5 text-secondary-600" aria-hidden="true" />
                        </div>
                        <div>
                          <p className="text-sm text-secondary-500">Email</p>
                          <p className="font-medium text-secondary-900">{camelProvider.email}</p>
                        </div>
                      </a>
                    )}
                    <div className="flex items-center gap-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center">
                        <MapPinIcon className="w-5 h-5 text-secondary-600" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-sm text-secondary-500">Service Area</p>
                        <p className="font-medium text-secondary-900">{camelProvider.city}, {camelProvider.district}</p>
                        {camelProvider.serviceDeliveryTypes.length > 0 && (
                          <p className="text-xs text-secondary-500 mt-1">
                            {camelProvider.serviceDeliveryTypes.map((t: string) => t.replace('_', ' ')).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-6 border-t border-secondary-100 space-y-3">
                    <Button className="w-full justify-center" rightIcon={<MessageSquare className="w-5 h-5" aria-hidden="true" />}>
                      Send Enquiry
                    </Button>
                    <Button variant="outline" className="w-full justify-center" rightIcon={<Phone className="w-5 h-5" aria-hidden="true" />}>
                      Request Callback
                    </Button>
                  </div>
                </Card>

                {/* Availability */}
                <Card variant="outlined" padding="lg" className="sticky top-24" style={{ top: 'calc(24px + 400px)' }}>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary-600" aria-hidden="true" />
                    </span>
                    Availability
                  </h3>
                  <div className="space-y-2">
                    {daysOrder.map((day, index) => {
                      const availability = camelProvider.availability[day as keyof typeof camelProvider.availability]
                      return (
                        <div
                          key={day}
                          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-secondary-50 transition-colors"
                        >
                          <span className="text-sm font-medium text-secondary-700 w-12">{dayLabels[index]}</span>
                          <span className="text-sm text-secondary-600">
                            {availability.isAvailable
                              ? `${availability.startTime} - ${availability.endTime}`
                              : 'Closed'}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </Card>

                {/* Quick Stats */}
                <Card variant="outlined" padding="lg" className="sticky top-24" style={{ top: 'calc(24px + 400px + 320px)' }}>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary-600" aria-hidden="true" />
                    </span>
                    At a Glance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-secondary-600">Services Listed</span>
                      <span className="font-bold text-secondary-900">{listings.length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-secondary-600">Years Experience</span>
                      <span className="font-bold text-secondary-900">{camelProvider.yearsExperience}+</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-secondary-600">Profile Views</span>
                      <span className="font-bold text-secondary-900">{camelProvider.profileViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-secondary-600">Response Rate</span>
                      <span className="font-bold text-secondary-900">94%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                      <span className="text-secondary-600">Avg. Response Time</span>
                      <span className="font-bold text-secondary-900">2 hours</span>
                    </div>
                  </div>
                </Card>

                {/* Verification Badge */}
                {camelProvider.verificationStatus === 'verified' && (
                  <Card variant="outlined" padding="lg" className="border-primary-200 bg-primary-50">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary-600" aria-hidden="true" />
                      </div>
                      <h3 className="font-semibold text-secondary-900 mb-1">Verified Provider</h3>
                      <p className="text-sm text-secondary-600 mb-4">
                        This provider has been verified by our team. Background checks, license verification, and insurance validation completed.
                      </p>
                      <Badge variant="primary" className="gap-1">
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                        Verified on {camelProvider.verifiedAt ? new Date(camelProvider.verifiedAt).toLocaleDateString('en-LK') : 'N/A'}
                      </Badge>
                    </div>
                  </Card>
                )}
              </aside>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Providers */}
      {camelProvider.category && (
        <section className="py-12 bg-secondary-50">
          <div className="container">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-secondary-900 mb-8">
                Other Top {camelProvider.category.name} Providers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="similar-providers">
                <div className="col-span-full text-center text-secondary-500 py-8">
                  Loading similar providers...
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Client-side script to load similar providers */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (async function() {
              try {
                const res = await fetch('/api/providers/similar?category=${encodeURIComponent(camelProvider.category?.slug || '')}&exclude=${resolvedParams.id}&limit=4')
                const data = await res.json()
                const container = document.getElementById('similar-providers')
                if (data.providers && data.providers.length > 0) {
                  container.innerHTML = data.providers.map(p => \`
                    <a href="/providers/\${p.id}" class="group">
                      <article class="bg-white rounded-2xl border border-secondary-200 overflow-hidden h-full flex flex-col transition-shadow duration-200 hover:shadow-xl">
                        <div class="relative h-40">
                          <img src="\${p.coverImageUrl || p.businessLogoUrl || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop'}" alt="" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                          <div class="absolute top-3 right-3">
                            <span class="inline-flex items-center gap-1 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                              <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
                              Verified
                            </span>
                          </div>
                        </div>
                        <div class="p-5 flex-1 flex flex-col">
                          <h3 class="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">\${p.businessName}</h3>
                          <p class="text-sm text-secondary-500 mb-3 line-clamp-2">\${p.shortIntro || \`\${p.yearsExperience}+ years experience\`}</p>
                          <div class="flex items-center gap-2 mb-3">
                            <span class="px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">\${p.yearsExperience}+ years</span>
                          </div>
                          <div class="mt-auto pt-3 border-t border-secondary-100 flex items-center justify-between">
                            <div class="flex items-center gap-1">
                              <svg class="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                              <span class="font-medium text-secondary-900">\${p.rating.toFixed(1)}</span>
                              <span class="text-sm text-secondary-500">(\${p.reviewCount})</span>
                            </div>
                          </div>
                        </div>
                      </article>
                    </a>
                  \`).join('')
                } else {
                  container.innerHTML = '<p class="col-span-full text-center text-secondary-500 py-8">No similar providers found.</p>'
                }
              } catch (e) {
                console.error('Failed to load similar providers:', e)
              }
            })()
          `
        }}
      />
    </div>
  )
}