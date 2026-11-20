import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const searchParams = request.nextUrl.searchParams

    const categorySlug = searchParams.get('category')

    if (!categorySlug) {
      return NextResponse.json({ count: 0 })
    }

    // Get category ID from slug
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single()

    if (!category) {
      return NextResponse.json({ count: 0 })
    }

    // Count published listings in this category
    const { count, error } = await supabase
      .from('service_listings')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', category.id)
      .eq('status', 'published')

    if (error) {
      console.error('Listings count error:', error)
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error('Listings count API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}