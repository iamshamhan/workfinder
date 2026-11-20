import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PUT(request: NextRequest) {
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
    const {
      business_name,
      short_intro,
      description,
      main_category_id,
      years_experience,
      languages,
      availability,
      service_delivery_types,
      district,
      city,
      service_coverage,
    } = body

    // Get provider profile ID
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({ error: 'Provider profile not found' }, { status: 404 })
    }

    // Update provider profile
    const { data, error } = await supabase
      .from('provider_profiles')
      .update({
        business_name,
        short_intro,
        description,
        main_category_id,
        years_experience: years_experience ? parseInt(years_experience) : null,
        languages,
        availability,
        service_delivery_types,
        district,
        city,
        service_coverage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', providerProfile.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error('Error updating provider profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}