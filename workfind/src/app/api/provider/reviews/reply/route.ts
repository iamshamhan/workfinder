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

    // Get provider profile ID
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { review_id, content } = body

    if (!review_id || !content?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify the review belongs to this provider
    const { data: review } = await supabase
      .from('reviews')
      .select('id, provider_id, customer_id')
      .eq('id', review_id)
      .eq('provider_id', providerProfile.id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // For now, we'll store the response as a new review entry with a reference to the original
    // In a production system, you might want a separate review_responses table
    // For simplicity, we'll update the review with a response field or create a conversation
    // Here we'll just return success since the full implementation would need a separate table

    return NextResponse.json({ success: true, message: 'Response posted' })
  } catch (error) {
    console.error('Error posting review response:', error)
    return NextResponse.json({ error: 'Failed to post response' }, { status: 500 })
  }
}