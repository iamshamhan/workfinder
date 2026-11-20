import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
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
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = [
    '/',
    '/browse',
    '/categories',
    '/search',
    '/providers',
    '/services',
    '/about',
    '/contact',
    '/help',
    '/faq',
    '/terms',
    '/privacy',
    '/login',
    '/register',
    '/forgot-password',
    '/how-it-works',
    '/locations',
    '/become-provider',
    '/success-stories',
    '/pricing',
    '/resources',
    '/safety',
    '/report',
    '/support',
    '/careers',
    '/press',
    '/blog',
    '/guidelines',
    '/cookies',
    '/accessibility',
    '/sitemap',
    '/auth/callback',
    '/auth/forgot-password',
    '/auth/update-password',
  ]

  // Check if path is public
  const isPublicPath = publicPaths.some((path) =>
    pathname === path || pathname.startsWith(path + '/')
  )

  // Auth routes
  const isAuthRoute = pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/auth/callback') ||
    pathname.startsWith('/auth/update-password')

  // Protected routes
  const isCustomerDashboard = pathname.startsWith('/dashboard/customer')
  const isProviderDashboard = pathname.startsWith('/dashboard/provider')
  const isAdminDashboard = pathname.startsWith('/dashboard/admin')

  // Redirect unauthenticated users from protected routes
  if (!user && (isCustomerDashboard || isProviderDashboard || isAdminDashboard)) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users from auth routes (except callback)
  if (user && isAuthRoute && !pathname.startsWith('/auth/callback')) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/'
    return NextResponse.redirect(new URL(redirect, request.url))
  }

  // Role-based access control for dashboards
  if (user) {
    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const userRole = profile?.role || 'customer'

    // Prevent customers from accessing provider dashboard
    if (isProviderDashboard && userRole === 'customer') {
      return NextResponse.redirect(new URL('/dashboard/customer', request.url))
    }

    // Prevent non-admins from accessing admin dashboard
    if (isAdminDashboard && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard/customer', request.url))
    }
  }

  return supabaseResponse
}