'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Filter,
  MessageSquare,
  Mail,
  Phone,
  ChevronRight,
  X,
  Trash2,
  ArrowLeft,
  Clock,
  CheckCircle,
  AlertCircle,
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

interface CustomerEnquiriesPageProps {
  userId: string
}

interface Enquiry {
  id: string
  provider_id: string
  provider: {
    id: string
    business_name: string
    business_logo_url: string | null
    cover_image_url: string | null
    rating: number
    review_count: number
    verification_status: string
    district: string
    city: string
    phone: string | null
    whatsapp: string | null
  }
  listing_id: string | null
  listing?: {
    id: string
    title: string
    main_image_url: string | null
    pricing_type: string
    price_amount: number | null
    price_currency: string
  }
  subject: string
  message: string
  contact_method: string
  status: string
  created_at: string
  updated_at: string
}

const statusOptions: SelectOption[] = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
]

const contactMethodOptions: SelectOption[] = [
  { value: '', label: 'All Methods' },
  { value: 'call', label: 'Phone Call' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Email' },
  { value: 'in_app', label: 'In-App Message' },
]

const sortOptions: SelectOption[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
]

export default function CustomerEnquiriesPage({ userId }: CustomerEnquiriesPageProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [contactMethodFilter, setContactMethodFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean, enquiryId: string | null }>({ open: false, enquiryId: null })
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null)

  useEffect(() => {
    const mockData: Enquiry[] = [
      {
        id: 'enq-1',
        provider_id: 'prov-1',
        provider: {
          id: 'prov-1',
          business_name: 'Premier Electrical Services',
          business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
          cover_image_url: null,
          rating: 4.9,
          review_count: 127,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 123 4567',
        },
        listing_id: 'listing-1',
        listing: {
          id: 'listing-1',
          title: 'Complete Home Electrical Wiring',
          main_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
          pricing_type: 'starting_from',
          price_amount: 45000,
          price_currency: 'LKR',
        },
        subject: 'Electrical wiring for new house',
        message: 'Hi, I need complete electrical wiring for a new 3-bedroom house in Colombo. The house is 2500 sq ft. Please provide a quote including materials and labor. I need this done within 2 weeks.',
        contact_method: 'whatsapp',
        status: 'replied',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'enq-2',
        provider_id: 'prov-2',
        provider: {
          id: 'prov-2',
          business_name: 'AquaFlow Plumbing Solutions',
          business_logo_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=200&h=200&fit=crop',
          cover_image_url: null,
          rating: 4.8,
          review_count: 94,
          verification_status: 'verified',
          district: 'gampaha',
          city: 'Negombo',
          phone: '+94 31 223 4567',
          whatsapp: '+94 76 234 5678',
        },
        listing_id: 'listing-4',
        listing: {
          id: 'listing-4',
          title: 'Bathroom Plumbing Installation & Renovation',
          main_image_url: 'https://images.unsplash.com/photo-1581147036324-c157e62b3cc4?w=600&h=400&fit=crop',
          pricing_type: 'starting_from',
          price_amount: 35000,
          price_currency: 'LKR',
        },
        subject: 'Bathroom renovation quote',
        message: 'Looking to renovate my master bathroom. Need new toilet, shower, vanity installation and tiling. Can you provide a quote?',
        contact_method: 'call',
        status: 'new',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'enq-3',
        provider_id: 'prov-3',
        provider: {
          id: 'prov-3',
          business_name: 'SparkleClean Home Services',
          business_logo_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=200&h=200&fit=crop',
          cover_image_url: null,
          rating: 4.9,
          review_count: 203,
          verification_status: 'verified',
          district: 'kandy',
          city: 'Kandy',
          phone: '+94 81 223 4567',
          whatsapp: '+94 71 345 6789',
        },
        listing_id: 'listing-7',
        listing: {
          id: 'listing-7',
          title: 'Deep Cleaning & Sanitization',
          main_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
          pricing_type: 'fixed',
          price_amount: 15000,
          price_currency: 'LKR',
        },
        subject: 'Post-renovation deep cleaning',
        message: 'Just finished renovating my apartment. Need thorough deep cleaning including windows, cabinets, appliances. 2 bedroom apartment.',
        contact_method: 'email',
        status: 'replied',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'enq-4',
        provider_id: 'prov-1',
        provider: {
          id: 'prov-1',
          business_name: 'Premier Electrical Services',
          business_logo_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=200&h=200&fit=crop',
          cover_image_url: null,
          rating: 4.9,
          review_count: 127,
          verification_status: 'verified',
          district: 'colombo',
          city: 'Colombo',
          phone: '+94 11 234 5678',
          whatsapp: '+94 77 123 4567',
        },
        listing_id: 'listing-2',
        listing: {
          id: 'listing-2',
          title: 'Electrical Fault Diagnosis & Repair',
          main_image_url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop',
          pricing_type: 'hourly',
          price_amount: 3500,
          price_currency: 'LKR',
        },
        subject: 'Emergency electrical issue',
        message: 'Circuit breaker keeps tripping. Burning smell from outlet in kitchen. Need urgent repair.',
        contact_method: 'call',
        status: 'closed',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]

    setEnquiries(mockData)
    setIsLoading(false)
  }, [])

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.provider.business_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = !statusFilter || enquiry.status === statusFilter
    const matchesContactMethod = !contactMethodFilter || enquiry.contact_method === contactMethodFilter
    return matchesSearch && matchesStatus && matchesContactMethod
  })

  const sortedEnquiries = [...filteredEnquiries].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  const itemsPerPage = 10
  const totalPages = Math.ceil(sortedEnquiries.length / itemsPerPage)
  const paginatedEnquiries = sortedEnquiries.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (enquiryId: string) => {
    setDeleteConfirm({ open: true, enquiryId })
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.enquiryId) return
    try {
      setEnquiries(prev => prev.filter(e => e.id !== deleteConfirm.enquiryId))
      addToast('Enquiry deleted', 'success')
    } catch (error) {
      addToast('Failed to delete enquiry', 'error')
    } finally {
      setDeleteConfirm({ open: false, enquiryId: null })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <Badge variant="primary" size="sm">New</Badge>
      case 'read': return <Badge variant="secondary" size="sm">Read</Badge>
      case 'replied': return <Badge variant="success" size="sm">Replied</Badge>
      case 'closed': return <Badge variant="secondary" size="sm">Closed</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'in_app': return <MessageSquare className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getContactMethodLabel = (method: string) => {
    switch (method) {
      case 'call': return 'Phone Call'
      case 'whatsapp': return 'WhatsApp'
      case 'email': return 'Email'
      case 'in_app': return 'In-App'
      default: return method
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer toasts={toasts} onClose={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">My Enquiries</h1>
            <p className="text-secondary-600 mt-1">Manage your conversations with service providers</p>
          </div>
          <Link href="/browse">
            <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-4 h-4" />}>
              Browse Services
            </Button>
          </Link>
        </div>

        <Card variant="outlined" padding="lg" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Search enquiries..."
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
              placeholder="Contact Method"
              options={contactMethodOptions}
              value={contactMethodFilter}
              onChange={(value) => setContactMethodFilter(value)}
              leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
              className="w-44"
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
        ) : (
          <>
            {paginatedEnquiries.length > 0 ? (
              <div className="space-y-4">
                {paginatedEnquiries.map((enquiry) => (
                  <Card key={enquiry.id} variant="outlined" padding="lg">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      <div className="flex items-center gap-4 min-w-[200px]">
                        <Avatar
                          src={enquiry.provider.business_logo_url}
                          fallback={enquiry.provider.business_name}
                          size="lg"
                        />
                        <div>
                          <Link
                            href={`/providers/${enquiry.provider.id}`}
                            className="font-semibold text-secondary-900 hover:text-primary-600 transition-colors"
                          >
                            {enquiry.provider.business_name}
                          </Link>
                          <div className="flex items-center gap-2 text-sm text-secondary-500">
                            {enquiry.provider.verification_status === 'verified' && (
                              <Badge variant="primary" className="gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                                </svg>
                                Verified
                              </Badge>
                            )}
                            <span>{enquiry.provider.city}, {enquiry.provider.district}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4 mb-2">
                          <h3 className="font-semibold text-secondary-900 truncate max-w-md">
                            {enquiry.subject}
                          </h3>
                          {getStatusBadge(enquiry.status)}
                        </div>
                        <p className="text-secondary-600 mb-3 line-clamp-2">{enquiry.message}</p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {enquiry.listing && (
                            <Link
                              href={`/services/${enquiry.listing.id}`}
                              className="flex items-center gap-1 text-primary-600 hover:text-primary-700"
                            >
                              <span>Service:</span>
                              <span className="font-medium text-secondary-900">{enquiry.listing.title}</span>
                            </Link>
                          )}
                          <span className="flex items-center gap-1 text-secondary-500">
                            {getContactMethodIcon(enquiry.contact_method)}
                            {getContactMethodLabel(enquiry.contact_method)}
                          </span>
                          <span className="flex items-center gap-1 text-secondary-500">
                            <Clock className="w-4 h-4" />
                            {new Date(enquiry.created_at).toLocaleDateString('en-LK', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[180px]">
                        <Button variant="outline" size="sm" className="w-full sm:w-auto" rightIcon={<ChevronRight className="w-4 h-4" />}>
                          View Details
                        </Button>
                        <div className="flex gap-2 w-full sm:w-auto">
                          {enquiry.provider.whatsapp && (
                            <a
                              href={`https://wa.me/94${enquiry.provider.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 sm:flex-none p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
                              aria-label="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-4 h-4 mx-auto" />
                            </a>
                          )}
                          {enquiry.provider.phone && (
                            <a
                              href={`tel:${enquiry.provider.phone}`}
                              className="flex-1 sm:flex-none p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-center"
                              aria-label="Call provider"
                            >
                              <Phone className="w-4 h-4 mx-auto" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={sortedEnquiries.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No enquiries found"
              description={searchQuery || statusFilter || contactMethodFilter
                ? 'Try adjusting your filters or search terms.'
                : 'You haven\'t sent any enquiries yet. Start browsing services and contact providers!'}
              action={{
                label: searchQuery || statusFilter || contactMethodFilter ? 'Clear filters' : 'Browse Services',
                onClick: () => {
                  if (searchQuery || statusFilter || contactMethodFilter) {
                    setSearchQuery('')
                    setStatusFilter('')
                    setContactMethodFilter('')
                  } else {
                    window.location.href = '/browse'
                  }
                },
                variant: 'outline',
              }}
            />
          )}
        </>
      )}
    </div>
  </div>
)
}