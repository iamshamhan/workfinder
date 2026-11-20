'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Star,
  ChevronRight,
  X,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  AlertCircle,
  Clock,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils'

interface CustomerReviewsPageProps {
  userId: string
}

interface Review {
  id: string
  customer_id: string
  provider_id: string
  provider: {
    id: string
    business_name: string
    business_logo_url: string | null
    rating: number
    review_count: number
    verification_status: string
    district: string
    city: string
  }
  job_request_id: string | null
  job_request?: {
    id: string
    title: string
  }
  listing_id: string | null
  listing?: {
    id: string
    title: string
  }
  rating: number
  title: string | null
  content: string
  images: string[]
  is_verified_purchase: boolean
  status: string
  created_at: string
  updated_at: string
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'flagged', label: 'Flagged' },
]

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
]

export default function CustomerReviewsPage({ userId }: CustomerReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, reviewId: string | null }>({ open: false, reviewId: null })
  const [editReview, setEditReview] = useState<Review | null>(null)
  const [editForm, setEditForm] = useState({ rating: 5, title: '', content: '' })

  useEffect(() => {
    const mockData: Review[] = [
      {
        id: 'rev-1',
        customer_id: 'cust-1',
        provider_id: 'prov-1',
        provider: {
          id: 'prov-1',
          business_name: 'Premier Electrical Services',
          business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
          rating: 4.9,
          review_count: 127,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
        },
        job_request_id: null,
        listing_id: 'listing-1',
        listing: {
          id: 'listing-1',
          title: 'Complete Home Electrical Wiring',
        },
        rating: 5,
        title: 'Excellent work, very professional',
        content: 'Premier Electrical rewired our entire 30-year-old house. They were punctual, clean, and explained everything clearly. The team completed the work in 4 days as promised. No hidden costs. Highly recommend!',
        images: [],
        is_verified_purchase: true,
        status: 'published',
        created_at: new Date('2024-03-15').toISOString(),
        updated_at: new Date('2024-03-15').toISOString(),
      },
      {
        id: 'rev-2',
        customer_id: 'cust-1',
        provider_id: 'prov-2',
        provider: {
          id: 'prov-2',
          business_name: 'AquaFlow Plumbing Solutions',
          business_logo_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=200&h=200&fit=crop',
          rating: 4.8,
          review_count: 94,
          verification_status: 'verified',
          district: 'gampaha',
          city: 'Negombo',
        },
        job_request_id: null,
        listing_id: 'listing-4',
        listing: {
          id: 'listing-4',
          title: 'Bathroom Plumbing Installation & Renovation',
        },
        rating: 5,
        title: 'Bathroom renovation exceeded expectations',
        content: 'AquaFlow renovated our master bathroom. The plumber suggested a better layout that saved space. Work was completed in 5 days. Clean, professional, and the 1-year guarantee gives peace of mind.',
        images: [],
        is_verified_purchase: true,
        status: 'published',
        created_at: new Date('2024-03-20').toISOString(),
        updated_at: new Date('2024-03-20').toISOString(),
      },
      {
        id: 'rev-3',
        customer_id: 'cust-1',
        provider_id: 'prov-3',
        provider: {
          id: 'prov-3',
          business_name: 'SparkleClean Home Services',
          business_logo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
          rating: 4.9,
          review_count: 203,
          verification_status: 'verified',
          district: 'kandy',
          city: 'Kandy',
        },
        job_request_id: null,
        listing_id: 'listing-6',
        listing: {
          id: 'listing-6',
          title: 'Standard Home Cleaning Service',
        },
        rating: 5,
        title: 'Reliable and trustworthy cleaners',
        content: 'Have been using SparkleClean for 6 months for weekly cleaning. Same cleaner comes every time, knows our preferences. Eco-friendly products don\'t trigger my allergies. Easy to reschedule when needed.',
        images: [],
        is_verified_purchase: true,
        status: 'published',
        created_at: new Date('2024-03-05').toISOString(),
        updated_at: new Date('2024-03-05').toISOString(),
      },
      {
        id: 'rev-4',
        customer_id: 'cust-1',
        provider_id: 'prov-3',
        provider: {
          id: 'prov-3',
          business_name: 'SparkleClean Home Services',
          business_logo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
          rating: 4.9,
          review_count: 203,
          verification_status: 'verified',
          district: 'kandy',
          city: 'Kandy',
        },
        job_request_id: null,
        listing_id: 'listing-7',
        listing: {
          id: 'listing-7',
          title: 'Deep Cleaning & Sanitization',
        },
        rating: 4,
        title: 'Thorough deep cleaning',
        content: 'Used their deep cleaning service after renovation. Very thorough - even cleaned inside cabinets and window tracks. Only reason for 4 stars is they arrived 30 minutes late. Otherwise excellent work.',
        images: [],
        is_verified_purchase: true,
        status: 'published',
        created_at: new Date('2024-02-28').toISOString(),
        updated_at: new Date('2024-02-28').toISOString(),
      },
      {
        id: 'rev-5',
        customer_id: 'cust-1',
        provider_id: 'prov-5',
        provider: {
          id: 'prov-5',
          business_name: 'TechFix Computer Solutions',
          business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
          rating: 4.8,
          review_count: 156,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Moratuwa',
        },
        job_request_id: null,
        listing_id: 'listing-10',
        listing: {
          id: 'listing-10',
          title: 'Laptop & Computer Repair',
        },
        rating: 5,
        title: 'Saved my laptop and data',
        content: 'Spilled coffee on my MacBook. TechFix recovered all my data and fixed the keyboard in 2 days. Much cheaper than Apple store. They even cleaned the inside. Highly recommend for any computer issues.',
        images: [],
        is_verified_purchase: true,
        status: 'published',
        created_at: new Date('2024-03-12').toISOString(),
        updated_at: new Date('2024-03-12').toISOString(),
      },
      {
        id: 'rev-6',
        customer_id: 'cust-1',
        provider_id: 'prov-1',
        provider: {
          id: 'prov-1',
          business_name: 'Premier Electrical Services',
          business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
          rating: 4.9,
          review_count: 127,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
        },
        job_request_id: null,
        listing_id: 'listing-2',
        listing: {
          id: 'listing-2',
          title: 'Electrical Fault Diagnosis & Repair',
        },
        rating: 3,
        title: 'Good service but expensive',
        content: 'Fixed the issue quickly but the hourly rate was higher than expected. Would have appreciated a quote upfront. Electrician was professional and cleaned up after.',
        images: [],
        is_verified_purchase: true,
        status: 'pending',
        created_at: new Date('2024-03-25').toISOString(),
        updated_at: new Date('2024-03-25').toISOString(),
      },
    ]

    setReviews(mockData)
    setIsLoading(false)
  }, [])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredReviews = reviews.filter(review => {
    const providerName = review.provider.business_name.toLowerCase()
    const listingTitle = review.listing?.title.toLowerCase() || ''
    const title = review.title?.toLowerCase() || ''
    const content = review.content.toLowerCase()

    const matchesSearch = providerName.includes(searchQuery.toLowerCase()) ||
      listingTitle.includes(searchQuery.toLowerCase()) ||
      title.includes(searchQuery.toLowerCase()) ||
      content.includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'rating_high':
        return b.rating - a.rating
      case 'rating_low':
        return a.rating - b.rating
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage)
  const paginatedReviews = sortedReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (reviewId: string) => {
    setDeleteConfirm({ open: true, reviewId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.reviewId) return
    try {
      setReviews(prev => prev.filter(r => r.id !== deleteConfirm.reviewId))
      addToast('Review deleted', 'success')
    } catch (error) {
      addToast('Failed to delete review', 'error')
    } finally {
      setDeleteConfirm({ open: false, reviewId: null })
    }
  }

  const handleEdit = (review: Review) => {
    setEditReview(review)
    setEditForm({
      rating: review.rating,
      title: review.title || '',
      content: review.content,
    })
  }

  const handleEditSubmit = async () => {
    if (!editReview) return
    try {
      setReviews(prev => prev.map(r =>
        r.id === editReview.id
          ? { ...r, rating: editForm.rating, title: editForm.title, content: editForm.content, updated_at: new Date().toISOString() }
          : r
      ))
      addToast('Review updated successfully', 'success')
      setEditReview(null)
    } catch (error) {
      addToast('Failed to update review', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="success" size="sm">Published</Badge>
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'hidden': return <Badge variant="secondary" size="sm">Hidden</Badge>
      case 'flagged': return <Badge variant="error" size="sm">Flagged</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const renderReviewsList = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Card key={i} variant="outlined" padding="lg" className="animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-secondary-200 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-secondary-200 rounded w-1/3" />
                  <div className="h-4 bg-secondary-200 rounded w-1/2" />
                  <div className="h-4 bg-secondary-200 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )
    }

    if (paginatedReviews.length === 0) {
      return (
        <EmptyState
          title="No reviews found"
          description={searchQuery || statusFilter
            ? 'Try adjusting your filters or search terms.'
            : 'You haven\'t written any reviews yet. After completing a job, you can leave a review for the provider!'}
          action={{
            label: searchQuery || statusFilter ? 'Clear filters' : 'Browse Providers',
            onClick: () => {
              if (searchQuery || statusFilter) {
                setSearchQuery('')
                setStatusFilter('')
              } else {
                window.location.href = '/browse'
              }
            },
            variant: 'outline',
          }}
        />
      )
    }

    return (
      <>
        <div className="space-y-4">
          {paginatedReviews.map((review) => (
            <Card key={review.id} variant="outlined" padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar
                    src={review.provider.business_logo_url}
                    fallback={review.provider.business_name}
                    size="lg"
                  />
                  <div>
                    <Link
                      href={`/providers/${review.provider.id}`}
                      className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                    >
                      {review.provider.business_name}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-secondary-500">
                      {review.provider.verification_status === 'verified' && (
                        <Badge variant="primary" className="gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                          Verified
                        </Badge>
                      )}
                      <span>{review.provider.city}, {review.provider.district}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      {review.listing && (
                        <Link
                          href={`/services/${review.listing.id}`}
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {review.listing.title}
                        </Link>
                      )}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-200'}`}
                            aria-hidden="true"
                          />
                        ))}
                        <span className="font-semibold text-secondary-900">{review.rating}/5</span>
                      </div>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                  {review.title && (
                    <h4 className="font-semibold text-secondary-900 mb-1">{review.title}</h4>
                  )}
                  <p className="text-secondary-600 mb-3">{review.content}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-secondary-500">
                      <Clock className="w-4 h-4" />
                      {new Date(review.created_at).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                    {review.is_verified_purchase && (
                      <Badge variant="success" size="sm" className="gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[180px]">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(review)} rightIcon={<Edit className="w-4 h-4" />}>
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-error-600 border-error-600 hover:bg-error-50"
                    onClick={() => handleDelete(review.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedReviews.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    )
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredReviews = reviews.filter(review => {
    const providerName = review.provider.business_name.toLowerCase()
    const listingTitle = review.listing?.title.toLowerCase() || ''
    const title = review.title?.toLowerCase() || ''
    const content = review.content.toLowerCase()

    const matchesSearch = providerName.includes(searchQuery.toLowerCase()) ||
      listingTitle.includes(searchQuery.toLowerCase()) ||
      title.includes(searchQuery.toLowerCase()) ||
      content.includes(searchQuery.toLowerCase())

    const matchesStatus = !statusFilter || review.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'rating_high':
        return b.rating - a.rating
      case 'rating_low':
        return a.rating - b.rating
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedReviews.length / itemsPerPage)
  const paginatedReviews = sortedReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (reviewId: string) => {
    setDeleteConfirm({ open: true, reviewId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.reviewId) return
    try {
      setReviews(prev => prev.filter(r => r.id !== deleteConfirm.reviewId))
      addToast('Review deleted', 'success')
    } catch (error) {
      addToast('Failed to delete review', 'error')
    } finally {
      setDeleteConfirm({ open: false, reviewId: null })
    }
  }

  const handleEdit = (review: Review) => {
    setEditReview(review)
    setEditForm({
      rating: review.rating,
      title: review.title || '',
      content: review.content,
    })
  }

  const handleEditSubmit = async () => {
    if (!editReview) return
    try {
      setReviews(prev => prev.map(r =>
        r.id === editReview.id
          ? { ...r, rating: editForm.rating, title: editForm.title, content: editForm.content, updated_at: new Date().toISOString() }
          : r
      ))
      addToast('Review updated successfully', 'success')
      setEditReview(null)
    } catch (error) {
      addToast('Failed to update review', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="success" size="sm">Published</Badge>
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'hidden': return <Badge variant="secondary" size="sm">Hidden</Badge>
      case 'flagged': return <Badge variant="error" size="sm">Flagged</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Reviews</h1>
            <p className="text-secondary-600 mt-1">Manage your reviews for service providers</p>
          </div>
          <Button variant="outline" size="sm" rightIcon={<Plus className="w-4 h-4" />}>
            Write New Review
          </Button>
        </div>

        <Card variant="outlined" padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
              className="w-full sm:w-64"
            />
            <Select
              placeholder="All Status"
              options={statusOptions}
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
              className="w-40"
            />
            <Select
              placeholder="Sort By"
              options={sortOptions}
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              leftIcon={<ChevronRight className="w-5 h-5" aria-hidden="true" />}
              className="w-44"
            />
          </div>
        </Card>

        {renderReviewsList()}
      </div>
    </div>
  )
}