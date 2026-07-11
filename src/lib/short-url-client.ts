const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateShortId(length = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
  }
  return result
}

export function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str)
  const bin = Array.from(bytes, (b) => String.fromCharCode(b)).join('')
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function buildSelfContainedShortUrl(
  origin: string,
  configHash: string,
  durationHours: number
): { shortUrl: string; expiresAt: string } {
  const expiresAtMs = Date.now() + durationHours * 60 * 60 * 1000
  const targetUrl = `${origin}/l?c=${configHash}&exp=${expiresAtMs}`
  const id = generateShortId()
  const encoded = toBase64Url(targetUrl)
  return {
    shortUrl: `${origin}/go/${id}?r=${encoded}`,
    expiresAt: new Date(expiresAtMs).toISOString(),
  }
}
