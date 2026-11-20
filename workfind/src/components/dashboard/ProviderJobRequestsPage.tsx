'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  Briefcase,
  ChevronRight,
  X,
  Trash2,
  Plus,
  Clock,
  MapPin,
  DollarSign,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Send,
  AlertTriangle,
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

interface ProviderJobRequestsPageProps {
  userId: string
}

interface JobRequest {
  id: string
  customer_id: string
  title: string
  description: string
  category_id: string
  subcategory_id: string | null
  category: { id: string; name: string; slug: string }
  subcategory?: { id: string; name: string; slug: string }
  required_service: string
  district: string
  city: string
  budget_min: number | null
  budget_max: number | null
  budget_currency: string
  preferred_date: string | null
  urgency: string
  reference_images: string[]
  contact_preferences: string[]
  status: string
  created_at: string
  updated_at: string
  customer?: {
    full_name: string
    avatar_url: string | null
  }
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'receiving_offers', label: 'Receiving Offers' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const urgencyOptions: SelectOption[] = [
  { value: '', label: 'All Urgency' },
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
  { value: 'urgency', label: 'Urgency' },
  { value: 'budget', label: 'Budget (High to Low)' },
]

export default function ProviderJobRequestsPage({ userId }: ProviderJobRequestsPageProps) {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [viewJob, setViewJob] = useState<JobRequest | null>(null)
  const [quotationModal, setQuotationModal] = useState<{ open: boolean, job: JobRequest | null, formData: QuotationForm }>({
    open: false,
    job: null,
    formData: { amount: '', currency: 'LKR', description: '', estimated_duration: '', valid_until: '' },
  })

  interface QuotationForm {
    amount: string
    currency: string
    description: string
    estimated_duration: string
    valid_until: string
  }

  useEffect(() => {
    fetchJobRequests()
  }, [])

  const fetchJobRequests = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/job-requests')
      if (response.ok) {
        const data = await response.json()
        setJobRequests(data.jobs || [])
      }
    } catch (error) {
      console.error('Failed to fetch job requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredJobs = jobRequests.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.required_service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || job.status === statusFilter
    const matchesUrgency = !urgencyFilter || job.urgency === urgencyFilter
    return matchesSearch && matchesStatus && matchesUrgency
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'urgency':
        const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
        return (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 2) - (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 2)
      case 'budget':
        const budgetA = a.budget_max || a.budget_min || 0
        const budgetB = b.budget_max || b.budget_min || 0
        return budgetB - budgetA
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage)
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const openQuotationModal = (job: JobRequest) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    setQuotationModal({
      open: true,
      job,
      formData: {
        amount: '',
        currency: 'LKR',
        description: '',
        estimated_duration: '',
        valid_until: tomorrow.toISOString().split('T')[0],
      },
    })
  }

