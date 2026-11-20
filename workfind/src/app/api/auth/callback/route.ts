import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { code, next } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    const response = NextResponse.next({
      request: { headers: request.headers },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Check if user profile exists, create if not
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('user_id', data.user.id)
        .single()

      if (!profile) {
        // Create profile from auth metadata
        const userRole = data.user.user_metadata?.role || 'customer'
        await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
            role: userRole,
            email: data.user.email,
            status: 'active',
          })

        // Create provider profile if needed
        if (userRole === 'provider') {
          await supabase
            .from('provider_profiles')
            .insert({
              user_id: data.user.id,
              business_name: data.user.user_metadata?.full_name || 'My Business',
              verification_status: 'unverified',
              rating: 0,
              review_count: 0,
              profile_views: 0,
              languages: ['English'],
              availability: {
                monday: { is_available: true, start_time: '09:00', end_time: '17:00' },
                tuesday: { is_available: true, start_time: '09:00', end_time: '17:00' },
                wednesday: { is_available: true, start_time: '09:00', end_time: '17:00' },
                thursday: { is_available: true, start_time: '09:00', end_time: '17:00' },
                friday: { is_available: true, start_time: '09:00', end_time: '17:00' },
                saturday: { is_available: true, start_time: '09:00', end_time: '13:00' },
                sunday: { is_available: false, start_time: null, end_time: null },
              },
              service_delivery_types: ['customer_location'],
            })
        }
      }
    }

    return NextResponse.json({
      user: data.user,
      session: data.session,
      message: 'Email verified successfully',
      email: data.user?.email,
    })
  } catch (err) {
    console.error('Callback error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}