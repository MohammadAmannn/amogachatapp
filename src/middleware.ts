import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
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

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data?.user || null
    console.log('[DEBUG server] Middleware resolved user ID:', user?.id || 'none')
  } catch (err) {
    console.error('[DEBUG server] Error calling getUser in middleware:', err)
  }

  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams
  const authAction = searchParams.get('auth_action')

  // Exclude public paths from middleware auth checks
  const isPublicPath =
    pathname.startsWith('/sign-in') ||
    pathname.startsWith('/sign-in-2') ||
    pathname.startsWith('/sign-up') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/otp') ||
    pathname.startsWith('/go/') ||
    pathname.startsWith('/l/') ||
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
