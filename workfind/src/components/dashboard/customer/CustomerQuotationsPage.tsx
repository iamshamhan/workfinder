'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  FileText,
  ChevronRight,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Award,
  Eye,
  Edit,
  Download,
  Calendar,
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

interface CustomerQuotationsPageProps {
  userId: string
}

interface Quotation {
  id: string
  job_request_id: string
  job_request: {
    id: string
    title: string
    category: { name: string }
    status: string
  }
  provider_id: string
  provider: {
    id: string
    business_name: string
    business_logo_url: string | null
    rating: number
    review_count: number
    verification_status: string
    district: string
    city: string
    phone: string | null
    whatsapp: string | null
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
  { value: 'amount_low', label: 'Amount: Low to High' },
  { value: 'amount_high', label: 'Amount: High to Low' },
  { value: 'status', label: 'Status' },
]

export default function CustomerQuotationsPage({ userId }: CustomerQuotationsPageProps) {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [viewQuotation, setViewQuotation] = useState<Quotation | null>(null)

  useEffect(() => {
    const mockData: Quotation[] = [
      {
        id: 'quote-1',
        job_request_id: 'job-1',
        job_request: {
          id: 'job-1',
          title: 'Kitchen Renovation',
          category: { name: 'Construction' },
          status: 'receiving_offers',
        },
        provider_id: 'prov-4',
        provider: {
          id: 'prov-4',
          business_name: 'BuildRight Construction',
          business_logo_url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=200&h=200&fit=crop',
          rating: 4.7,
          review_count: 87,
          verification_status: 'verified',
          district: 'matara',
          city: 'Matara',
          phone: '+94 41 223 4567',
          whatsapp: '+94 70 345 6789',
        },
        amount: 650000,
        currency: 'LKR',
        description: 'Complete kitchen renovation including custom cabinets, quartz countertops, island installation, backsplash, and modern appliances. Includes demolition, electrical, plumbing, and finishing. 5-year workmanship warranty.',
        estimated_duration: '4 weeks',
        valid_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'quote-2',
        job_request_id: 'job-1',
        job_request: {
          id: 'job-1',
          title: 'Kitchen Renovation',
          category: { name: 'Construction' },
          status: 'receiving_offers',
        },
        provider_id: 'prov-5',
        provider: {
          id: 'prov-5',
          business_name: 'LankaBuild Co',
          business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
          rating: 4.5,
          review_count: 56,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 234 5678',
        },
        amount: 720000,
        currency: 'LKR',
        description: 'Kitchen renovation with premium materials. German-engineered cabinets, marble countertops, high-end appliances. Includes design consultation, 3D visualization, and project management. 10-year warranty on cabinets.',
        estimated_duration: '5 weeks',
        valid_until: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'quote-3',
        job_request_id: 'job-2',
        job_request: {
          id: 'job-2',
          title: 'AC Installation - Split Units',
          category: { name: 'HVAC' },
          status: 'in_progress',
        },
        provider_id: 'prov-6',
        provider: {
          id: 'prov-6',
          business_name: 'CoolAir Solutions',
          business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
          rating: 4.8,
          review_count: 134,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 345 6789',
        },
        amount: 145000,
        currency: 'LKR',
        description: 'Installation of 3 split AC units (2x 12000 BTU, 1x 18000 BTU) including copper piping, electrical wiring, wall mounting, and commissioning. 1-year installation warranty, 5-year compressor warranty.',
        estimated_duration: '1 week',
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'accepted',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'quote-4',
        job_request_id: 'job-3',
        job_request: {
          id: 'job-3',
          title: 'Garden Landscaping',
          category: { name: 'Gardening' },
          status: 'completed',
        },
        provider_id: 'prov-7',
        provider: {
          id: 'prov-7',
          business_name: 'GreenScape Landscaping',
          business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
          rating: 4.9,
          review_count: 203,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 456 7890',
        },
        amount: 220000,
        currency: 'LKR',
        description: 'Complete garden redesign with lawn installation, plant selection, drip irrigation system, outdoor lighting, and garden pathway. Includes soil preparation and 3-month maintenance.',
        estimated_duration: '2 weeks',
        valid_until: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'accepted',
        created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'quote-5',
        job_request_id: 'job-1',
        job_request: {
          id: 'job-1',
          title: 'Kitchen Renovation',
          category: { name: 'Construction' },
          status: 'receiving_offers',
        },
        provider_id: 'prov-8',
        provider: {
          id: 'prov-8',
          business_name: 'Premium Interiors',
          business_logo_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=200&fit=crop',
          rating: 4.6,
          review_count: 45,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 567 8901',
        },
        amount: 680000,
        currency: 'LKR',
        description: 'Modern kitchen renovation with European-style cabinets, solid surface countertops, integrated appliances. Includes 3D design preview and project timeline.',
        estimated_duration: '4 weeks',
        valid_until: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setQuotations(mockData)
    setIsLoading(false)
  }, [])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = quote.job_request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount_low':
        return a.amount - b.amount
      case 'amount_high':
        return b.amount - a.amount
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage)
  const paginatedQuotations = sortedQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'accepted': return <Badge variant="success" size="sm">Accepted</Badge>
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>
      case 'withdrawn': return <Badge variant="secondary" size="sm">Withdrawn</Badge>
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const handleAccept = async (quote: Quotation) => {
    try {
      setQuotations(prev => prev.map(q =>
        q.id === quote.id ? { ...q, status: 'accepted' } : q
      ))
      // Also reject other pending quotes for same job request
      setQuotations(prev => prev.map(q =>
        q.job_request_id === quote.job_request_id && q.id !== quote.id && q.status === 'pending'
          ? { ...q, status: 'rejected' }
          : q
      ))
      addToast('Quotation accepted! Other quotes for this job have been declined.', 'success')
    } catch (error) {
      addToast('Failed to accept quotation', 'error')
    }
  }

  const handleReject = async (quote: Quotation) => {
    try {
      setQuotations(prev => prev.map(q =>
        q.id === quote.id ? { ...q, status: 'rejected' } : q
      ))
      addToast('Quotation rejected', 'success')
    } catch (error) {
      addToast('Failed to reject quotation', 'error')
    }
  }

  const renderQuotationsList = () => {
    if (isLoading) {
      return (
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
      )
    }

    if (paginatedQuotations.length === 0) {
      return (
        <EmptyState
          title="No quotations found"
          description={searchQuery || statusFilter
            ? 'Try adjusting your filters or search terms.'
            : 'You haven\'t received any quotations yet. Create a job request to start receiving quotes!'}
          action={{
            label: searchQuery || statusFilter ? 'Clear filters' : 'Create Job Request',
            onClick: () => {
              if (searchQuery || statusFilter) {
                setSearchQuery('')
                setStatusFilter('')
              } else {
                window.location.href = '/dashboard/customer/job-requests/new'
              }
            },
            variant: 'primary',
          }}
        />
      )
    }

    return (
      <div className="space-y-4">
        {paginatedQuotations.map((quote) => (
            <Card key={quote.id} variant="outlined" padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                <div className="flex items-center gap-4 min-w-[200px]">
                  <Avatar
                    src={quote.provider.business_logo_url}
                    fallback={quote.provider.business_name}
                    size="lg"
                  />
                  <div>
                    <Link
                      href={`/providers/${quote.provider.id}`}
                      className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                    >
                      {quote.provider.business_name}
                    </Link>
                    <div className="flex items-center gap-2 text-sm text-secondary-500">
                      {quote.provider.verification_status === 'verified' && (
                        <Badge variant="primary" className="gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 001.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                          </svg>
                          Verified
                        </Badge>
                      )}
                      <span>{quote.provider.city}, {quote.provider.district}</span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {quote.provider.rating.toFixed(1)} ({quote.provider.review_count})
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div>
                    <Link
                      href={`/dashboard/customer/job-requests/${quote.job_request_id}`}
                      className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                    >
                      {quote.job_request.title}
                    </Link>
                    <Badge variant="secondary" size="sm" className="ml-2">
                      {quote.job_request.category.name}
                    </Badge>
                  </div>
                  {getStatusBadge(quote.status)}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4 text-lg font-bold text-secondary-900">
                    <span>{formatCurrency(quote.amount, quote.currency)}</span>
                    {quote.estimated_duration && (
                      <span className="flex items-center gap-1 text-secondary-500 text-base font-normal">
                        <Clock className="w-4 h-4" />
                        {quote.estimated_duration}
                      </span>
                    )}
                  </div>
                  {quote.valid_until && isExpired(quote.valid_until) && (
                    <Badge variant="error" size="sm">Expired</Badge>
                  )}
                </div>

                <p className="text-secondary-600 mb-4 line-clamp-2">{quote.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-sm">
                  {quote.estimated_duration && (
                    <span className="flex items-center gap-1 text-secondary-500">
                      <Clock className="w-4 h-4" />
                      Est. Duration: {quote.estimated_duration}
                    </span>
                  )}
                  {quote.valid_until && (
                    <span className="flex items-center gap-1 text-secondary-500">
                      <Calendar className="w-4 h-4" />
                      Valid until: {new Date(quote.valid_until).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {isExpired(quote.valid_until) && <span className="text-error-600 ml-1">(Expired)</span>}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[200px]">
                <Link
                  href={`/dashboard/customer/job-requests/${quote.job_request_id}`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="sm" rightIcon={<Eye className="w-4 h-4" />}>
                    View Job Request
                  </Button>
                </Link>
                <div className="flex gap-2 w-full sm:w-auto">
                  {quote.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        className="flex-1 sm:flex-none"
                        onClick={() => handleAccept(quote)}
                        rightIcon={<CheckCircle className="w-4 h-4" />}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 sm:flex-none text-error-600 border-error-600 hover:bg-error-50"
                        onClick={() => handleReject(quote)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {quote.status === 'accepted' && (
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View Details
                    </Button>
                  )}
                  {quote.status === 'rejected' && (
                    <Badge variant="error" size="sm" className="w-full sm:w-auto text-center">
                      Rejected
                    </Badge>
                  )}
                  {quote.status === 'expired' && (
                    <Badge variant="error" size="sm" className="w-full sm:w-auto text-center">
                      Expired
                    </Badge>
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
    </div>
  )
}

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = quote.job_request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.provider.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const sortedQuotations = [...filteredQuotations].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'amount_low':
        return a.amount - b.amount
      case 'amount_high':
        return b.amount - a.amount
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage)
  const paginatedQuotations = sortedQuotations.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="warning" size="sm">Pending</Badge>
      case 'accepted': return <Badge variant="success" size="sm">Accepted</Badge>
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>
      case 'withdrawn': return <Badge variant="secondary" size="sm">Withdrawn</Badge>
      case 'expired': return <Badge variant="error" size="sm">Expired</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false
    return new Date(validUntil) < new Date()
  }

  const handleAccept = async (quote: Quotation) => {
    try {
      setQuotations(prev => prev.map(q =>
        q.id === quote.id ? { ...q, status: 'accepted' } : q
      ))
      // Also reject other pending quotes for same job request
      setQuotations(prev => prev.map(q =>
        q.job_request_id === quote.job_request_id && q.id !== quote.id && q.status === 'pending'
          ? { ...q, status: 'rejected' }
          : q
      ))
      addToast('Quotation accepted! Other quotes for this job have been declined.', 'success')
    } catch (error) {
      addToast('Failed to accept quotation', 'error')
    }
  }

  const handleReject = async (quote: Quotation) => {
    try {
      setQuotations(prev => prev.map(q =>
        q.id === quote.id ? { ...q, status: 'rejected' } : q
      ))
      addToast('Quotation rejected', 'success')
    } catch (error) {
      addToast('Failed to reject quotation', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Quotations</h1>
            <p className="text-secondary-600 mt-1">Compare and manage quotes for your job requests</p>
          </div>
          <Link href="/dashboard/customer/job-requests">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              View Job Requests
            </Button>
          </Link>
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

        {renderQuotationsList()}
      </div>
    </div>
  )
}