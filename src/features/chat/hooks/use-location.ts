// hooks/use-location.ts
import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

interface LocationState {
    latitude: number | null
    longitude: number | null
    accuracy: number | null
    error: string | null
    isLoading: boolean
    isTracking: boolean
}

export function useLocation() {
    const [state, setState] = useState<LocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        isLoading: false,
        isTracking: false
    })

    const watchIdRef = useRef<number | null>(null)

    const getCurrentLocation = useCallback((options?: PositionOptions) => {
        return new Promise<{ lat: number; lng: number; accuracy: number }>((resolve, reject) => {
            setState(prev => ({ ...prev, isLoading: true, error: null }))

            if (!navigator.geolocation) {
                const error = 'Geolocation not supported'
                setState(prev => ({ ...prev, error, isLoading: false }))
                reject(error)
                return
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const data = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    }
                    setState(prev => ({
                        ...prev,
                        latitude: data.lat,
                        longitude: data.lng,
                        accuracy: data.accuracy,
                        isLoading: false,
                        error: null
                    }))
                    resolve(data)
                },
                (err) => {
                    setState(prev => ({ 
                        ...prev, 
                        error: err.message, 
                        isLoading: false 
                    }))
                    reject(err.message)
                },
                { 
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000,
                    ...options 
                }
            )
        })
    }, [state])

    const startLiveTracking = useCallback((callback: (data: { lat: number; lng: number; accuracy: number }) => void) => {
        if (!navigator.geolocation) {
            toast.error('Geolocation not supported')
            return
        }

        setState(prev => ({ ...prev, isTracking: true, isLoading: true }))

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                const data = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }
                setState(prev => ({
                    ...prev,
                    latitude: data.lat,
                    longitude: data.lng,
                    accuracy: data.accuracy,
                    isLoading: false,
                    error: null
                }))
                callback(data)
            },
            (err) => {
                setState(prev => ({ 
                    ...prev, 
                    error: err.message, 
                    isLoading: false,
                    isTracking: false 
                }))
                toast.error('Live tracking error: ' + err.message)
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )
    }, [])

    const stopLiveTracking = useCallback(() => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setState(prev => ({ ...prev, isTracking: false }))
    }, [])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return {
        ...state,
        getCurrentLocation,
        startLiveTracking,
        stopLiveTracking,
        isSupported: !!navigator.geolocation
    }
}