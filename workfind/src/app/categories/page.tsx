import { Metadata } from 'next'
import { Search, ChevronRight, Star, MapPin, Briefcase, Users, Award, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { CategoryIcon } from '@/components/marketplace/CategoryIcon'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Service Categories',
  description: 'Explore all service categories available on WorkFind. Find electricians, plumbers, cleaners, and more in Sri Lanka.',
}

async function getCategories() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 3600 },
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

async function getProvidersCountByCategory(categoryId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/providers/count?category=${categoryId}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      return data.count || 0
    }
  } catch (error) {
    console.error('Failed to fetch provider count:', error)
  }
  return 0
}

async function getListingsCountByCategory(categoryId: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/listings/count?category=${categoryId}`, {
      next: { revalidate: 300 },
    })
    if (res.ok) {
      const data = await res.json()
      return data.count || 0
    }
  } catch (error) {
    console.error('Failed to fetch listings count:', error)
  }
  return 0
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary-50 to-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-900 mb-6">
              Explore Service Categories
            </h1>
            <p className="text-xl text-secondary-600 max-w-2xl mx-auto mb-10">
              Find the right professional for any job. Browse our comprehensive categories covering all home and business services across Sri Lanka.
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <Link href="/browse" className="block">
                <div className="bg-white rounded-2xl shadow-xl p-4 md:p-6">
                  <label htmlFor="category-search" className="visually-hidden">
                    Search for a service category
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" aria-hidden="true" />
                      <input
                        id="category-search"
                        type="search"
                        placeholder="What service do you need? (e.g., electrician, plumbing, cleaning...)"
                        className="w-full px-4 py-3 pl-12 text-lg text-secondary-900 placeholder-secondary-400 bg-secondary-50 border border-secondary-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                    <Button size="lg" className="w-full md:w-auto min-w-[160px] h-12 md:h-14" rightIcon={<ChevronRight className="w-5 h-5" aria-hidden="true" />}>
                      Search
                    </Button>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-white">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-secondary-900 mb-4">
                All Categories
              </h2>
              <p className="text-secondary-600 text-lg">
                {categories.length} categories with thousands of verified providers
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categories.map((category: any) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group"
                >
                  <Card variant="interactive" padding="lg" className="h-full flex flex-col">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-100 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 flex items-center justify-center text-4xl">
                      <CategoryIcon slug={category.slug} />
                    </div>
                    <h3 className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors text-center mb-2 flex-1">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-secondary-500 text-center mb-4 line-clamp-2 flex-1">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-4 text-sm text-secondary-500 pt-4 border-t border-secondary-100">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" aria-hidden="true" />
                        <span id={`providers-${category.id}`}>Loading...</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" aria-hidden="true" />
                        <span id={`listings-${category.id}`}>Loading...</span>
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-16">
                <p className="text-secondary-600">No categories available at the moment.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why Choose WorkFind */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              Why Choose WorkFind?
            </h2>
            <p className="text-primary-100 mb-12 max-w-2xl mx-auto">
              We verify every provider, protect your payments, and make it easy to find the right professional for any job.
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

      {/* CTA */}
      <section className="py-16 bg-secondary-900 text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-secondary-300 mb-8 max-w-2xl mx-auto">
            Post a job request and let qualified providers send you quotes. It&apos;s free and only takes a minute.
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

// Client-side component to load dynamic counts
function CategoryStats() {
  return null // Will be hydrated with client-side script
}