'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Users,
  Briefcase,
  MessageSquare,
  Star,
  Shield,
  Eye,
  BarChart2,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Table } from '@/components/ui/Table'
import { formatNumber, formatDate } from '@/lib/utils'

interface AdminStats {
  totalUsers: number
  totalProviders: number
  totalCustomers: number
  totalListings: number
  pendingListings: number
  totalReviews: number
  pendingReviews: number
  openReports: number
  usersChange: number
  providersChange: number
  listingsChange: number
  reportsChange: number
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'provider_registered' | 'listing_created' | 'review_submitted' | 'report_filed'
  title: string
  description: string
  timestamp: string
  userName: string
  userAvatar?: string
}

interface PendingItem {
  id: string
  type: 'listing' | 'review' | 'report'
  title: string
  status: string
  createdAt: string
  actionUrl: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      change: stats ? `${stats.usersChange >= 0 ? '+' : ''}${stats.usersChange}%` : '+0%',
      changeType: (stats?.usersChange || 0) >= 0 ? 'positive' as const : 'negative' as const,
      href: '/dashboard/admin/users',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Providers',
      value: stats?.totalProviders || 0,
      icon: <Briefcase className="w-6 h-6" />,
      change: stats ? `${stats.providersChange >= 0 ? '+' : ''}${stats.providersChange}%` : '+0%',
      changeType: (stats?.providersChange || 0) >= 0 ? 'positive' as const : 'negative' as const,
      href: '/dashboard/admin/providers',
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Listings',
      value: stats?.totalListings || 0,
      icon: <MessageSquare className="w-6 h-6" />,
      change: stats ? `${stats.listingsChange >= 0 ? '+' : ''}${stats.listingsChange}%` : '+0%',
      changeType: (stats?.listingsChange || 0) >= 0 ? 'positive' as const : 'negative' as const,
      href: '/dashboard/admin/listings',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Open Reports',
      value: stats?.openReports || 0,
      icon: <Shield className="w-6 h-6" />,
      change: stats ? `${stats.reportsChange >= 0 ? '+' : ''}${stats.reportsChange}%` : '+0%',
      changeType: (stats?.reportsChange || 0) >= 0 ? 'positive' as const : 'negative' as const,
      href: '/dashboard/admin/reports',
      color: 'bg-red-100 text-red-600',
    },
  ]

  const quickActions = [
    { label: 'Review Pending Listings', icon: <MessageSquare className="w-5 h-5" />, href: '/dashboard/admin/listings?status=pending_approval', variant: 'primary' as const },
    { label: 'Moderate Reviews', icon: <Star className="w-5 h-5" />, href: '/dashboard/admin/reviews?status=pending', variant: 'secondary' as const },
    { label: 'Handle Reports', icon: <Shield className="w-5 h-5" />, href: '/dashboard/admin/reports?status=pending', variant: 'outline' as const },
    { label: 'View Analytics', icon: <BarChart2 className="w-5 h-5" />, href: '/dashboard/admin/analytics', variant: 'outline' as const },
  ]

  async function fetchDashboardData() {
    try {
      setLoading(true)
      const [statsRes, activityRes, pendingRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/recent-activity'),
        fetch('/api/admin/dashboard/pending-items'),
      ])

      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data)
      }

      if (activityRes.ok) {
        const data = await activityRes.json()
        setRecentActivity(data)
      }

      if (pendingRes.ok) {
        const data = await pendingRes.json()
        setPendingItems(data)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
            <p className="text-secondary-600 mt-1">Platform overview and quick actions</p>
          </div>
          <Button variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} variant="elevated" padding="lg" className="animate-pulse">
              <div className="h-6 bg-secondary-200 rounded w-3/4 mb-2" />
              <div className="h-8 bg-secondary-200 rounded w-1/2" />
              <div className="h-4 bg-secondary-200 rounded w-1/3 mt-2" />
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-secondary-900 mb-2">Failed to load dashboard</h2>
        <p className="text-secondary-500 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Admin Dashboard</h1>
          <p className="text-secondary-600 mt-1">Platform overview and quick actions</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchDashboardData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href} className="no-underline">
            <Card variant="elevated" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(stat.value)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`text-sm ${stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'}`}>
                      {stat.changeType === 'positive' ? (
                        <TrendingUp className="w-4 h-4 inline-block" />
                      ) : (
                        <TrendingDown className="w-4 h-4 inline-block" />
                      )}
                      {stat.change}
                    </span>
                    <span className="text-sm text-secondary-500">vs last month</span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card variant="outlined" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </div>
              <Link href="/dashboard/admin/audit-logs" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1">
                View all
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                <p className="text-secondary-500">No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-4 bg-secondary-50 rounded-xl">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      {activity.type === 'user_registered' && <Users className="w-5 h-5 text-primary-600" />}
                      {activity.type === 'provider_registered' && <Briefcase className="w-5 h-5 text-primary-600" />}
                      {activity.type === 'listing_created' && <MessageSquare className="w-5 h-5 text-primary-600" />}
                      {activity.type === 'review_submitted' && <Star className="w-5 h-5 text-primary-600" />}
                      {activity.type === 'report_filed' && <Shield className="w-5 h-5 text-primary-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-secondary-900">{activity.title}</p>
                        <span className="text-xs text-secondary-500">{formatDate(activity.timestamp)}</span>
                      </div>
                      <p className="text-sm text-secondary-600">{activity.description}</p>
                      <p className="text-xs text-secondary-400 mt-1">By {activity.userName}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Pending Items */}
          <Card variant="outlined" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <CardTitle>Requires Attention</CardTitle>
            </div>
            {pendingItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-success-500 mx-auto mb-4" />
                <p className="text-secondary-500">No pending items requiring attention</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-warning-100 rounded-lg flex items-center justify-center">
                        {item.type === 'listing' && <MessageSquare className="w-5 h-5 text-warning-600" />}
                        {item.type === 'review' && <Star className="w-5 h-5 text-warning-600" />}
                        {item.type === 'report' && <Shield className="w-5 h-5 text-warning-600" />}
                      </div>
                      <div>
                        <p className="font-medium text-secondary-900">{item.title}</p>
                        <p className="text-sm text-secondary-500 capitalize">{item.type} • {formatDate(item.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'pending' ? 'warning' : item.status === 'under_review' ? 'primary' : 'secondary'} size="sm">
                        {item.status.replace('_', ' ')}
                      </Badge>
                      <Link href={item.actionUrl}>
                        <Button variant="outline" size="sm">Review</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          <Card variant="outlined" padding="lg">
            <CardTitle>Platform Health</CardTitle>
            <div className="space-y-4 mt-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-900">Active Users</span>
                  <span className="text-sm font-semibold text-secondary-900">{stats ? formatNumber(stats.totalUsers) : '0'}</span>
                </div>
                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-900">Provider Verification</span>
                  <span className="text-sm font-semibold text-secondary-900">{stats ? formatNumber(stats.totalProviders) : '0'}</span>
                </div>
                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-900">Listing Approval Rate</span>
                  <span className="text-sm font-semibold text-secondary-900">94%</span>
                </div>
                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: '94%' }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-secondary-900">Report Resolution</span>
                  <span className="text-sm font-semibold text-secondary-900">87%</span>
                </div>
                <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: '87%' }} />
                </div>
              </div>
            </div>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardTitle>Quick Stats</CardTitle>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Total Customers</p>
                    <p className="text-xs text-secondary-500">{(stats?.totalUsers || 0) - (stats?.totalProviders || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Total Reviews</p>
                    <p className="text-xs text-secondary-500">{formatNumber(stats?.totalReviews || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Pending Reviews</p>
                    <p className="text-xs text-secondary-500">{formatNumber(stats?.pendingReviews || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">Pending Listings</p>
                    <p className="text-xs text-secondary-500">{formatNumber(stats?.pendingListings || 0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}