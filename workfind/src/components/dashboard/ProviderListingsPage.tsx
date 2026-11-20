'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Briefcase,
  ChevronDown,
  X,
  ChevronRight,
  MoreVertical,
  Edit,
  Trash2,
  Plus,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import { Avatar } from '@/components/ui/Avatar'
import { EmptyState } from '@/components/ui/EmptyState'
import { Table } from '@/components/ui/Table'
import { Modal } from '@/components/ui/Modal'
import { Dropdown } from '@/components/ui/Dropdown'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { SRI_LANKAN_DISTRICTS } from '@/constants/sri-lanka'
import { mockCategories, mockListings, mockProviders, searchListings, getProviderById, getCategoryBySlug } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils'

interface ProviderListingsPageProps {
  listings: {
    id: string
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
    status: string
    view_count: number
    enquiry_count: number
    created_at: string
    updated_at: string
  }[]
}

// Icon components for row actions
const ViewIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const DuplicateIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2-2v8a2 2 0 002 2z" />
  </svg>
)

const DeleteIcon = () => (
  <Trash2 className="w-4 h-4" aria-hidden="true" />
)

const rowActionOptions = [
  { value: 'view', label: 'View', icon: <ViewIcon /> },
  { value: 'edit', label: 'Edit', icon: <EditIcon /> },
  { value: 'duplicate', label: 'Duplicate', icon: <DuplicateIcon /> },
  { value: 'delete', label: 'Delete', icon: <DeleteIcon />, danger: true },
] as const

