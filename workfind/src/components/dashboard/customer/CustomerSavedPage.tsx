'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Heart,
  Search,
  MapPin,
  Star,
  Briefcase,
  ChevronRight,
  X,
  Trash2,
  MessageSquare,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import { formatCurrency } from '@/lib/utils'

interface CustomerSavedPageProps {
  userId: string
}

interface SavedProvider {
  id: string
  provider_id: string
  provider: {
    id: string
    business_name: string
    business_logo_url: string | null
    cover_image_url: string | null
    short_intro: string | null
    rating: number
    review_count: number
    verification_status: string
    years_experience: number
    district: string
    city: string
    phone: string | null
    whatsapp: string | null
    service_delivery_types: string[]
    main_category_id: string | null
    category?: { name: string; slug: string }
  }
  created_at: string
}

const categoryOptions: SelectOption[] = [
  { value: '', label: 'All Categories' },
]

const districtOptions: SelectOption[] = [
  { value: '', label: 'All Districts' },
  ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
]

const sortOptions: SelectOption[] = [
  { value: 'recent', label: 'Most Recently Saved' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'reviews', label: 'Most Reviewed' },
  { value: 'name', label: 'Name A-Z' },
]

export default function CustomerSavedPage({ userId }: CustomerSavedPageProps) {
  const [savedProviders, setSavedProviders] = useState<SavedProvider[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [districtFilter, setDistrictFilter] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, providerId: string | null }>({ open: false, providerId: null })

  useEffect(() => {
    const mockData: SavedProvider[] = [
      {
        id: 'save-1',
        provider_id: 'prov-1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        provider: {
          id: 'prov-1',
          business_name: 'Premier Electrical Services',
          business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
          cover_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=300&fit=crop',
          short_intro: 'Licensed electricians with 15+ years experience. 24/7 emergency service available.',
          rating: 4.9,
          review_count: 127,
          verification_status: 'verified',
          years_experience: 15,
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 123 4567',
          service_delivery_types: ['customer_location', 'business_location'],
          main_category_id: 'cat-1',
          category: { name: 'Electrical', slug: 'electrical' },
        }
      },
      {
        id: 'save-2',
        provider_id: 'prov-2',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        provider: {
          id: 'prov-2',
          business_name: 'AquaFlow Plumbing Solutions',
          business_logo_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=200&h=200&fit=crop',
          cover_image_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=600&h=300&fit=crop',
          short_intro: 'Fast, reliable plumbing services. No call-out fees. 1-year workmanship guarantee.',
          rating: 4.8,
          review_count: 94,
          verification_status: 'verified',
          years_experience: 10,
          district: 'gampaha',
          city: 'Negombo',
          phone: '+94 31 223 4567',
          whatsapp: '+94 76 234 5678',
          service_delivery_types: ['customer_location'],
          main_category_id: 'cat-2',
          category: { name: 'Plumbing', slug: 'plumbing' },
        }
      },
      {
        id: 'save-3',
        provider_id: 'prov-3',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        provider: {
          id: 'prov-3',
          business_name: 'SparkleClean Home Services',
          business_logo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
          cover_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=300&fit=crop',
          short_intro: 'Professional cleaning you can trust. Eco-friendly products. Background-checked staff.',
          rating: 4.9,
          review_count: 203,
          verification_status: 'verified',
          years_experience: 8,
          district: 'kandy',
          city: 'Kandy',
          phone: '+94 81 223 4567',
          whatsapp: '+94 71 345 6789',
          service_delivery_types: ['customer_location'],
          main_category_id: 'cat-3',
          category: { name: 'Cleaning', slug: 'cleaning' },
        }
      },
    ]

    setSavedProviders(mockData)
    setIsLoading(false)
  }, [])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredProviders = savedProviders.filter(item => {
    const provider = item.provider
    const matchesSearch = provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      provider.short_intro?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !categoryFilter || provider.main_category_id === categoryFilter
    const matchesDistrict = !districtFilter || provider.district === districtFilter
    return matchesSearch && matchesCategory && matchesDistrict
  })

  const sortedProviders = [...filteredProviders].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.provider.rating - a.provider.rating
      case 'reviews':
        return b.provider.review_count - a.provider.review_count
      case 'name':
        return a.provider.business_name.localeCompare(b.provider.business_name)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const handleRemove = (savedId: string) => {
    setDeleteConfirm({ open: true, providerId: savedId })
  }

  const confirmRemove = async () => {
    if (!deleteConfirm.providerId) return
    try {
      setSavedProviders(prev => prev.filter(p => p.id !== deleteConfirm.providerId))
      addToast('Provider removed from saved', 'success')
    } catch (error) {
      addToast('Failed to remove provider', 'error')
    } finally {
      setDeleteConfirm({ open: false, providerId: null })
    }
  }

  const getWhatsAppLink = (phone?: string | null, whatsapp?: string | null) => {
    const number = whatsapp || phone
    return number ? `https://wa.me/94${number.replace(/\D/g, '')}` : '#'
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Saved Providers</h1>
            <p className="text-secondary-600 mt-1">{savedProviders.length} provider{savedProviders.length !== 1 ? 's' : ''} saved</p>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Browse More
            </Button>
          </Link>
        </div>

        <Card variant="outlined" padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search saved providers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
              className="w-full sm:w-64"
            />
            <Select
              placeholder="All Categories"
              options={categoryOptions}
              value={categoryFilter}
              onChange={(value) => setCategoryFilter(value)}
              leftIcon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
              className="w-44"
            />
            <Select
              placeholder="All Districts"
              options={districtOptions}
              value={districtFilter}
              onChange={(value) => setDistrictFilter(value)}
              leftIcon={<MapPin className="w-5 h-5" aria-hidden="true" />}
              className="w-44"
            />
            <Select
              placeholder="Sort By"
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              leftIcon={<ChevronRight className="w-5 h-5" aria-hidden="true" />}
              className="w-40"
            />
          </div>
        </Card>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} variant="outlined" padding="none" className="animate-pulse">
                <div className="aspect-video bg-secondary-200 rounded-t-xl" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-3/4" />
                  <div className="h-4 bg-secondary-200 rounded w-1/2" />
                  <div className="h-8 bg-secondary-200 rounded w-full" />
                </div>
              </Card>
            ))}
          </div>
        ) : sortedProviders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((item) => {
              const provider = item.provider
              const whatsappLink = getWhatsAppLink(provider.phone, provider.whatsapp)

              return (
                <Card key={item.id} variant="elevated" padding="none" className="overflow-hidden h-full flex flex-col transition-shadow duration-200 hover:shadow-xl relative">
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-error-100 hover:text-error-600 transition-colors text-secondary-500"
                      aria-label="Remove from saved"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="relative h-40">
                    <img
                      src={provider.cover_image_url || provider.business_logo_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=300&fit=crop'}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3">
                      {provider.verification_status === 'verified' && (
                        <Badge variant="primary" className="gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
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
                        <Link
                          href={`/providers/${provider.id}`}
                          className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors truncate block"
                        >
                          {provider.business_name}
                        </Link>
                        <p className="text-sm text-secondary-500 truncate">
                          {provider.short_intro || `${provider.years_experience}+ years experience`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      {provider.category && (
                        <Badge variant="secondary" size="sm">
                          {provider.category.name}
                        </Badge>
                      )}
                      {provider.service_delivery_types.length > 0 && (
                        <Badge variant="outline" size="sm">
                          {provider.service_delivery_types[0].replace('_', ' ')}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-auto pt-3 border-t border-secondary-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                        <span className="font-medium text-secondary-900">{provider.rating.toFixed(1)}</span>
                        <span className="text-sm text-secondary-500">({provider.review_count})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          aria-label="Chat on WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </Link>
                        <a
                          href={`tel:${provider.phone}`}
                          className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors"
                          aria-label="Call provider"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <Link
                          href={`/providers/${provider.id}`}
                          className="p-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 transition-colors"
                          aria-label="View profile"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No saved providers"
            description={searchQuery || categoryFilter || districtFilter
              ? 'Try adjusting your filters or search terms.'
              : 'Start saving providers you like to see them here.'}
            action={{
              label: searchQuery || categoryFilter || districtFilter ? 'Clear filters' : 'Browse Providers',
              onClick: () => {
                if (searchQuery || categoryFilter || districtFilter) {
                  setSearchQuery('')
                  setCategoryFilter('')
                  setDistrictFilter('')
                } else {
                  window.location.href = '/browse'
                }
              },
              variant: 'outline',
            }}
          />
        )}
      </div>
    </div>
  )
}