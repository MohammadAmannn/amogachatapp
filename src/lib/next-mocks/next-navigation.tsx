import React from 'react'

export function useRouter() {
  return {
    push: (url: string) => {},
    back: () => {},
    replace: (url: string) => {},
    prefetch: () => {},
  }
}

export function useSearchParams() {
  return {
    get: (key: string) => null,
  }
}

export function usePathname() {
  return '/'
}

export function notFound() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-background rounded-xl border border-dashed border-border">
      <h2 className="text-xl font-bold text-destructive">404 - Not Found</h2>
      <p className="text-sm text-muted-foreground mt-1">The requested item could not be found.</p>
    </div>
  )
}
