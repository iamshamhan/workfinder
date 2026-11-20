'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  MessageSquare,
  Star,
  Eye,
  Clock,
  TrendingUp,
  Menu,
  X,
  ChevronRight,
  Settings,
  BarChart2,
  Calendar,
  MapPin,
  Shield,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  LayoutDashboard,
  Heart,
  LogOut,
  Shield as ShieldIcon,
  Inbox,
  FileText,
  Award,
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
import ProviderProfileCompletion from './ProviderProfileCompletion'

interface ProviderDashboardProps {
  userId: string
}

interface DashboardStats {
  total_listings: number
  active_enquiries: number
  unread_messages: number
  profile_views: number
  average_rating: number
  total_quotations: number
  pending_quotations: number
  completed_jobs: number
}

interface RecentEnquiry {
  id: string
  customer_id: string
  subject: string
  message: string
  contact_method: string
  status: string
  created_at: string
  customer: {
    full_name: string
    avatar_url: string | null
  }
  listing?: {
    id: string
    title: string
  }
}

interface RecentListing {
  id: string
  title: string
  category_id: string
  status: string
  view_count: number
  enquiry_count: number
  price_amount: number | null
  price_currency: string
  category: {
    name: string
  }
}

export default function ProviderDashboard({ userId }: ProviderDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'analytics'>('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { user, profile, loading, signOut } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentEnquiries, setRecentEnquiries] = useState<RecentEnquiry[]>([])
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [isLoadingStats, setIsLoadingStats] = useState(true)

  const isProvider = profile?.role === 'provider'
  const isAdmin = profile?.role === 'admin'

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoadingStats(true)
    try {
      const [statsRes, enquiriesRes, listingsRes] = await Promise.all([
        fetch('/api/provider/dashboard/stats'),
        fetch('/api/provider/enquiries?limit=5'),
        fetch('/api/provider/listings?limit=5'),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }

      if (enquiriesRes.ok) {
        const data = await enquiriesRes.json()
        setRecentEnquiries(data.enquiries || [])
      }

      if (listingsRes.ok) {
        const data = await listingsRes.json()
        setRecentListings(data.listings || [])
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoadingStats(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          </div>
        </div>
      </div>
    )
  }

  const statCards = stats ? [
    { label: 'Total Listings', value: stats.total_listings.toLocaleString(), icon: <Briefcase className="w-6 h-6" />, change: '+2 this month', changeType: 'positive' as const },
    { label: 'Active Enquiries', value: stats.active_enquiries.toLocaleString(), icon: <Inbox className="w-6 h-6" />, change: stats.active_enquiries > 0 ? `${stats.active_enquiries} pending` : 'No pending', changeType: 'positive' as const },
    { label: 'Messages', value: stats.unread_messages.toLocaleString(), icon: <MessageSquare className="w-6 h-6" />, change: stats.unread_messages > 0 ? `${stats.unread_messages} unread` : 'All read', changeType: stats.unread_messages > 0 ? 'positive' as const : 'neutral' as const },
    { label: 'Profile Views', value: stats.profile_views.toLocaleString(), icon: <Eye className="w-6 h-6" />, change: '+12% this week', changeType: 'positive' as const },
    { label: 'Average Rating', value: stats.average_rating.toFixed(1), icon: <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />, change: '+0.1', changeType: 'positive' as const },
    { label: 'Quotations Sent', value: stats.total_quotations.toLocaleString(), icon: <FileText className="w-6 h-6" />, change: stats.pending_quotations > 0 ? `${stats.pending_quotations} pending` : 'All responded', changeType: 'positive' as const },
  ] : []

  const quickActions = [
    { label: 'Create Listing', icon: <Plus className="w-5 h-5" />, href: '/dashboard/provider/listings/new', variant: 'primary' as const },
    { label: 'Edit Profile', icon: <Settings className="w-5 h-5" />, href: '/dashboard/provider/profile', variant: 'secondary' as const },
    { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, href: '/dashboard/provider/messages', variant: 'outline' as const },
    { label: 'Job Requests', icon: <FileText className="w-5 h-5" />, href: '/dashboard/provider/job-requests', variant: 'outline' as const },
    { label: 'Manage Availability', icon: <Calendar className="w-5 h-5" />, href: '/dashboard/provider/availability', variant: 'outline' as const },
    { label: 'View Analytics', icon: <BarChart2 className="w-5 h-5" />, href: '/dashboard/provider/analytics', variant: 'outline' as const },
  ]

  const userMenuOptions = [
    ...(isProvider ? [
      { value: 'dashboard', label: 'Provider Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard/provider' },
      { value: 'listings', label: 'My Listings', icon: <Briefcase className="w-4 h-4" />, href: '/dashboard/provider/listings' },
      { value: 'enquiries', label: 'Enquiries', icon: <Inbox className="w-4 h-4" />, href: '/dashboard/provider/enquiries' },
      { value: 'job-requests', label: 'Job Requests', icon: <FileText className="w-4 h-4" />, href: '/dashboard/provider/job-requests' },
      { value: 'quotations', label: 'Quotations', icon: <FileText className="w-4 h-4" />, href: '/dashboard/provider/quotations' },
      { value: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, href: '/dashboard/provider/messages' },
      { value: 'reviews', label: 'Reviews', icon: <Award className="w-4 h-4" />, href: '/dashboard/provider/reviews' },
    ] : []),
    ...(!isProvider ? [
      { value: 'dashboard', label: 'My Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard/customer' },
      { value: 'saved', label: 'Saved Providers', icon: <Heart className="w-4 h-4" />, href: '/dashboard/customer/saved' },
      { value: 'job-requests', label: 'My Job Requests', icon: <Briefcase className="w-4 h-4" />, href: '/dashboard/customer/job-requests' },
    ] : []),
    { value: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, href: '/messages' },
    { value: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />, href: '/settings' },
    { value: 'divider', label: '', divider: true },
    ...(isAdmin ? [
      { value: 'admin', label: 'Admin Dashboard', icon: <ShieldIcon className="w-4 h-4" />, href: '/dashboard/admin' },
      { value: 'divider', label: '', divider: true },
    ] : []),
    { value: 'logout', label: 'Log out', icon: <LogOut className="w-4 h-4" />, onClick: signOut, danger: true },
  ]

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
      case 'call': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />
      case 'email': return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
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

  const getListingStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge variant="success" size="sm">Published</Badge>
      case 'pending_approval': return <Badge variant="warning" size="sm">Pending Approval</Badge>
      case 'draft': return <Badge variant="secondary" size="sm">Draft</Badge>
      case 'rejected': return <Badge variant="error" size="sm">Rejected</Badge>
      case 'suspended': return <Badge variant="error" size="sm">Suspended</Badge>
      case 'archived': return <Badge variant="secondary" size="sm">Archived</Badge>
      default: return <Badge variant="outline" size="sm">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <ToastContainer />
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-600 mt-1">Welcome back! Here's an overview of your business.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/provider/listings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} variant="elevated" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-1">{stat.value}</p>
                  <p className={`text-sm mt-2 ${stat.changeType === 'positive' ? 'text-success-600' : stat.changeType === 'negative' ? 'text-error-600' : 'text-secondary-500'}`}>
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card variant="outlined" padding="lg" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <CardTitle>Quick Actions</CardTitle>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}>
                <Button variant={action.variant || 'outline'} className="w-full h-20 flex-col gap-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                    {action.icon}
                  </div>
                  <span className="font-medium text-secondary-900">{action.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <Tabs.List>
            <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
            <Tabs.Trigger value="enquiries">Recent Enquiries</Tabs.Trigger>
            <Tabs.Trigger value="analytics">Analytics Summary</Tabs.Trigger>
          </Tabs.List>
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Profile Completion */}
            <ProviderProfileCompletion userId={userId} />

            {/* Recent Enquiries */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>Recent Enquiries</CardTitle>
                <Link href="/dashboard/provider/enquiries" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse p-4 bg-secondary-50 rounded-xl">
                      <div className="h-4 bg-secondary-200 rounded w-1/4 mb-2" />
                      <div className="h-3 bg-secondary-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentEnquiries.length > 0 ? (
                <div className="space-y-4">
                  {recentEnquiries.map((enquiry) => (
                    <div key={enquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-secondary-900">{enquiry.customer.full_name}</p>
                          {getStatusBadge(enquiry.status)}
                        </div>
                        <p className="text-sm text-secondary-600 mb-1">{enquiry.listing?.title || 'General Enquiry'}</p>
                        <p className="text-sm text-secondary-500 truncate max-w-xs">{enquiry.message}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-secondary-500">{new Date(enquiry.created_at).toLocaleString()}</span>
                        <span className="flex items-center gap-1 text-secondary-500">
                          {getContactMethodIcon(enquiry.contact_method)}
                          {getContactMethodLabel(enquiry.contact_method)}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => window.location.href = `/dashboard/provider/enquiries`}>Reply</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Inbox className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                  <h3 className="font-medium text-secondary-900 mb-2">No enquiries yet</h3>
                  <p className="text-secondary-500 mb-4">Enquiries from potential customers will appear here</p>
                  <Link href="/dashboard/provider/listings/new">
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Listing
                    </Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recent Listings */}
            <Card variant="outlined" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <CardTitle>My Recent Listings</CardTitle>
                <Link href="/dashboard/provider/listings" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                  View all listings
                  <ChevronRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
              {isLoadingStats ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse p-4 bg-secondary-50 rounded-xl">
                      <div className="h-4 bg-secondary-200 rounded w-1/4 mb-2" />
                      <div className="h-3 bg-secondary-200 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : recentListings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table
                    columns={[
                      { key: 'image', header: '', accessor: (row) => (
                        <img
                          src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=100&h=60&fit=crop"
                          alt=""
                          className="w-16 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) },
                      { key: 'title', header: 'Listing', accessor: (row) => (
                        <div>
                          <p className="font-semibold text-secondary-900 group-hover:text-primary-600 transition-colors mb-1">{row.title}</p>
                          <p className="text-sm text-secondary-500">{row.category?.name || row.category_id}</p>
                        </div>
                      ) },
                      { key: 'status', header: 'Status', accessor: (row) => getListingStatusBadge(row.status) },
                      { key: 'views', header: 'Views', accessor: 'view_count' },
                      { key: 'enquiries', header: 'Enquiries', accessor: 'enquiry_count' },
                      { key: 'price', header: 'Price', accessor: (row) =>
                        row.price_amount ? formatCurrency(row.price_amount, row.price_currency) : 'Contact for quote'
                      },
                    ]}
                    data={recentListings}
                    keyExtractor={(row) => row.id}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-4 text-secondary-300" />
                  <h3 className="font-medium text-secondary-900 mb-2">No listings yet</h3>
                  <p className="text-secondary-500 mb-4">Create your first listing to start getting enquiries</p>
                  <Link href="/dashboard/provider/listings/new">
                    <Button variant="primary" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Listing
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Enquiries Tab */}
        {activeTab === 'enquiries' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Input placeholder="Search enquiries..." leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>} className="w-full md:w-72" />
                  <Select
                    placeholder="All Status"
                    options={[
                      { value: '', label: 'All Status' },
                      { value: 'new', label: 'New' },
                      { value: 'read', label: 'Read' },
                      { value: 'replied', label: 'Replied' },
                      { value: 'closed', label: 'Closed' },
                    ]}
                    value=""
                    onChange={() => {}}
                    leftIcon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>}
                    className="w-40"
                  />
                </div>
              </div>
              <div className="space-y-4">
                {recentEnquiries.map((enquiry) => (
                  <div key={enquiry.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{enquiry.customer.full_name}</p>
                        {getStatusBadge(enquiry.status)}
                      </div>
                      <p className="text-sm text-secondary-600 mb-1">{enquiry.listing?.title || 'General Enquiry'}</p>
                      <p className="text-sm text-secondary-500 truncate max-w-xs">{enquiry.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-secondary-500">{new Date(enquiry.created_at).toLocaleString()}</span>
                      <span className="flex items-center gap-1 text-secondary-500">
                        {getContactMethodIcon(enquiry.contact_method)}
                        {getContactMethodLabel(enquiry.contact_method)}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = `/dashboard/provider/enquiries`}>Reply</Button>
                      <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <Link href="/dashboard/provider/enquiries">
                  <Button variant="outline" size="sm">View All Enquiries</Button>
                </Link>
              </div>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <Card variant="outlined" padding="lg">
              <CardTitle>Performance Overview</CardTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card variant="outlined" padding="lg">
                  <h4 className="font-medium text-secondary-900 mb-4">Listing Views (Last 30 Days)</h4>
                  <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-500">View full analytics for detailed charts</p>
                  </div>
                </Card>
                <Card variant="outlined" padding="lg">
                  <h4 className="font-medium text-secondary-900 mb-4">Enquiry Conversion Rate</h4>
                  <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-500">View full analytics for detailed charts</p>
                  </div>
                </Card>
                <Card variant="outlined" padding="lg">
                  <h4 className="font-medium text-secondary-900 mb-4">Revenue Estimate</h4>
                  <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-500">View full analytics for detailed charts</p>
                  </div>
                </Card>
                <Card variant="outlined" padding="lg">
                  <h4 className="font-medium text-secondary-900 mb-4">Customer Demographics</h4>
                  <div className="h-64 bg-secondary-50 rounded-lg flex items-center justify-center">
                    <p className="text-secondary-500">View full analytics for detailed charts</p>
                  </div>
                </Card>
              </div>
            </Card>

            <div className="text-center">
              <Link href="/dashboard/provider/analytics">
                <Button variant="primary" size="lg">
                  <BarChart2 className="w-4 h-4 mr-2" />
                  View Full Analytics Dashboard
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}