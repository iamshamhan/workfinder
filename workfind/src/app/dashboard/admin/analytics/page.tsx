'use client'

import { useState, useEffect } from 'react'
import {
  BarChart2,
  Users,
  Briefcase,
  Star,
  Shield,
  Eye,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Loader2,
  RefreshCw,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select, SelectOption } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { Toast, ToastContainer, toast } from '@/components/ui/Toast'
import { formatNumber, formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface AnalyticsData {
  period: string
  overview: {
    users: { total: number; customers: number; providers: number }
    listings: { total: number; published: number }
    reviews: { total: number; published: number }
    reports: { total: number; resolved: number }
    engagement: { totalViews: number; totalEnquiries: number; avgViewsPerListing: number; avgEnquiriesPerListing: number }
  }
  topCategories: { name: string; count: number }[]
  topProviders: { id: string; name: string; rating: number; reviews: number; views: number }[]
  dailyData: {
    date: string
    label: string
    users: number
    providers: number
    listings: number
    reviews: number
    reports: number
    views: number
    enquiries: number
  }[]
}

const periodOptions: SelectOption[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
  { value: '1y', label: 'Last Year' },
]

const metricOptions: SelectOption[] = [
  { value: 'users', label: 'New Users' },
  { value: 'providers', label: 'New Providers' },
  { value: 'listings', label: 'New Listings' },
  { value: 'reviews', label: 'New Reviews' },
  { value: 'reports', label: 'New Reports' },
  { value: 'views', label: 'Page Views' },
  { value: 'enquiries', label: 'Enquiries' },
]

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('30d')
  const [selectedMetric, setSelectedMetric] = useState('users')
  const [chartData, setChartData] = useState<{ label: string; value: number }[]>([])

  async function fetchAnalytics() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`)
      if (!res.ok) throw new Error('Failed to fetch analytics')
      const result = await res.json()
      setData(result)
      updateChartData(result)
    } catch (error) {
      toast.error('Failed to load analytics')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  function updateChartData(analyticsData: AnalyticsData) {
    const metricKey = selectedMetric as keyof AnalyticsData['dailyData'][0]
    const newChartData = analyticsData.dailyData.map(day => ({
      label: day.label,
      value: day[metricKey] as number,
    }))
    setChartData(newChartData)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  useEffect(() => {
    if (data) updateChartData(data)
  }, [selectedMetric, data])

  const getMetricLabel = (metric: string) => {
    const opt = metricOptions.find(o => o.value === metric)
    return opt?.label || metric
  }

  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case 'users': return <Users className="w-5 h-5" />
      case 'providers': return <Briefcase className="w-5 h-5" />
      case 'listings': return <MessageSquare className="w-5 h-5" />
      case 'reviews': return <Star className="w-5 h-5" />
      case 'reports': return <Shield className="w-5 h-5" />
      case 'views': return <Eye className="w-5 h-5" />
      case 'enquiries': return <MessageSquare className="w-5 h-5" />
      default: return <BarChart2 className="w-5 h-5" />
    }
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'users': return 'text-blue-600'
      case 'providers': return 'text-green-600'
      case 'listings': return 'text-purple-600'
      case 'reviews': return 'text-yellow-600'
      case 'reports': return 'text-red-600'
      case 'views': return 'text-indigo-600'
      case 'enquiries': return 'text-pink-600'
      default: return 'text-primary-600'
    }
  }

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  // Calculate previous period for comparison
  const previousPeriodData = data ? {
    users: data.overview.users.total,
    providers: data.overview.users.providers,
    listings: data.overview.listings.total,
    reviews: data.overview.reviews.total,
    reports: data.overview.reports.total,
  } : null

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Platform Analytics</h1>
            <p className="text-secondary-600 mt-1">Track platform performance and growth metrics</p>
          </div>
          <Button variant="outline" disabled>
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Loading...
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
        <Card variant="outlined" padding="lg" className="animate-pulse">
          <div className="h-8 bg-secondary-200 rounded w-1/4 mb-6" />
          <div className="h-64 bg-secondary-200 rounded" />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastContainer />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Platform Analytics</h1>
          <p className="text-secondary-600 mt-1">Track platform performance and growth metrics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card variant="outlined" padding="md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-secondary-500" />
            <Select
              placeholder="Select Period"
              options={periodOptions}
              value={period}
              onChange={setPeriod}
              className="w-48"
            />
          </div>
          <div className="flex items-center gap-4">
            <BarChart2 className="w-5 h-5 text-secondary-500" />
            <Select
              placeholder="Chart Metric"
              options={metricOptions}
              value={selectedMetric}
              onChange={setSelectedMetric}
              className="w-48"
            />
          </div>
        </div>
      </Card>

      {/* Overview Stats */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-8 gap-4 mb-6">
          <Card variant="elevated" padding="lg" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Total Users</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(data.overview.users.total)}</p>
                <p className="text-sm mt-2">
                  <span className="text-success-600">+{formatNumber(data.overview.users.customers)} customers</span>
                  <span className="text-secondary-400 mx-2">•</span>
                  <span className="text-primary-600">{formatNumber(data.overview.users.providers)} providers</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Listings</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(data.overview.listings.total)}</p>
                <p className="text-sm text-success-600 mt-2">{formatNumber(data.overview.listings.published)} published</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Reviews</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(data.overview.reviews.total)}</p>
                <p className="text-sm text-success-600 mt-2">{formatNumber(data.overview.reviews.published)} published</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-yellow-600">
                <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Reports</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(data.overview.reports.total)}</p>
                <p className="text-sm text-success-600 mt-2">{formatNumber(data.overview.reports.resolved)} resolved</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                <Shield className="w-6 h-6" />
              </div>
            </div>
          </Card>

          <Card variant="elevated" padding="lg" className="lg:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-secondary-500">Engagement</p>
                <p className="text-3xl font-bold text-secondary-900 mt-1">{formatNumber(data.overview.engagement.totalViews)}</p>
                <p className="text-sm mt-2">
                  <span className="text-primary-600">{formatNumber(data.overview.engagement.totalEnquiries)} enquiries</span>
                  <span className="text-secondary-400 mx-2">•</span>
                  <span className="text-secondary-600">Avg {data.overview.engagement.avgViewsPerListing} views/listing</span>
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <Eye className="w-6 h-6" />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Chart */}
      <Card variant="outlined" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <CardTitle>{getMetricLabel(selectedMetric)} Over Time</CardTitle>
            <CardDescription>Daily {getMetricLabel(selectedMetric).toLowerCase()} for the selected period</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium', getMetricColor(selectedMetric))}>
              {getMetricIcon(selectedMetric)}
              {chartData.reduce((sum, d) => sum + d.value, 0)} total
            </span>
          </div>
        </div>

        <div className="h-80">
          {chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-secondary-500">No data available for this period</p>
            </div>
          ) : (
            <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={getMetricColor(selectedMetric).replace('text-', '').replace('600', '')} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={getMetricColor(selectedMetric).replace('text-', '').replace('600', '')} stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const maxValue = Math.max(...chartData.map(d => d.value), 1)
                const width = 800
                const height = 350
                const padding = 50
                const chartWidth = width - padding * 2
                const chartHeight = height - padding * 2
                const stepX = chartWidth / (chartData.length - 1 || 1)

                return (
                  <>
                    {/* Grid lines */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <line
                        key={i}
                        x1={padding}
                        y1={padding + (chartHeight / 4) * i}
                        x2={width - padding}
                        y2={padding + (chartHeight / 4) * i}
                        stroke="#e5e7eb"
                        strokeWidth={1}
                      />
                    ))}

                    {/* Y-axis labels */}
                    {Array.from({ length: 5 }).map((_, i) => (
                      <text
                        key={`y-${i}`}
                        x={padding - 10}
                        y={padding + (chartHeight / 4) * i + 4}
                        textAnchor="end"
                        fontSize="11"
                        fill="#9ca3af"
                      >
                        {Math.round(maxValue * (1 - i / 4))}
                      </text>
                    ))}

                    {/* Area */}
                    <path
                      d={
                        chartData
                          .map((d, i) => {
                            const x = padding + i * stepX
                            const y = padding + chartHeight - (d.value / maxValue) * chartHeight
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                          })
                          .join(' ') +
                        ` L ${padding + chartWidth} ${padding + chartHeight} L ${padding} ${padding + chartHeight} Z`
                      }
                      fill="url(#chartGradient)"
                    />

                    {/* Line */}
                    <path
                      d={
                        chartData
                          .map((d, i) => {
                            const x = padding + i * stepX
                            const y = padding + chartHeight - (d.value / maxValue) * chartHeight
                            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
                          })
                          .join(' ')
                      }
                      stroke={getMetricColor(selectedMetric).replace('text-', '')}
                      strokeWidth={2}
                      fill="none"
                    />

                    {/* Points */}
                    {chartData.map((d, i) => (
                      <circle
                        key={i}
                        cx={padding + i * stepX}
                        cy={padding + chartHeight - (d.value / maxValue) * chartHeight}
                        r={4}
                        fill={getMetricColor(selectedMetric).replace('text-', '')}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}

                    {/* X-axis labels */}
                    {chartData.map((d, i) => (
                      i % Math.ceil(chartData.length / 10) === 0 && (
                        <text
                          key={`x-${i}`}
                          x={padding + i * stepX}
                          y={height - padding + 20}
                          textAnchor="middle"
                          fontSize="10"
                          fill="#9ca3af"
                        >
                          {d.label}
                        </text>
                      )
                    ))}
                  </>
                )
              })()}
            </svg>
          )}
        </div>
      </Card>

      {/* Top Categories & Providers */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card variant="outlined" padding="lg">
            <CardTitle>Top Categories</CardTitle>
            <div className="space-y-3 mt-4">
              {data.topCategories.slice(0, 10).map((cat, index) => (
                <div key={cat.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-secondary-900">{cat.name}</p>
                    <p className="text-sm text-secondary-500">{formatNumber(cat.count)} listings</p>
                  </div>
                  <Badge variant="secondary" size="sm">{formatNumber(cat.count)}</Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card variant="outlined" padding="lg">
            <CardTitle>Top Providers</CardTitle>
            <div className="space-y-3 mt-4">
              {data.topProviders.slice(0, 10).map((provider, index) => (
                <div key={provider.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-secondary-900 truncate">{provider.name}</p>
                    <div className="flex items-center gap-2 text-xs text-secondary-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {provider.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span>{formatNumber(provider.reviews)} reviews</span>
                      <span>•</span>
                      <span>{formatNumber(provider.views)} views</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Summary Table */}
      {data && (
        <Card variant="outlined" padding="lg">
          <CardTitle>Daily Summary</CardTitle>
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-200">
                  <th className="text-left py-3 px-4 font-medium text-secondary-500">Date</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">New Users</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">New Providers</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">New Listings</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">New Reviews</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">New Reports</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">Views</th>
                  <th className="text-right py-3 px-4 font-medium text-secondary-500">Enquiries</th>
                </tr>
              </thead>
              <tbody>
                {data.dailyData.slice().reverse().slice(0, 30).map((day) => (
                  <tr key={day.date} className="border-b border-secondary-100 hover:bg-secondary-50">
                    <td className="py-3 px-4 text-secondary-900">{day.label}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.users)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.providers)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.listings)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.reviews)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.reports)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.views)}</td>
                    <td className="py-3 px-4 text-right text-secondary-600">{formatNumber(day.enquiries)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}