'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
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
  AlertCircle,
  User,
  MessageSquare,
  Star,
  FileText,
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

interface Report {
  id: string
  reporter_id: string
  reported_type: 'user' | 'listing' | 'review' | 'message'
  reported_id: string
  reason: string
  description: string | null
  status: 'pending' | 'under_review' | 'resolved' | 'dismissed'
  moderator_id: string | null
  moderation_note: string | null
  resolved_at: string | null
  created_at: string
  profiles?: { full_name: string | null; email: string; avatar_url: string | null }
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
  { value: 'under_review', label: 'Under Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
]

const typeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'user', label: 'User' },
  { value: 'listing', label: 'Listing' },
  { value: 'review', label: 'Review' },
  { value: 'message', label: 'Message' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date' },
  { value: 'reason', label: 'Reason' },
  { value: 'status', label: 'Status' },
  { value: 'reported_type', label: 'Type' },
]

const reasonLabels: Record<string, string> = {
  inappropriate_content: 'Inappropriate Content',
  spam: 'Spam',
  fake_profile: 'Fake Profile',
  misleading_information: 'Misleading Information',
  harassment: 'Harassment',
  fraud: 'Fraud',
  poor_service: 'Poor Service',
  other: 'Other',
}

const getReasonIcon = (reason: string) => {
  switch (reason) {
    case 'inappropriate_content': return <AlertCircle className="w-4 h-4" />
    case 'spam': return <MessageSquare className="w-4 h-4" />
    case 'fake_profile': return <User className="w-4 h-4" />
    case 'misleading_information': return <FileText className="w-4 h-4" />
    case 'harassment': return <AlertCircle className="w-4 h-4" />
    case 'fraud': return <Shield className="w-4 h-4" />
    case 'poor_service': return <Star className="w-4 h-4" />
    default: return <Flag className="w-4 h-4" />
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'user': return <User className="w-4 h-4" />
    case 'listing': return <FileText className="w-4 h-4" />
    case 'review': return <Star className="w-4 h-4" />
    case 'message': return <MessageSquare className="w-4 h-4" />
    default: return <Flag className="w-4 h-4" />
  }
}

