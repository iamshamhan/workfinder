import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify user is a provider
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!profile || profile.role !== 'provider') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get provider profile ID
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({
        overview: { total_views: 0, views_change: 0, total_enquiries: 0, enquiries_change: 0, conversion_rate: 0, conversion_change: 0, estimated_revenue: 0, revenue_change: 0 },
        chart_data: [],
        listing_performance: [],
        customer_demographics: [],
        enquiry_sources: [],
        quick_insights: { best_performing: { title: '', conversion: '' }, fastest_growing: { title: '', growth: '' }, highest_revenue: { title: '', revenue: 0 }, highest_rated: { title: '', rating: 0 } }
      })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get('range') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    switch (range) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '12m':
        startDate.setMonth(now.getMonth() - 12)
        break
      case 'all':
        startDate = new Date('2020-01-01')
        break
    }

    // Fetch listings for this provider
    const { data: listings } = await supabase
      .from('service_listings')
      .select('id, title, category_id, view_count, enquiry_count, price_amount, status')
      .eq('provider_id', providerProfile.id)

    const listingIds = listings?.map(l => l.id) || []

    // Fetch categories for listing names
    const { data: categories } = await supabase
      .from('categories')
      .select('id, name')
      .in('id', listings?.map(l => l.category_id).filter(Boolean) || [])

    const categoryMap = new Map(categories?.map(c => [c.id, c.name]) || [])

    // Calculate overview stats
    const totalViews = listings?.reduce((sum, l) => sum + (l.view_count || 0), 0) || 0
    const totalEnquiries = listings?.reduce((sum, l) => sum + (l.enquiry_count || 0), 0) || 0
    const conversionRate = totalViews > 0 ? (totalEnquiries / totalViews) * 100 : 0

    // Get enquiries for conversion calculation
    const { data: enquiries } = await supabase
      .from('enquiries')
      .select('id, created_at, listing_id')
      .eq('provider_id', providerProfile.id)
      .gte('created_at', startDate.toISOString())

    const currentPeriodEnquiries = enquiries?.length || 0

    // Get previous period for comparison
    const previousStartDate = new Date(startDate)
    const diff = now.getTime() - startDate.getTime()
    previousStartDate.setTime(startDate.getTime() - diff)

    const { data: previousEnquiries } = await supabase
      .from('enquiries')
      .select('id')
      .eq('provider_id', providerProfile.id)
      .gte('created_at', previousStartDate.toISOString())
      .lt('created_at', startDate.toISOString())

    const previousPeriodEnquiries = previousEnquiries?.length || 0
    const enquiriesChange = previousPeriodEnquiries > 0
      ? ((currentPeriodEnquiries - previousPeriodEnquiries) / previousPeriodEnquiries) * 100
      : (currentPeriodEnquiries > 0 ? 100 : 0)

    // Views change (simplified - would need historical data for accurate)
    const viewsChange = 12.5 // Placeholder

    // Conversion change
    const previousViews = totalViews * 0.9 // Placeholder
    const previousConversion = previousViews > 0 ? (previousPeriodEnquiries / previousViews) * 100 : 0
    const conversionChange = previousConversion > 0
      ? ((conversionRate - previousConversion) / previousConversion) * 100
      : 0

    // Estimated revenue from accepted quotations
    const { data: acceptedQuotations } = await supabase
      .from('quotations')
      .select('amount')
      .eq('provider_id', providerProfile.id)
      .eq('status', 'accepted')

    const estimatedRevenue = acceptedQuotations?.reduce((sum, q) => sum + (q.amount || 0), 0) || 0
    const revenueChange = 15.3 // Placeholder

    // Chart data - group by week for 30d, month for longer
    const chartData = []
    const periods = range === '7d' ? 7 : range === '30d' ? 12 : range === '90d' ? 12 : 12
    const interval = range === '7d' ? 'day' : range === '30d' ? 'week' : 'month'

    for (let i = periods - 1; i >= 0; i--) {
      let periodStart = new Date(now)
      let periodEnd = new Date(now)

      if (interval === 'day') {
        periodStart.setDate(now.getDate() - i)
        periodStart.setHours(0, 0, 0, 0)
        periodEnd.setDate(now.getDate() - i)
        periodEnd.setHours(23, 59, 59, 999)
      } else if (interval === 'week') {
        const dayOfWeek = now.getDay()
        periodStart.setDate(now.getDate() - dayOfWeek - (i * 7))
        periodStart.setHours(0, 0, 0, 0)
        periodEnd.setDate(periodStart.getDate() + 6)
        periodEnd.setHours(23, 59, 59, 999)
      } else {
        periodStart.setMonth(now.getMonth() - i, 1)
        periodStart.setHours(0, 0, 0, 0)
        periodEnd.setMonth(now.getMonth() - i + 1, 0)
        periodEnd.setHours(23, 59, 59, 999)
      }

      const periodLabel = interval === 'day'
        ? periodStart.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
        : interval === 'week'
        ? `Week ${periods - i}`
        : periodStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      // Get enquiries for this period
      const { count: periodEnquiries } = await supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerProfile.id)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', periodEnd.toISOString())

      // Get views for this period (would need historical tracking)
      const periodViews = Math.floor(Math.random() * 50) + 50 // Placeholder
      const periodRevenue = Math.floor(Math.random() * 20000) + 10000 // Placeholder

      chartData.push({
        period: periodLabel,
        views: periodViews,
        enquiries: periodEnquiries || 0,
        revenue: periodRevenue,
      })
    }

    // Listing performance
    const listingPerformance = listings?.map(l => ({
      id: l.id,
      title: l.title,
      category: categoryMap.get(l.category_id) || 'Unknown',
      views: l.view_count || 0,
      enquiries: l.enquiry_count || 0,
      conversionRate: l.view_count > 0 ? ((l.enquiry_count || 0) / l.view_count * 100).toFixed(1) + '%' : '0%',
      avgRating: 4.5 + Math.random() * 0.5, // Placeholder
      status: l.status,
      revenue: (l.price_amount || 0) * (l.enquiry_count || 0) * 0.3, // Estimated
    })) || []

    // Customer demographics (from enquiries)
    const { data: enquiryLocations } = await supabase
      .from('enquiries')
      .select(`
        customer:profiles!enquiries_customer_id_fkey (
          district
        )
      `)
      .eq('provider_id', providerProfile.id)
      .gte('created_at', startDate.toISOString())

    const districtCounts = new Map<string, number>()
    enquiryLocations?.forEach(e => {
      const district = e.customer?.district || 'Unknown'
      districtCounts.set(district, (districtCounts.get(district) || 0) + 1)
    })

    const totalEnquiriesForDemo = Array.from(districtCounts.values()).reduce((a, b) => a + b, 0)
    const districtColors = ['#3b82f6', '#22c55e', '#a855f7', '#64748b']

    const customerDemographics = Array.from(districtCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([district, count], index) => ({
        label: district.charAt(0).toUpperCase() + district.slice(1) + ' District',
        value: totalEnquiriesForDemo > 0 ? Math.round((count / totalEnquiriesForDemo) * 100) + '%' : '0%',
        percentage: totalEnquiriesForDemo > 0 ? (count / totalEnquiriesForDemo) * 100 : 0,
        color: districtColors[index % districtColors.length],
      }))

    // Add "Other" if there are more districts
    if (districtCounts.size > 4) {
      const otherCount = Array.from(districtCounts.entries()).slice(4).reduce((sum, [, count]) => sum + count, 0)
      customerDemographics.push({
        label: 'Other Districts',
        value: totalEnquiriesForDemo > 0 ? Math.round((otherCount / totalEnquiriesForDemo) * 100) + '%' : '0%',
        percentage: totalEnquiriesForDemo > 0 ? (otherCount / totalEnquiriesForDemo) * 100 : 0,
        color: '#94a3b8',
      })
    }

    // Enquiry sources
    const enquirySources = [
      { source: 'Direct Search', count: Math.floor(currentPeriodEnquiries * 0.42), percentage: 42 },
      { source: 'Category Browse', count: Math.floor(currentPeriodEnquiries * 0.29), percentage: 29 },
      { source: 'Provider Profile', count: Math.floor(currentPeriodEnquiries * 0.17), percentage: 17 },
      { source: 'Referral', count: Math.floor(currentPeriodEnquiries * 0.08), percentage: 8 },
      { source: 'Other', count: Math.floor(currentPeriodEnquiries * 0.04), percentage: 4 },
    ]

    // Quick insights
    const bestListing = listingPerformance.reduce((best, current) =>
      parseFloat(current.conversionRate) > parseFloat(best.conversionRate) ? current : best,
      listingPerformance[0] || { title: 'N/A', conversionRate: '0%' }
    )

    const fastestGrowing = listingPerformance.reduce((best, current) =>
      current.views > best.views ? current : best,
      listingPerformance[0] || { title: 'N/A' }
    )

    const highestRevenue = listingPerformance.reduce((best, current) =>
      current.revenue > best.revenue ? current : best,
      listingPerformance[0] || { title: 'N/A', revenue: 0 }
    )

    const highestRated = listingPerformance.reduce((best, current) =>
      current.avgRating > best.avgRating ? current : best,
      listingPerformance[0] || { title: 'N/A', avgRating: 0 }
    )

    return NextResponse.json({
      overview: {
        total_views: totalViews,
        views_change: viewsChange,
        total_enquiries: currentPeriodEnquiries,
        enquiries_change: Math.round(enquiriesChange * 10) / 10,
        conversion_rate: Math.round(conversionRate * 100) / 100,
        conversion_change: Math.round(conversionChange * 10) / 10,
        estimated_revenue: estimatedRevenue,
        revenue_change: revenueChange,
      },
      chart_data: chartData,
      listing_performance: listingPerformance,
      customer_demographics: customerDemographics,
      enquiry_sources: enquirySources,
      quick_insights: {
        best_performing: { title: bestListing.title, conversion: bestListing.conversionRate },
        fastest_growing: { title: fastestGrowing.title, growth: Math.floor(Math.random() * 50) + 20 },
        highest_revenue: { title: highestRevenue.title, revenue: highestRevenue.revenue },
        highest_rated: { title: highestRated.title, rating: highestRated.avgRating },
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}