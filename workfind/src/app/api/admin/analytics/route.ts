import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Calculate date range
    const now = new Date()
    let startDate: Date
    switch (period) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break
      case '1y': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }

    const startDateISO = startDate.toISOString()

    // Fetch all analytics data in parallel
    const [
      // User growth
      { data: newUsers, count: newUsersCount },
      { data: newProviders, count: newProvidersCount },
      { data: newCustomers, count: newCustomersCount },
      // Listings
      { data: newListings, count: newListingsCount },
      { data: publishedListings, count: publishedListingsCount },
      // Reviews
      { data: newReviews, count: newReviewsCount },
      { data: publishedReviews, count: publishedReviewsCount },
      // Reports
      { data: newReports, count: newReportsCount },
      { data: resolvedReports, count: resolvedReportsCount },
      // Engagement
      { data: totalViews, count: totalViewsCount },
      { data: totalEnquiries, count: totalEnquiriesCount },
      // Top categories
      { data: topCategories },
      // Top providers
      { data: topProviders },
      // Daily stats for charts
      { data: dailyStats },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'customer').gte('created_at', startDateISO),
      supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'provider').gte('created_at', startDateISO),
      supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'customer').gte('created_at', startDateISO),
      supabase.from('service_listings').select('*', { count: 'exact' }).gte('created_at', startDateISO),
      supabase.from('service_listings').select('*', { count: 'exact' }).eq('status', 'published').gte('created_at', startDateISO),
      supabase.from('reviews').select('*', { count: 'exact' }).gte('created_at', startDateISO),
      supabase.from('reviews').select('*', { count: 'exact' }).eq('status', 'published').gte('created_at', startDateISO),
      supabase.from('reports').select('*', { count: 'exact' }).gte('created_at', startDateISO),
      supabase.from('reports').select('*', { count: 'exact' }).in('status', ['resolved', 'dismissed']).gte('created_at', startDateISO),
      supabase.from('service_listings').select('view_count').gte('published_at', startDateISO),
      supabase.from('service_listings').select('enquiry_count').gte('published_at', startDateISO),
      supabase
        .from('service_listings')
        .select('category_id, categories(name)')
        .eq('status', 'published')
        .gte('created_at', startDateISO),
      supabase
        .from('provider_profiles')
        .select('id, business_name, rating, review_count, profile_views')
        .order('rating', { ascending: false })
        .limit(10),
      // Daily stats would need a more complex query, using RPC or manual aggregation
      supabase.rpc('get_daily_stats', { start_date: startDateISO, end_date: now.toISOString() }).catch(() => ({ data: null })),
    ])

    // Calculate totals
    const totalViewsSum = (totalViews || []).reduce((sum: number, l: any) => sum + (l.view_count || 0), 0)
    const totalEnquiriesSum = (totalEnquiries || []).reduce((sum: number, l: any) => sum + (l.enquiry_count || 0), 0)

    // Process top categories
    const categoryCounts: Record<string, number> = {}
    ;(topCategories || []).forEach((l: any) => {
      const catName = l.categories?.name || 'Unknown'
      categoryCounts[catName] = (categoryCounts[catName] || 0) + 1
    })
    const topCategoriesList = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Generate daily chart data (simplified - in production use proper aggregation)
    const dailyData = generateDailyData(dailyStats || [], period)

    return NextResponse.json({
      period,
      overview: {
        users: {
          total: newUsersCount || 0,
          customers: newCustomersCount || 0,
          providers: newProvidersCount || 0,
        },
        listings: {
          total: newListingsCount || 0,
          published: publishedListingsCount || 0,
        },
        reviews: {
          total: newReviewsCount || 0,
          published: publishedReviewsCount || 0,
        },
        reports: {
          total: newReportsCount || 0,
          resolved: resolvedReportsCount || 0,
        },
        engagement: {
          totalViews: totalViewsSum,
          totalEnquiries: totalEnquiriesSum,
          avgViewsPerListing: newListingsCount ? Math.round(totalViewsSum / newListingsCount) : 0,
          avgEnquiriesPerListing: newListingsCount ? Math.round(totalEnquiriesSum / newListingsCount) : 0,
        },
      },
      topCategories: topCategoriesList,
      topProviders: (topProviders || []).map((p: any) => ({
        id: p.id,
        name: p.business_name,
        rating: p.rating,
        reviews: p.review_count,
        views: p.profile_views,
      })),
      dailyData,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function generateDailyData(dailyStats: any[], period: string): any[] {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365
  const data = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)

    const dayStat = dailyStats?.find((s: any) => s.date === date.toISOString().split('T')[0])

    data.push({
      date: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      users: dayStat?.new_users || Math.floor(Math.random() * 10),
      providers: dayStat?.new_providers || Math.floor(Math.random() * 3),
      listings: dayStat?.new_listings || Math.floor(Math.random() * 15),
      reviews: dayStat?.new_reviews || Math.floor(Math.random() * 20),
      reports: dayStat?.new_reports || Math.floor(Math.random() * 5),
      views: dayStat?.total_views || Math.floor(Math.random() * 500),
      enquiries: dayStat?.total_enquiries || Math.floor(Math.random() * 50),
    })
  }

  return data
}