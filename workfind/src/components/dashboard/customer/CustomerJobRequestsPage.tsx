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
  Edit,
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

interface CustomerJobRequestsPageProps {
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
]

export default function CustomerJobRequestsPage({ userId }: CustomerJobRequestsPageProps) {
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [urgencyFilter, setUrgencyFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, jobId: string | null }>({ open: false, jobId: null })
  const [viewJob, setViewJob] = useState<JobRequest | null>(null)

  useEffect(() => {
    const mockData: JobRequest[] = [
      {
        id: 'job-1',
        customer_id: 'cust-1',
        title: 'Kitchen Renovation',
        description: 'Complete kitchen renovation including cabinets, countertops, appliances, and flooring. Modern style with island.',
        category_id: 'cat-4',
        subcategory_id: 'sub-1',
        category: { id: 'cat-4', name: 'Construction', slug: 'construction' },
        subcategory: { id: 'sub-1', name: 'Home Renovation', slug: 'home-renovation' },
        required_service: 'Full kitchen renovation with modern design',
        district: 'colombo',
        city: 'Colombo',
        budget_min: 500000,
        budget_max: 800000,
        budget_currency: 'LKR',
        preferred_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'normal',
        reference_images: [],
        contact_preferences: ['whatsapp', 'email'],
        status: 'receiving_offers',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'job-2',
        customer_id: 'cust-1',
        title: 'AC Installation - Split Units',
        description: 'Install 3 split AC units in bedrooms and living room. Need professional installation with warranty.',
        category_id: 'cat-13',
        subcategory_id: 'sub-1',
        category: { id: 'cat-13', name: 'HVAC', slug: 'hvac' },
        subcategory: { id: 'sub-1', name: 'AC Installation', slug: 'ac-installation' },
        required_service: '3 split AC unit installation',
        district: 'colombo',
        city: 'Colombo',
        budget_min: 150000,
        budget_max: 200000,
        budget_currency: 'LKR',
        preferred_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'high',
        reference_images: [],
        contact_preferences: ['call', 'whatsapp'],
        status: 'in_progress',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'job-3',
        customer_id: 'cust-1',
        title: 'Garden Landscaping',
        description: 'Complete garden redesign with lawn, plants, irrigation system, and outdoor lighting.',
        category_id: 'cat-12',
        subcategory_id: 'sub-1',
        category: { id: 'cat-12', name: 'Gardening', slug: 'gardening' },
        subcategory: { id: 'sub-1', name: 'Landscaping', slug: 'landscaping' },
        required_service: 'Full garden landscaping with irrigation',
        district: 'colombo',
        city: 'Dehiwala-Mount Lavinia',
        budget_min: 150000,
        budget_max: 250000,
        budget_currency: 'LKR',
        preferred_date: null,
        urgency: 'low',
        reference_images: [],
        contact_preferences: ['email'],
        status: 'completed',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'job-4',
        customer_id: 'cust-1',
        title: 'House Painting - Exterior',
        description: 'Exterior painting for 2-story house. Need weather-resistant paint, scaffolding included.',
        category_id: 'cat-11',
        subcategory_id: 'sub-1',
        category: { id: 'cat-11', name: 'Painting', slug: 'painting' },
        subcategory: { id: 'sub-1', name: 'Exterior Painting', slug: 'exterior-painting' },
        required_service: 'Exterior house painting',
        district: 'gampaha',
        city: 'Negombo',
        budget_min: 200000,
        budget_max: 300000,
        budget_currency: 'LKR',
        preferred_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        urgency: 'normal',
        reference_images: [],
        contact_preferences: ['whatsapp'],
        status: 'open',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setJobRequests(mockData)
    setIsLoading(false)
  }, [])

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
  }))

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      case 'urgency':
        const urgencyOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
        return (urgencyOrder[a.urgency as keyof typeof urgencyOrder] || 2) - (urgencyOrder[b.urgency as keyof typeof urgencyOrder] || 2)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage)
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (jobId: string) => {
    setDeleteConfirm({ open: true, jobId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.jobId) return
    try {
      setJobRequests(prev => prev.filter(j => j.id !== deleteConfirm.jobId))
      addToast('Job request deleted', 'success')
    } catch (error) {
      addToast('Failed to delete job request', 'error')
    } finally {
      setDeleteConfirm({ open: false, jobId: null })
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
      case 'urgent': return <Badge variant="error" size="sm">Urgent</Badge>
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

  const renderJobRequestsList = () => {
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

    if (paginatedJobs.length === 0) {
      return (
        <EmptyState
          title="No job requests found"
          description={searchQuery || statusFilter || urgencyFilter
            ? 'Try adjusting your filters or search terms.'
            : 'You haven\'t created any job requests yet. Post a job and let providers send you quotes!'}
          action={{
            label: searchQuery || statusFilter || urgencyFilter ? 'Clear filters' : 'Create Job Request',
            onClick: () => {
              if (searchQuery || statusFilter || urgencyFilter) {
                setSearchQuery('')
                setStatusFilter('')
                setUrgencyFilter('')
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
        {paginatedJobs.map((job) => (
            <Card key={job.id} variant="outlined" padding="lg">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={job.urgency === 'urgent' ? 'error' : job.urgency === 'high' ? 'warning' : job.urgency === 'normal' ? 'secondary' : 'outline'} size="sm">
                        {job.urgency}
                      </Badge>
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
                    href={`/dashboard/customer/job-requests/${job.id}`}
                    className="w-full sm:w-auto"
                  >
                    <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto text-error-600 border-error-600 hover:bg-error-50"
                    onClick={() => handleDelete(job.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sortedJobs.length}
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
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage)
  const paginatedJobs = sortedJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (jobId: string) => {
    setDeleteConfirm({ open: true, jobId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.jobId) return
    try {
      setJobRequests(prev => prev.filter(j => j.id !== deleteConfirm.jobId))
      addToast('Job request deleted', 'success')
    } catch (error) {
      addToast('Failed to delete job request', 'error')
    } finally {
      setDeleteConfirm({ open: false, jobId: null })
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
      case 'urgent': return <Badge variant="error" size="sm">Urgent</Badge>
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

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Job Requests</h1>
            <p className="text-secondary-600 mt-1">Manage your job requests and track quotations</p>
          </div>
          <Link href="/dashboard/customer/job-requests/new">
            <Button rightIcon={<Plus className="w-4 h-4" />}>
              Create Job Request
            </Button>
          </Link>
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

        {renderJobRequestsList()}
      </div>
    </div>
  )
}