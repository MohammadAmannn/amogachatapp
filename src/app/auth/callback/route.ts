// app/auth/callback/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('🔍 [Auth Callback] Received request:')
  console.log('  - Code present:', !!code)
  console.log('  - Next param:', next)
  console.log('  - All params:', Object.fromEntries(searchParams))
  console.log('  - Origin:', origin)

  // If there's an error param from OAuth
  const error = searchParams.get('error')
  if (error) {
    console.error('❌ [Auth Callback] OAuth error:', error)
    const errorDesc = searchParams.get('error_description') || 'Unknown error'
    const errorUrl = new URL('/sign-in', origin)
    errorUrl.searchParams.set('error', error)
    errorUrl.searchParams.set('error_description', errorDesc)
    return NextResponse.redirect(errorUrl)
  }

  if (code) {
    try {
      console.log('✅ [Auth Callback] Exchanging code for session...')
      const supabase = await createClient()
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error('❌ [Auth Callback] Exchange error:', exchangeError)
        throw exchangeError
      }
      
      console.log('✅ [Auth Callback] Session exchange successful!')
      console.log('  - User:', data.user?.email)
      console.log('  - User ID:', data.user?.id)  // ✅ Log the user ID
      console.log('  - Session:', data.session ? 'present' : 'null')
      
      // ✅ The user data will be set in the client-side useEffect
      // We don't need to set it here since the client will handle it
      
      // Redirect to the next parameter
      const redirectUrl = new URL(next, origin)
      
      // ✅ Add a query param to trigger client-side auth refresh
      redirectUrl.searchParams.set('auth', 'success')
      
      console.log('  - Redirecting to:', redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
      
    } catch (err: any) {
      console.error('❌ [Auth Callback] Exception:', err)
      const errorUrl = new URL('/sign-in', origin)
      errorUrl.searchParams.set('error', 'AuthExchangeError')
      errorUrl.searchParams.set('error_description', err.message || 'Unknown error')
      return NextResponse.redirect(errorUrl)
    }
  }

  console.warn('⚠️ [Auth Callback] No code parameter found!')
  const errorUrl = new URL('/sign-in', origin)
  errorUrl.searchParams.set('error', 'MissingCode')
  errorUrl.searchParams.set('error_description', 'No authorization code provided')
  return NextResponse.redirect(errorUrl)
}