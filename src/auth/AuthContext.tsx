import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { AuthUser, ActorType } from '../lib/types'
import {
  authFaskesApi,
  authNakesApi,
  authApi,
  getStoredTokens,
  setStoredTokens,
  clearStoredTokens,
} from '../lib/api'

// ─── Storage ──────────────────────────────────────────────────────────────────

const USER_KEY = 'sk_user'

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearUser() {
  localStorage.removeItem(USER_KEY)
}

// ─── Context types ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  loginFaskes: (username: string, password: string) => Promise<void>
  loginNakes: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser)

  const loginFaskes = useCallback(async (username: string, password: string) => {
    const data = await authFaskesApi.login(username, password)
    setStoredTokens({ access_token: data.token.access_token, refresh_token: data.token.refresh_token })
    const authUser: AuthUser = {
      actor_type: 'faskes' as ActorType,
      id: data.faskes_id,
      faskes_id: data.faskes_id,
      name: data.name,
    }
    saveUser(authUser)
    setUser(authUser)
  }, [])

  const loginNakes = useCallback(async (username: string, password: string) => {
    const data = await authNakesApi.login(username, password)
    setStoredTokens({ access_token: data.token.access_token, refresh_token: data.token.refresh_token })
    const authUser: AuthUser = {
      actor_type: 'nakes' as ActorType,
      id: data.nakes_id,
      faskes_id: data.faskes_id,
      name: data.full_name,
      role: data.role,
    }
    saveUser(authUser)
    setUser(authUser)
  }, [])

  const logout = useCallback(async () => {
    const tokens = getStoredTokens()
    if (tokens) {
      try {
        await authApi.logout(tokens.refresh_token)
      } catch {
        // fire-and-forget: clear local state regardless of network result
      }
    }
    clearStoredTokens()
    clearUser()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, loginFaskes, loginNakes, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
