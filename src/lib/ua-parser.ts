export function parseBrowser(ua: string): string {
  if (!ua) return 'Unknown'
  const uaLower = ua.toLowerCase()
  if (uaLower.includes('edg/')) return 'Edge'
  if (uaLower.includes('opr/') || uaLower.includes('opera')) return 'Opera'
  if (uaLower.includes('chrome') && !uaLower.includes('chromium')) return 'Chrome'
  if (uaLower.includes('firefox')) return 'Firefox'
  if (uaLower.includes('safari') && !uaLower.includes('chrome')) return 'Safari'
  if (uaLower.includes('msie') || uaLower.includes('trident')) return 'IE'
  return 'Other'
}

export function parseOS(ua: string): string {
  if (!ua) return 'Unknown'
  const uaLower = ua.toLowerCase()
  if (uaLower.includes('windows')) return 'Windows'
  if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
    if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) return 'iOS'
    return 'macOS'
  }
  if (uaLower.includes('iphone') || uaLower.includes('ipad') || uaLower.includes('ipod')) return 'iOS'
  if (uaLower.includes('android')) return 'Android'
  if (uaLower.includes('linux')) return 'Linux'
  return 'Other'
}

export function parseDevice(ua: string, os: string): string {
  if (!ua) return 'desktop'
  const uaLower = ua.toLowerCase()
  if (uaLower.includes('ipad') || uaLower.includes('tablet') || (uaLower.includes('android') && !uaLower.includes('mobile'))) {
    return 'tablet'
  }
  if (
    uaLower.includes('mobile') ||
    uaLower.includes('iphone') ||
    uaLower.includes('ipod') ||
    uaLower.includes('windows phone') ||
    os === 'iOS' ||
    (uaLower.includes('android') && uaLower.includes('mobile'))
  ) {
    return 'mobile'
  }
  return 'desktop'
}

export function parseReferrer(referrerRaw: string): string {
  if (!referrerRaw) return 'direct'
  try {
    const url = new URL(referrerRaw)
    const host = url.hostname.toLowerCase()
    if (host.includes('t.co') || host.includes('twitter.com') || host.includes('x.com')) return 'Twitter'
    if (host.includes('facebook.com') || host.includes('fb.com')) return 'Facebook'
    if (host.includes('instagram.com')) return 'Instagram'
    if (host.includes('linkedin.com')) return 'LinkedIn'
    if (host.includes('github.com')) return 'GitHub'
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube'
    if (host.includes('google.com')) return 'Google'
    if (host.includes('bing.com')) return 'Bing'
    if (host.includes('reddit.com')) return 'Reddit'
    return host.replace('www.', '')
  } catch {
    return 'direct'
  }
}

export function cleanReferrerName(ref: string): string {
  if (!ref) return 'direct'
  const lower = ref.toLowerCase()
  if (lower === 'whatsapp' || lower === 'wa') return 'WhatsApp'
  if (lower === 'linkedin' || lower === 'li') return 'LinkedIn'
  if (lower === 'twitter' || lower === 'tw' || lower === 'x') return 'Twitter'
  if (lower === 'instagram' || lower === 'ig') return 'Instagram'
  if (lower === 'gmail' || lower === 'gm' || lower === 'email') return 'Gmail/Email'
  return ref.charAt(0).toUpperCase() + ref.slice(1)
}

