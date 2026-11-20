'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  LayoutDashboard,
  Heart,
  MessageSquare,
  Briefcase,
  FileText,
  Star,
  Settings,
  Plus,
  ChevronRight,
  Users,
  ChevronDown,
  MoreVertical,
  Loader2,
  LogOut,
  Shield,
  Clock,
  MapPin,
  DollarSign,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Filter,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Toast, ToastContainer } from '@/components/ui/Toast'
import { Tabs } from '@/components/ui/Tabs'
import { Dropdown } from '@/components/ui/Dropdown'
import { Table } from '@/components/ui/Table'
import { Pagination } from '@/components/ui/Pagination'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/context'

interface CustomerDashboardProps {
  userId: string
}

const quickStats = [
  { label: 'Saved Providers', value: '12', icon: <Heart className="w-6 h-6" />, change: '+3 this month', changeType: 'positive' as const },
  { label: 'Active Enquiries', value: '5', icon: <Inbox className="w-6 h-6" />, change: '2 pending', changeType: 'positive' as const },
  { label: 'Messages', value: '3', icon: <MessageSquare className="w-6 h-6" />, change: '1 unread', changeType: 'positive' as const },
  { label: 'Job Requests', value: '3', icon: <Briefcase className="w-6 h-6" />, change: '1 completed', changeType: 'positive' as const },
  { label: 'Reviews Written', value: '8', icon: <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />, change: '+2 this month', changeType: 'positive' as const },
]

const quickActions = [
  { label: 'Create Job Request', icon: <Plus className="w-5 h-5" />, href: '/dashboard/customer/job-requests/new', variant: 'primary' as const },
  { label: 'Browse Services', icon: <LayoutDashboard className="w-5 h-5" />, href: '/browse', variant: 'secondary' as const },
  { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, href: '/dashboard/customer/messages', variant: 'outline' as const },
  { label: 'Saved Providers', icon: <Heart className="w-5 h-5" />, href: '/dashboard/customer/saved', variant: 'outline' as const },
  { label: 'My Reviews', icon: <Star className="w-5 h-5" />, href: '/dashboard/customer/reviews', variant: 'outline' as const },
]

const recentEnquiries = [
  { id: '1', providerName: 'Premier Electrical Services', service: 'Home Electrical Wiring', message: 'Need wiring for new house', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), status: 'replied' as const },
  { id: '2', providerName: 'AquaFlow Plumbing', service: 'Bathroom Renovation', message: 'Complete bathroom remodel', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), status: 'new' as const },
  { id: '3', providerName: 'SparkleClean Home', service: 'Deep Cleaning', message: 'Post-renovation cleaning', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'closed' as const },
]

const jobRequests = [
  { id: '1', title: 'Kitchen Renovation', category: 'Construction', status: 'receiving_offers', budget: 'LKR 500,000 - 800,000', quotes: 3, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', title: 'AC Installation', category: 'HVAC', status: 'in_progress', budget: 'LKR 150,000', quotes: 1, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', title: 'Garden Landscaping', category: 'Gardening', status: 'completed', budget: 'LKR 200,000', quotes: 2, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
]

const quotations = [
  { id: '1', jobRequestId: '1', providerName: 'BuildRight Construction', amount: 'LKR 650,000', duration: '4 weeks', status: 'accepted' as const, date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', jobRequestId: '1', providerName: 'LankaBuild Co', amount: 'LKR 720,000', duration: '5 weeks', status: 'rejected' as const, date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', jobRequestId: '2', providerName: 'CoolAir Solutions', amount: 'LKR 145,000', duration: '1 week', status: 'pending' as const, date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
]

const reviews = [
  { id: '1', providerName: 'Premier Electrical Services', listingTitle: 'Home Electrical Wiring', rating: 5, title: 'Excellent work', content: 'Professional team, completed on time.', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), status: 'published' },
  { id: '2', providerName: 'AquaFlow Plumbing', listingTitle: 'Bathroom Renovation', rating: 5, title: 'Great service', content: 'Clean work, fair pricing.', date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), status: 'published' },
]

