import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const adminId = searchParams.get('admin_id')
    const action = searchParams.get('action')
    const targetType = searchParams.get('target_type')
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')
    const sortBy = searchParams.get('sortBy') || 'created_at'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    let query = supabase
      .from('admin_audit_logs')
      .select(`
        *,
        profiles!admin_audit_logs_admin_id_fkey(full_name, email)
      `, { count: 'exact' })

    if (adminId) query = query.eq('admin_id', adminId)
    if (action) query = query.ilike('action', `%${action}%`)
    if (targetType) query = query.eq('target_type', targetType)
    if (startDate) query = query.gte('created_at', startDate)
    if (endDate) query = query.lte('created_at', endDate)

    query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    query = query.range((page - 1) * limit, page * limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Admin audit logs fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { action, target_type, target_id, details } = body

    if (!action || !target_type || !target_id) {
      return NextResponse.json({ error: 'Action, target_type, and target_id are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_audit_logs')
      .insert({
        admin_id: user.id,
        action,
        target_type,
        target_id,
        details: details || {},
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Admin audit log create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}