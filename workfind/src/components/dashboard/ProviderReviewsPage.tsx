'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Star,
  ChevronRight,
  X,
  Trash2,
  AlertCircle,
  CheckCircle,
  Eye,
  Reply,
  Flag,
  Shield,
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
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils'

interface ProviderReviewsPageProps {
  userId: string
}

interface Review {
  id: string
  customer_id: string
  provider_id: string
  job_request_id: string | null
  listing_id: string | null
  rating: number
  title: string | null
  content: string
  images: string[]
  is_verified_purchase: boolean
  status: string
  moderation_note: string | null
  created_at: string
  updated_at: string
  customer: {
    full_name: string
    avatar_url: string | null
  }
  listing?: {
    id: string
    title: string
  }
  job_request?: {
    id: string
    title: string
  }
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'published', label: 'Published' },
  { value: 'pending', label: 'Pending' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'flagged', label: 'Flagged' },
]

const ratingOptions: SelectOption[] = [
  { value: '', label: 'All Ratings' },
  { value: '5', label: '5 Stars' },
  { value: '4', label: '4 Stars' },
  { value: '3', label: '3 Stars' },
  { value: '2', label: '2 Stars' },
  { value: '1', label: '1 Star' },
]

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rating_high', label: 'Highest Rated' },
  { value: 'rating_low', label: 'Lowest Rated' },
]

