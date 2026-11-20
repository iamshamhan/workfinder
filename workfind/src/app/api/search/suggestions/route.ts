import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const query = searchParams.get('q') || ''
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 20)

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Get search suggestions from multiple sources
    const [listingsSuggestions, providersSuggestions, categoriesSuggestions] = await Promise.all([
      // Service listing titles
      supabase
        .from('service_listings')
        .select('title, category_id')
        .eq('status', 'published')
        .ilike('title', `%${query}%`)
        .limit(limit)
        .order('view_count', { ascending: false }),

      // Provider business names
      supabase
        .from('provider_profiles')
        .select('business_name, main_category_id')
        .eq('verification_status', 'verified')
        .ilike('business_name', `%${query}%`)
        .limit(limit)
        .order('rating', { ascending: false }),

      // Categories
      supabase
        .from('categories')
        .select('name, slug')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,slug.ilike.%${query}%`)
        .limit(5)
        .order('display_order', { ascending: true }),
    ])

    // Combine and deduplicate suggestions
    const suggestions = new Map<string, { type: string; label: string; value: string; category?: string }>()

    // Add listing suggestions
    listingsSuggestions.data?.forEach(item => {
      if (!suggestions.has(item.title.toLowerCase())) {
        suggestions.set(item.title.toLowerCase(), {
          type: 'listing',
          label: item.title,
          value: item.title,
        })
      }
    })

    // Add provider suggestions
    providersSuggestions.data?.forEach(item => {
      if (!suggestions.has(item.business_name.toLowerCase())) {
        suggestions.set(item.business_name.toLowerCase(), {
          type: 'provider',
          label: item.business_name,
          value: item.business_name,
        })
      }
    })

    // Add category suggestions
    categoriesSuggestions.data?.forEach(item => {
      if (!suggestions.has(item.name.toLowerCase())) {
        suggestions.set(item.name.toLowerCase(), {
          type: 'category',
          label: item.name,
          value: item.name,
          category: item.slug,
        })
      }
    })

    return NextResponse.json({
      suggestions: Array.from(suggestions.values()).slice(0, limit),
    })
  } catch (error) {
    console.error('Search suggestions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}