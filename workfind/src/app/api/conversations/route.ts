import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Verify the user is authenticated and matches the requested user_id
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch conversations where user is a participant
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey (
          id, user_id, full_name, avatar_url, role, business_name, business_logo_url,
          verification_status, district, city, phone, whatsapp, email
        ),
        participant_2:profiles!conversations_participant_2_id_fkey (
          id, user_id, full_name, avatar_url, role, business_name, business_logo_url,
          verification_status, district, city, phone, whatsapp, email
        ),
        last_message:messages!conversations_last_message_at_fkey (
          id, conversation_id, sender_id, content, message_type, read_at, created_at
        )
      `)
      .or(`participant_1_id.eq.${userId},participant_2_id.eq.${userId}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error

    // Fetch unread counts for each conversation
    const conversationIds = conversations?.map(c => c.id) || []
    let unreadCounts: Record<string, number> = {}

    if (conversationIds.length > 0) {
      const { data: unreadData } = await supabase
        .from('messages')
        .select('conversation_id', { count: 'exact' })
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .is('read_at', null)

      // Get individual counts per conversation
      const { data: unreadByConv } = await supabase
        .from('messages')
        .select('conversation_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', userId)
        .is('read_at', null)

      if (unreadByConv) {
        unreadByConv.forEach(msg => {
          unreadCounts[msg.conversation_id] = (unreadCounts[msg.conversation_id] || 0) + 1
        })
      }
    }

    // Format conversations with the other participant's details and unread count
    const formattedConversations = conversations?.map(conv => {
      const participant = conv.participant_1.user_id === userId ? conv.participant_2 : conv.participant_1
      return {
        ...conv,
        participant,
        unread_count: unreadCounts[conv.id] || 0,
      }
    }) || []

    return NextResponse.json({ conversations: formattedConversations })
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch conversations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { participant_id, listing_id, job_request_id } = body

    if (!participant_id) {
      return NextResponse.json({ error: 'Participant ID is required' }, { status: 400 })
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1_id.eq.${user.id},participant_2_id.eq.${participant_id}),` +
        `and(participant_1_id.eq.${participant_id},participant_2_id.eq.${user.id})`
      )
      .eq('listing_id', listing_id || '')
      .eq('job_request_id', job_request_id || '')
      .single()

    if (existingConv) {
      return NextResponse.json({ conversation: existingConv })
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: user.id,
        participant_2_id: participant_id,
        listing_id: listing_id || null,
        job_request_id: job_request_id || null,
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Create notification for the other participant
    await supabase.from('notifications').insert({
      user_id: participant_id,
      type: 'new_message',
      title: 'New Conversation',
      message: 'You have a new conversation',
      reference_id: conversation.id,
      reference_type: 'conversation',
    })

    return NextResponse.json({ conversation })
  } catch (error) {
    console.error('Error creating conversation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create conversation' },
      { status: 500 }
    )
  }
}