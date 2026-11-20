import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    // Parse query parameters
    const query = searchParams.get('q') || undefined
    const category = searchParams.get('category') || undefined
    const subcategory = searchParams.get('subcategory') || undefined
    const district = searchParams.get('district') || undefined
    const city = searchParams.get('city') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined
    const verifiedOnly = searchParams.get('verified') === 'true'
    const pricingTypes = searchParams.get('pricingType')?.split(',').filter(Boolean)
    const deliveryTypes = searchParams.get('deliveryType')?.split(',').filter(Boolean)
    const sortBy = (searchParams.get('sort') as 'relevant' | 'rating' | 'reviews' | 'newest' | 'price_low' | 'price_high') || 'relevant'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '12'), 50)

    // Call the database RPC function for search
    const { data, error } = await supabase.rpc('search_service_listings', {
      search_query: query,
      category_slug: category,
      subcategory_slug: subcategory,
      district_param: district,
      city_param: city,
      min_price: minPrice,
      max_price: maxPrice,
      min_rating: minRating,
      verified_only: verifiedOnly,
      pricing_types: pricingTypes && pricingTypes.length > 0 ? pricingTypes : null,
      service_delivery_types: deliveryTypes && deliveryTypes.length > 0 ? deliveryTypes : null,
      sort_by: sortBy,
      page_num: page,
      limit_num: limit
    })

    if (error) {
      console.error('Search RPC error:', error)
      // Fallback to direct query if RPC fails
      return await fallbackSearch(supabase, {
        query, category, subcategory, district, city, minPrice, maxPrice,
        minRating, verifiedOnly, pricingTypes, deliveryTypes, sortBy, page, limit
      })
    }

    // Transform the results
    const listings = data?.map((item: any) => ({
      id: item.id,
      providerId: item.provider_id,
      title: item.title,
      slug: item.slug,
      description: item.description,
      categoryId: item.category_id,
      subcategoryId: item.subcategory_id,
      mainImageUrl: item.main_image_url,
      pricingType: item.pricing_type,
      priceAmount: item.price_amount,
      priceCurrency: item.price_currency,
      locationType: item.location_type,
      district: item.district,
      city: item.city,
      serviceCoverage: item.service_coverage,
      experienceRequired: item.experience_required,
      tags: item.tags,
      status: item.status,
      publishedAt: item.published_at,
      viewCount: item.view_count,
      enquiryCount: item.enquiry_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || []

    const totalCount = data?.[0]?.total_count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        query,
        category,
        subcategory,
        district,
        city,
        minPrice,
        maxPrice,
        minRating,
        verifiedOnly,
        pricingTypes,
        deliveryTypes,
        sortBy,
      }
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Fallback search using direct queries when RPC fails
async function fallbackSearch(supabase: any, params: any) {
  try {
    let query = supabase
      .from('service_listings')
      .select(`
        *,
        provider:provider_profiles!provider_id (
          id,
          business_name,
          business_logo_url,
          rating,
          review_count,
          verification_status,
          district,
          city
        ),
        category:categories!category_id (id, name, slug)
      `, { count: 'exact' })
      .eq('status', 'published')

    // Apply filters
    if (params.category) {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.category)
        .single()
      if (cat) query = query.eq('category_id', cat.id)
    }

    if (params.subcategory) {
      const { data: sub } = await supabase
        .from('subcategories')
        .select('id')
        .eq('slug', params.subcategory)
        .single()
      if (sub) query = query.eq('subcategory_id', sub.id)
    }

    if (params.district) query = query.eq('district', params.district)
    if (params.city) query = query.ilike('city', params.city)

    if (params.minPrice !== undefined) query = query.gte('price_amount', params.minPrice)
    if (params.maxPrice !== undefined) query = query.lte('price_amount', params.maxPrice)

    if (params.verifiedOnly) {
      query = query.eq('provider.verification_status', 'verified')
    }

    if (params.pricingTypes?.length) {
      query = query.in('pricing_type', params.pricingTypes)
    }

    if (params.deliveryTypes?.length) {
      query = query.in('location_type', params.deliveryTypes)
    }

    // Full-text search
    if (params.query) {
      query = query.textSearch('fts', params.query, {
        type: 'websearch',
        config: 'english',
      })
    }

    // Sorting
    switch (params.sortBy) {
      case 'rating':
        query = query.order('provider.rating', { ascending: false, nullsLast: true })
        break
      case 'reviews':
        query = query.order('provider.review_count', { ascending: false, nullsLast: true })
        break
      case 'newest':
        query = query.order('published_at', { ascending: false, nullsLast: true })
        break
      case 'price_low':
        query = query.order('price_amount', { ascending: true, nullsLast: true })
        break
      case 'price_high':
        query = query.order('price_amount', { ascending: false, nullsLast: true })
        break
      default:
        query = query.order('view_count', { ascending: false })
    }

    const page = params.page || 1
    const limit = params.limit || 12
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    const listings = data?.map((item: any) => ({
      id: item.id,
      providerId: item.provider_id,
      providerName: item.provider?.business_name,
      providerLogoUrl: item.provider?.business_logo_url,
      providerRating: item.provider?.rating,
      providerReviewCount: item.provider?.review_count,
      providerVerified: item.provider?.verification_status === 'verified',
      title: item.title,
      slug: item.slug,
      description: item.description,
      categoryId: item.category_id,
      subcategoryId: item.subcategory_id,
      mainImageUrl: item.main_image_url,
      pricingType: item.pricing_type,
      priceAmount: item.price_amount,
      priceCurrency: item.price_currency,
      locationType: item.location_type,
      district: item.district,
      city: item.city,
      serviceCoverage: item.service_coverage,
      experienceRequired: item.experience_required,
      tags: item.tags,
      status: item.status,
      publishedAt: item.published_at,
      viewCount: item.view_count,
      enquiryCount: item.enquiry_count,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    })) || []

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasMore: page < totalPages,
      },
      filters: {
        query: params.query,
        category: params.category,
        subcategory: params.subcategory,
        district: params.district,
        city: params.city,
        minPrice: params.minPrice,
        maxPrice: params.maxPrice,
        minRating: params.minRating,
        verifiedOnly: params.verifiedOnly,
        pricingTypes: params.pricingTypes,
        deliveryTypes: params.deliveryTypes,
        sortBy: params.sortBy,
      }
    })
  } catch (error) {
    console.error('Fallback search error:', error)
    return NextResponse.json(
      { listings: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasMore: false }, filters: {} },
      { status: 500 }
    )
  }
}