'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'
import { userService, type User } from '@/lib/db'

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (email: string, password: string, nickname?: string) => Promise<{ success: boolean; error?: string }>
  loginAsGuest: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// 本地存储键
const GUEST_USER_KEY = 'petmate_guest_user'
const LOCAL_USER_KEY = 'petmate_local_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initAuth()
  }, [])

  const initAuth = async () => {
    setIsLoading(true)

    if (isSupabaseConfigured && supabase) {
      // 检查Supabase会话
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // 获取用户数据
        const userData = await userService.get(session.user.id)
        if (userData) {
          setUser(userData)
        } else {
          // 创建用户记录
          const newUser = await userService.create({
            id: session.user.id,
            email: session.user.email,
          })
          if (newUser) setUser(newUser)
        }
      } else {
        // 检查本地游客用户
        const guestUser = localStorage.getItem(GUEST_USER_KEY)
        if (guestUser) {
          try {
            setUser(JSON.parse(guestUser))
          } catch {
            localStorage.removeItem(GUEST_USER_KEY)
          }
        }
      }
    } else {
      // 内存模式：检查本地存储
      const localUser = localStorage.getItem(LOCAL_USER_KEY)
      if (localUser) {
        try {
          setUser(JSON.parse(localUser))
        } catch {
          localStorage.removeItem(LOCAL_USER_KEY)
        }
      }
    }

    setIsLoading(false)
  }

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const existingUser = await userService.getByEmail(email)
      if (existingUser) {
        setUser(existingUser)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(existingUser))
        return { success: true }
      }
      return { success: false, error: '用户不存在' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { success: false, error: error.message }

    if (data.user) {
      const userData = await userService.get(data.user.id)
      if (userData) {
        setUser(userData)
      } else {
        const newUser = await userService.create({ id: data.user.id, email: data.user.email })
        if (newUser) setUser(newUser)
      }
      localStorage.removeItem(GUEST_USER_KEY)
    }

    return { success: true }
  }

  const register = async (email: string, password: string, nickname?: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      const newUser = await userService.create({ email, nickname: nickname || '铲屎官' })
      if (newUser) {
        setUser(newUser)
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser))
        return { success: true }
      }
      return { success: false, error: '创建用户失败' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nickname: nickname || '铲屎官' } },
    })

    if (error) return { success: false, error: error.message }

    if (data.user) {
      const newUser = await userService.create({
        id: data.user.id,
        email: data.user.email,
        nickname: nickname || '铲屎官',
      })
      if (newUser) setUser(newUser)
    }

    return { success: true }
  }

  const loginAsGuest = async () => {
    const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    const guestUser = await userService.create({ id: guestId, nickname: '游客' })
    if (guestUser) {
      setUser(guestUser)
      localStorage.setItem(GUEST_USER_KEY, JSON.stringify(guestUser))
    }
  }

  const logout = async () => {
    if (isSupabaseConfigured && supabase) await supabase.auth.signOut()
    setUser(null)
    localStorage.removeItem(GUEST_USER_KEY)
    localStorage.removeItem(LOCAL_USER_KEY)
  }

  const refreshUser = async () => {
    if (!user) return
    const userData = await userService.get(user.id)
    if (userData) setUser(userData)
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user && !user.id.startsWith('guest_'),
      isGuest: !!user && user.id.startsWith('guest_'),
      login,
      register,
      loginAsGuest,
      logout,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export function useRequireAuth() {
  const { user, isLoading, isAuthenticated, loginAsGuest } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !user) loginAsGuest()
  }, [isLoading, isAuthenticated, user])

  return { user, isLoading, isAuthenticated }
}