export default function ProviderReviewsPage({ userId }: ProviderReviewsPageProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [ratingFilter, setRatingFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [viewReview, setViewReview] = useState<Review | null>(null)
  const [replyModal, setReplyModal] = useState<{ open: boolean, review: Review | null, replyMessage: string }>({ open: false, review: null, replyMessage: '' })
  const [flagModal, setFlagModal] = useState<{ open: boolean, reviewId: string | null }>({ open: false, reviewId: null })

  useEffect(() => {
    fetchReviews()
  }, [])

  const fetchReviews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/reviews')
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  // Calculate stats
  const publishedReviews = reviews.filter(r => r.status === 'published')
  const avgRating = publishedReviews.length > 0
    ? (publishedReviews.reduce((sum, r) => sum + r.rating, 0) / publishedReviews.length).toFixed(1)
    : '0.0'
  const totalReviews = publishedReviews.length
  const verifiedReviews = publishedReviews.filter(r => r.is_verified_purchase).length

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (review.title && review.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      review.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || review.status === statusFilter
    const matchesRating = !ratingFilter || review.rating === parseInt(ratingFilter)
    return matchesSearch && matchesStatus && matchesRating
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

  const handleReplySubmit = async () => {
    if (!replyModal.review || !replyModal.replyMessage.trim()) return

    try {
      const response = await fetch('/api/provider/reviews/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_id: replyModal.review.id,
          content: replyModal.replyMessage,
        }),
      })
      if (response.ok) {
        addToast('Response posted successfully', 'success')
        setReplyModal({ open: false, review: null, replyMessage: '' })
      } else {
        addToast('Failed to post response', 'error')
      }
    } catch (error) {
      addToast('Failed to post response', 'error')
    }
  }

  const handleFlagReview = async () => {
    if (!flagModal.reviewId) return

    try {
      const response = await fetch(`/api/provider/reviews/${flagModal.reviewId}/flag`, {
        method: 'POST',
      })
      if (response.ok) {
        setReviews(prev => prev.map(r => r.id === flagModal.reviewId ? { ...r, status: 'flagged' } : r))
        addToast('Review flagged for moderation', 'success')
      } else {
        addToast('Failed to flag review', 'error')
      }
    } catch (error) {
      addToast('Failed to flag review', 'error')
    } finally {
      setFlagModal({ open: false, reviewId: null })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="success" size="sm"><CheckCircle className="w-3 h-3 mr-1" /> Published</Badge>
      case 'pending': return <Badge variant="warning" size="sm"><AlertCircle className="w-3 h-3 mr-1" /> Pending</Badge>
      case 'hidden': return <Badge variant="secondary" size="sm"><Eye className="w-3 h-3 mr-1" /> Hidden</Badge>
      case 'flagged': return <Badge variant="error" size="sm"><Flag className="w-3 h-3 mr-1" /> Flagged</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`${starSize} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-300'}`}
            aria-hidden="true"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Reviews</h1>
            <p className="text-secondary-600 mt-1">Manage and respond to customer reviews</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Average Rating</p>
                <p className="text-4xl font-bold text-secondary-900 mt-1 flex items-center gap-2">
                  {avgRating}
                  <Star className="w-7 h-7 fill-yellow-400 text-yellow-400" />
                </p>
                <p className="text-sm text-secondary-500 mt-2">Based on {totalReviews} reviews</p>
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Total Reviews</p>
                <p className="text-4xl font-bold text-secondary-900 mt-1">{totalReviews}</p>
                <p className="text-sm text-secondary-500 mt-2">{verifiedReviews} verified purchases</p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Verified Reviews</p>
                <p className="text-4xl font-bold text-secondary-900 mt-1">{verifiedReviews}</p>
                <p className="text-sm text-secondary-500 mt-2">
                  {totalReviews > 0 ? Math.round((verifiedReviews / totalReviews) * 100) : 0}% of total
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Pending Moderation</p>
                <p className="text-4xl font-bold text-secondary-900 mt-1">
                  {reviews.filter(r => r.status === 'pending').length}
                </p>
                <p className="text-sm text-secondary-500 mt-2">Awaiting approval</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
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
              placeholder="All Ratings"
              options={ratingOptions}
              value={ratingFilter}
              onChange={(value) => setRatingFilter(value)}
              leftIcon={<Star className="w-5 h-5 fill-yellow-400 text-yellow-400" aria-hidden="true" />}
              className="w-40"
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
        ) : paginatedReviews.length === 0 ? (
          <EmptyState
            title="No reviews found"
            description={searchQuery || statusFilter || ratingFilter
              ? 'Try adjusting your filters or search terms.'
              : 'No reviews yet. They will appear here when customers leave feedback.'}
            action={{
              label: searchQuery || statusFilter || ratingFilter ? 'Clear filters' : 'Go to Dashboard',
              onClick: () => {
                if (searchQuery || statusFilter || ratingFilter) {
                  setSearchQuery('')
                  setStatusFilter('')
                  setRatingFilter('')
                } else {
                  window.location.href = '/dashboard/provider'
                }
              },
              variant: 'outline',
            }}
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <Card key={review.id} variant="outlined" padding="lg">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <Avatar
                        src={review.customer.avatar_url}
                        fallback={review.customer.full_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-secondary-900">{review.customer.full_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating, 'sm')}
                          <span className="text-sm font-medium text-secondary-700">{review.rating}.0</span>
                          {review.is_verified_purchase && (
                            <Badge variant="primary" size="xs" className="ml-2">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          {review.title && (
                            <h3 className="font-semibold text-secondary-900 mb-1">{review.title}</h3>
                          )}
                          <p className="text-secondary-600 line-clamp-3">{review.content}</p>
                        </div>
                        {getStatusBadge(review.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        {review.listing && (
                          <Link
                            href={`/services/${review.listing.id}`}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                          >
                            <span>Service:</span>
                            <span className="font-medium text-secondary-900">{review.listing.title}</span>
                          </Link>
                        )}
                        {review.job_request && (
                          <Link
                            href={`/dashboard/provider/job-requests/${review.job_request.id}`}
                            className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                          >
                            <span>Job:</span>
                            <span className="font-medium text-secondary-900">{review.job_request.title}</span>
                          </Link>
                        )}
                        <span className="flex items-center gap-1 text-secondary-500">
                          <Clock className="w-4 h-4" />
                          {new Date(review.created_at).toLocaleDateString('en-LK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[200px]">
                      {review.status === 'published' && (
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => setReplyModal({ open: true, review, replyMessage: '' })} rightIcon={<Reply className="w-4 h-4" />}>
                          Respond
                        </Button>
                      )}
                      {review.status === 'published' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full sm:w-auto text-error-600 hover:bg-error-50"
                          onClick={() => setFlagModal({ open: true, reviewId: review.id })}
                        >
                          <Flag className="w-4 h-4 mr-1" />
                          Flag
                        </Button>
                      )}
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
        )}

      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModal.open}
        onClose={() => setReplyModal({ open: false, review: null, replyMessage: '' })}
        title="Respond to Review"
        description={replyModal.review ? `Replying to: ${replyModal.review.customer.full_name}` : ''}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-secondary-600 mb-3">
              Your response will be publicly visible on your profile. Be professional and constructive.
            </p>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Your Response</label>
            <textarea
              value={replyModal.replyMessage}
              onChange={(e) => setReplyModal(prev => ({ ...prev, replyMessage: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
              placeholder="Thank the customer, address any concerns, and share your perspective..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setReplyModal({ open: false, review: null, replyMessage: '' })}>Cancel</Button>
            <Button onClick={handleReplySubmit} rightIcon={<Reply className="w-4 h-4" />}>
              Post Response
            </Button>
          </div>
        </div>
      </Modal>

      {/* Flag Modal */}
      <Modal
        isOpen={flagModal.open}
        onClose={() => setFlagModal({ open: false, reviewId: null })}
        title="Flag Review"
        description="Are you sure you want to flag this review for moderation? This will hide it temporarily while our team reviews it."
        size="sm"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setFlagModal({ open: false, reviewId: null })}>Cancel</Button>
          <Button variant="destructive" onClick={handleFlagReview}>
            <Flag className="w-4 h-4 mr-2" />
            Flag Review
          </Button>
        </div>
      </Modal>
    </div>
  )
}