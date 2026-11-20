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

    // Get provider profile ID and categories
    const { data: providerProfile } = await supabase
      .from('provider_profiles')
      .select('id, main_category_id')
      .eq('user_id', user.id)
      .single()

    if (!providerProfile) {
      return NextResponse.json({ jobs: [] })
    }

    // Get provider categories
    const { data: providerCategories } = await supabase
      .from('provider_categories')
      .select('category_id')
      .eq('provider_id', providerProfile.id)

    const categoryIds = [
      providerProfile.main_category_id,
      ...(providerCategories?.map(c => c.category_id) || [])
    ].filter(Boolean)

    // Fetch job requests matching provider's categories
    const { data: jobs, error } = await supabase
      .from('job_requests')
      .select(`
        *,
        category:categories!job_requests_category_id_fkey (id, name, slug),
        subcategory:subcategories!job_requests_subcategory_id_fkey (id, name, slug),
        customer:profiles!job_requests_customer_id_fkey (full_name, avatar_url)
      `)
      .in('category_id', categoryIds)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      throw error
    }

    return NextResponse.json({ jobs: jobs || [] })
  } catch (error) {
    console.error('Error fetching job requests:', error)
    return NextResponse.json({ error: 'Failed to fetch job requests' }, { status: 500 })
  }
}