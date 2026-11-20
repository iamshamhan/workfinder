'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  X,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  RotateCcw,
  Trash2,
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

interface ProviderQuotationsPageProps {
  userId: string
}

interface Quotation {
  id: string
  job_request_id: string
  provider_id: string
  job_request: {
    id: string
    title: string
    description: string
    category: { id: string; name: string; slug: string }
    district: string
    city: string
    budget_min: number | null
    budget_max: number | null
    budget_currency: string
    preferred_date: string | null
    urgency: string
    customer: {
      full_name: string
      avatar_url: string | null
    }
  }
  amount: number
  currency: string
  description: string
  estimated_duration: string | null
  valid_until: string | null
  status: string
  created_at: string
  updated_at: string
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
  { value: 'expired', label: 'Expired' },
]

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
  { value: 'amount_high', label: 'Amount (High to Low)' },
  { value: 'amount_low', label: 'Amount (Low to High)' },
]

export default function ProviderQuotationsPage({ userId }: ProviderQuotationsPageProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null)
  const [withdrawModal, setWithdrawModal] = useState<{ open: boolean, quotationId: string | null }>({ open: false, quotationId: null })

  useEffect(() => {
    fetchQuotations()
  }, [])

  const fetchQuotations = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/quotations')
      if (response.ok) {
        const data = await response.json()
        setQuotations(data.quotations || [])
      }
    } catch (error) {
      console.error('Failed to fetch quotations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = quotation.job_request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.job_request.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || quotation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'amount_high':
        return b.amount - a.amount
      case 'amount_low':
        return a.amount - b.amount
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage)
  const paginatedQuotations = sortedQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleWithdraw = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/provider/quotations/${quotationId}/withdraw`, {
        method: 'POST',
      })
      if (response.ok) {
        setQuotations(prev => prev.map(q => q.id === quotationId ? { ...q, status: 'withdrawn' } : q))
        addToast('Quotation withdrawn', 'success')
      } else {
        addToast('Failed to withdraw quotation', 'error')
      }
    } catch (error) {
      addToast('Failed to withdraw quotation', 'error')
    } finally {
      setWithdrawModal({ open: false, quotationId: null })
    }
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const getStatusBadge = (status: string, validUntil: string | null = null) => {
    if (status === 'pending' && isExpired(validUntil)) {
      return <Badge variant="error" size="sm">Expired</Badge>
    }
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'accepted': return <Badge variant="success" size="sm">Accepted</Badge>
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>
      case 'withdrawn': return <Badge variant="secondary" size="sm">Withdrawn</Badge>
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return <Badge variant="error" size="sm"><AlertCircle className="w-3 h-3 mr-1" /> Urgent</Badge>
      case 'high': return <Badge variant="warning" size="sm">High</Badge>
      case 'normal': return <Badge variant="secondary" size="sm">Normal</Badge>
      case 'low': return <Badge variant="outline" size="sm">Low</Badge>
      default: return <Badge variant="outline" size="sm">{urgency}</Badge>
    }
  }

  const formatBudget = (job: Quotation['job_request']) => {
    if (job.budget_min && job.budget_max) {
      return `${formatCurrency(job.budget_min, job.budget_currency)} - ${formatCurrency(job.budget_max, job.budget_currency)}`
    } else if (job.budget_min) {
      return `${formatCurrency(job.budget_min, job.budget_currency)}+`
    } else if (job.budget_max) {
      return `Up to ${formatCurrency(job.budget_max, job.budget_currency)}`
    }
    return 'Negotiable'
  }

  const canWithdraw = (status: string) => {
    return status === 'pending'
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Quotations</h1>
            <p className="text-secondary-600 mt-1">Manage and track quotations you've sent</p>
          </div>
        </div>

        <Card variant="outlined" padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search quotations..."
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
        ) : paginatedQuotations.length === 0 ? (
          <EmptyState
            title="No quotations found"
            description={searchQuery || statusFilter
              ? 'Try adjusting your filters or search terms.'
              : 'You haven\'t sent any quotations yet. Bid on job requests to send quotes!'}
            action={{
              label: searchQuery || statusFilter ? 'Clear filters' : 'View Job Requests',
              onClick: () => {
                if (searchQuery || statusFilter) {
                  setSearchQuery('')
                  setStatusFilter('')
                } else {
                  window.location.href = '/dashboard/provider/job-requests'
                }
              },
              variant: 'outline',
            }}
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedQuotations.map((quotation) => (
                <Card key={quotation.id} variant="outlined" padding="lg">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <Avatar
                        src={quotation.job_request.customer.avatar_url}
                        fallback={quotation.job_request.customer.full_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-secondary-900">{quotation.job_request.customer.full_name}</p>
                        <p className="text-sm text-secondary-500">{quotation.job_request.title}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <h3 className="font-semibold text-secondary-900 truncate max-w-md">
                          {quotation.job_request.title}
                        </h3>
                        {getStatusBadge(quotation.status, quotation.valid_until)}
                      </div>
                      <p className="text-secondary-600 mb-3 line-clamp-2">{quotation.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-primary-600 font-semibold text-lg">
                          <DollarSign className="w-5 h-5" />
                          {formatCurrency(quotation.amount, quotation.currency)}
                        </span>
                        {getUrgencyBadge(quotation.job_request.urgency)}
                        <span className="flex items-center gap-1 text-secondary-500">
                          <MapPin className="w-4 h-4" />
                          {quotation.job_request.city}, {quotation.job_request.district}
                        </span>
                        <span className="flex items-center gap-1 text-secondary-500">
                          <Clock className="w-4 h-4" />
                          {new Date(quotation.created_at).toLocaleDateString('en-LK', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        {quotation.valid_until && (
                          <span className={`flex items-center gap-1 text-sm ${isExpired(quotation.valid_until) ? 'text-error-600' : 'text-secondary-500'}`}>
                            <Clock className="w-4 h-4" />
                            Valid until: {new Date(quotation.valid_until).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[200px]">
                      <Link
                        href={`/dashboard/provider/quotations/${quotation.id}`}
                        className="w-full sm:w-auto"
                      >
                        <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                          View Details
                        </Button>
                      </Link>
                      {canWithdraw(quotation.status) && !isExpired(quotation.valid_until) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full sm:w-auto text-error-600 hover:bg-error-50"
                          onClick={() => setWithdrawModal({ open: true, quotationId: quotation.id })}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Withdraw
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
                totalItems={sortedQuotations.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Withdraw Modal */}
      <Modal
        isOpen={withdrawModal.open}
        onClose={() => setWithdrawModal({ open: false, quotationId: null })}
        title="Withdraw Quotation"
        description="Are you sure you want to withdraw this quotation? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={() => setWithdrawModal({ open: false, quotationId: null })}>Cancel</Button>
          <Button variant="destructive" onClick={() => withdrawModal.quotationId && handleWithdraw(withdrawModal.quotationId)}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </Modal>
    </div>
  )
}