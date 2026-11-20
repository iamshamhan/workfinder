'use client'

import { useState, useEffect } from 'react'
import {
  Star,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Flag,
  Shield,
  MessageSquare,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { Dropdown } from '@/components/ui/Dropdown'
import { Avatar } from '@/components/ui/Avatar'
import { Toast, ToastContainer, toast } from '@/components/ui/Toast'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

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
  status: 'pending' | 'published' | 'hidden' | 'flagged'
  moderation_note: string | null
  created_at: string
  updated_at: string
  profiles?: { full_name: string | null; avatar_url: string | null }
  provider_profiles?: { business_name: string }
  service_listings?: { title: string }
  job_requests?: { title: string }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'published', label: 'Published' },
  { value: 'hidden', label: 'Hidden' },
  { value: 'flagged', label: 'Flagged' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date' },
  { value: 'rating', label: 'Rating' },
  { value: 'status', label: 'Status' },
]

export default function ReviewsModerationPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    status: '',
    provider_id: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [modalAction, setModalAction] = useState<'publish' | 'hide' | 'flag' | 'delete'>('publish')
  const [moderationNote, setModerationNote] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchReviews() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.status) params.set('status', filters.status)
      if (filters.provider_id) params.set('provider_id', filters.provider_id)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/admin/reviews?${params}`)
      if (!res.ok) throw new Error('Failed to fetch reviews')
      const data: PaginatedResponse<Review> = await res.json()
      setReviews(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load reviews')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [pagination.page, filters.status, filters.provider_id, filters.search, filters.sortBy, filters.sortOrder])

  async function handleReviewAction(reviewId: string, action: 'publish' | 'hide' | 'flag') {
    setActionLoading(reviewId)
    try {
      const updates: any = {}

      switch (action) {
        case 'publish':
          updates.status = 'published'
          break
        case 'hide':
          updates.status = 'hidden'
          if (moderationNote) updates.moderation_note = moderationNote
          break
        case 'flag':
          updates.status = 'flagged'
          if (moderationNote) updates.moderation_note = moderationNote
          break
      }

      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, ...updates }),
      })

      if (!res.ok) throw new Error('Failed to update review')

      const actionText = action === 'publish' ? 'published' : action === 'hide' ? 'hidden' : 'flagged'
      toast.success(`Review ${actionText} successfully`)
      setShowActionModal(false)
      setModerationNote('')
      fetchReviews()
    } catch (error) {
      toast.error(`Failed to ${action} review`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteReview() {
    if (!selectedReview) return
    setActionLoading(selectedReview.id)
    try {
      const res = await fetch(`/api/admin/reviews?id=${selectedReview.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete review')
      toast.success('Review deleted successfully')
      setShowActionModal(false)
      setSelectedReview(null)
      fetchReviews()
    } catch (error) {
      toast.error('Failed to delete review')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const openActionModal = (review: Review, action: 'publish' | 'hide' | 'flag' | 'delete') => {
    setSelectedReview(review)
    setModalAction(action)
    setShowActionModal(true)
  }

  const getStatusBadgeVariant = (status: Review['status']) => {
    switch (status) {
      case 'published': return 'success'
      case 'pending': return 'warning'
      case 'hidden': return 'secondary'
      case 'flagged': return 'error'
    }
  }

  const getStatusActions = (review: Review) => {
    const actions = [
      { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { /* view */ } },
    ]

    switch (review.status) {
      case 'pending':
        actions.push(
          { label: 'Publish', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'publish') },
          { label: 'Hide', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'hide') }
        )
        break
      case 'published':
        actions.push(
          { label: 'Hide', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'hide'), danger: true },
          { label: 'Flag', icon: <Flag className="w-4 h-4" />, onClick: () => openActionModal(review, 'flag'), danger: true }
        )
        break
      case 'hidden':
        actions.push(
          { label: 'Publish', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'publish') },
          { label: 'Flag', icon: <Flag className="w-4 h-4" />, onClick: () => openActionModal(review, 'flag'), danger: true }
        )
        break
      case 'flagged':
        actions.push(
          { label: 'Publish', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'publish') },
          { label: 'Hide', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(review, 'hide') }
        )
        break
    }

    actions.push(
      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => openActionModal(review, 'delete'), danger: true }
    )

    return actions
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          'w-4 h-4',
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-300'
        )}
      />
    ))
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Review Moderation</h1>
          <p className="text-secondary-600 mt-1">Moderate customer reviews and manage content</p>
        </div>
        <Button variant="outline" onClick={fetchReviews} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Reviews</p>
              <p className="text-2xl font-bold text-secondary-900">{formatNumber(pagination.total)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Published</p>
              <p className="text-2xl font-bold text-success-600">
                {formatNumber(reviews.filter(r => r.status === 'published').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Pending</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatNumber(reviews.filter(r => r.status === 'pending').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Hidden</p>
              <p className="text-2xl font-bold text-secondary-600">
                {formatNumber(reviews.filter(r => r.status === 'hidden').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Flagged</p>
              <p className="text-2xl font-bold text-error-600">
                {formatNumber(reviews.filter(r => r.status === 'flagged').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <Input
              placeholder="Search reviews..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="Status"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-40"
          />
          <Select
            placeholder="Sort By"
            options={sortOptions}
            value={filters.sortBy}
            onChange={(value) => setFilters({ ...filters, sortBy: value })}
            leftIcon={<ChevronDown className="w-5 h-5" />}
            className="w-40"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
            aria-label={filters.sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
          >
            {filters.sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
        </div>
      </Card>

      {/* Reviews Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading reviews...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <Star className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No reviews found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'rating', header: 'Rating', accessor: (row) => (
                  <div className="flex items-center gap-1">
                    {renderStars(row.rating)}
                    <span className="font-medium ml-1">{row.rating.toFixed(1)}</span>
                  </div>
                ) },
                { key: 'content', header: 'Review', accessor: (row) => (
                  <div>
                    {row.title && <p className="font-medium text-secondary-900 mb-1">{row.title}</p>}
                    <p className="text-sm text-secondary-600 line-clamp-2">{row.content}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-secondary-400">
                      <span>by {row.profiles?.full_name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>for {row.provider_profiles?.business_name || 'Provider'}</span>
                      {row.service_listings && (
                        <>
                          <span>•</span>
                          <span>{row.service_listings.title}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) },
                { key: 'status', header: 'Status', accessor: (row) => (
                  <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
                    {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  </Badge>
                ) },
                { key: 'verified', header: 'Verified', accessor: (row) => (
                  <Badge variant={row.is_verified_purchase ? 'success' : 'secondary'} size="sm">
                    {row.is_verified_purchase ? 'Verified Purchase' : 'Not Verified'}
                  </Badge>
                ) },
                { key: 'created_at', header: 'Date', accessor: (row) => formatDate(row.created_at) },
                { key: 'actions', header: 'Actions', accessor: (row) => (
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="p-1">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                    items={getStatusActions(row).map(item => ({
                      ...item,
                      onClick: () => { item.onClick(); },
                    }))}
                    align="end"
                  />
                ) },
              ]}
              data={reviews}
              keyExtractor={(row) => row.id}
              loading={actionLoading ? true : undefined}
            />

            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary-200">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                  showPageSize
                  pageSizeOptions={[10, 20, 50, 100]}
                  pageSize={pagination.limit}
                  onPageSizeChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
                  totalItems={pagination.total}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => { setShowActionModal(false); setSelectedReview(null); setModerationNote('') }}
        title={
          modalAction === 'publish' ? 'Publish Review' :
          modalAction === 'hide' ? 'Hide Review' :
          modalAction === 'flag' ? 'Flag Review' :
          'Delete Review'
        }
        description={
          modalAction === 'publish'
            ? `Are you sure you want to publish this review? It will be visible to all users.`
            : modalAction === 'hide'
            ? `Please provide a moderation note for hiding this review.`
            : modalAction === 'flag'
            ? `Please provide a reason for flagging this review.`
            : `This action cannot be undone. The review will be permanently deleted.`
        }
        confirmText={
          modalAction === 'publish' ? 'Publish' :
          modalAction === 'hide' ? 'Hide' :
          modalAction === 'flag' ? 'Flag' : 'Delete'
        }
        onConfirm={() => selectedReview && modalAction !== 'delete' && handleReviewAction(selectedReview.id, modalAction)}
        loading={actionLoading === selectedReview?.id}
        variant={
          modalAction === 'publish' ? 'primary' :
          modalAction === 'hide' || modalAction === 'flag' ? 'warning' : 'danger'
        }
      >
        {(modalAction === 'hide' || modalAction === 'flag') && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary-700">
              {modalAction === 'hide' ? 'Moderation Note' : 'Flag Reason'}
            </label>
            <textarea
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`${modalAction === 'hide' ? 'Explain why this review is being hidden...' : 'Explain why this review is being flagged...'}`}
              required
            />
          </div>
        )}
        {modalAction === 'delete' && (
          <div>
            <p className="text-secondary-600">This action cannot be undone. The review will be permanently deleted.</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setShowActionModal(false); setSelectedReview(null) }}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteReview} loading={actionLoading === selectedReview?.id}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}