// components/chat/location-picker.tsx
import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { MapPin, Navigation, Clock, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Helper for reverse geocoding via our server API endpoint
async function getFriendlyAddress(lat: number, lng: number): Promise<string> {
    try {
        const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`)
        if (!res.ok) return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        const data = await res.json()
        if (data && data.address) {
            const addr = data.address
            const parts = []
            if (addr.amenity) parts.push(addr.amenity)
            else if (addr.building) parts.push(addr.building)
            else if (addr.shop) parts.push(addr.shop)
            else if (addr.road) parts.push(addr.road)
            
            if (addr.suburb) parts.push(addr.suburb)
            else if (addr.neighbourhood) parts.push(addr.neighbourhood)
            
            if (addr.city) parts.push(addr.city)
            else if (addr.town) parts.push(addr.town)
            else if (addr.village) parts.push(addr.village)
            
            if (parts.length > 0) {
                return parts.join(', ')
            }
        }
        return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    } catch (error) {
        console.error('Reverse geocoding failed:', error)
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
    }
}

interface LocationPickerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSendLocation: (type: 'current' | 'live', data: any) => void
    isLiveEnabled?: boolean
}

export function LocationPicker({ 
    open, 
    onOpenChange, 
    onSendLocation, 
    isLiveEnabled = true 
}: LocationPickerProps) {
    const [locationType, setLocationType] = useState<'current' | 'live'>('current')
    const [isLoading, setIsLoading] = useState(false)
    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null)
    const [liveDuration, setLiveDuration] = useState(15) // minutes
    const [error, setError] = useState<string | null>(null)
    const watchIdRef = useRef<number | null>(null)
    const lastGeocodeTimeRef = useRef<number>(0)
    const [isTracking, setIsTracking] = useState(false)

    // Get current location
    const getCurrentLocation = () => {
        setIsLoading(true)
        setError(null)

        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser')
            setIsLoading(false)
            return
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                setLocation({ lat, lng })
                setIsLoading(false)
                toast.success('Location acquired!')

                try {
                    const friendlyName = await getFriendlyAddress(lat, lng)
                    setLocation({ lat, lng, address: friendlyName })
                } catch (e) {
                    console.error(e)
                }
            },
            (err) => {
                setError(`Unable to get location: ${err.message}`)
                setIsLoading(false)
                toast.error('Failed to get location')
            },
            { 
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            }
        )
    }

    // Start live tracking
    const startLiveTracking = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported')
            return
        }

        setIsTracking(true)
        setIsLoading(true)
        setError(null)

        watchIdRef.current = navigator.geolocation.watchPosition(
            async (position) => {
                const lat = position.coords.latitude
                const lng = position.coords.longitude
                
                // Immediately update coordinates
                setLocation(prev => ({
                    lat,
                    lng,
                    address: prev?.address
                }))
                setIsLoading(false)

                // Throttle Nominatim geocoding requests to once every 5 seconds to avoid HTTP 429 Rate Limit Blocks
                const now = Date.now()
                if (now - lastGeocodeTimeRef.current > 5000) {
                    lastGeocodeTimeRef.current = now
                    try {
                        const friendlyName = await getFriendlyAddress(lat, lng)
                        setLocation({ lat, lng, address: friendlyName })
                    } catch (e) {
                        console.error(e)
                    }
                }
            },
            (err) => {
                setError(`Tracking error: ${err.message}`)
                setIsLoading(false)
                toast.error('Live tracking failed')
            },
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        )

        // Auto-stop after duration
        setTimeout(() => {
            stopLiveTracking()
        }, liveDuration * 60 * 1000)
    }

    const stopLiveTracking = () => {
        if (watchIdRef.current) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setIsTracking(false)
        toast.info('Live tracking stopped')
    }

    const handleSend = () => {
        if (!location) {
            toast.error('No location available')
            return
        }

        if (locationType === 'live' && isTracking) {
            // Send initial live location with tracking data
            onSendLocation('live', {
                ...location,
                isActive: true,
                expiresAt: Date.now() + liveDuration * 60 * 1000,
                duration: liveDuration
            })
        } else {
            // Send static current location
            onSendLocation('current', {
                ...location,
                timestamp: Date.now()
            })
        }

        // Clean up
        if (locationType === 'live') {
            stopLiveTracking()
        }
        onOpenChange(false)
    }

    const handleCancel = () => {
        if (isTracking) {
            stopLiveTracking()
        }
        onOpenChange(false)
    }

    // Sync tracking mode to locationType selection
    useEffect(() => {
        if (locationType === 'live') {
            if (!isTracking) {
                startLiveTracking()
            }
        } else {
            if (isTracking) {
                stopLiveTracking()
            }
        }
    }, [locationType, isTracking])

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current)
            }
        }
    }, [])

    return (
        <Dialog open={open} onOpenChange={handleCancel}>
            <DialogContent className="sm:max-w-md rounded-2xl" showCloseButton={false}>
                <DialogHeader>
                    <div className="flex items-center gap-2 text-left">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-8.5 w-8.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                            title="Close"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <DialogTitle className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-emerald-600" />
                            Share Location
                        </DialogTitle>
                    </div>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Location Type Selection */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground">
                            Location Type
                        </label>
                        <ToggleGroup 
                            type="single" 
                            value={locationType} 
                            onValueChange={(value) => value && setLocationType(value as 'current' | 'live')}
                            className="justify-start gap-2"
                        >
                            <ToggleGroupItem 
                                value="current" 
                                className="flex-1 gap-2 data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
                            >
                                <Navigation className="h-4 w-4" />
                                Current
                            </ToggleGroupItem>
                            <ToggleGroupItem 
                                value="live" 
                                className="flex-1 gap-2 data-[state=on]:bg-emerald-600 data-[state=on]:text-white"
                                disabled={!isLiveEnabled}
                            >
                                <Clock className="h-4 w-4" />
                                Live
                            </ToggleGroupItem>
                        </ToggleGroup>
                    </div>

                    {/* Live Duration Selector (only when live is selected) */}
                    {locationType === 'live' && (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-muted-foreground">
                                Share for
                            </label>
                            <div className="flex gap-2 flex-wrap">
                                {[5, 15, 30, 60].map((mins) => (
                                    <Button
                                        key={mins}
                                        variant={liveDuration === mins ? 'default' : 'outline'}
                                        size="sm"
                                        className={cn(
                                            "rounded-xl text-xs font-bold",
                                            liveDuration === mins && "bg-emerald-600 hover:bg-emerald-700"
                                        )}
                                        onClick={() => setLiveDuration(mins)}
                                    >
                                        {mins}m
                                    </Button>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted-foreground">
                                Live location will auto-expire after {liveDuration} minutes
                            </p>
                        </div>
                    )}

                    {/* Location Preview/Status */}
                    <div className="bg-muted/20 rounded-xl p-4 min-h-[80px] flex flex-col items-center justify-center">
                        {isLoading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                                <span className="text-xs text-muted-foreground">
                                    {locationType === 'live' ? 'Starting live tracking...' : 'Getting location...'}
                                </span>
                            </div>
                        ) : error ? (
                            <div className="text-center">
                                <span className="text-xs text-red-500">{error}</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={getCurrentLocation}
                                    className="mt-2 rounded-xl text-xs"
                                >
                                    Retry
                                </Button>
                            </div>
                        ) : location ? (
                            <div className="text-center px-4 max-w-full">
                                <MapPin className="h-8 w-8 text-emerald-600 mx-auto mb-1" />
                                <span className="text-xs font-bold text-foreground block truncate" title={location.address}>
                                    {location.address || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`}
                                </span>
                                {isTracking && (
                                    <div className="flex items-center justify-center gap-1 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] text-emerald-600 font-bold">
                                            Live tracking active
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Button 
                                onClick={getCurrentLocation}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                            >
                                Get Location
                            </Button>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="outline"
                            onClick={handleCancel}
                            className="rounded-xl font-bold text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={!location || isLoading || (locationType === 'live' && !isTracking)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs"
                        >
                            {locationType === 'live' ? 'Share Live' : 'Share Location'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}