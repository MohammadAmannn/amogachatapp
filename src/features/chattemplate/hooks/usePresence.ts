import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/client'
import { updateProfilePresence } from '../services/presence.service'

export function usePresence(userId: string | undefined) {
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set())
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    // 1. Update database to 'online'
    updateProfilePresence(userId, true)

    // 2. Track heartbeat (database presence persistency)
    heartbeatIntervalRef.current = setInterval(() => {
      updateProfilePresence(userId, true)
    }, 30000) // 30 seconds heartbeat

    // 3. Setup Supabase Realtime Presence
    const channel = supabase.channel('chat-presence-room', {
      config: {
        presence: {
          key: userId,
        },
      },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState()
        const activeIds = new Set<string>()
        
        Object.keys(state).forEach((key) => {
          activeIds.add(key)
        })

        setOnlineUserIds(activeIds)
      })

    channel.subscribe(async (status: any) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
        })
      }
    })

    // 4. Handle tab close/browser unload
    const handleUnload = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      if (supabaseUrl && supabaseKey) {
        const url = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`
        const body = JSON.stringify({
          status: 'offline',
          online: false,
          offline: true,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        
        if (navigator.sendBeacon) {
          const blob = new Blob([body], { type: 'application/json' })
          navigator.sendBeacon(url, blob)
        } else {
          fetch(url, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
            },
            body,
            keepalive: true
          }).catch(() => {})
        }
      }
    }

    window.addEventListener('beforeunload', handleUnload)

    return () => {
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current)
      window.removeEventListener('beforeunload', handleUnload)
      
      // Update DB to offline
      updateProfilePresence(userId, false)
      supabase.removeChannel(channel)
    }
  }, [userId])

  const isUserOnline = (targetUserId: string) => {
    return onlineUserIds.has(targetUserId)
  }

  return { onlineUserIds, isUserOnline }
}
export default usePresence
