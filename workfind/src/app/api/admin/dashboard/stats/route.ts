import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get current user and check admin role
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

    // Get all stats in parallel
    const [
      { count: totalUsers },
      { count: totalProviders },
      { count: totalCustomers },
      { count: totalListings },
      { count: pendingListings },
      { count: totalReviews },
      { count: pendingReviews },
      { count: openReports },
      { count: usersLastMonth },
      { count: providersLastMonth },
      { count: listingsLastMonth },
      { count: reportsLastMonth },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
      supabase.from('service_listings').select('*', { count: 'exact', head: true }),
      supabase.from('service_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending_approval'),
      supabase.from('reviews').select('*', { count: 'exact', head: true }),
      supabase.from('reviews').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('reports').select('*', { count: 'exact', head: true }).in('status', ['pending', 'under_review']),
      // Last month comparisons
      supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'provider').gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('service_listings').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      supabase.from('reports').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
    ])

    // Calculate percentage changes (simplified)
    const usersChange = totalUsers && usersLastMonth ? Math.round((usersLastMonth / (totalUsers - usersLastMonth)) * 100) : 0
    const providersChange = totalProviders && providersLastMonth ? Math.round((providersLastMonth / (totalProviders - providersLastMonth)) * 100) : 0
    const listingsChange = totalListings && listingsLastMonth ? Math.round((listingsLastMonth / (totalListings - listingsLastMonth)) * 100) : 0
    const reportsChange = openReports && reportsLastMonth ? Math.round((reportsLastMonth / (openReports - reportsLastMonth)) * 100) : 0

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalProviders: totalProviders || 0,
      totalCustomers: totalCustomers || 0,
      totalListings: totalListings || 0,
      pendingListings: pendingListings || 0,
      totalReviews: totalReviews || 0,
      pendingReviews: pendingReviews || 0,
      openReports: openReports || 0,
      usersChange,
      providersChange,
      listingsChange,
      reportsChange,
    })
  } catch (error) {
    console.error('Admin dashboard stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}