  const handleQuotationSubmit = async () => {
    if (!quotationModal.job) return

    const { formData } = quotationModal
    if (!formData.amount || !formData.description) {
      addToast('Amount and description are required', 'error')
      return
    }

    try {
      const response = await fetch('/api/provider/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job_request_id: quotationModal.job.id,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          estimated_duration: formData.estimated_duration || null,
          valid_until: formData.valid_until || null,
        }),
      })
      if (response.ok) {
        addToast('Quotation sent successfully!', 'success')
        setQuotationModal({ open: false, job: null, formData: { amount: '', currency: 'LKR', description: '', estimated_duration: '', valid_until: '' } })
      } else {
        const data = await response.json()
        addToast(data.error || 'Failed to send quotation', 'error')
      }
    } catch (error) {
      addToast('Failed to send quotation', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open': return <Badge variant="primary" size="sm">Open</Badge>
      case 'receiving_offers': return <Badge variant="warning" size="sm">Receiving Offers</Badge>
      case 'in_progress': return <Badge variant="secondary" size="sm">In Progress</Badge>
      case 'completed': return <Badge variant="success" size="sm">Completed</Badge>
      case 'cancelled': return <Badge variant="error" size="sm">Cancelled</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return <Badge variant="error" size="sm"><AlertTriangle className="w-3 h-3 mr-1" /> Urgent</Badge>
      case 'high': return <Badge variant="warning" size="sm">High</Badge>
      case 'normal': return <Badge variant="secondary" size="sm">Normal</Badge>
      case 'low': return <Badge variant="outline" size="sm">Low</Badge>
      default: return <Badge variant="outline" size="sm">{urgency}</Badge>
    }
  }

  const formatBudget = (job: JobRequest) => {
    if (job.budget_min && job.budget_max) {
      return `${formatCurrency(job.budget_min, job.budget_currency)} - ${formatCurrency(job.budget_max, job.budget_currency)}`
    } else if (job.budget_min) {
      return `${formatCurrency(job.budget_min, job.budget_currency)}+`
    } else if (job.budget_max) {
      return `Up to ${formatCurrency(job.budget_max, job.budget_currency)}`
    }
    return 'Negotiable'
  }

  const canSendQuotation = (status: string) => {
    return status === 'open' || status === 'receiving_offers'
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Job Requests</h1>
            <p className="text-secondary-600 mt-1">View and bid on matching job requests in your area</p>
          </div>
        </div>

        <Card variant="outlined" padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search job requests..."
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
              className="w-44"
            />
            <Select
              placeholder="All Urgency"
              options={urgencyOptions}
              value={urgencyFilter}
              onChange={(value) => setUrgencyFilter(value)}
              leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
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
        ) : paginatedJobs.length === 0 ? (
          <EmptyState
            title="No job requests found"
            description={searchQuery || statusFilter || urgencyFilter
              ? 'Try adjusting your filters or search terms.'
              : 'No matching job requests at the moment. Check back later!'}
            action={{
              label: searchQuery || statusFilter || urgencyFilter ? 'Clear filters' : 'Refresh',
              onClick: () => {
                if (searchQuery || statusFilter || urgencyFilter) {
                  setSearchQuery('')
                  setStatusFilter('')
                  setUrgencyFilter('')
                } else {
                  fetchJobRequests()
                }
              },
              variant: 'outline',
            }}
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedJobs.map((job) => (
                <Card key={job.id} variant="outlined" padding="lg">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-3">
                          {getUrgencyBadge(job.urgency)}
                          {getStatusBadge(job.status)}
                        </div>
                        <h3 className="font-semibold text-secondary-900 flex-1 truncate">{job.title}</h3>
                      </div>
                      <p className="text-secondary-600 mb-3 line-clamp-2">{job.description}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <span className="flex items-center gap-1 text-secondary-500">
                          <Briefcase className="w-4 h-4" />
                          {job.category.name}
                        </span>
                        <span className="flex items-center gap-1 text-secondary-500">
                          <MapPin className="w-4 h-4" />
                          {job.city}, {job.district}
                        </span>
                        <span className="flex items-center gap-1 text-primary-600 font-semibold">
                          <DollarSign className="w-4 h-4" />
                          {formatBudget(job)}
                        </span>
                        {job.preferred_date && (
                          <span className="flex items-center gap-1 text-secondary-500">
                            <Clock className="w-4 h-4" />
                            Preferred: {new Date(job.preferred_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[200px]">
                      <Link
                        href={`/dashboard/provider/job-requests/${job.id}`}
                        className="w-full sm:w-auto"
                      >
                        <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                          View Details
                        </Button>
                      </Link>
                      {canSendQuotation(job.status) && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => openQuotationModal(job)}
                          rightIcon={<Send className="w-4 h-4" />}
                        >
                          Send Quote
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
                totalItems={sortedJobs.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>

      {/* Quotation Modal */}
      <Modal
        isOpen={quotationModal.open}
        onClose={() => setQuotationModal({ open: false, job: null, formData: { amount: '', currency: 'LKR', description: '', estimated_duration: '', valid_until: '' } })}
        title="Send Quotation"
        description={quotationModal.job ? `For: ${quotationModal.job.title}` : ''}
        size="lg"
      >
        <form onSubmit={(e) => { e.preventDefault(); handleQuotationSubmit() }} className="space-y-4">
          <Input
            label="Amount (LKR)"
            type="number"
            value={quotationModal.formData.amount}
            onChange={(e) => setQuotationModal(prev => ({ ...prev, formData: { ...prev.formData, amount: e.target.value } }))}
            placeholder="Enter your quote amount"
            required
            min="0"
            step="1000"
          />
          <Input
            label="Description"
            type="textarea"
            value={quotationModal.formData.description}
            onChange={(e) => setQuotationModal(prev => ({ ...prev, formData: { ...prev.formData, description: e.target.value } }))}
            placeholder="Describe what's included in your quote, timeline, materials, etc."
            rows={4}
            required
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Estimated Duration (Optional)"
              value={quotationModal.formData.estimated_duration}
              onChange={(e) => setQuotationModal(prev => ({ ...prev, formData: { ...prev.formData, estimated_duration: e.target.value } }))}
              placeholder="e.g., 2 weeks, 5 days"
            />
            <Input
              label="Valid Until (Optional)"
              type="date"
              value={quotationModal.formData.valid_until}
              onChange={(e) => setQuotationModal(prev => ({ ...prev, formData: { ...prev.formData, valid_until: e.target.value } }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setQuotationModal({ open: false, job: null, formData: { amount: '', currency: 'LKR', description: '', estimated_duration: '', valid_until: '' } })}>Cancel</Button>
            <Button type="submit" rightIcon={<Send className="w-4 h-4" />}>
              Send Quotation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}