'use client'

import { useState, useEffect, useRef } from 'react'
import { AxiosError } from 'axios'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/context/theme-provider'
import { ColorThemeProvider } from '@/context/color-theme-provider'
import { FontProvider } from '@/context/font-provider'
import { DirectionProvider } from '@/context/direction-provider'
import { NavigationProgress } from '@/components/navigation-progress'
import { useAuthStore } from '@/stores/auth-store'
import { handleServerError } from '@/lib/handle-server-error'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/client'
import { ensureProfileExists } from '@/features/chattemplate/services/profile.service'
import { handleAuthRedirect } from '@/services/auth-redirect.service'

function QueryProviderWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: (failureCount, error) => {
              if (process.env.NODE_ENV === 'development') console.log({ failureCount, error })
              if (failureCount >= 0 && process.env.NODE_ENV === 'development') return false
              if (failureCount > 3 && process.env.NODE_ENV === 'production') return false
              return !(
                error instanceof AxiosError &&
                [401, 403].includes(error.response?.status ?? 0)
              )
            },
            refetchOnWindowFocus: process.env.NODE_ENV === 'production',
            staleTime: 60 * 1000, // 60s - reduces refetch churn during navigation
          },
          mutations: {
            onError: (error) => {
              handleServerError(error)
              if (error instanceof AxiosError) {
                if (error.response?.status === 304) {
                  toast.error('Content not modified!')
                }
              }
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            if (error instanceof AxiosError) {
              if (error.response?.status === 401) {
                toast.error('Session expired!')
                useAuthStore.getState().auth.reset()
                router.push('/sign-in')
              }
              if (error.response?.status === 500) {
                toast.error('Internal Server Error!')
                if (process.env.NODE_ENV === 'production') {
                  router.push('/500-error')
                }
              }
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools buttonPosition='bottom-left' />
      )}
    </QueryClientProvider>
  )
}

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { auth } = useAuthStore()
  const oauthRedirectHandled = useRef(false)

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      console.log(`[DEBUG client] onAuthStateChange event: ${event}. Session user ID: ${session?.user?.id || 'none'}`)
      if (session) {
        const user = session.user

        const searchParams = new URLSearchParams(window.location.search)
        const authAction = searchParams.get('auth_action')
        console.log('[DEBUG client] onAuthStateChange searchParams:', window.location.search)
        console.log('[DEBUG client] Determined authAction:', authAction)

        if (authAction === 'signin') {
          console.log('[DEBUG client] authAction is signin. Querying profiles for user id:', user.id)
          // Query profiles table to check if user exists in our records
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', user.id)
            .maybeSingle()

          if (!profile) {
            console.warn('[DEBUG client] Profile not found in database. Signing out...')
            await supabase.auth.signOut()
            auth.reset()
            toast.error('Account not found in our records. Please sign up first.')
            router.replace('/sign-up')
            return
          }
          console.log('[DEBUG client] Profile found successfully.')
        }

        const targetRedirect = searchParams.get('redirect')
        console.log('[DEBUG client] Determined targetRedirect from search params:', targetRedirect)

        if (!auth.user || auth.user.accountNo !== user.id) {
          console.log('[DEBUG client] Setting user object in store and syncing profile...')
          const userObj = {
            accountNo: user.id,
            email: user.email!,
            name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split('@')[0],
            picture: user.user_metadata?.avatar_url || undefined,
            role: ['user'],
            exp: Date.now() + 24 * 60 * 60 * 1000,
          }
          auth.setUser(userObj)
          auth.setAccessToken(session.access_token)
          
          // Sync profile to database
          ensureProfileExists(userObj).catch(err => {
            console.error('Failed to sync profile on auth state change:', err)
          })
        }

        if (authAction === 'signin') {
          console.log('[DEBUG client] authAction is signin. oauthRedirectHandled.current:', oauthRedirectHandled.current)
          // Prevent double-fire: onAuthStateChange can fire for both
          // INITIAL_SESSION and SIGNED_IN events on the same page load
          if (oauthRedirectHandled.current) {
            console.log('[DEBUG client] oauthRedirectHandled.current is true, ignoring extra fire.')
            return
          }
          oauthRedirectHandled.current = true

          // Primary: URL redirect param (always set by middleware now).
          // Fallback: sessionStorage saved before OAuth started.
          let destination = targetRedirect
          if (!destination || destination === '/') {
            const fallback = typeof window !== 'undefined' ? sessionStorage.getItem('post_login_redirect') : null
            console.log('[DEBUG client] targetRedirect was empty or root. sessionStorage fallback:', fallback)
            destination = fallback || '/'
          }
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('post_login_redirect')
          }
          console.log('[DEBUG client] Performing handleAuthRedirect to destination:', destination)
          handleAuthRedirect(router, destination)
          return
        } else {
          // Reset flag for future logins
          console.log('[DEBUG client] authAction is not signin, resetting oauthRedirectHandled flag.')
          oauthRedirectHandled.current = false
        }
      } else {
        if (auth.user) {
          auth.reset()
        }
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [auth, router])

  useEffect(() => {
    const handleChunkError = (event: ErrorEvent | PromiseRejectionEvent) => {
      let errorMessage = ''
      if ('message' in event) {
        errorMessage = event.message
      } else if (event.reason && typeof event.reason === 'object' && 'message' in event.reason) {
        errorMessage = (event.reason as { message: string }).message
      }

      if (
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Loading chunk') ||
        /Loading chunk [\d]+ failed/.test(errorMessage)
      ) {
        console.warn('ChunkLoadError detected, reloading page...', errorMessage)

        // Safeguard to prevent infinite reload loop:
        const lastReload = sessionStorage.getItem('chunk_load_last_reload')
        const now = Date.now()

        // If we reloaded less than 10 seconds ago, don't reload again to avoid loop
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('chunk_load_last_reload', now.toString())
          window.location.reload()
        }
      }
    }

    window.addEventListener('error', handleChunkError as EventListener, true)
    window.addEventListener('unhandledrejection', handleChunkError as EventListener, true)

    return () => {
      window.removeEventListener('error', handleChunkError as EventListener, true)
      window.removeEventListener('unhandledrejection', handleChunkError as EventListener, true)
    }
  }, [])

  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? ''}>
      <QueryProviderWrapper>
        <ThemeProvider>
          <ColorThemeProvider>
            <FontProvider>
              <DirectionProvider>
                <NavigationProgress />
                {children}
                <Toaster duration={5000} />
              </DirectionProvider>
            </FontProvider>
          </ColorThemeProvider>
        </ThemeProvider>
      </QueryProviderWrapper>
    </GoogleOAuthProvider>
  )
}
