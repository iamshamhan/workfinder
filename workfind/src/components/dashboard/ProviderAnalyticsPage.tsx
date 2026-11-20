'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  DollarSign,
  Star,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Download,
  BarChart2,
  Users,
  Target,
  Clock,
  MapPin,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Table } from '@/components/ui/Table'
import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProviderAnalyticsPageProps {
  userId: string
}

interface AnalyticsData {
  overview: {
    total_views: number
    views_change: number
    total_enquiries: number
    enquiries_change: number
    conversion_rate: number
    conversion_change: number
    estimated_revenue: number
    revenue_change: number
  }
  chart_data: Array<{
    period: string
    views: number
    enquiries: number
    revenue: number
  }>
  listing_performance: Array<{
    id: string
    title: string
    category: string
    views: number
    enquiries: number
    conversion_rate: string
    avg_rating: number
    status: string
    revenue: number
  }>
  customer_demographics: Array<{
    label: string
    value: string
    percentage: number
    color: string
  }>
  enquiry_sources: Array<{
    source: string
    count: number
    percentage: number
  }>
  quick_insights: {
    best_performing: { title: string; conversion: string }
    fastest_growing: { title: string; growth: string }
    highest_revenue: { title: string; revenue: number }
    highest_rated: { title: string; rating: number }
  }
}

const timeRangeOptions: SelectOption[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '12m', label: 'Last 12 Months' },
  { value: 'all', label: 'All Time' },
]

