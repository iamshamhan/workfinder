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

    // Fetch pending items from multiple tables
    const [
      { data: pendingListings },
      { data: pendingReviews },
      { data: openReports },
    ] = await Promise.all([
      supabase
        .from('service_listings')
        .select('id, title, status, created_at')
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: true })
        .limit(10),
      supabase
        .from('reviews')
        .select('id, title, status, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: true })
        .limit(10),
      supabase
        .from('reports')
        .select('id, reason, status, created_at')
        .in('status', ['pending', 'under_review'])
        .order('created_at', { ascending: true })
        .limit(10),
    ])

    const pendingItems = [
      ...(pendingListings || []).map(l => ({
        id: l.id,
        type: 'listing' as const,
        title: l.title,
        status: l.status,
        createdAt: l.created_at,
        actionUrl: `/dashboard/admin/listings/${l.id}`,
      })),
      ...(pendingReviews || []).map(r => ({
        id: r.id,
        type: 'review' as const,
        title: r.title || 'Untitled Review',
        status: r.status,
        createdAt: r.created_at,
        actionUrl: `/dashboard/admin/reviews/${r.id}`,
      })),
      ...(openReports || []).map(r => ({
        id: r.id,
        type: 'report' as const,
        title: `Report: ${r.reason.replace('_', ' ')}`,
        status: r.status,
        createdAt: r.created_at,
        actionUrl: `/dashboard/admin/reports/${r.id}`,
      })),
    ]

    // Sort by createdAt ascending (oldest first)
    const sortedItems = pendingItems
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(0, 15)

    return NextResponse.json(sortedItems)
  } catch (error) {
    console.error('Admin dashboard pending items error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}