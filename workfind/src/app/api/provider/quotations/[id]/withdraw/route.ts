import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params

    // Update quotation status to withdrawn
    const { data, error } = await supabase
      .from('quotations')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('provider_id', providerProfile.id)
      .eq('status', 'pending') // Can only withdraw pending quotations
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json({ error: 'Quotation not found or cannot be withdrawn' }, { status: 404 })
    }

    return NextResponse.json({ quotation: data })
  } catch (error) {
    console.error('Error withdrawing quotation:', error)
    return NextResponse.json({ error: 'Failed to withdraw quotation' }, { status: 500 })
  }
}