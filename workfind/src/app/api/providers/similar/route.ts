import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const categorySlug = searchParams.get('category')
    const excludeId = searchParams.get('exclude')
    const limit = Math.min(parseInt(searchParams.get('limit') || '4'), 10)

    if (!categorySlug) {
      return NextResponse.json({ providers: [] })
    }

    // Get category ID from slug
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category) {
      return NextResponse.json({ providers: [] })
    }

    // Fetch similar verified providers in the same category
    let query = supabase
      .from('provider_profiles')
      .select(`
        id,
        business_name,
        business_logo_url,
        cover_image_url,
        short_intro,
        years_experience,
        rating,
        review_count,
        verification_status,
        verified_at,
        district,
        city,
        languages,
        service_delivery_types
      `)
      .eq('main_category_id', category.id)
      .eq('verification_status', 'verified')
      .order('rating', { ascending: false })
      .limit(limit + 1) // Fetch one extra in case we need to exclude

    if (excludeId) {
      query = query.neq('id', excludeId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Similar providers error:', error)
      return NextResponse.json({ providers: [] })
    }

    // Filter out excluded provider and limit results
    const providers = (data || [])
      .filter(p => p.id !== excludeId)
      .slice(0, limit)
      .map(p => ({
        id: p.id,
        businessName: p.business_name,
        businessLogoUrl: p.business_logo_url,
        coverImageUrl: p.cover_image_url,
        shortIntro: p.short_intro,
        yearsExperience: p.years_experience,
        rating: p.rating,
        reviewCount: p.review_count,
        verificationStatus: p.verification_status,
        verifiedAt: p.verified_at,
        district: p.district,
        city: p.city,
        languages: p.languages,
        serviceDeliveryTypes: p.service_delivery_types,
      }))

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Similar providers API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}