export default function ReportsManagementPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    status: '',
    reported_type: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [modalAction, setModalAction] = useState<'review' | 'resolve' | 'dismiss' | 'delete'>('review')
  const [moderationNote, setModerationNote] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchReports() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.status) params.set('status', filters.status)
      if (filters.reported_type) params.set('reported_type', filters.reported_type)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/admin/reports?${params}`)
      if (!res.ok) throw new Error('Failed to fetch reports')
      const data: PaginatedResponse<Report> = await res.json()
      setReports(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load reports')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [pagination.page, filters.status, filters.reported_type, filters.search, filters.sortBy, filters.sortOrder])

  async function handleReportAction(reportId: string, action: 'review' | 'resolve' | 'dismiss') {
    setActionLoading(reportId)
    try {
      const updates: any = {}

      switch (action) {
        case 'review':
          updates.status = 'under_review'
          break
        case 'resolve':
          updates.status = 'resolved'
          if (moderationNote) updates.moderation_note = moderationNote
          break
        case 'dismiss':
          updates.status = 'dismissed'
          if (moderationNote) updates.moderation_note = moderationNote
          break
      }

      const res = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, ...updates }),
      })

      if (!res.ok) throw new Error('Failed to update report')

      const actionText = action === 'review' ? 'marked under review' : action === 'resolve' ? 'resolved' : 'dismissed'
      toast.success(`Report ${actionText} successfully`)
      setShowActionModal(false)
      setModerationNote('')
      fetchReports()
    } catch (error) {
      toast.error(`Failed to ${action} report`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteReport() {
    if (!selectedReport) return
    setActionLoading(selectedReport.id)
    try {
      const res = await fetch(`/api/admin/reports?id=${selectedReport.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete report')
      toast.success('Report deleted successfully')
      setShowActionModal(false)
      setSelectedReport(null)
      fetchReports()
    } catch (error) {
      toast.error('Failed to delete report')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const openActionModal = (report: Report, action: 'review' | 'resolve' | 'dismiss' | 'delete') => {
    setSelectedReport(report)
    setModalAction(action)
    setShowActionModal(true)
  }

  const getStatusBadgeVariant = (status: Report['status']) => {
    switch (status) {
      case 'resolved': return 'success'
      case 'under_review': return 'primary'
      case 'dismissed': return 'secondary'
      default: return 'warning'
    }
  }

  const getStatusActions = (report: Report) => {
    const actions = [
      { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { /* view */ } },
    ]

    switch (report.status) {
      case 'pending':
        actions.push(
          { label: 'Start Review', icon: <Eye className="w-4 h-4" />, onClick: () => openActionModal(report, 'review') },
          { label: 'Resolve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(report, 'resolve') },
          { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(report, 'dismiss') }
        )
        break
      case 'under_review':
        actions.push(
          { label: 'Resolve', icon: <CheckCircle className="w-4 h-4" />, onClick: () => openActionModal(report, 'resolve') },
          { label: 'Dismiss', icon: <XCircle className="w-4 h-4" />, onClick: () => openActionModal(report, 'dismiss') }
        )
        break
      case 'resolved':
      case 'dismissed':
        actions.push(
          { label: 'Reopen', icon: <AlertCircle className="w-4 h-4" />, onClick: () => openActionModal(report, 'review') }
        )
        break
    }

    actions.push(
      { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => openActionModal(report, 'delete'), danger: true }
    )

    return actions
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Reports Management</h1>
          <p className="text-secondary-600 mt-1">Review and moderate user reports</p>
        </div>
        <Button variant="outline" onClick={fetchReports} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Total Reports</p>
              <p className="text-2xl font-bold text-secondary-900">{formatNumber(pagination.total)}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Flag className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Pending</p>
              <p className="text-2xl font-bold text-warning-600">
                {formatNumber(reports.filter(r => r.status === 'pending').length)}
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
              <p className="text-sm text-secondary-500">Under Review</p>
              <p className="text-2xl font-bold text-primary-600">
                {formatNumber(reports.filter(r => r.status === 'under_review').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card variant="outlined" padding="md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary-500">Resolved</p>
              <p className="text-2xl font-bold text-success-600">
                {formatNumber(reports.filter(r => r.status === 'resolved').length)}
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
              <p className="text-sm text-secondary-500">Dismissed</p>
              <p className="text-2xl font-bold text-secondary-600">
                {formatNumber(reports.filter(r => r.status === 'dismissed').length)}
              </p>
            </div>
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <XCircle className="w-5 h-5 text-gray-600" />
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
              placeholder="Search reports..."
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
            placeholder="Type"
            options={typeOptions}
            value={filters.reported_type}
            onChange={(value) => setFilters({ ...filters, reported_type: value })}
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

      {/* Reports Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <Flag className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No reports found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'type', header: 'Type', accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {getTypeIcon(row.reported_type)}
                    </div>
                    <span className="capitalize">{row.reported_type}</span>
                  </div>
                ) },
                { key: 'reason', header: 'Reason', accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center text-warning-600">
                      {getReasonIcon(row.reason)}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900">{reasonLabels[row.reason] || row.reason}</p>
                      {row.description && <p className="text-xs text-secondary-500 truncate max-w-xs">{row.description}</p>}
                    </div>
                  </div>
                ) },
                { key: 'reporter', header: 'Reporter', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900">{row.profiles?.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-secondary-500">{row.profiles?.email || 'Unknown'}</p>
                  </div>
                ) },
                { key: 'status', header: 'Status', accessor: (row) => (
                  <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
                    {row.status.replace('_', ' ')}
                  </Badge>
                ) },
                { key: 'created_at', header: 'Reported', accessor: (row) => formatDate(row.created_at) },
                { key: 'resolved_at', header: 'Resolved', accessor: (row) => row.resolved_at ? formatDate(row.resolved_at) : '—' },
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
              data={reports}
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
        onClose={() => { setShowActionModal(false); setSelectedReport(null); setModerationNote('') }}
        title={
          modalAction === 'review' ? 'Start Review' :
          modalAction === 'resolve' ? 'Resolve Report' :
          modalAction === 'dismiss' ? 'Dismiss Report' :
          'Delete Report'
        }
        description={
          modalAction === 'review'
            ? `Mark this report as under review.`
            : modalAction === 'resolve'
            ? `Please provide a resolution note for this report.`
            : modalAction === 'dismiss'
            ? `Please provide a reason for dismissing this report.`
            : `This action cannot be undone. The report will be permanently deleted.`
        }
        confirmText={
          modalAction === 'review' ? 'Start Review' :
          modalAction === 'resolve' ? 'Resolve' :
          modalAction === 'dismiss' ? 'Dismiss' : 'Delete'
        }
        onConfirm={() => selectedReport && modalAction !== 'delete' && handleReportAction(selectedReport.id, modalAction)}
        loading={actionLoading === selectedReport?.id}
        variant={
          modalAction === 'review' ? 'primary' :
          modalAction === 'resolve' ? 'success' :
          modalAction === 'dismiss' ? 'warning' : 'danger'
        }
      >
        {(modalAction === 'resolve' || modalAction === 'dismiss') && (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-secondary-700">
              {modalAction === 'resolve' ? 'Resolution Note' : 'Dismissal Reason'}
            </label>
            <textarea
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder={`${modalAction === 'resolve' ? 'Explain how this report was resolved...' : 'Explain why this report is being dismissed...'}`}
              required
            />
          </div>
        )}
        {modalAction === 'delete' && (
          <div>
            <p className="text-secondary-600">This action cannot be undone. The report will be permanently deleted.</p>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="secondary" onClick={() => { setShowActionModal(false); setSelectedReport(null) }}>Cancel</Button>
              <Button variant="danger" onClick={handleDeleteReport} loading={actionLoading === selectedReport?.id}>Delete</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}