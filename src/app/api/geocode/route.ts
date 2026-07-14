import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const lat = searchParams.get('lat')
  const lon = searchParams.get('lon')

  if (!lat || !lon) {
    return NextResponse.json({ error: 'Latitude and Longitude are required' }, { status: 400 })
  }

  try {
    // Call Nominatim with a compliant User-Agent header from the server side
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'AmogaChatApp/1.0 (contact@amogachatapp.com)',
          'Accept-Language': 'en'
        },
        next: { revalidate: 3600 } // Cache response for 1 hour to optimize performance and prevent rate limit blocks
      }
    )

    if (!response.ok) {
      throw new Error(`Nominatim returned status ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Server-side geocoding failed:', error)
    return NextResponse.json({ error: error.message || 'Geocoding failed' }, { status: 500 })
  }
}
