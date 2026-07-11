import { promises as fs } from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

export interface ShortUrlEntry {
  id: string
  targetUrl: string
  createdAt: string
  expiresAt: string
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

const URLS_FILE = path.join(process.cwd(), 'src/features/link-builder/data/urls.json')
const ID_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

type GlobalStore = typeof globalThis & { __shortUrlStore?: Map<string, ShortUrlEntry> }

function getMemoryStore(): Map<string, ShortUrlEntry> {
  const g = globalThis as GlobalStore
  if (!g.__shortUrlStore) {
    g.__shortUrlStore = new Map()
  }
  return g.__shortUrlStore
}

export function generateShortId(length = 6): string {
  let result = ''
  for (let i = 0; i < length; i++) {
    result += ID_CHARS.charAt(Math.floor(Math.random() * ID_CHARS.length))
  }
  return result
}

function isKvConfigured(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN)
}

async function kvGet(key: string): Promise<ShortUrlEntry | null> {
  if (!isKvConfigured()) return null
  try {
    const res = await fetch(process.env.KV_REST_API_URL!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['GET', key]),
      cache: 'no-store',
    })
    if (!res.ok) return null
    const data = await res.json()
    if (!data.result) return null
    return JSON.parse(data.result as string) as ShortUrlEntry
  } catch {
    return null
  }
}

async function kvSet(key: string, entry: ShortUrlEntry, ttlSeconds: number): Promise<boolean> {
  if (!isKvConfigured()) return false
  try {
    const res = await fetch(process.env.KV_REST_API_URL!, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(['SET', key, JSON.stringify(entry), 'EX', ttlSeconds]),
      cache: 'no-store',
    })
    return res.ok
  } catch {
    return false
  }
}

async function readFileStore(): Promise<ShortUrlEntry[]> {
  try {
    const raw = await fs.readFile(URLS_FILE, 'utf-8')
    return JSON.parse(raw) as ShortUrlEntry[]
  } catch {
    return []
  }
}

async function writeFileStore(entries: ShortUrlEntry[]): Promise<boolean> {
  try {
    await fs.writeFile(URLS_FILE, JSON.stringify(entries, null, 2), 'utf-8')
    return true
  } catch {
    return false
  }
}

export async function saveShortUrl(
  targetUrl: string,
  expiresAtMs: number
): Promise<{ id: string; entry: ShortUrlEntry; shortUrlSuffix: string }> {
  const id = generateShortId()
  const entry: ShortUrlEntry = {
    id,
    targetUrl,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
  }

  const memory = getMemoryStore()
  memory.set(id, entry)

  const ttlSeconds = Math.max(60, Math.ceil((expiresAtMs - Date.now()) / 1000))
  const kvSaved = await kvSet(`short:${id}`, entry, ttlSeconds)

  const existing = await readFileStore()
  existing.push(entry)
  const fileSaved = await writeFileStore(existing)

  let supabaseSaved = false
  if (supabase) {
    try {
      const { error } = await supabase
        .from('short_urls')
        .insert({
          id,
          target_url: targetUrl,
          expires_at: new Date(expiresAtMs).toISOString()
        })
      if (error) {
        console.error('Supabase saveShortUrl error:', error)
      } else {
        supabaseSaved = true
        console.log('Supabase saveShortUrl success:', id)
      }
    } catch (e) {
      console.error('Supabase saveShortUrl exception:', e)
    }
  }

  // When no persistent store is available (typical on Vercel without KV or Supabase),
  // embed the redirect target so the link survives cold starts.
  const needsFallback = !kvSaved && !fileSaved && !supabaseSaved
  const shortUrlSuffix = needsFallback
    ? `${id}?r=${Buffer.from(targetUrl).toString('base64url')}`
    : id

  return { id, entry, shortUrlSuffix }
}

let fileStoreLoaded = false

async function ensureFileStoreLoaded(): Promise<void> {
  if (fileStoreLoaded) return
  fileStoreLoaded = true
  const entries = await readFileStore()
  const memory = getMemoryStore()
  for (const entry of entries) {
    memory.set(entry.id, entry)
  }
}

export async function getShortUrl(id: string): Promise<ShortUrlEntry | null> {
  await ensureFileStoreLoaded()

  const memory = getMemoryStore()
  const cached = memory.get(id)
  if (cached) return cached

  // Check Supabase first as it is our primary persistent store on production
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('short_urls')
        .select('*')
        .eq('id', id)
        .single()
      
      if (!error && data) {
        const entry: ShortUrlEntry = {
          id: data.id,
          targetUrl: data.target_url,
          createdAt: data.created_at,
          expiresAt: data.expires_at,
        }
        memory.set(id, entry)
        return entry
      }
    } catch (e) {
      console.error('Supabase getShortUrl exception:', e)
    }
  }

  const fromKv = await kvGet(`short:${id}`)
  if (fromKv) {
    memory.set(id, fromKv)
    return fromKv
  }

  const fromFile = await readFileStore()
  const entry = fromFile.find((e) => e.id === id) ?? null
  if (entry) {
    memory.set(id, entry)
  }
  return entry
}
