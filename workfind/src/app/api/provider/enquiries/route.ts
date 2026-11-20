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
      return NextResponse.json({ enquiries: [] })
    }

    // Fetch enquiries with customer and listing details
    const { data: enquiries, error } = await supabase
      .from('enquiries')
      .select(`
        *,
        customer:profiles!enquiries_customer_id_fkey (
          id,
          full_name,
          avatar_url,
          phone,
          whatsapp,
          email
        ),
        listing:service_listings!enquiries_listing_id_fkey (
          id,
          title,
          main_image_url,
          pricing_type,
          price_amount,
          price_currency
        )
      `)
      .eq('provider_id', providerProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ enquiries: enquiries || [] })
  } catch (error) {
    console.error('Error fetching enquiries:', error)
    return NextResponse.json({ error: 'Failed to fetch enquiries' }, { status: 500 })
  }
}