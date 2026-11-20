'use client'

import { useState, useEffect } from 'react'
import {
  Briefcase,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Star,
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

interface Provider {
  id: string
  user_id: string
  business_name: string
  business_logo_url: string | null
  cover_image_url: string | null
  short_intro: string | null
  description: string | null
  main_category_id: string | null
  years_experience: number | null
  languages: string[]
  availability: any
  service_delivery_types: string[]
  verification_status: 'unverified' | 'pending' | 'verified' | 'rejected'
  verified_at: string | null
  verified_by: string | null
  rating: number
  review_count: number
  profile_views: number
  district: string | null
  city: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  service_coverage: string[]
  created_at: string
  updated_at: string
  profiles?: {
    full_name: string | null
    email: string
    avatar_url: string | null
    status: string
  }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const verificationStatusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'unverified', label: 'Unverified' },
  { value: 'pending', label: 'Pending Review' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date Joined' },
  { value: 'business_name', label: 'Business Name' },
  { value: 'rating', label: 'Rating' },
  { value: 'verification_status', label: 'Verification' },
  { value: 'district', label: 'Location' },
]

export default function ProvidersManagementPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    verification_status: '',
    district: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationAction, setVerificationAction] = useState<'verify' | 'reject'>('verify')
  const [rejectionReason, setRejectionReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchProviders() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.verification_status) params.set('verification_status', filters.verification_status)
      if (filters.district) params.set('district', filters.district)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/admin/providers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch providers')
      const data: PaginatedResponse<Provider> = await res.json()
      setProviders(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load providers')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProviders()
  }, [pagination.page, filters.verification_status, filters.district, filters.search, filters.sortBy, filters.sortOrder])

  async function handleVerificationAction(providerId: string, action: 'verify' | 'reject') {
    setActionLoading(providerId)
    try {
      const updates: any = {
        verification_status: action === 'verify' ? 'verified' : 'rejected',
      }

      if (action === 'reject' && rejectionReason) {
        updates.rejection_reason = rejectionReason
      }

      const res = await fetch('/api/admin/providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, ...updates }),
      })

      if (!res.ok) throw new Error('Failed to update provider')

      toast.success(`Provider ${action === 'verify' ? 'verified' : 'rejected'} successfully`)
      setShowVerificationModal(false)
      setRejectionReason('')
      fetchProviders()
    } catch (error) {
      toast.error(`Failed to ${action} provider`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const openVerificationModal = (provider: Provider, action: 'verify' | 'reject') => {
    setSelectedProvider(provider)
    setVerificationAction(action)
    setShowVerificationModal(true)
  }

  const getVerificationBadgeVariant = (status: Provider['verification_status']) => {
    switch (status) {
      case 'verified': return 'success'
      case 'pending': return 'warning'
      case 'rejected': return 'error'
      default: return 'secondary'
    }
  }

  const getVerificationIcon = (status: Provider['verification_status']) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const getProviderActions = (provider: Provider) => {
    const actions = [
      { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { /* navigate */ } },
      { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => { /* navigate */ } },
    ]

    if (provider.verification_status === 'pending') {
      actions.push(
        { label: 'Verify', icon: <UserCheck className="w-4 h-4" />, onClick: () => openVerificationModal(provider, 'verify') },
        { label: 'Reject', icon: <UserX className="w-4 h-4" />, onClick: () => openVerificationModal(provider, 'reject') }
      )
    } else if (provider.verification_status === 'unverified') {
      actions.push(
        { label: 'Verify', icon: <UserCheck className="w-4 h-4" />, onClick: () => openVerificationModal(provider, 'verify') }
      )
    } else if (provider.verification_status === 'verified') {
      actions.push(
        { label: 'Reject', icon: <UserX className="w-4 h-4" />, onClick: () => openVerificationModal(provider, 'reject'), danger: true }
      )
    }

    actions.push(
      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => { /* delete */ }, danger: true }
    )

    return actions
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Provider Management</h1>
          <p className="text-secondary-600 mt-1">Manage service providers, verifications, and profiles</p>
        </div>
        <Button variant="outline" onClick={fetchProviders} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Providers</p>
              <p className="text-2xl font-bold text-secondary-900">{formatNumber(pagination.total)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Verified</p>
              <p className="text-2xl font-bold text-success-600">
                {formatNumber(providers.filter(p => p.verification_status === 'verified').length)}
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
              <p className="text-sm text-secondary-500">Pending Review</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatNumber(providers.filter(p => p.verification_status === 'pending').length)}
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
                {formatNumber(providers.filter(p => p.verification_status === 'rejected').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
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
              placeholder="Search providers..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="Verification Status"
            options={verificationStatusOptions}
            value={filters.verification_status}
            onChange={(value) => setFilters({ ...filters, verification_status: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-44"
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

      {/* Providers Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading providers...</p>
          </div>
        ) : providers.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No providers found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'logo', header: '', accessor: (row) => (
                  <Avatar src={row.business_logo_url} alt={row.business_name} size="sm" fallback={row.business_name.charAt(0)} />
                ) },
                { key: 'business', header: 'Provider', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900">{row.business_name}</p>
                    <p className="text-sm text-secondary-500">{row.profiles?.full_name || 'Unknown'} • {row.profiles?.email}</p>
                  </div>
                ) },
                { key: 'verification', header: 'Verification', accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <Badge variant={getVerificationBadgeVariant(row.verification_status)} size="sm">
                      {getVerificationIcon(row.verification_status)}
                      {row.verification_status.charAt(0).toUpperCase() + row.verification_status.slice(1)}
                    </Badge>
                    {row.verified_at && (
                      <span className="text-xs text-secondary-400">
                        {formatDate(row.verified_at)}
                      </span>
                    )}
                  </div>
                ) },
                { key: 'rating', header: 'Rating', accessor: (row) => (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{row.rating.toFixed(1)}</span>
                    <span className="text-sm text-secondary-500">({row.review_count})</span>
                  </div>
                ) },
                { key: 'location', header: 'Location', accessor: (row) => (
                  <div>
                    <p className="text-sm text-secondary-900">{row.district || '—'}</p>
                    {row.city && <p className="text-xs text-secondary-500">{row.city}</p>}
                  </div>
                ) },
                { key: 'joined', header: 'Joined', accessor: (row) => formatDate(row.created_at) },
                { key: 'actions', header: 'Actions', accessor: (row) => (
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="p-1">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                    items={getProviderActions(row).map(item => ({
                      ...item,
                      onClick: () => { item.onClick(); },
                    }))}
                    align="end"
                  />
                ) },
              ]}
              data={providers}
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

      {/* Verification Modal */}
      <Modal
        isOpen={showVerificationModal}
        onClose={() => { setShowVerificationModal(false); setSelectedProvider(null); setRejectionReason('') }}
        title={verificationAction === 'verify' ? 'Verify Provider' : 'Reject Provider'}
        description={
          verificationAction === 'verify'
            ? `Are you sure you want to verify ${selectedProvider?.business_name}? This will mark them as a trusted provider.`
            : `Please provide a reason for rejecting ${selectedProvider?.business_name}.`
        }
        confirmText={verificationAction === 'verify' ? 'Verify' : 'Reject'}
        onConfirm={() => selectedProvider && handleVerificationAction(selectedProvider.id, verificationAction)}
        loading={actionLoading === selectedProvider?.id}
        variant={verificationAction === 'verify' ? 'primary' : 'danger'}
      >
        {verificationAction === 'reject' && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary-700">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Explain why this provider is being rejected..."
              required
            />
          </div>
        )}
      </Modal>
    </div>
  )
}