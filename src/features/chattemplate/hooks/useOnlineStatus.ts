import { useState, useEffect } from 'react'
import { isBrowserOnline, subscribeToNetworkChanges } from '../utils/network'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(isBrowserOnline())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    const unsubscribe = subscribeToNetworkChanges(handleOnline, handleOffline)
    return () => unsubscribe()
  }, [])

  return isOnline
}
export default useOnlineStatus
