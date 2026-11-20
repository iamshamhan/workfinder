import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName, role } = await request.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (!['customer', 'provider'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be customer or provider' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
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

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: fullName,
        role,
        email,
        status: 'active',
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // If provider, create provider profile
    if (role === 'provider') {
      const { error: providerError } = await supabase
        .from('provider_profiles')
        .insert({
          user_id: authData.user.id,
          business_name: fullName,
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

      if (providerError) {
        console.error('Provider profile creation error:', providerError)
      }
    }

    return NextResponse.json({
      user: authData.user,
      session: authData.session,
      message: 'Registration successful. Please check your email to verify your account.',
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}