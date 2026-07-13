import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  const authAction = searchParams.get('auth_action')

  // Exclude public paths from middleware auth checks
  const isPublicPath =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/otp') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/auth/') ||
    pathname === '/_next/image' ||
    pathname.startsWith('/_next/static') ||
    pathname === '/favicon.ico' ||
    (pathname === '/' && authAction !== null)

  console.log(`[DEBUG server] Middleware checking path: ${pathname}. isPublicPath: ${isPublicPath}`)

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/sign-in'
    
    const fullPath = request.nextUrl.search
      ? `${pathname}${request.nextUrl.search}`
      : pathname

    url.searchParams.set('redirect', fullPath)
    
    console.log('[DEBUG server] Protected route accessed by unauthenticated user. Redirecting to:', url.toString())
    const redirectResponse = NextResponse.redirect(url)
    redirectResponse.headers.set('x-middleware-cache', 'no-cache')
    return redirectResponse
  }

  supabaseResponse.headers.set('x-middleware-cache', 'no-cache')
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

