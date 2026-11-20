import Link from 'next/link'
import { Briefcase, ChevronRight, Search, Shield, Star, Truck, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'
import { HeroSearch } from '@/components/marketplace/HeroSearch'
import { ProviderCard } from '@/components/marketplace/ProviderCard'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import {
  getStartingPrice,
  mockCategories,
  mockListings,
  mockProviders,
  mockReviews,
} from '@/lib/mock-data'

const steps = [
  {
    number: '01',
    title: 'Search for a service',
    description: 'Enter the work you need, choose a category and pick a district.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Compare available professionals',
    description: 'Review profiles, ratings, prices, locations and photos of completed work.',
    icon: Users,
  },
  {
    number: '03',
    title: 'Contact and hire the right person',
    description: 'Call, use WhatsApp, send an enquiry or request a quotation.',
    icon: Briefcase,
  },
]

const testimonials = [
  {
    name: 'Priyanka Fernando',
    location: 'Colombo',
    initials: 'PF',
    rating: 5,
    text: 'Found an electrician the same day. The profile showed the district, price range and recent reviews before I called.',
    service: 'Electrical wiring',
  },
  {
    name: 'Mohamed Rizwan',
    location: 'Kandy',
    initials: 'MR',
    rating: 5,
    text: 'I compared contractors for an office renovation and contacted the one whose coverage matched our site.',
    service: 'Construction',
  },
  {
    name: 'Nimali Perera',
    location: 'Galle',
    initials: 'NP',
    rating: 4,
    text: 'The cleaning listing showed a daily rate and service area, which made booking straightforward.',
    service: 'Home cleaning',
  },
]

const popularSearches = ['Electrician', 'Plumber', 'House Cleaning', 'AC Repair', 'Tutor', 'Web Developer']

export default function HomePage() {
  const categories = mockCategories.filter((category) => category.is_active).slice(0, 10)
  const featuredProviders = [...mockProviders]
    .sort((a, b) => b.rating - a.rating || b.review_count - a.review_count)
    .slice(0, 4)
  const locations = SRI_LANKAN_DISTRICTS.slice(0, 12)
  const publishedListings = mockListings.filter((listing) => listing.status === 'published').length

  return (
    <div className="flex flex-col">
      <section className="bg-primary-50 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-5xl text-center">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3 py-1 text-sm font-medium text-primary-800">
              <Shield className="h-3.5 w-3.5" aria-hidden="true" />
              Sri Lanka service marketplace
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-tight text-secondary-900 md:text-5xl lg:text-6xl">
              Find the Right Professional for Every Job.
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-secondary-600 md:text-xl">
              Discover trusted professionals, skilled workers and service providers near you.
            </p>
            <HeroSearch
              categories={categories.map((category) => ({ value: category.slug, label: category.name }))}
              districts={SRI_LANKAN_DISTRICTS.map((district) => ({ value: district.id, label: district.name }))}
            />
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-secondary-500">
              <span>Popular searches:</span>
              {popularSearches.map((term) => (
                <Link
                  key={term}
                  href={`/browse?q=${encodeURIComponent(term)}`}
                  className="rounded-full border border-secondary-200 bg-white px-3 py-1.5 text-secondary-700 hover:border-primary-300 hover:text-primary-700"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary-900 py-12 text-white">
        <div className="container grid grid-cols-2 gap-8 text-center md:grid-cols-4">
          <div>
            <p className="text-3xl font-bold">{mockProviders.length}</p>
            <p className="mt-1 text-secondary-400">Providers in the catalogue</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{publishedListings}</p>
            <p className="mt-1 text-secondary-400">Published services</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{mockCategories.length}</p>
            <p className="mt-1 text-secondary-400">Service categories</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{SRI_LANKAN_DISTRICTS.length}</p>
            <p className="mt-1 text-secondary-400">Districts covered</p>
          </div>
        </div>
        <p className="container mt-6 text-center text-xs text-secondary-500">
          Figures are from the prototype catalogue ({mockReviews.length} sample reviews). Live totals will come from the database.
        </p>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-900 md:text-4xl">Popular categories</h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-600">
              Start with a trade, then narrow the list by district and price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {categories.map((category) => {
              const count = mockProviders.filter((provider) => provider.main_category_id === category.id).length
              return (
                <Link key={category.slug} href={`/categories/${category.slug}`} className="group">
                  <Card variant="interactive" padding="md" className="h-full text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 group-hover:bg-primary-600 group-hover:text-white">
                      <CategoryIcon slug={category.slug} />
                    </div>
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-700">{category.name}</h3>
                    <p className="mt-1 text-sm text-secondary-500">{count} providers</p>
                  </Card>
                </Link>
              )
            })}
          </div>
          <div className="mt-10 text-center">
            <Link href="/categories" className="inline-flex items-center gap-2 font-medium text-primary-700 hover:text-primary-800">
              View all categories
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="mb-3 text-3xl font-bold text-secondary-900 md:text-4xl">Featured providers</h2>
              <p className="text-lg text-secondary-600">Highest-rated profiles in the current catalogue.</p>
            </div>
            <Link href="/browse" className="inline-flex items-center gap-2 font-medium text-primary-700 hover:text-primary-800">
              Browse all services
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featuredProviders.map((provider) => {
              const category = mockCategories.find((item) => item.id === provider.main_category_id)
              const district = SRI_LANKAN_DISTRICTS.find((item) => item.id === provider.district)
              return (
                <ProviderCard
                  key={provider.id}
                  provider={{
                    id: provider.id,
                    name: provider.business_name,
                    category: category?.name || 'Service',
                    location: [provider.city, district?.name].filter(Boolean).join(', '),
                    rating: provider.rating,
                    reviewCount: provider.review_count,
                    startingPrice: getStartingPrice(provider.id),
                    isVerified: provider.verification_status === 'verified',
                    image: provider.cover_image_url,
                  }}
                />
              )
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-900 md:text-4xl">How it works</h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-600">Three steps from search to hire.</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-700">
                  <step.icon className="h-7 w-7" aria-hidden="true" />
                  <span className="absolute -top-2 -right-2 rounded-full bg-secondary-900 px-2 py-0.5 text-xs font-semibold text-white">
                    {step.number}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-secondary-900">{step.title}</h3>
                <p className="leading-relaxed text-secondary-600">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/how-it-works" variant="outline">
              Read the full steps
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-secondary-50 py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-900 md:text-4xl">Popular locations</h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-600">
              Districts and cities are selected from the shared Sri Lanka location list.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {locations.map((location) => (
              <Link
                key={location.id}
                href={`/browse?district=${location.id}`}
                className="rounded-lg border border-secondary-200 bg-white px-4 py-2 font-medium text-secondary-700 hover:border-primary-300 hover:text-primary-700"
              >
                {location.name}
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/locations" className="inline-flex items-center gap-2 font-medium text-primary-700 hover:text-primary-800">
              View all districts
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary-700 py-16 text-white md:py-24">
        <div className="container max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Become a service provider</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-100">
            Publish your services, set coverage by district, show prices in LKR and receive enquiries from people already looking for the work you do.
          </p>
          <div className="mb-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: Users, title: 'Reach customers', text: 'Appear when people search your category and district.' },
              { icon: Star, title: 'Show your record', text: 'Profiles carry ratings, reviews and a verification state.' },
              { icon: Truck, title: 'Set how you work', text: 'Offer work at your premises, at the customer, or remotely.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl bg-primary-800/60 p-6">
                <item.icon className="mx-auto mb-4 h-6 w-6" aria-hidden="true" />
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-primary-100">{item.text}</p>
              </div>
            ))}
          </div>
          <Button href="/auth/register?role=provider" variant="secondary" size="lg">
            Post a service
          </Button>
        </div>
      </section>

      <section className="bg-white py-16 md:py-24">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-secondary-900 md:text-4xl">Customer stories</h2>
            <p className="mx-auto max-w-2xl text-lg text-secondary-600">
              Illustrative feedback for the design. Published reviews will come from completed jobs.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} variant="outlined" padding="lg" className="h-full">
                <div className="mb-4 flex items-center gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-5 w-5 ${index < testimonial.rating ? 'fill-warning-400 text-warning-400' : 'text-secondary-200'}`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mb-6 leading-relaxed text-secondary-700">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 font-semibold text-primary-800">
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">{testimonial.name}</p>
                    <p className="text-sm text-secondary-500">
                      {testimonial.location} · {testimonial.service}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary-900 py-16 text-white md:py-24">
        <div className="container text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to find a professional?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-secondary-300">
            Search the catalogue or create an account to save providers and send enquiries.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button href="/browse" size="lg">
              Browse services
            </Button>
            <Button href="/auth/register?role=customer" size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Create a free account
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