export default function CustomerDashboard({ userId }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'job-requests' | 'quotations' | 'reviews'>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [enquirySearch, setEnquirySearch] = useState('')
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('')
  const [jobRequestSearch, setJobRequestSearch] = useState('')
  const [jobRequestStatusFilter, setJobRequestStatusFilter] = useState('')
  const [quotationSearch, setQuotationSearch] = useState('')
  const [quotationStatusFilter, setQuotationStatusFilter] = useState('')
  const { user, profile, loading, signOut } = useAuth()

  const isProvider = profile?.role === 'provider'
  const isAdmin = profile?.role === 'admin'

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <div className="flex items-center justify-center h-64" role="status" aria-live="polite">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
            <span className="sr-only">Loading dashboard...</span>
          </div>
        </div>
      </div>
    )
  }

  const filteredEnquiries = recentEnquiries.filter(enquiry => {
    const matchesSearch = enquiry.providerName.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      enquiry.service.toLowerCase().includes(enquirySearch.toLowerCase()) ||
      enquiry.message.toLowerCase().includes(enquirySearch.toLowerCase())
    const matchesStatus = !enquiryStatusFilter || enquiry.status === enquiryStatusFilter
    return matchesSearch && matchesStatus
  })

  const filteredJobRequests = jobRequests.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(jobRequestSearch.toLowerCase()) ||
      job.category.toLowerCase().includes(jobRequestSearch.toLowerCase())
    const matchesStatus = !jobRequestStatusFilter || job.status === jobRequestStatusFilter
    return matchesSearch && matchesStatus
  })

  const filteredQuotations = quotations.filter(quote => {
    const matchesSearch = quote.providerName.toLowerCase().includes(quotationSearch.toLowerCase()) ||
      jobRequests.find(j => j.id === quote.jobRequestId)?.title.toLowerCase().includes(quotationSearch.toLowerCase())
    const matchesStatus = !quotationStatusFilter || quote.status === quotationStatusFilter
    return matchesSearch && matchesStatus
  })

  const userMenuOptions = [
    ...(!isProvider ? [
      { value: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard/customer' },
      { value: 'saved', label: 'Saved Providers', icon: <Heart className="w-4 h-4" />, href: '/dashboard/customer/saved' },
      { value: 'job-requests', label: 'My Job Requests', icon: <Briefcase className="w-4 h-4" />, href: '/dashboard/customer/job-requests' },
      { value: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, href: '/dashboard/customer/messages' },
      { value: 'enquiries', label: 'My Enquiries', icon: <Inbox className="w-4 h-4" />, href: '/dashboard/customer/enquiries' },
      { value: 'quotations', label: 'Quotations', icon: <FileText className="w-4 h-4" />, href: '/dashboard/customer/quotations' },
      { value: 'reviews', label: 'My Reviews', icon: <Star className="w-4 h-4" />, href: '/dashboard/customer/reviews' },
    ] : []),
    { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/settings' },
    { value: 'divider', label: '', divider: true },
    ...(isAdmin ? [
      { value: 'admin', label: 'Admin Dashboard', icon: <Shield className="w-4 h-4" />, href: '/dashboard/admin' },
      { value: 'divider', label: '', divider: true },
    ] : []),
    { value: 'logout', label: 'Log out', icon: <LogOut className="w-4 h-4" />, onClick: signOut, danger: true },
  ]

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer />
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-600 mt-1">Welcome back! Here's an overview of your activity.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/customer/job-requests/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
                Create Job Request
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label} variant="elevated" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600" aria-hidden="true">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="enquiries">Enquiries</Tabs.Trigger>
            <Tabs.Trigger value="job-requests">Job Requests</Tabs.Trigger>
            <Tabs.Trigger value="quotations">Quotations</Tabs.Trigger>
            <Tabs.Trigger value="reviews">Reviews</Tabs.Trigger>
          </Tabs.List>
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Quick Actions</CardTitle>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href}>
                    <Button variant={action.variant || 'outline'} className="w-full h-20 flex-col gap-2">
                      <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600" aria-hidden="true">
                        {action.icon}
                      </div>
                      <span className="font-medium text-secondary-900">{action.label}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>

            {/* Recent Enquiries */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Recent Enquiries</CardTitle>
                <Link href="/dashboard/customer/enquiries" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="space-y-4">
                {filteredEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{enquiry.providerName}</p>
                        <Badge variant={enquiry.status === 'new' ? 'primary' : enquiry.status === 'replied' ? 'success' : 'secondary'} size="sm">
                          {enquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">{enquiry.service}</p>
                      <p className="text-sm text-secondary-500 truncate max-w-xs">{enquiry.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(enquiry.date).toLocaleString()}</span>
                      <Button variant="outline" size="sm">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Active Job Requests */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Active Job Requests</CardTitle>
                <Link href="/dashboard/customer/job-requests" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    { key: 'title', header: 'Job Request', accessor: (row) => (
                      <div>
                        <p className="font-semibold text-secondary-900">{row.title}</p>
                        <p className="text-sm text-secondary-500">{row.category}</p>
                      </div>
                    ) },
                    { key: 'status', header: 'Status', accessor: (row) => (
                      <Badge
                        variant={
                          row.status === 'open' ? 'primary' :
                          row.status === 'receiving_offers' ? 'warning' :
                          row.status === 'in_progress' ? 'secondary' :
                          row.status === 'completed' ? 'success' : 'secondary'
                        }
                        size="sm"
                      >
                        {row.status.replace('_', ' ')}
                      </Badge>
                    ) },
                    { key: 'budget', header: 'Budget', accessor: 'budget' },
                    { key: 'quotes', header: 'Quotes', accessor: 'quotes' },
                  ]}
                  data={filteredJobRequests}
                  keyExtractor={(row) => row.id}
                  emptyMessage="No job requests found"
                />
              </div>
            </Card>

            {/* Pending Quotations */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Pending Quotations</CardTitle>
                <Link href="/dashboard/customer/quotations" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              <div className="space-y-4">
                {filteredQuotations.filter(q => q.status === 'pending').map((quote) => (
                  <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{quote.providerName}</p>
                        <Badge variant="warning" size="sm">{quote.status}</Badge>
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">Job: {jobRequests.find(j => j.id === quote.jobRequestId)?.title}</p>
                      <p className="font-semibold text-primary-600 text-lg">{quote.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(quote.date).toLocaleString()}</span>
                      <Button variant="outline" size="sm">Review</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search enquiries..."
                    value={enquirySearch}
                    onChange={(e) => setEnquirySearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                    className="w-full md:w-72"
                    aria-label="Search enquiries"
                  />
                  <Select
                    placeholder="All Status"
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'new', label: 'New' },
                      { value: 'read', label: 'Read' },
                      { value: 'replied', label: 'Replied' },
                      { value: 'closed', label: 'Closed' },
                    ]}
                    value={enquiryStatusFilter}
                    onChange={(value) => setEnquiryStatusFilter(value)}
                    leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
                    className="w-40"
                    aria-label="Filter by status"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {filteredEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{enquiry.providerName}</p>
                        <Badge variant={enquiry.status === 'new' ? 'primary' : enquiry.status === 'replied' ? 'success' : 'secondary'} size="sm">
                          {enquiry.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">{enquiry.service}</p>
                      <p className="text-sm text-secondary-500 truncate max-w-xs">{enquiry.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(enquiry.date).toLocaleString()}</span>
                      <Button variant="outline" size="sm">View</Button>
                      <Button variant="ghost" size="sm" aria-label="More options"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Job Requests Tab */}
        {activeTab === 'job-requests' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search job requests..."
                    value={jobRequestSearch}
                    onChange={(e) => setJobRequestSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                    className="w-full md:w-72"
                    aria-label="Search job requests"
                  />
                  <Select
                    placeholder="All Status"
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'open', label: 'Open' },
                      { value: 'receiving_offers', label: 'Receiving Offers' },
                      { value: 'in_progress', label: 'In Progress' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                    ]}
                    value={jobRequestStatusFilter}
                    onChange={(value) => setJobRequestStatusFilter(value)}
                    leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
                    className="w-48"
                    aria-label="Filter by status"
                  />
                </div>
                <Link href="/dashboard/customer/job-requests/new">
                  <Button rightIcon={<Plus className="w-4 h-4" aria-hidden="true" />}>
                    Create Job Request
                  </Button>
                </Link>
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    { key: 'title', header: 'Job Request', accessor: (row) => (
                      <div>
                        <p className="font-semibold text-secondary-900">{row.title}</p>
                        <p className="text-sm text-secondary-500">{row.category}</p>
                      </div>
                    ) },
                    { key: 'status', header: 'Status', accessor: (row) => (
                      <Badge
                        variant={
                          row.status === 'open' ? 'primary' :
                          row.status === 'receiving_offers' ? 'warning' :
                          row.status === 'in_progress' ? 'secondary' :
                          row.status === 'completed' ? 'success' : 'secondary'
                        }
                        size="sm"
                      >
                        {row.status.replace('_', ' ')}
                      </Badge>
                    ) },
                    { key: 'budget', header: 'Budget', accessor: 'budget' },
                    { key: 'quotes', header: 'Quotes', accessor: 'quotes' },
                    { key: 'createdAt', header: 'Created', accessor: (row) => new Date(row.createdAt).toLocaleDateString() },
                  ]}
                  data={filteredJobRequests}
                  keyExtractor={(row) => row.id}
                  emptyMessage="No job requests found"
                />
              </div>
            </Card>
          </div>
        )}

        {/* Quotations Tab */}
        {activeTab === 'quotations' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Search quotations..."
                    value={quotationSearch}
                    onChange={(e) => setQuotationSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" aria-hidden="true" />}
                    className="w-full md:w-72"
                    aria-label="Search quotations"
                  />
                  <Select
                    placeholder="All Status"
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'accepted', label: 'Accepted' },
                      { value: 'rejected', label: 'Rejected' },
                      { value: 'withdrawn', label: 'Withdrawn' },
                    ]}
                    value={quotationStatusFilter}
                    onChange={(value) => setQuotationStatusFilter(value)}
                    leftIcon={<Filter className="w-5 h-5" aria-hidden="true" />}
                    className="w-40"
                    aria-label="Filter by status"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {filteredQuotations.map((quote) => (
                  <div key={quote.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{quote.providerName}</p>
                        <Badge variant={
                          quote.status === 'pending' ? 'warning' :
                          quote.status === 'accepted' ? 'success' :
                          quote.status === 'rejected' ? 'error' : 'secondary'
                        } size="sm">
                          {quote.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">Job: {jobRequests.find(j => j.id === quote.jobRequestId)?.title}</p>
                      <p className="font-semibold text-primary-600 text-lg">{quote.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(quote.date).toLocaleString()}</span>
                      <Button variant="outline" size="sm">View Details</Button>
                      {quote.status === 'pending' && (
                        <>
                          <Button variant="primary" size="sm">Accept</Button>
                          <Button variant="outline" size="sm" className="text-error-600 border-error-600">Reject</Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>My Reviews</CardTitle>
                <Button variant="outline" size="sm" rightIcon={<Plus className="w-4 h-4" aria-hidden="true" />}>
                  Write Review
                </Button>
              </div>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{review.providerName}</p>
                        <Badge variant="secondary" size="sm">{review.listingTitle}</Badge>
                      </div>
                      <div className="flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-secondary-200'}`} aria-hidden="true" />
                        ))}
                      </div>
                      <p className="text-sm text-secondary-600 mt-1">{review.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(review.date).toLocaleString()}</span>
                      <Badge variant={review.status === 'published' ? 'success' : 'warning'} size="sm">
                        {review.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}