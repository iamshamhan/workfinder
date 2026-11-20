import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { conversation_id, content } = body

    if (!conversation_id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is part of this conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, participant_1_id, participant_2_id')
      .eq('id', conversation_id)
      .or(`participant_1_id.eq.${user.id},participant_2_id.eq.${user.id}`)
      .single()

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // Create message
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id,
        sender_id: user.id,
        content: content.trim(),
        message_type: 'text',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', conversation_id)

    // Create notification for other participant
    const otherParticipantId = conversation.participant_1_id === user.id
      ? conversation.participant_2_id
      : conversation.participant_1_id

    await supabase
      .from('notifications')
      .insert({
        user_id: otherParticipantId,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message`,
        reference_id: conversation_id,
        reference_type: 'conversation',
      })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}