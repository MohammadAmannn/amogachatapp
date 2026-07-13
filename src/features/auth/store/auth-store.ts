import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN = 'thisisjustarandomstring'
const USER_DATA = 'auth_user_data'

interface AuthUser {
  id: string      // ✅ This should always be the auth.uid() from Supabase
  accountNo: string  // ✅ This can be the same as id
  email: string
  name: string
  picture?: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  const cookieState = getCookie(ACCESS_TOKEN)
  let initToken = ''
  if (cookieState) {
    try {
      initToken = JSON.parse(cookieState)
    } catch {
      removeCookie(ACCESS_TOKEN)
    }
  }

  const userCookie = getCookie(USER_DATA)
  let initUser: AuthUser | null = null
  if (userCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(userCookie))
      if (parsed.exp && parsed.exp > Date.now()) {
        initUser = parsed
      } else {
        removeCookie(ACCESS_TOKEN)
        removeCookie(USER_DATA)
      }
    } catch {
      initUser = null
      removeCookie(USER_DATA)
    }
  }

  return {
    auth: {
      user: initUser,
      setUser: (user) =>
        set((state) => {
          let userToStore: AuthUser | null = null
          if (user) {
            // ✅ Ensure both id and accountNo are set
            userToStore = {
              ...user,
              id: user.id || user.accountNo,  // ✅ Fallback to accountNo if id is missing
              accountNo: user.accountNo || user.id,  // ✅ Fallback to id if accountNo is missing
            }
            setCookie(USER_DATA, encodeURIComponent(JSON.stringify(userToStore)))
          } else {
            removeCookie(USER_DATA)
          }
          return { ...state, auth: { ...state.auth, user: userToStore } }
        }),
      accessToken: initUser ? initToken : '',
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN)
          removeCookie(USER_DATA)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})