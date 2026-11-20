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
      .select('id, rating, review_count, profile_views')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({
        stats: {
          total_listings: 0,
          active_enquiries: 0,
          unread_messages: 0,
          profile_views: 0,
          average_rating: 0,
          total_quotations: 0,
          pending_quotations: 0,
          completed_jobs: 0,
        }
      })
    }

    // Fetch all stats in parallel
    const [
      { count: totalListings },
      { count: activeEnquiries },
      { count: totalQuotations },
      { count: pendingQuotations },
      { count: completedJobs },
      { data: unreadMessages },
    ] = await Promise.all([
      supabase
        .from('service_listings')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerProfile.id),

      supabase
        .from('enquiries')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerProfile.id)
        .in('status', ['new', 'read']),

      supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerProfile.id),

      supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', providerProfile.id)
        .eq('status', 'pending'),

      supabase
        .from('job_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .in('id', supabase
          .from('quotations')
          .select('job_request_id')
          .eq('provider_id', providerProfile.id)
          .eq('status', 'accepted')
        ),

      supabase
        .from('messages')
        .select('id', { count: 'exact' })
        .eq('conversation_id', supabase
          .from('conversations')
          .select('id')
          .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
        )
        .neq('sender_id', user.id)
        .is('read_at', null),
    ])

    return NextResponse.json({
      stats: {
        total_listings: totalListings || 0,
        active_enquiries: activeEnquiries || 0,
        unread_messages: unreadMessages?.length || 0,
        profile_views: providerProfile.profile_views || 0,
        average_rating: providerProfile.rating || 0,
        total_quotations: totalQuotations || 0,
        pending_quotations: pendingQuotations || 0,
        completed_jobs: completedJobs || 0,
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}