export default function ProviderListingsPage({ listings: initialListings }: ProviderListingsPageProps) {
  const [listings, setListings] = useState(initialListings)
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, listing: typeof initialListings[0] | null }>({ open: false, listing: null })

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'published', label: 'Published' },
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'archived', label: 'Archived' },
  ]

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...mockCategories.map(c => ({ value: c.slug, label: c.name })),
  ]

  const pricingTypeOptions = [
    { value: '', label: 'Any Pricing' },
    { value: 'fixed', label: 'Fixed Price' },
    { value: 'starting_from', label: 'Starting From' },
    { value: 'hourly', label: 'Hourly Rate' },
    { value: 'daily', label: 'Daily Rate' },
    { value: 'negotiable', label: 'Negotiable' },
    { value: 'quotation', label: 'Request Quotation' },
  ]

  const deliveryTypeOptions = [
    { value: '', label: 'Any Delivery Type' },
    { value: 'business_location', label: 'At Business Location' },
    { value: 'customer_location', label: 'At Your Location' },
    { value: 'remote', label: 'Remote/Online' },
    { value: 'multiple_locations', label: 'Multiple Locations' },
  ]

  const sortOptions = [
    { value: 'relevant', label: 'Most Relevant' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'reviews', label: 'Most Reviewed' },
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
  ]

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const handleDelete = async (listing: typeof initialListings[0]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/provider/listings/${listing.id}`, {
        method: 'DELETE',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete listing')
      }
      setListings(prev => prev.filter(l => l.id !== listing.id))
      addToast('Listing deleted successfully', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to delete listing', 'error')
    } finally {
      setIsLoading(false)
      setDeleteModal({ open: false, listing: null })
    }
  }

  const handleDuplicate = async (listing: typeof initialListings[0]) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/provider/listings/${listing.id}/duplicate`, {
        method: 'POST',
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to duplicate listing')
      }
      setListings(prev => [data.listing, ...prev])
      addToast('Listing duplicated successfully', 'success')
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Failed to duplicate listing', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || listing.status === statusFilter
    const matchesCategory = !categoryFilter || listing.category_id === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
  })

  const itemsPerPage = 12
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  const paginatedListings = useMemo(() => {
    const start = (currentPage - 1) * 12
    return filteredListings.slice(start, start + 12)
  }, [filteredListings, currentPage])

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'search') setSearchQuery(value)
    else if (key === 'status') setStatusFilter(value)
    else if (key === 'category') setCategoryFilter(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setCategoryFilter('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchQuery || statusFilter || categoryFilter

  const districtOptions = [
    { value: '', label: 'All Districts' },
    ...SRI_LANKAN_DISTRICTS.map(d => ({ value: d.id, label: d.name })),
  ]

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">My Listings</h1>
          <p className="text-secondary-600 mt-1">Manage your service listings and track performance</p>
        </div>
        <Link href="/dashboard/provider/listings/new">
          <Button rightIcon={<Plus className="w-4 h-4" aria-hidden="true" />}>
            Create Listing
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="lg">
        <div className="flex flex-col sm:flex-row gap-4">
          <Input
            placeholder="Search listings..."
            value={searchQuery}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
            className="w-full sm:w-64"
            aria-label="Search listings"
          />
          <Select
            placeholder="All Status"
            options={[
              { value: '', label: 'All Status' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'pending_approval', label: 'Pending Approval' },
              { value: 'rejected', label: 'Rejected' },
              { value: 'suspended', label: 'Suspended' },
              { value: 'archived', label: 'Archived' },
            ]}
            value={statusFilter}
            onChange={(value) => handleFilterChange('status', value)}
            leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
            className="w-40"
            aria-label="Filter by status"
          />
          <Select
            placeholder="All Categories"
            options={[
              { value: '', label: 'All Categories' },
              ...mockCategories.map(c => ({ value: c.slug, label: c.name })),
            ]}
            value={categoryFilter}
            onChange={(value) => handleFilterChange('category', value)}
            leftIcon={<Briefcase className="w-5 h-5" aria-hidden="true" />}
            className="w-48"
            aria-label="Filter by category"
          />
        </div>
      </Card>

      {/* Listings Table */}
      <Card variant="outlined" padding="none">
        {filteredListings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <Table
                columns={[
                  { key: 'image', header: '', accessor: (row) => (
                    <img
                      src={row.main_image_url || 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&h=60&fit=crop'}
                      alt=""
                      className="w-16 h-10 rounded-lg object-cover"
                    />
                  ) },
                  { key: 'title', header: 'Listing', accessor: (row) => (
                    <div>
                      <p className="font-medium text-secondary-900 truncate max-w-xs">{row.title}</p>
                      <p className="text-sm text-secondary-500">{getCategoryBySlug(row.category_id)?.name || row.category_id}</p>
                    </div>
                  ) },
                  { key: 'status', header: 'Status', accessor: (row) => (
                    <Badge
                      variant={row.status === 'published' ? 'success' :
                        row.status === 'pending_approval' ? 'warning' :
                        row.status === 'draft' ? 'secondary' :
                        row.status === 'rejected' ? 'error' :
                        row.status === 'suspended' ? 'error' : 'secondary'}
                      size="sm"
                    >
                      {row.status.replace('_', ' ')}
                    </Badge>
                  ) },
                  { key: 'views', header: 'Views', accessor: 'view_count' },
                  { key: 'enquiries', header: 'Enquiries', accessor: 'enquiry_count' },
                  { key: 'price', header: 'Price', accessor: (row) =>
                    row.price_amount ? formatCurrency(row.price_amount, row.price_currency) : 'Contact for quote'
                  },
                ]}
                data={filteredListings.slice((currentPage - 1) * 12, currentPage * 12)}
                keyExtractor={(row) => row.id}
                renderRowActions={(row) => (
                  <Dropdown
                    trigger={<Button variant="ghost" size="sm" aria-label={`Actions for ${row.title}`}><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg></Button>}
                    options={[
                      { value: 'view', label: 'View', icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542 7z" />
                        </svg>
                      ) },
                      { value: 'edit', label: 'Edit', icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      ) },
                      { value: 'duplicate', label: 'Duplicate', icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2-2v8a2 2 0 002 2z" />
                        </svg>
                      ) },
                      { value: 'delete', label: 'Delete', icon: <Trash2 className="w-4 h-4" aria-hidden="true" />, danger: true },
                    ]}
                  />
                )}
              />
            </div>
          </>
        ) : (
          <EmptyState
            title="No listings found"
            description="Try adjusting your filters or search terms to find what you're looking for."
            action={{
              label: 'Clear all filters',
              onClick: clearAllFilters,
              variant: 'outline',
            }}
          />
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredListings.length}
            itemsPerPage={12}
            onPageChange={handlePageChange}
          />
        )}
      </Card>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, listing: null })}
        title="Delete Listing"
        description="This action cannot be undone. Are you sure you want to delete this listing?"
        size="sm"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setDeleteModal({ open: false, listing: null })}>Cancel</Button>
          <Button variant="destructive" isLoading={isLoading} onClick={() => deleteModal.listing && handleDelete(deleteModal.listing)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}