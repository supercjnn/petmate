/**
 * 认证服务
 * 支持邮箱、手机号、微信登录
 */

import { supabase, isSupabaseConfigured } from './supabase'
import { db, UserData } from './database'
import { Errors, AppError } from './errors'

export interface AuthResult {
  user: UserData | null
  session: any | null
  error: AppError | null
  isNewUser: boolean
}

// ============ 邮箱注册/登录 ============

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname?: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    // 内存模式
    const result = await db.createUser({
      email,
      nickname: nickname || '铲屎官',
      currentDay: 1,
      startDate: new Date().toISOString(),
      isPaid: false,
      history: {},
      notes: {},
      achievements: [],
      totalDaysCompleted: 0,
      settings: {
        reminderEnabled: true,
        reminderTime: '09:00',
        reminderMethod: 'browser',
        theme: 'light',
        language: 'zh-CN'
      }
    })

    return {
      user: result,
      session: null,
      error: null,
      isNewUser: true
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: nickname || '铲屎官'
        }
      }
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: Errors.validation(error.message),
        isNewUser: false
      }
    }

    // 创建用户记录
    const newUser = await db.createUser({
      id: data.user?.id,
      email,
      nickname: nickname || '铲屎官',
      currentDay: 1,
      startDate: new Date().toISOString(),
      isPaid: false,
      history: {},
      notes: {},
      achievements: [],
      totalDaysCompleted: 0,
      settings: {
        reminderEnabled: true,
        reminderTime: '09:00',
        reminderMethod: 'browser',
        theme: 'light',
        language: 'zh-CN'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    return {
      user: newUser,
      session: data.session,
      error: null,
      isNewUser: true
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: Errors.internal(),
      isNewUser: false
    }
  }
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    // 内存模式无法验证密码，直接返回错误
    return {
      user: null,
      session: null,
      error: Errors.validation('请使用Supabase进行真实认证'),
      isNewUser: false
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        user: null,
        session: null,
        error: Errors.validation(error.message),
        isNewUser: false
      }
    }

    // 获取用户数据
    db.setUserId(data.user?.id || '')
    const user = await db.getUser()

    return {
      user,
      session: data.session,
      error: null,
      isNewUser: false
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: Errors.internal(),
      isNewUser: false
    }
  }
}

// ============ 手机号登录（模拟）============

export async function signInWithPhone(phone: string): Promise<AuthResult> {
  // 国内手机号登录通常需要短信验证码
  // 这里模拟登录流程
  if (!isSupabaseConfigured() || !supabase) {
    // 内存模式
    return {
      user: null,
      session: null,
      error: Errors.validation('手机号登录需要Supabase配置'),
      isNewUser: false
    }
  }

  // Supabase支持手机号认证
  // 需要配置短信提供商
  return {
    user: null,
    session: null,
    error: Errors.validation('手机号登录暂未开放'),
    isNewUser: false
  }
}

// ============ 微信登录（预留）============

export async function signInWithWechat(): Promise<AuthResult> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      user: null,
      session: null,
      error: Errors.validation('微信登录需要Supabase配置'),
      isNewUser: false
    }
  }

  // 注意：微信OAuth需要额外配置
  // 参考文档：https://supabase.com/docs/guides/auth/social-login/auth-wechat
  try {
    // 暂时返回未开放错误
    return {
      user: null,
      session: null,
      error: Errors.validation('微信登录暂未开放，请使用邮箱登录'),
      isNewUser: false
    }
  } catch (error) {
    return {
      user: null,
      session: null,
      error: Errors.internal(),
      isNewUser: false
    }
  }
}

// ============ 游客登录 ============

export async function signInAsGuest(): Promise<AuthResult> {
  // 创建临时用户
  const guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2)}`

  const guestUser: UserData = {
    id: guestId,
    nickname: '游客铲屎官',
    currentDay: 1,
    startDate: new Date().toISOString(),
    isPaid: false,
    history: {},
    notes: {},
    achievements: [],
    totalDaysCompleted: 0,
    settings: {
      reminderEnabled: true,
      reminderTime: '09:00',
      reminderMethod: 'browser',
      theme: 'light',
      language: 'zh-CN'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  // 保存到本地
  if (typeof window !== 'undefined') {
    localStorage.setItem('petmate_user', JSON.stringify(guestUser))
  }

  return {
    user: guestUser,
    session: null,
    error: null,
    isNewUser: true
  }
}

// ============ 登出 ============

export async function signOut(): Promise<void> {
  if (isSupabaseConfigured() && supabase) {
    await supabase.auth.signOut()
  }

  // 清理本地存储
  if (typeof window !== 'undefined') {
    localStorage.removeItem('petmate_user')
    localStorage.removeItem('petmate_token')
  }
}

// ============ 获取当前会话 ============

export async function getCurrentSession(): Promise<{
  user: UserData | null
  session: any | null
}> {
  if (!isSupabaseConfigured() || !supabase) {
    // 从本地存储读取
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('petmate_user')
      if (stored) {
        return {
          user: JSON.parse(stored),
          session: null
        }
      }
    }
    return { user: null, session: null }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      return { user: null, session: null }
    }

    db.setUserId(session.user.id)
    const user = await db.getUser()

    return { user, session }
  } catch (error) {
    return { user: null, session: null }
  }
}

// ============ 密码重置 ============

export async function resetPassword(email: string): Promise<AppError | null> {
  if (!isSupabaseConfigured() || !supabase) {
    return Errors.validation('密码重置需要Supabase配置')
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`
    })

    if (error) {
      return Errors.validation(error.message)
    }

    return null
  } catch (error) {
    return Errors.internal()
  }
}
