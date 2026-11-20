import { updateSession } from '@/lib/supabase/middleware'
import { adminMiddleware } from '@/lib/auth/admin-middleware'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // First run the admin middleware for admin route protection
  const adminResponse = await adminMiddleware(request)

  // If admin middleware redirected, return that response
  if (adminResponse.headers.get('location') !== request.nextUrl.pathname) {
    // Check if it's a redirect response
    if (adminResponse.status === 307 || adminResponse.status === 308) {
      return adminResponse
    }
  }

  // Then run the regular session update
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}