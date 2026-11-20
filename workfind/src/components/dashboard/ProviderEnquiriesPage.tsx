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
  Eye,
  Reply,
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

interface ProviderEnquiriesPageProps {
  userId: string
}

interface Enquiry {
  id: string
  customer_id: string
  provider_id: string
  listing_id: string | null
  customer: {
    id: string
    full_name: string
    avatar_url: string | null
    phone: string | null
    whatsapp: string | null
    email: string
  }
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

export default function ProviderEnquiriesPage({ userId }: ProviderEnquiriesPageProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [contactMethodFilter, setContactMethodFilter] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const [toasts, setToasts] = useState<Array<{id: string, title: string, message: string, type: 'success' | 'error' | 'info'}>>([])
  const [viewEnquiry, setViewEnquiry] = useState<Enquiry | null>(null)
  const [replyModal, setReplyModal] = useState<{ open: boolean, enquiry: Enquiry | null, replyMessage: string }>({ open: false, enquiry: null, replyMessage: '' })

  useEffect(() => {
    fetchEnquiries()
  }, [])

  const fetchEnquiries = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/provider/enquiries')
      if (response.ok) {
        const data = await response.json()
        setEnquiries(data.enquiries || [])
      }
    } catch (error) {
      console.error('Failed to fetch enquiries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, title: type === 'error' ? 'Error' : type === 'success' ? 'Success' : 'Notice', message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000)
  }

  const filteredEnquiries = enquiries.filter(enquiry => {
    const matchesSearch = enquiry.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enquiry.customer.full_name.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleStatusChange = async (enquiryId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/provider/enquiries/${enquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setEnquiries(prev => prev.map(e => e.id === enquiryId ? { ...e, status: newStatus } : e))
        addToast('Status updated', 'success')
      } else {
        addToast('Failed to update status', 'error')
      }
    } catch (error) {
      addToast('Failed to update status', 'error')
    }
  }

  const openReplyModal = (enquiry: Enquiry) => {
    setReplyModal({ open: true, enquiry, replyMessage: '' })
  }

  const handleReplySubmit = async () => {
    if (!replyModal.enquiry || !replyModal.replyMessage.trim()) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiry_id: replyModal.enquiry.id,
          content: replyModal.replyMessage,
        }),
      })
      if (response.ok) {
        await handleStatusChange(replyModal.enquiry.id, 'replied')
        setReplyModal({ open: false, enquiry: null, replyMessage: '' })
        addToast('Reply sent successfully', 'success')
      } else {
        addToast('Failed to send reply', 'error')
      }
    } catch (error) {
      addToast('Failed to send reply', 'error')
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
            <h1 className="text-2xl font-bold text-secondary-900">Incoming Enquiries</h1>
            <p className="text-secondary-600 mt-1">Manage enquiries from potential customers</p>
          </div>
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
        ) : paginatedEnquiries.length === 0 ? (
          <EmptyState
            title="No enquiries found"
            description={searchQuery || statusFilter || contactMethodFilter
              ? 'Try adjusting your filters or search terms.'
              : 'No enquiries yet. They will appear here when customers contact you.'}
            action={{
              label: searchQuery || statusFilter || contactMethodFilter ? 'Clear filters' : 'Go to Dashboard',
              onClick: () => {
                if (searchQuery || statusFilter || contactMethodFilter) {
                  setSearchQuery('')
                  setStatusFilter('')
                  setContactMethodFilter('')
                } else {
                  window.location.href = '/dashboard/provider'
                }
              },
              variant: 'outline',
            }}
          />
        ) : (
          <>
            <div className="space-y-4">
              {paginatedEnquiries.map((enquiry) => (
                <Card key={enquiry.id} variant="outlined" padding="lg">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <Avatar
                        src={enquiry.customer.avatar_url}
                        fallback={enquiry.customer.full_name}
                        size="lg"
                      />
                      <div>
                        <p className="font-semibold text-secondary-900">{enquiry.customer.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-secondary-500">
                          <span>{getContactMethodLabel(enquiry.contact_method)}</span>
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
                            <span>Listing:</span>
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

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 min-w-[200px]">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => openReplyModal(enquiry)} rightIcon={<Reply className="w-4 h-4" />}>
                        Reply
                      </Button>
                      <div className="flex gap-2 w-full sm:w-auto">
                        {enquiry.customer.whatsapp && (
                          <a
                            href={`https://wa.me/94${enquiry.customer.whatsapp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-center"
                            aria-label="Chat on WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4 mx-auto" />
                          </a>
                        )}
                        {enquiry.customer.phone && (
                          <a
                            href={`tel:${enquiry.customer.phone}`}
                            className="flex-1 sm:flex-none p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors text-center"
                            aria-label="Call customer"
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
        )}
      </div>

      {/* Reply Modal */}
      <Modal
        isOpen={replyModal.open}
        onClose={() => setReplyModal({ open: false, enquiry: null, replyMessage: '' })}
        title="Reply to Enquiry"
        description={replyModal.enquiry ? `Replying to: ${replyModal.enquiry.subject}` : ''}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">Your Reply</label>
            <textarea
              value={replyModal.replyMessage}
              onChange={(e) => setReplyModal(prev => ({ ...prev, replyMessage: e.target.value }))}
              rows={6}
              className="w-full px-4 py-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-shadow"
              placeholder="Type your reply here..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setReplyModal({ open: false, enquiry: null, replyMessage: '' })}>Cancel</Button>
            <Button onClick={handleReplySubmit} rightIcon={<Reply className="w-4 h-4" />}>
              Send Reply
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}