'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  Shield,
  Flag,
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

interface Listing {
  id: string
  provider_id: string
  title: string
  slug: string
  description: string
  category_id: string
  subcategory_id: string | null
  main_image_url: string | null
  pricing_type: string
  price_amount: number | null
  price_currency: string
  location_type: string
  district: string | null
  city: string | null
  service_coverage: string[]
  experience_required: string | null
  tags: string[]
  status: 'draft' | 'pending_approval' | 'published' | 'rejected' | 'suspended' | 'archived'
  rejection_reason: string | null
  published_at: string | null
  view_count: number
  enquiry_count: number
  created_at: string
  updated_at: string
  provider_profiles?: { business_name: string }
  profiles?: { full_name: string | null; email: string }
  categories?: { name: string }
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
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'published', label: 'Published' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'archived', label: 'Archived' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date Created' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
  { value: 'view_count', label: 'Views' },
  { value: 'enquiry_count', label: 'Enquiries' },
]

export default function ListingsModerationPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    status: '',
    category_id: '',
    district: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [modalAction, setModalAction] = useState<'approve' | 'reject' | 'suspend' | 'activate'>('approve')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchListings() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.status) params.set('status', filters.status)
      if (filters.category_id) params.set('category_id', filters.category_id)
      if (filters.district) params.set('district', filters.district)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/admin/listings?${params}`)
      if (!res.ok) throw new Error('Failed to fetch listings')
      const data: PaginatedResponse<Listing> = await res.json()
      setListings(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load listings')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [pagination.page, filters.status, filters.category_id, filters.district, filters.search, filters.sortBy, filters.sortOrder])

  async function handleListingAction(listingId: string, action: 'approve' | 'reject' | 'suspend' | 'activate') {
    setActionLoading(listingId)
    try {
      const updates: any = {}

      switch (action) {
        case 'approve':
          updates.status = 'published'
          break
        case 'reject':
          updates.status = 'rejected'
          if (rejectionReason) updates.rejection_reason = rejectionReason
          break
        case 'suspend':
          updates.status = 'suspended'
          break
        case 'activate':
          updates.status = 'published'
          break
      }

      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId, ...updates }),
      })

      if (!res.ok) throw new Error('Failed to update listing')

      const actionText = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'suspend' ? 'suspended' : 'activated'
      toast.success(`Listing ${actionText} successfully`)
      setShowActionModal(false)
      setRejectionReason('')
      fetchListings()
    } catch (error) {
      toast.error(`Failed to ${action} listing`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteListing() {
    if (!selectedListing) return
    setActionLoading(selectedListing.id)
    try {
      const res = await fetch(`/api/admin/listings?id=${selectedListing.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete listing')
      toast.success('Listing deleted successfully')
      setShowActionModal(false)
      setSelectedListing(null)
      fetchListings()
    } catch (error) {
      toast.error('Failed to delete listing')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const openActionModal = (listing: Listing, action: 'approve' | 'reject' | 'suspend' | 'activate') => {
    setSelectedListing(listing)
    setModalAction(action)
    setShowActionModal(true)
  }

  const getStatusBadgeVariant = (status: Listing['status']) => {
    switch (status) {
      case 'published': return 'success'
      case 'pending_approval': return 'warning'
      case 'rejected': return 'error'
      case 'suspended': return 'error'
      case 'archived': return 'secondary'
      default: return 'secondary'
    }
  }

  const getStatusActions = (listing: Listing) => {
    const actions = [
      { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { /* navigate */ } },
      { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => { /* navigate */ } },
    ]

    switch (listing.status) {
      case 'pending_approval':
        actions.push(
          { label: 'Approve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(listing, 'approve') },
          { label: 'Reject', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(listing, 'reject') }
        )
        break
      case 'published':
        actions.push(
          { label: 'Suspend', icon: <Shield className="w-4 h-4" />, onClick: () => openActionModal(listing, 'suspend'), danger: true }
        )
        break
      case 'rejected':
      case 'suspended':
        actions.push(
          { label: 'Activate', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(listing, 'activate') }
        )
        break
    }

    actions.push(
      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => { setSelectedListing(listing); setModalAction('delete'); setShowActionModal(true) }, danger: true }
    )

    return actions
  }

  const formatPrice = (listing: Listing) => {
    if (!listing.price_amount) return 'Contact for quote'
    const currency = listing.price_currency || 'LKR'
    switch (listing.pricing_type) {
      case 'fixed': return `${currency} ${formatNumber(listing.price_amount)}`
      case 'starting_from': return `${currency} ${formatNumber(listing.price_amount)}+`
      case 'hourly': return `${currency} ${formatNumber(listing.price_amount)}/hr`
      case 'daily': return `${currency} ${formatNumber(listing.price_amount)}/day`
      default: return `${currency} ${formatNumber(listing.price_amount)}`
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Listing Moderation</h1>
          <p className="text-secondary-600 mt-1">Review, approve, and manage service listings</p>
        </div>
        <Button variant="outline" onClick={fetchListings} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total</p>
              <p className="text-2xl font-bold text-secondary-900">{formatNumber(pagination.total)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Published</p>
              <p className="text-2xl font-bold text-success-600">
                {formatNumber(listings.filter(l => l.status === 'published').length)}
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
                {formatNumber(listings.filter(l => l.status === 'pending_approval').length)}
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
              <p className="text-sm text-secondary-500">Rejected</p>
              <p className="text-2xl font-bold text-error-600">
                {formatNumber(listings.filter(l => l.status === 'rejected').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Suspended</p>
              <p className="text-2xl font-bold text-error-600">
                {formatNumber(listings.filter(l => l.status === 'suspended').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Views</p>
              <p className="text-2xl font-bold text-secondary-900">
                {formatNumber(listings.reduce((sum, l) => sum + l.view_count, 0))}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-600" />
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
              placeholder="Search listings..."
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
            className="w-44"
          />
          <Select
            placeholder="Category"
            options={[
              { value: '', label: 'All Categories' },
              { value: 'electrical', label: 'Electrical' },
              { value: 'plumbing', label: 'Plumbing' },
              { value: 'carpentry', label: 'Carpentry' },
              { value: 'cleaning', label: 'Cleaning' },
            ]}
            value={filters.category_id}
            onChange={(value) => setFilters({ ...filters, category_id: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-40"
          />
          <Select
            placeholder="District"
            options={[
              { value: '', label: 'All Districts' },
              { value: 'colombo', label: 'Colombo' },
              { value: 'gampaha', label: 'Gampaha' },
              { value: 'kalutara', label: 'Kalutara' },
              { value: 'kandy', label: 'Kandy' },
              { value: 'galle', label: 'Galle' },
            ]}
            value={filters.district}
            onChange={(value) => setFilters({ ...filters, district: value })}
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

      {/* Listings Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No listings found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'image', header: '', accessor: (row) => (
                  <img
                    src={row.main_image_url || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&h=60&fit=crop'}
                    alt=""
                    className="w-16 h-10 rounded-lg object-cover"
                    loading="lazy"
                  />
                ) },
                { key: 'title', header: 'Listing', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900 max-w-xs truncate">{row.title}</p>
                    <p className="text-sm text-secondary-500">{row.categories?.name || 'Uncategorized'}</p>
                    <p className="text-xs text-secondary-400">by {row.provider_profiles?.business_name || 'Unknown'}</p>
                  </div>
                ) },
                { key: 'status', header: 'Status', accessor: (row) => (
                  <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
                    {row.status.replace('_', ' ')}
                  </Badge>
                ) },
                { key: 'price', header: 'Price', accessor: (row) => formatPrice(row) },
                { key: 'views', header: 'Views', accessor: (row) => formatNumber(row.view_count) },
                { key: 'enquiries', header: 'Enquiries', accessor: (row) => formatNumber(row.enquiry_count) },
                { key: 'created_at', header: 'Created', accessor: (row) => formatDate(row.created_at) },
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
              data={listings}
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
        onClose={() => { setShowActionModal(false); setSelectedListing(null); setRejectionReason('') }}
        title={
          modalAction === 'approve' ? 'Approve Listing' :
          modalAction === 'reject' ? 'Reject Listing' :
          modalAction === 'suspend' ? 'Suspend Listing' :
          'Activate Listing'
        }
        description={
          modalAction === 'approve'
            ? `Are you sure you want to approve "${selectedListing?.title}"? It will be published and visible to customers.`
            : modalAction === 'reject'
            ? `Please provide a reason for rejecting "${selectedListing?.title}".`
            : modalAction === 'suspend'
            ? `Are you sure you want to suspend "${selectedListing?.title}"? It will be hidden from customers.`
            : `Are you sure you want to activate "${selectedListing?.title}"? It will be published again.`
        }
        confirmText={
          modalAction === 'approve' ? 'Approve' :
          modalAction === 'reject' ? 'Reject' :
          modalAction === 'suspend' ? 'Suspend' : 'Activate'
        }
        onConfirm={() => selectedListing && modalAction !== 'delete' && handleListingAction(selectedListing.id, modalAction)}
        loading={actionLoading === selectedListing?.id}
        variant={
          modalAction === 'approve' ? 'primary' :
          modalAction === 'reject' || modalAction === 'suspend' ? 'danger' : 'primary'
        }
      >
        {modalAction === 'reject' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary-700">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Explain why this listing is being rejected..."
              required
            />
          </div>
        )}
        {modalAction === 'delete' && (
          <div>
            <p className="text-secondary-600">This action cannot be undone. The listing will be permanently deleted.</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setShowActionModal(false); setSelectedListing(null) }}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteListing} loading={actionLoading === selectedListing?.id}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}