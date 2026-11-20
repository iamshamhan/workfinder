'use client'

import { useState, useEffect } from 'react'
import {
  Eye,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Download,
  Calendar,
  User,
  Shield,
  FileText,
  Trash2,
  MoreVertical,
  ExternalLink,
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

interface AuditLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string
  details: Record<string, unknown>
  created_at: string
  profiles?: { full_name: string | null; email: string }
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const actionOptions: SelectOption[] = [
  { value: '', label: 'All Actions' },
  { value: 'create_user', label: 'Create User' },
  { value: 'update_user', label: 'Update User' },
  { value: 'delete_user', label: 'Delete User' },
  { value: 'create_provider', label: 'Create Provider' },
  { value: 'update_provider', label: 'Update Provider' },
  { value: 'delete_provider', label: 'Delete Provider' },
  { value: 'create_category', label: 'Create Category' },
  { value: 'update_category', label: 'Update Category' },
  { value: 'delete_category', label: 'Delete Category' },
  { value: 'update_listing', label: 'Update Listing' },
  { value: 'delete_listing', label: 'Delete Listing' },
  { value: 'update_review', label: 'Update Review' },
  { value: 'delete_review', label: 'Delete Review' },
  { value: 'update_report', label: 'Update Report' },
  { value: 'delete_report', label: 'Delete Report' },
]

const targetTypeOptions: SelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'user', label: 'User' },
  { value: 'provider', label: 'Provider' },
  { value: 'category', label: 'Category' },
  { value: 'listing', label: 'Listing' },
  { value: 'review', label: 'Review' },
  { value: 'report', label: 'Report' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date' },
  { value: 'action', label: 'Action' },
  { value: 'target_type', label: 'Target Type' },
]

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    admin_id: '',
    action: '',
    target_type: '',
    start_date: '',
    end_date: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  async function fetchLogs() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.admin_id) params.set('admin_id', filters.admin_id)
      if (filters.action) params.set('action', filters.action)
      if (filters.target_type) params.set('target_type', filters.target_type)
      if (filters.start_date) params.set('start_date', filters.start_date)
      if (filters.end_date) params.set('end_date', filters.end_date)

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (!res.ok) throw new Error('Failed to fetch audit logs')
      const data: PaginatedResponse<AuditLog> = await res.json()
      setLogs(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load audit logs')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [pagination.page, filters.admin_id, filters.action, filters.target_type, filters.start_date, filters.end_date, filters.sortBy, filters.sortOrder])

  const openDetailModal = (log: AuditLog) => {
    setSelectedLog(log)
    setShowDetailModal(true)
  }

  const getActionLabel = (action: string) => {
    const opt = actionOptions.find(o => o.value === action)
    return opt?.label || action.replace('_', ' ')
  }

  const getActionColor = (action: string) => {
    if (action.startsWith('create_')) return 'text-success-600 bg-success-100'
    if (action.startsWith('update_')) return 'text-primary-600 bg-primary-100'
    if (action.startsWith('delete_')) return 'text-error-600 bg-error-100'
    return 'text-secondary-600 bg-secondary-100'
  }

  const getTargetTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-4 h-4" />
      case 'provider': return <Shield className="w-4 h-4" />
      case 'category': return <FileText className="w-4 h-4" />
      case 'listing': return <FileText className="w-4 h-4" />
      case 'review': return <Star className="w-4 h-4" />
      case 'report': return <Flag className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  async function handleExport() {
    try {
      const params = new URLSearchParams({
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.admin_id) params.set('admin_id', filters.admin_id)
      if (filters.action) params.set('action', filters.action)
      if (filters.target_type) params.set('target_type', filters.target_type)
      if (filters.start_date) params.set('start_date', filters.start_date)
      if (filters.end_date) params.set('end_date', filters.end_date)
      params.set('limit', '10000')

      const res = await fetch(`/api/admin/audit-logs?${params}`)
      if (!res.ok) throw new Error('Failed to export')
      const data = await res.json()

      // Convert to CSV
      const headers = ['ID', 'Admin', 'Action', 'Target Type', 'Target ID', 'Details', 'Date']
      const rows = (data.data || []).map((log: AuditLog) => [
        log.id,
        `${log.profiles?.full_name || 'Unknown'} (${log.profiles?.email || ''})`,
        getActionLabel(log.action),
        log.target_type,
        log.target_id,
        JSON.stringify(log.details),
        formatDate(log.created_at),
      ])

      const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      link.click()

      toast.success('Audit logs exported successfully')
    } catch (error) {
      toast.error('Failed to export audit logs')
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Audit Logs</h1>
          <p className="text-secondary-600 mt-1">Track all administrative actions on the platform</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <Input
              placeholder="Search by admin, action, target..."
              value={filters.admin_id}
              onChange={(e) => setFilters({ ...filters, admin_id: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="Action"
            options={actionOptions}
            value={filters.action}
            onChange={(value) => setFilters({ ...filters, action: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-44"
          />
          <Select
            placeholder="Target Type"
            options={targetTypeOptions}
            value={filters.target_type}
            onChange={(value) => setFilters({ ...filters, target_type: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-40"
          />
          <div className="flex gap-2">
            <Input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              placeholder="Start Date"
              className="w-36"
            />
            <Input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              placeholder="End Date"
              className="w-36"
            />
          </div>
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

        {/* Active filters display */}
        {(filters.action || filters.target_type || filters.start_date || filters.end_date) && (
          <div className="flex flex-wrap gap-2">
            {filters.action && (
              <Badge variant="secondary" className="gap-1">
                Action: {getActionLabel(filters.action)}
                <button onClick={() => setFilters({ ...filters, action: '' })} className="ml-1">×</button>
              </Badge>
            )}
            {filters.target_type && (
              <Badge variant="secondary" className="gap-1">
                Type: {filters.target_type}
                <button onClick={() => setFilters({ ...filters, target_type: '' })} className="ml-1">×</button>
              </Badge>
            )}
            {filters.start_date && (
              <Badge variant="secondary" className="gap-1">
                From: {filters.start_date}
                <button onClick={() => setFilters({ ...filters, start_date: '' })} className="ml-1">×</button>
              </Badge>
            )}
            {filters.end_date && (
              <Badge variant="secondary" className="gap-1">
                To: {filters.end_date}
                <button onClick={() => setFilters({ ...filters, end_date: '' })} className="ml-1">×</button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => setFilters({
              admin_id: '', action: '', target_type: '', start_date: '', end_date: ''
            })}>
              Clear All
            </Button>
          </div>
        )}
      </Card>

      {/* Audit Logs Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center">
            <Shield className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No audit logs found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'date', header: 'Date & Time', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900">{formatDate(row.created_at)}</p>
                    <p className="text-xs text-secondary-400">{new Date(row.created_at).toLocaleTimeString()}</p>
                  </div>
                ) },
                { key: 'admin', header: 'Admin', accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <Avatar src={row.profiles?.avatar_url} alt={row.profiles?.full_name || 'Admin'} size="sm" fallback="A" />
                    <div>
                      <p className="font-medium text-secondary-900">{row.profiles?.full_name || 'Unknown Admin'}</p>
                      <p className="text-xs text-secondary-500">{row.profiles?.email || ''}</p>
                    </div>
                  </div>
                ) },
                { key: 'action', header: 'Action', accessor: (row) => (
                  <Badge variant="secondary" className={getActionColor(row.action)}>
                    {getActionLabel(row.action)}
                  </Badge>
                ) },
                { key: 'target', header: 'Target', accessor: (row) => (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                      {getTargetTypeIcon(row.target_type)}
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900 capitalize">{row.target_type}</p>
                      <p className="text-xs text-secondary-500 font-mono">{row.target_id}</p>
                    </div>
                  </div>
                ) },
                { key: 'details', header: 'Details', accessor: (row) => (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDetailModal(row)}
                    className="text-left w-full justify-start"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                ) },
              ]}
              data={logs}
              keyExtractor={(row) => row.id}
            />

            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary-200">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                  showPageSize
                  pageSizeOptions={[25, 50, 100, 200]}
                  pageSize={pagination.limit}
                  onPageSizeChange={(limit) => setPagination(prev => ({ ...prev, limit, page: 1 }))}
                  totalItems={pagination.total}
                />
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => { setShowDetailModal(false); setSelectedLog(null) }}
        title="Audit Log Details"
        size="lg"
        confirmText="Close"
        variant="secondary"
        onConfirm={() => setShowDetailModal(false)}
      >
        {selectedLog && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Log ID</label>
                <code className="block px-3 py-2 bg-secondary-100 rounded-lg text-sm font-mono text-secondary-900 break-all">
                  {selectedLog.id}
                </code>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Date & Time</label>
                <p className="text-secondary-900">{formatDate(selectedLog.created_at)} at {new Date(selectedLog.created_at).toLocaleTimeString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Admin</label>
                <div className="flex items-center gap-2">
                  <Avatar src={selectedLog.profiles?.avatar_url} alt={selectedLog.profiles?.full_name || 'Admin'} size="sm" fallback="A" />
                  <div>
                    <p className="font-medium text-secondary-900">{selectedLog.profiles?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-secondary-500">{selectedLog.profiles?.email || ''}</p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Admin ID</label>
                <code className="block px-3 py-2 bg-secondary-100 rounded-lg text-sm font-mono text-secondary-900 break-all">
                  {selectedLog.admin_id}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Action</label>
              <Badge variant="secondary" className={getActionColor(selectedLog.action)}>
                {getActionLabel(selectedLog.action)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Target Type</label>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    {getTargetTypeIcon(selectedLog.target_type)}
                  </div>
                  <span className="capitalize text-secondary-900">{selectedLog.target_type}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-1">Target ID</label>
                <code className="block px-3 py-2 bg-secondary-100 rounded-lg text-sm font-mono text-secondary-900 break-all">
                  {selectedLog.target_id}
                </code>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-1">Details</label>
              <pre className="px-4 py-3 bg-secondary-100 rounded-lg text-sm text-secondary-900 overflow-x-auto max-h-64">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}