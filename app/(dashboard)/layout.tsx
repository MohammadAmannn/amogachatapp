'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { auth } = useAuthStore()
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated once the auth store has loaded from cookies
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    const hasAuthParams = typeof window !== 'undefined' && (
      window.location.search.includes('code=') ||
      window.location.search.includes('auth_action=')
    )
    if (hasAuthParams) return

    if (!auth.accessToken || !auth.user) {
      const currentPath = window.location.pathname + window.location.search
      router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
      return
    }

    if (auth.user.exp && auth.user.exp < Date.now()) {
      auth.reset()
      const currentPath = window.location.pathname + window.location.search
      router.replace(`/sign-in?redirect=${encodeURIComponent(currentPath)}`)
    }
  }, [auth, router, isHydrated])

  // While hydrating auth state, show nothing (no stacked page / spinner)
  if (!isHydrated || !auth.accessToken || !auth.user) {
    return null
  }

  return <AuthenticatedLayout>{children}</AuthenticatedLayout>
}
