import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, icon, image_url, parent_id, display_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) {
      console.error('Categories API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      )
    }

    // Also fetch subcategories
    const { data: subcategories, error: subError } = await supabase
      .from('subcategories')
      .select('id, category_id, name, slug, description, display_order, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (subError) {
      console.error('Subcategories API error:', subError)
    }

    return NextResponse.json({
      categories: data || [],
      subcategories: subcategories || [],
    })
  } catch (error) {
    console.error('Categories API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}