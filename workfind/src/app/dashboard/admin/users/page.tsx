'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Shield,
  UserX,
  UserCheck,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
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

interface User {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  role: 'customer' | 'provider' | 'admin'
  status: 'active' | 'suspended' | 'pending_verification' | 'banned'
  phone: string | null
  whatsapp: string | null
  email: string
  created_at: string
  updated_at: string
}

interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const roleOptions: SelectOption[] = [
  { value: '', label: 'All Roles' },
  { value: 'customer', label: 'Customer' },
  { value: 'provider', label: 'Provider' },
  { value: 'admin', label: 'Admin' },
]

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'pending_verification', label: 'Pending Verification' },
  { value: 'banned', label: 'Banned' },
]

const sortOptions: SelectOption[] = [
  { value: 'created_at', label: 'Date Joined' },
  { value: 'full_name', label: 'Name' },
  { value: 'email', label: 'Email' },
  { value: 'role', label: 'Role' },
  { value: 'status', label: 'Status' },
]

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 })
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc' as 'asc' | 'desc',
  })
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  async function fetchUsers() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      })
      if (filters.role) params.set('role', filters.role)
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)

      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error('Failed to fetch users')
      const data: PaginatedResponse<User> = await res.json()
      setUsers(data.data)
      setPagination(prev => ({ ...prev, total: data.total, totalPages: data.totalPages }))
    } catch (error) {
      toast.error('Failed to load users')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [pagination.page, filters.role, filters.status, filters.search, filters.sortBy, filters.sortOrder])

  async function handleUserAction(userId: string, action: 'activate' | 'suspend' | 'ban') {
    setActionLoading(userId)
    try {
      let newStatus: User['status']
      switch (action) {
        case 'activate': newStatus = 'active'; break
        case 'suspend': newStatus = 'suspended'; break
        case 'ban': newStatus = 'banned'; break
      }

      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update user')

      toast.success(`User ${action}d successfully`)
      fetchUsers()
    } catch (error) {
      toast.error(`Failed to ${action} user`)
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDeleteUser() {
    if (!selectedUser) return
    setActionLoading(selectedUser.id)
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete user')
      toast.success('User deleted successfully')
      setShowDeleteModal(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      toast.error('Failed to delete user')
      console.error(error)
    } finally {
      setActionLoading(null)
    }
  }

  const getRoleBadgeVariant = (role: User['role']) => {
    switch (role) {
      case 'admin': return 'primary'
      case 'provider': return 'success'
      default: return 'secondary'
    }
  }

  const getStatusBadgeVariant = (status: User['status']) => {
    switch (status) {
      case 'active': return 'success'
      case 'suspended': return 'warning'
      case 'pending_verification': return 'primary'
      case 'banned': return 'error'
    }
  }

  const getUserActions = (user: User) => [
    { label: 'View Details', icon: <Eye className="w-4 h-4" />, onClick: () => { /* navigate */ } },
    { label: 'Edit', icon: <Edit className="w-4 h-4" />, onClick: () => { /* navigate */ } },
    ...(user.status !== 'active' ? [
      { label: 'Activate', icon: <UserCheck className="w-4 h-4" />, onClick: () => handleUserAction(user.id, 'activate') },
    ] : [
      { label: 'Suspend', icon: <UserX className="w-4 h-4" />, onClick: () => handleUserAction(user.id, 'suspend') },
      { label: 'Ban', icon: <UserX className="w-4 h-4" />, onClick: () => handleUserAction(user.id, 'ban'), danger: true },
    ]),
    { label: 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => { setSelectedUser(user); setShowDeleteModal(true) }, danger: true },
  ]

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">User Management</h1>
          <p className="text-secondary-600 mt-1">Manage platform users, roles, and account statuses</p>
        </div>
        <Button variant="outline" onClick={fetchUsers} disabled={loading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
            <Input
              placeholder="Search users..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-10"
            />
          </div>
          <Select
            placeholder="All Roles"
            options={roleOptions}
            value={filters.role}
            onChange={(value) => setFilters({ ...filters, role: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-40"
          />
          <Select
            placeholder="All Statuses"
            options={statusOptions}
            value={filters.status}
            onChange={(value) => setFilters({ ...filters, status: value })}
            leftIcon={<Filter className="w-5 h-5" />}
            className="w-44"
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

      {/* Users Table */}
      <Card variant="outlined" padding="none">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin mx-auto mb-4" />
            <p className="text-secondary-500">Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">No users found</h3>
            <p className="text-secondary-500">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <Table
              columns={[
                { key: 'avatar', header: '', accessor: (row) => (
                  <Avatar src={row.avatar_url} alt={row.full_name || row.email} size="sm" />
                ) },
                { key: 'name', header: 'User', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900">{row.full_name || 'Unknown'}</p>
                    <p className="text-sm text-secondary-500">{row.email}</p>
                  </div>
                ) },
                { key: 'role', header: 'Role', accessor: (row) => (
                  <Badge variant={getRoleBadgeVariant(row.role)} size="sm">
                    {row.role.charAt(0).toUpperCase() + row.role.slice(1)}
                  </Badge>
                ) },
                { key: 'status', header: 'Status', accessor: (row) => (
                  <Badge variant={getStatusBadgeVariant(row.status)} size="sm">
                    {row.status.replace('_', ' ')}
                  </Badge>
                ) },
                { key: 'phone', header: 'Phone', accessor: (row) => row.phone || row.whatsapp || '—' },
                { key: 'created_at', header: 'Joined', accessor: (row) => formatDate(row.created_at) },
                { key: 'actions', header: 'Actions', accessor: (row) => (
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" className="p-1">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    }
                    items={getUserActions(row).map(item => ({
                      ...item,
                      onClick: () => { item.onClick(); },
                    }))}
                    align="end"
                  />
                ) },
              ]}
              data={users}
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

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSelectedUser(null) }}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.full_name || selectedUser?.email}? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDeleteUser}
        loading={actionLoading === selectedUser?.id}
        variant="danger"
      />
    </div>
  )
}