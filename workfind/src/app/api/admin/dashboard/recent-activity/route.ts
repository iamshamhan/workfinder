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

    // Fetch recent activity from multiple tables
    const [
      { data: newUsers },
      { data: newProviders },
      { data: newListings },
      { data: newReviews },
      { data: newReports },
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('role', 'customer')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('role', 'provider')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('service_listings')
        .select('id, title, provider_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('reviews')
        .select('id, title, customer_id, provider_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('reports')
        .select('id, reason, reporter_id, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    // Combine and format all activities
    const activities = [
      ...(newUsers || []).map(u => ({
        id: `user-${u.id}`,
        type: 'user_registered' as const,
        title: 'New Customer Registered',
        description: `${u.full_name || 'Unknown'} joined as a customer`,
        timestamp: u.created_at,
        userName: u.full_name || 'Unknown',
        userAvatar: u.avatar_url,
      })),
      ...(newProviders || []).map(p => ({
        id: `provider-${p.id}`,
        type: 'provider_registered' as const,
        title: 'New Provider Registered',
        description: `${p.full_name || 'Unknown'} joined as a provider`,
        timestamp: p.created_at,
        userName: p.full_name || 'Unknown',
        userAvatar: p.avatar_url,
      })),
      ...(newListings || []).map(l => ({
        id: `listing-${l.id}`,
        type: 'listing_created' as const,
        title: 'New Listing Created',
        description: `"${l.title}" was submitted for approval`,
        timestamp: l.created_at,
        userName: 'Provider',
      })),
      ...(newReviews || []).map(r => ({
        id: `review-${r.id}`,
        type: 'review_submitted' as const,
        title: 'New Review Submitted',
        description: r.title ? `"${r.title}"` : 'A new review was submitted',
        timestamp: r.created_at,
        userName: 'Customer',
      })),
      ...(newReports || []).map(r => ({
        id: `report-${r.id}`,
        type: 'report_filed' as const,
        title: 'New Report Filed',
        description: `Report reason: ${r.reason.replace('_', ' ')}`,
        timestamp: r.created_at,
        userName: 'User',
      })),
    ]

    // Sort by timestamp descending and take top 20
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20)

    return NextResponse.json(sortedActivities)
  } catch (error) {
    console.error('Admin dashboard recent activity error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}