export default function ProviderAnalyticsPage({ userId }: ProviderAnalyticsPageProps) {
  const [timeRange, setTimeRange] = useState('30d')
  const [chartType, setChartType] = useState<'views' | 'enquiries' | 'revenue'>('views')
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/provider/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatChange = (change: number) => ({
    value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
    type: change >= 0 ? 'positive' as const : 'negative' as const,
    icon: change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />,
  })

  const metricCards = analytics ? [
    {
      label: 'Total Views',
      value: analytics.overview.total_views.toLocaleString(),
      change: formatChange(analytics.overview.views_change),
      icon: <Eye className="w-6 h-6" />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Enquiries',
      value: analytics.overview.total_enquiries.toLocaleString(),
      change: formatChange(analytics.overview.enquiries_change),
      icon: <MessageSquare className="w-6 h-6" />,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Conversion Rate',
      value: `${analytics.overview.conversion_rate.toFixed(2)}%`,
      change: formatChange(analytics.overview.conversion_change),
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Est. Revenue',
      value: formatCurrency(analytics.overview.estimated_revenue, 'LKR'),
      change: formatChange(analytics.overview.revenue_change),
      icon: <DollarSign className="w-6 h-6" />,
      color: 'bg-amber-100 text-amber-600',
    },
  ] : []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
              <p className="text-secondary-600 mt-1">Track your business performance and growth</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} variant="elevated" padding="lg" className="animate-pulse">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="h-4 bg-secondary-200 rounded w-1/2" />
                    <div className="h-8 bg-secondary-200 rounded w-1/4 mt-2" />
                    <div className="h-3 bg-secondary-200 rounded w-1/3 mt-2" />
                  </div>
                  <div className="w-12 h-12 bg-secondary-200 rounded-xl" />
                </div>
              </Card>
            ))}
          </div>
          <Card variant="outlined" padding="lg" className="lg:col-span-2 animate-pulse">
            <div className="h-80 bg-secondary-50 rounded-lg" />
          </Card>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="container py-8">
          <div className="text-center py-12">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 text-secondary-200" />
            <h3 className="text-lg font-medium text-secondary-900 mb-2">Unable to load analytics</h3>
            <p className="text-secondary-500">Please try again later</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
            <p className="text-secondary-600 mt-1">Track your business performance and growth</p>
          </div>
          <div className="flex items-center gap-3">
            <Select
              placeholder="Time Range"
              options={timeRangeOptions}
              value={timeRange}
              onChange={setTimeRange}
              leftIcon={<Calendar className="w-4 h-4" aria-hidden="true" />}
              className="w-44"
            />
            <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric) => (
            <Card key={metric.label} variant="elevated" padding="lg">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-500">{metric.label}</p>
                  <p className="text-3xl font-bold text-secondary-900 mt-1">{metric.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className={cn(
                      'text-sm font-medium',
                      metric.change.type === 'positive' ? 'text-success-600' : 'text-error-600'
                    )}>
                      {metric.change.icon}
                      {metric.change.value}
                    </span>
                    <span className="text-xs text-secondary-500">vs previous period</span>
                  </div>
                </div>
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', metric.color)}>
                  {metric.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Views Chart */}
          <Card variant="outlined" padding="lg" className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Performance Over Time</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'views' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('views')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Views
                </Button>
                <Button
                  variant={chartType === 'enquiries' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('enquiries')}
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  Enquiries
                </Button>
                <Button
                  variant={chartType === 'revenue' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('revenue')}
                >
                  <DollarSign className="w-4 h-4 mr-1" />
                  Revenue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80 bg-secondary-50 rounded-lg flex items-center justify-center relative">
                <div className="absolute inset-0 flex items-end justify-around px-4 py-4" style={{ height: '100%' }}>
                  {analytics.chart_data.map((data, index) => {
                    let height: number
                    let color: string
                    switch (chartType) {
                      case 'views':
                        height = (data.views / Math.max(...analytics.chart_data.map(d => d.views)) * 100) || 0
                        color = '#3b82f6'
                        break
                      case 'enquiries':
                        height = (data.enquiries / Math.max(...analytics.chart_data.map(d => d.enquiries)) * 100) || 0
                        color = '#22c55e'
                        break
                      case 'revenue':
                        height = (data.revenue / Math.max(...analytics.chart_data.map(d => d.revenue)) * 100) || 0
                        color = '#f59e0b'
                        break
                    }
                    return (
                      <div key={index} className="flex flex-col items-center h-full justify-end gap-1" style={{ width: '100%' }}>
                        <div
                          className="w-full rounded-t transition-all duration-300"
                          style={{
                            height: `${Math.max(height, 2)}%`,
                            backgroundColor: color,
                            minHeight: '4px',
                          }}
                        />
                        <span className="text-xs text-secondary-500">{data.period}</span>
                      </div>
                    )
                  })}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 flex items-center justify-around text-xs text-secondary-400 pointer-events-none">
                  {analytics.chart_data.map((data, i) => (
                    <span key={i} className="w-[calc(100%/12)] text-center" style={{ width: `${100/analytics.chart_data.length}%` }}>
                      {i % Math.ceil(analytics.chart_data.length / 6) === 0 ? data.period : ''}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card variant="outlined" padding="lg">
            <CardTitle>Quick Insights</CardTitle>
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Best Performing</p>
                    <p className="text-sm text-secondary-500">{analytics.quick_insights.best_performing.title}</p>
                  </div>
                </div>
                <Badge variant="success" size="sm">{analytics.quick_insights.best_performing.conversion} conversion</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Fastest Growing</p>
                    <p className="text-sm text-secondary-500">{analytics.quick_insights.fastest_growing.title}</p>
                  </div>
                </div>
                <Badge variant="primary" size="sm">+{analytics.quick_insights.fastest_growing.growth} views</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Highest Revenue</p>
                    <p className="text-sm text-secondary-500">{analytics.quick_insights.highest_revenue.title}</p>
                  </div>
                </div>
                <Badge variant="secondary" size="sm">{formatCurrency(analytics.quick_insights.highest_revenue.revenue, 'LKR')}</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-secondary-900">Highest Rated</p>
                    <p className="text-sm text-secondary-500">{analytics.quick_insights.highest_rated.title}</p>
                  </div>
                </div>
                <Badge variant="outline" size="sm">{analytics.quick_insights.highest_rated.rating.toFixed(1)}/5.0</Badge>
              </div>
            </div>
          </Card>
        </div>

        {/* Demographics & Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Customer Demographics */}
          <Card variant="outlined" padding="lg">
            <CardTitle>Customer Demographics</CardTitle>
            <CardDescription>Where your enquiries are coming from</CardDescription>
            <div className="space-y-4 mt-6">
              {analytics.customer_demographics.map((demo, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-700">{demo.label}</span>
                    <span className="font-medium text-secondary-900">{demo.value}</span>
                  </div>
                  <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${demo.percentage}%`, backgroundColor: demo.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Enquiry Sources */}
          <Card variant="outlined" padding="lg">
            <CardTitle>Enquiry Sources</CardTitle>
            <CardDescription>How customers find your listings</CardDescription>
            <div className="space-y-4 mt-6">
              {analytics.enquiry_sources.map((source, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-700">{source.source}</span>
                    <span className="font-medium text-secondary-900">{source.percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-600 rounded-full transition-all duration-500"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Listing Performance Table */}
        <Card variant="outlined" padding="none">
          <CardHeader className="px-6 py-4 border-b border-secondary-200">
            <CardTitle>Listing Performance</CardTitle>
            <CardDescription>How each of your listings is performing</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto">
            <Table
              columns={[
                { key: 'listing', header: 'Listing', accessor: (row) => (
                  <div>
                    <p className="font-medium text-secondary-900 truncate max-w-xs">{row.title}</p>
                    <p className="text-sm text-secondary-500">{row.category}</p>
                  </div>
                ) },
                { key: 'status', header: 'Status', accessor: (row) => (
                  <Badge
                    variant={
                      row.status === 'published' ? 'success' :
                      row.status === 'draft' ? 'secondary' :
                      row.status === 'pending_approval' ? 'warning' : 'error'
                    }
                    size="sm"
                  >
                    {row.status}
                  </Badge>
                ) },
                { key: 'views', header: 'Views', accessor: (row) => row.views.toLocaleString() },
                { key: 'enquiries', header: 'Enquiries', accessor: 'enquiries' },
                { key: 'conversion', header: 'Conversion', accessor: 'conversionRate' },
                { key: 'rating', header: 'Rating', accessor: (row) => (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{row.avg_rating.toFixed(1)}</span>
                  </div>
                ) },
                { key: 'revenue', header: 'Est. Revenue', accessor: (row) => formatCurrency(row.revenue, 'LKR') },
              ]}
              data={analytics.listing_performance}
              keyExtractor={(row) => row.id}
            />
          </div>
        </Card>
      </div>
    </div>
  )
}