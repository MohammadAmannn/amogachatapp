import { describe, expect, it, vi } from 'vitest'
import { getFullRedirectUrl, handleAuthRedirect } from './auth-redirect.service'

describe('getFullRedirectUrl', () => {
  it('returns pathname directly if searchParamsString is empty/undefined', () => {
    expect(getFullRedirectUrl('/files/document')).toBe('/files/document')
  })

  it('prefixes searchParamsString with ? if it does not have one', () => {
    expect(getFullRedirectUrl('/files/document', 'id=123')).toBe('/files/document?id=123')
  })

  it('preserves ? prefix if searchParamsString already has one', () => {
    expect(getFullRedirectUrl('/files/document', '?id=123')).toBe('/files/document?id=123')
  })
})

describe('handleAuthRedirect', () => {
  it('redirects to root / if redirectTo is undefined', () => {
    const routerMock = { replace: vi.fn() }
    handleAuthRedirect(routerMock, undefined)
    expect(routerMock.replace).toHaveBeenCalledWith('/')
  })

  it('redirects to root / if redirectTo is null', () => {
    const routerMock = { replace: vi.fn() }
    handleAuthRedirect(routerMock, null)
    expect(routerMock.replace).toHaveBeenCalledWith('/')
  })

  it('navigates to relative redirect paths directly', () => {
    const routerMock = { replace: vi.fn() }
    handleAuthRedirect(routerMock, '/files/document/abc')
    expect(routerMock.replace).toHaveBeenCalledWith('/files/document/abc')
  })

  it('adds leading slash to relative redirect paths if missing', () => {
    const routerMock = { replace: vi.fn() }
    handleAuthRedirect(routerMock, 'files/document/abc')
    expect(routerMock.replace).toHaveBeenCalledWith('/files/document/abc')
  })

  it('parses absolute http redirect URLs and resolves to relative path', () => {
    const routerMock = { replace: vi.fn() }
    handleAuthRedirect(routerMock, 'https://amoganextapp.vercel.app/files/document/abc?query=1#hash')
    expect(routerMock.replace).toHaveBeenCalledWith('/files/document/abc?query=1#hash')
  })
})
