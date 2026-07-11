'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LayoutProvider, useLayout } from '@/context/layout-provider'
import { SearchProvider } from '@/context/search-provider'
import { SkipToMain } from '@/components/skip-to-main'

type AuthenticatedLayoutProps = {
  children?: React.ReactNode
}

function AuthenticatedLayoutContent({ children }: AuthenticatedLayoutProps) {
  const { setShowInlineNotFound } = useLayout()
  const pathname = usePathname()

  useEffect(() => {
    setShowInlineNotFound(false)
  }, [pathname, setShowInlineNotFound])

  return (
    <>
      <SkipToMain />
      <div className="flex min-h-svh flex-1 flex-col h-svh w-full overflow-hidden">
        {children}
      </div>
    </>
  )
}

export function AuthenticatedLayout({ children }: AuthenticatedLayoutProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <SearchProvider>
      <LayoutProvider>
        <AuthenticatedLayoutContent>{children}</AuthenticatedLayoutContent>
      </LayoutProvider>
    </SearchProvider>
  )
}
