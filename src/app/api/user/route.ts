import { NextRequest, NextResponse } from 'next/server'
import { User } from '@/lib/user-types'
import { 
  supabase, 
  isSupabaseConfigured, 
  getUser as dbGetUser, 
  createUser as dbCreateUser,
  updateUser as dbUpdateUser,
  getHistory as dbGetHistory
} from '@/lib/supabase'

// MVP阶段：内存存储作为fallback
const users: Map<string, User> = new Map()
const tokens: Map<string, string> = new Map() // token -> userId

// 生成简单token
function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

// 生成用户ID
function generateUserId(): string {
  return 'user_' + Date.now().toString(36)
}

// 验证token
function verifyToken(token: string): string | null {
  return tokens.get(token) || null
}

// POST: 注册/登录/同步
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, phone, email, nickname, token, userData } = body
    
    if (action === 'register') {
      // 注册
      if (!phone && !email) {
        return NextResponse.json({ success: false, error: '需要手机号或邮箱' }, { status: 400 })
      }
      
      // Supabase 模式
      if (isSupabaseConfigured() && supabase) {
        // 检查是否已存在
        const { data: existingUsers } = await supabase
          .from('users')
          .select('*')
          .or(`phone.eq.${phone},email.eq.${email}`)
          .limit(1)
        
        if (existingUsers && existingUsers.length > 0) {
          const existingUser = existingUsers[0]
          const newToken = generateToken()
          tokens.set(newToken, existingUser.id)
          
          // 获取历史记录
          const history = await dbGetHistory(existingUser.id)
          const userWithHistory = { ...existingUser, history }
          
          return NextResponse.json({
            success: true,
            data: { user: userWithHistory, token: newToken },
            message: '账号已存在，已自动登录'
          })
        }
        
        // 创建新用户
        const newUser = {
          phone,
          email,
          nickname: nickname || '铲屎官',
          current_day: 1,
          is_paid: false,
          settings: {
            reminderEnabled: true,
            reminderTime: '09:00',
            reminderMethod: 'browser'
          }
        }
        
        const { data: createdUser, error } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single()
        
        if (error || !createdUser) {
          console.error('Supabase 创建用户失败:', error)
          // 降级到内存存储
          return await handleRegisterFallback(phone, email, nickname)
        }
        
        const newToken = generateToken()
        tokens.set(newToken, createdUser.id)
        
        const userWithHistory = { ...createdUser, history: {} }
        
        return NextResponse.json({
          success: true,
          data: { user: userWithHistory, token: newToken },
          message: '注册成功（Supabase）'
        })
      }
      
      // 内存存储模式
      return await handleRegisterFallback(phone, email, nickname)
    }
    
    if (action === 'login') {
      // 登录
      if (!phone && !email) {
        return NextResponse.json({ success: false, error: '需要手机号或邮箱' }, { status: 400 })
      }
      
      // Supabase 模式
      if (isSupabaseConfigured() && supabase) {
        const { data: users } = await supabase
          .from('users')
          .select('*')
          .or(`phone.eq.${phone},email.eq.${email}`)
          .limit(1)
        
        if (!users || users.length === 0) {
          return NextResponse.json({ success: false, error: '账号不存在' }, { status: 404 })
        }
        
        const user = users[0]
        const newToken = generateToken()
        tokens.set(newToken, user.id)
        
        // 获取历史记录
        const history = await dbGetHistory(user.id)
        const userWithHistory = { ...user, history }
        
        return NextResponse.json({
          success: true,
          data: { user: userWithHistory, token: newToken },
          message: '登录成功（Supabase）'
        })
      }
      
      // 内存存储模式
      const user = Array.from(users.values()).find(u =>
        u.phone === phone || u.email === email
      )
      
      if (!user) {
        return NextResponse.json({ success: false, error: '账号不存在' }, { status: 404 })
      }
      
      const newToken = generateToken()
      tokens.set(newToken, user.id)
      
      return NextResponse.json({
        success: true,
        data: { user, token: newToken },
        message: '登录成功'
      })
    }
    
    if (action === 'sync') {
      // 同步数据
      const userId = verifyToken(token)
      
      if (!userId) {
        return NextResponse.json({ success: false, error: '无效token' }, { status: 401 })
      }
      
      // Supabase 模式
      if (isSupabaseConfigured() && supabase) {
        const { data: updatedUser, error } = await supabase
          .from('users')
          .update({
            ...userData,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single()
        
        if (error) {
          console.error('Supabase 同步失败:', error)
          // 降级到内存
          const memUser = users.get(userId)
          if (memUser) {
            const updated = { ...memUser, ...userData }
            users.set(userId, updated)
            return NextResponse.json({
              success: true,
              data: { user: updated },
              message: '同步成功（内存降级）'
            })
          }
        }
        
        const history = await dbGetHistory(userId)
        return NextResponse.json({
          success: true,
          data: { user: { ...updatedUser, history } },
          message: '同步成功（Supabase）'
        })
      }
      
      // 内存存储模式
      const memUser = users.get(userId)
      if (!memUser) {
        return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
      }
      
      const updatedUser = {
        ...memUser,
        ...userData,
        updatedAt: new Date().toISOString()
      }
      users.set(userId, updatedUser)
      
      return NextResponse.json({
        success: true,
        data: { user: updatedUser },
        message: '同步成功'
      })
    }
    
    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('User API 错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 内存注册 fallback
async function handleRegisterFallback(phone: string | undefined, email: string | undefined, nickname?: string) {
  const existingUser = Array.from(users.values()).find(u =>
    u.phone === phone || u.email === email
  )
  
  if (existingUser) {
    const token = generateToken()
    tokens.set(token, existingUser.id)
    return NextResponse.json({
      success: true,
      data: { user: existingUser, token },
      message: '账号已存在，已自动登录'
    })
  }
  
  const userId = generateUserId()
  const user: User = {
    id: userId,
    phone,
    email,
    nickname: nickname || '铲屎官',
    createdAt: new Date().toISOString(),
    currentDay: 1,
    startDate: new Date().toISOString(),
    isPaid: false,
    history: {},
    settings: {
      reminderEnabled: true,
      reminderTime: '09:00',
      reminderMethod: 'browser'
    }
  }
  
  users.set(userId, user)
  const token = generateToken()
  tokens.set(token, userId)
  
  return NextResponse.json({
    success: true,
    data: { user, token },
    message: '注册成功'
  })
}

// GET: 获取用户信息
export async function GET(request: NextRequest) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return NextResponse.json({ success: false, error: '缺少token' }, { status: 401 })
  }
  
  const userId = verifyToken(token)
  if (!userId) {
    return NextResponse.json({ success: false, error: '无效token' }, { status: 401 })
  }
  
  // Supabase 模式
  if (isSupabaseConfigured() && supabase) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error || !user) {
      // 降级到内存
      const memUser = users.get(userId)
      if (memUser) {
        return NextResponse.json({ success: true, data: { user: memUser } })
      }
      return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
    }
    
    const history = await dbGetHistory(userId)
    return NextResponse.json({ success: true, data: { user: { ...user, history } } })
  }
  
  // 内存存储模式
  const user = users.get(userId)
  if (!user) {
    return NextResponse.json({ success: false, error: '用户不存在' }, { status: 404 })
  }
  
  return NextResponse.json({ success: true, data: { user } })
}