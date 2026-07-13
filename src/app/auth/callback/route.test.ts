import { describe, expect, it, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { createClient } from '@/lib/server'

vi.mock('@/lib/server', () => ({
  createClient: vi.fn(),
}))

describe('OAuth Callback Route Handler', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('redirects to sign-in with MissingCode error when code param is absent', async () => {
    const request = new Request('https://amoganextapp.vercel.app/auth/callback?next=%2Ffiles%2Fdocument%2F123')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://amoganextapp.vercel.app/sign-in?error=MissingCode')
  })

  it('redirects to the target next URL when code exchange is successful', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ data: {}, error: null })
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new Request('https://amoganextapp.vercel.app/auth/callback?code=mock-valid-code&next=%2Ffiles%2Fdocument%2F123')
    const response = await GET(request)

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith('mock-valid-code')
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://amoganextapp.vercel.app/files/document/123')
  })

  it('redirects to root / by default if next param is missing', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({ data: {}, error: null })
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new Request('https://amoganextapp.vercel.app/auth/callback?code=mock-valid-code')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://amoganextapp.vercel.app/')
  })

  it('redirects to sign-in with AuthExchangeError when code exchange fails', async () => {
    const mockExchangeCodeForSession = vi.fn().mockResolvedValue({
      data: {},
      error: { message: 'Invalid grant' },
    })
    const mockSupabase = {
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
      },
    }
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new Request('https://amoganextapp.vercel.app/auth/callback?code=mock-bad-code&next=%2Ffiles%2Fdocument%2F123')
    const response = await GET(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://amoganextapp.vercel.app/sign-in?error=AuthExchangeError&details=Invalid%20grant')
  })
})
