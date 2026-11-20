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

    // Get conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        ),
        participant_2:profiles!conversations_participant_2_id_fkey (
          id,
          full_name,
          avatar_url,
          role
        ),
        listing:service_listings!conversations_listing_id_fkey (
          id,
          title,
          main_image_url
        ),
        job_request:job_requests!conversations_job_request_id_fkey (
          id,
          title
        ),
        last_message:messages!conversations_last_message_at_fkey (
          content,
          sender_id,
          created_at,
          message_type
        )
      `)
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) {
      throw error
    }

    // Transform conversations to include other participant and unread count
    const transformedConversations = await Promise.all(
      (conversations || []).map(async (conv) => {
        const otherParticipant = conv.participant_1_id === user.id
          ? conv.participant_2
          : conv.participant_1

        // Get unread count
        const { count: unread_count } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .neq('sender_id', user.id)
          .is('read_at', null)

        return {
          ...conv,
          other_participant: otherParticipant,
          unread_count: unread_count || 0,
        }
      })
    )

    return NextResponse.json({ conversations: transformedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}