'use client'

import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface LeafletMapProps {
  latitude: number
  longitude: number
  type: 'current' | 'live'
  address?: string
}

export default function LeafletMap({ latitude, longitude, type, address }: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current) return

    // Fix Leaflet default marker icon path resolution in next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15)
    mapRef.current = map

    // Invalidate map size after a short delay to ensure correct tiles load after layout stabilizes
    const sizeTimer = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize()
      }
    }, 250)

    // OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const markerColor = type === 'live' ? '#10b981' : '#3b82f6'

    // HTML-based premium custom marker
    const customIcon = L.divIcon({
      className: 'custom-leaflet-marker',
      html: `
        <div style="
          position: relative;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          ${type === 'live' ? `
            <div style="
              position: absolute;
              width: 100%;
              height: 100%;
              border-radius: 50%;
              background-color: ${markerColor};
              opacity: 0.4;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
          ` : ''}
          <div style="
            width: 16px;
            height: 16px;
            background-color: ${markerColor};
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            z-index: 10;
          "></div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    })

    const marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map)
    markerRef.current = marker

    // Bind description popup
    marker.bindPopup(`
      <div style="font-family: inherit; font-size: 12px; padding: 2px; text-align: center;">
        <b style="color: ${markerColor}">${type === 'live' ? 'Live Location' : 'Current Location'}</b><br/>
        <span style="font-size: 11px; color: #4b5563; display: block; margin-top: 4px; max-width: 180px; word-break: break-word;">
          ${address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`}
        </span>
      </div>
    `).openPopup()

    // Keyframe animations for live ping
    const styleEl = document.createElement('style')
    styleEl.innerHTML = `
      @keyframes ping {
        0% { transform: scale(0.5); opacity: 0.8; }
        70%, 100% { transform: scale(2); opacity: 0; }
      }
    `
    document.head.appendChild(styleEl)

    return () => {
      clearTimeout(sizeTimer)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl)
      }
    }
  }, [latitude, longitude, type, address])

  // React to coordinates updates (important for live location tracking)
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      markerRef.current.setLatLng([latitude, longitude])
      mapRef.current.panTo([latitude, longitude])
    }
  }, [latitude, longitude])

  return (
    <div className="w-full h-full relative z-0">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}
