'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AppLogo } from './app-logo'

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop)
    }

    // Add scroll listener to the body
    document.addEventListener('scroll', onScroll, { passive: true })

    // Clean up the event listener on unmount
    return () => document.removeEventListener('scroll', onScroll)
  }, [])

  return (
    // Page header container: fixed mode me top par sticky behavior deta hai.
    <header
      className={cn(
        'z-50 h-16 shrink-0',
        fixed &&
          'header-fixed peer/header sticky top-0 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80',
        offset > 10 && fixed ? 'shadow-sm' : 'shadow-none',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          // Header ke andar left-to-right UI controls/content align karne ke liye row layout.
          'relative flex h-full min-w-0 flex-nowrap items-center gap-1.5 overflow-hidden px-2 py-2 sm:gap-3 sm:px-4 md:gap-4',
          offset > 10 &&
            fixed &&
            'after:absolute after:inset-0 after:-z-10 after:bg-background/20 after:backdrop-blur-lg'
        )}
      >
        {/* Mobile par app logo; desktop par sidebar trigger sidebar header me hai */}
        <AppLogo className='shrink-0 md:hidden' />
        {children}
      </div>
    </header>
  )
}
