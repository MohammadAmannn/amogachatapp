export function isBrowserOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

export function subscribeToNetworkChanges(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
