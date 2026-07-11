/**
 * Centralized service to manage authentication redirections.
 */

export function getFullRedirectUrl(pathname: string, searchParamsString?: string): string {
  if (!searchParamsString) {
    return pathname
  }
  const cleanSearch = searchParamsString.startsWith('?') 
    ? searchParamsString 
    : `?${searchParamsString}`
  return `${pathname}${cleanSearch}`
}

export function handleAuthRedirect(router: any, redirectTo?: string | null) {
  console.log('[DEBUG client] handleAuthRedirect received redirectTo:', redirectTo)
  if (!redirectTo) {
    console.log("[DEBUG client] handleAuthRedirect: no redirect target provided, replacing route to '/'")
    router.replace('/')
    return
  }

  // Normalize absolute/relative redirect
  let targetPath = redirectTo
  try {
    if (redirectTo.startsWith('http://') || redirectTo.startsWith('https://')) {
      const url = new URL(redirectTo)
      targetPath = `${url.pathname}${url.search}${url.hash}` || '/'
      console.log('[DEBUG client] handleAuthRedirect parsed absolute URL to relative:', targetPath)
    }
  } catch {
    // Treat as relative path
  }

  // Ensure leading slash if not absolute path
  if (!targetPath.startsWith('/') && !targetPath.startsWith('http://') && !targetPath.startsWith('https://')) {
    targetPath = `/${targetPath}`
  }

  console.log('[DEBUG client] handleAuthRedirect calling router.replace with targetPath:', targetPath)
  router.replace(targetPath)
}
