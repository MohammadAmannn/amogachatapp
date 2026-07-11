'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'

interface QrCodeDisplayProps {
  value: string
  size?: number
  className?: string
}

export function QrCodeDisplay({ value, size = 140, className }: QrCodeDisplayProps) {
  if (!value) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/40 rounded text-xs text-muted-foreground ${className ?? ''}`}
        style={{ width: size, height: size }}
      >
        No URL
      </div>
    )
  }

  return (
    <div className={className} style={{ width: size, height: size }}>
      <QRCode
        value={value}
        size={size}
        level={value.length > 800 ? 'L' : 'M'}
        bgColor="#ffffff"
        fgColor="#000000"
        style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
      />
    </div>
  )
}

export async function downloadQrCode(value: string, filename: string, size = 400) {
  if (!value) return

  try {
    const wrapper = document.createElement('div')
    wrapper.style.position = 'absolute'
    wrapper.style.left = '-9999px'
    document.body.appendChild(wrapper)

    const { createRoot } = await import('react-dom/client')
    const root = createRoot(wrapper)
    root.render(
      React.createElement(QRCode, {
        value,
        size,
        level: 'M',
        bgColor: '#ffffff',
        fgColor: '#000000',
      })
    )

    await new Promise((r) => setTimeout(r, 100))

    const svgEl = wrapper.querySelector('svg')
    if (!svgEl) throw new Error('QR render failed')

    const svgData = new XMLSerializer().serializeToString(svgEl)
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Canvas unavailable')

    const img = new Image()
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, size, size)
        ctx.drawImage(img, 0, 0, size, size)
        URL.revokeObjectURL(url)
        resolve()
      }
      img.onerror = reject
      img.src = url
    })

    root.unmount()
    document.body.removeChild(wrapper)

    canvas.toBlob((pngBlob) => {
      if (!pngBlob) return
      const blobUrl = window.URL.createObjectURL(pngBlob)
      const a = document.createElement('a')
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(blobUrl)
      toast.success('QR Code downloaded successfully!')
    }, 'image/png')
  } catch {
    toast.error('Failed to download QR code.')
  }
}
