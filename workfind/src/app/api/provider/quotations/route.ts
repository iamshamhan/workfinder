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
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({ quotations: [] })
    }

    // Fetch quotations with job request details
    const { data: quotations, error } = await supabase
      .from('quotations')
      .select(`
        *,
        job_request:job_requests!quotations_job_request_id_fkey (
          id,
          title,
          description,
          category:categories!job_requests_category_id_fkey (id, name, slug),
          district,
          city,
          budget_min,
          budget_max,
          budget_currency,
          preferred_date,
          urgency,
          customer:profiles!job_requests_customer_id_fkey (full_name, avatar_url)
        )
      `)
      .eq('provider_id', providerProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ quotations: quotations || [] })
  } catch (error) {
    console.error('Error fetching quotations:', error)
    return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 })
  }
}

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
    const { job_request_id, amount, currency, description, estimated_duration, valid_until } = body

    if (!job_request_id || !amount || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify job request exists and is open
    const { data: jobRequest } = await supabase
      .from('job_requests')
      .select('id, status')
      .eq('id', job_request_id)
      .single()

    if (!jobRequest) {
      return NextResponse.json({ error: 'Job request not found' }, { status: 404 })
    }

    if (jobRequest.status !== 'open' && jobRequest.status !== 'receiving_offers') {
      return NextResponse.json({ error: 'Cannot send quotation for this job request' }, { status: 400 })
    }

    // Create quotation
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        job_request_id,
        provider_id: providerProfile.id,
        amount,
        currency: currency || 'LKR',
        description,
        estimated_duration: estimated_duration || null,
        valid_until: valid_until || null,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update job request status to receiving_offers
    await supabase
      .from('job_requests')
      .update({ status: 'receiving_offers', updated_at: new Date().toISOString() })
      .eq('id', job_request_id)

    // Create notification for customer
    const { data: jobWithCustomer } = await supabase
      .from('job_requests')
      .select('customer_id')
      .eq('id', job_request_id)
      .single()

    if (jobWithCustomer) {
      await supabase
        .from('notifications')
        .insert({
          user_id: jobWithCustomer.customer_id,
          type: 'new_quotation',
          title: 'New Quotation Received',
          message: `You received a new quotation for "${jobRequest.title}"`,
          reference_id: data.id,
          reference_type: 'quotation',
        })
    }

    return NextResponse.json({ quotation: data })
  } catch (error) {
    console.error('Error creating quotation:', error)
    return NextResponse.json({ error: 'Failed to create quotation' }, { status: 500 })
  }
}