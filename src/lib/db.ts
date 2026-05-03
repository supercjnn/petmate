/**
 * 数据服务层 - 简化版
 * 支持 Supabase 和内存双模式
 */

import { supabase, isSupabaseConfigured } from './supabase/client'

// 类型定义
export interface User {
  id: string
  email?: string | null
  nickname?: string | null
  avatar_url?: string | null
  experience?: 'beginner' | 'intermediate' | 'experienced' | null
  environment?: 'solo' | 'family' | 'multi_pet' | null
  created_at: string
  updated_at: string
}

export interface Cat {
  id: string
  user_id: string
  name?: string | null
  breed?: string | null
  birth_date?: string | null
  adopt_date?: string | null
  gender?: 'male' | 'female' | 'unknown' | null
  sterilized?: boolean | null
  weight?: number | null
  avatar_url?: string | null
  notes?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DailyRecord {
  id: string
  user_id: string
  cat_id?: string | null
  day_number: number
  date: string
  completed_actions: any[]
  notes?: string | null
  mood?: 'great' | 'good' | 'okay' | 'worried' | 'bad' | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  user_id: string
  cat_id?: string | null
  title?: string | null
  content: string
  category?: 'observation' | 'health' | 'behavior' | 'feeding' | 'other' | null
  tags?: any[]
  images?: any[]
  is_private?: boolean | null
  created_at: string
  updated_at: string
}

export interface Achievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  metadata?: Record<string, any>
}

export interface Payment {
  id: string
  user_id: string
  product_id: string
  product_name: string
  product_type: 'premium' | 'consultation' | 'course' | 'subscription'
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method?: 'wechat' | 'alipay' | null
  paid_at?: string | null
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface ShareLink {
  id: string
  user_id: string
  content_type: 'progress' | 'achievement' | 'card' | 'diary'
  content: Record<string, any>
  view_count: number
  like_count: number
  expires_at?: string | null
  created_at: string
}

// 内存存储
const memoryStore = {
  users: new Map<string, User>(),
  cats: new Map<string, Cat[]>(),
  dailyRecords: new Map<string, DailyRecord[]>(),
  notes: new Map<string, Note[]>(),
  achievements: new Map<string, Achievement[]>(),
  payments: new Map<string, Payment[]>(),
  shareLinks: new Map<string, ShareLink[]>(),
}

// ============ 用户服务 ============
export const userService = {
  async get(userId: string): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('id', userId).single()
      return error ? null : data as User
    }
    return memoryStore.users.get(userId) || null
  },

  async getByEmail(email: string): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').select('*').eq('email', email).single()
      return error ? null : data as User
    }
    for (const user of memoryStore.users.values()) {
      if (user.email === email) return user
    }
    return null
  },

  async create(userData: Partial<User>): Promise<User | null> {
    const newUser: User = {
      id: userData.id || crypto.randomUUID(),
      email: userData.email || null,
      nickname: userData.nickname || '铲屎官',
      avatar_url: userData.avatar_url || null,
      experience: userData.experience || 'beginner',
      environment: userData.environment || 'solo',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('users').insert(newUser as any).select().single()
      return error ? null : data as User
    }

    memoryStore.users.set(newUser.id, newUser)
    return newUser
  },

  async update(userId: string, updates: Partial<User>): Promise<User | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() } as any)
        .eq('id', userId)
        .select()
        .single()
      return error ? null : data as User
    }

    const existing = memoryStore.users.get(userId)
    if (!existing) return null

    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() }
    memoryStore.users.set(userId, updated)
    return updated
  },
}

// ============ 每日记录服务 ============
export const dailyRecordService = {
  async get(userId: string, date: string): Promise<DailyRecord | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()
      return error ? null : data as DailyRecord
    }

    const records = memoryStore.dailyRecords.get(userId) || []
    return records.find(r => r.date === date) || null
  },

  async list(userId: string, options?: { limit?: number }): Promise<DailyRecord[]> {
    if (isSupabaseConfigured && supabase) {
      let query = supabase.from('daily_records').select('*').eq('user_id', userId).order('date', { ascending: false })
      if (options?.limit) query = query.limit(options.limit)
      const { data, error } = await query
      return error ? [] : data as DailyRecord[]
    }

    const records = memoryStore.dailyRecords.get(userId) || []
    return records.slice(0, options?.limit || records.length)
  },

  async upsert(userId: string, recordData: Partial<DailyRecord>): Promise<DailyRecord | null> {
    const date = recordData.date || new Date().toISOString().split('T')[0]
    const record: DailyRecord = {
      id: recordData.id || crypto.randomUUID(),
      user_id: userId,
      cat_id: recordData.cat_id || null,
      day_number: recordData.day_number || 1,
      date,
      completed_actions: recordData.completed_actions || [],
      notes: recordData.notes || null,
      mood: recordData.mood || null,
      created_at: recordData.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('daily_records').upsert(record).select().single()
      return error ? null : data as DailyRecord
    }

    const records = memoryStore.dailyRecords.get(userId) || []
    const existingIndex = records.findIndex(r => r.date === date)
    if (existingIndex >= 0) {
      records[existingIndex] = record
    } else {
      records.push(record)
    }
    memoryStore.dailyRecords.set(userId, records)
    return record
  },
}

// ============ 笔记服务 ============
export const noteService = {
  async list(userId: string): Promise<Note[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notes').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      return error ? [] : data as Note[]
    }
    return memoryStore.notes.get(userId) || []
  },

  async create(userId: string, noteData: Partial<Note>): Promise<Note | null> {
    const note: Note = {
      id: crypto.randomUUID(),
      user_id: userId,
      cat_id: noteData.cat_id || null,
      title: noteData.title || null,
      content: noteData.content || '',
      category: noteData.category || 'other',
      tags: noteData.tags || [],
      images: noteData.images || [],
      is_private: noteData.is_private ?? true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('notes').insert(note as any).select().single()
      return error ? null : data as Note
    }

    const notes = memoryStore.notes.get(userId) || []
    notes.push(note)
    memoryStore.notes.set(userId, notes)
    return note
  },

  async delete(noteId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('notes').delete().eq('id', noteId)
      return !error
    }

    for (const [userId, notes] of memoryStore.notes.entries()) {
      const index = notes.findIndex(n => n.id === noteId)
      if (index >= 0) {
        notes.splice(index, 1)
        memoryStore.notes.set(userId, notes)
        return true
      }
    }
    return false
  },
}

// ============ 成就服务 ============
export const achievementService = {
  async list(userId: string): Promise<Achievement[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('achievements').select('*').eq('user_id', userId)
      return error ? [] : data as Achievement[]
    }
    return memoryStore.achievements.get(userId) || []
  },

  async unlock(userId: string, achievementId: string, metadata?: Record<string, any>): Promise<Achievement | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('achievements')
        .insert({ user_id: userId, achievement_id: achievementId, metadata: metadata || {} } as any)
        .select()
        .single()
      return error ? null : data as Achievement
    }

    const achievements = memoryStore.achievements.get(userId) || []
    if (achievements.some(a => a.achievement_id === achievementId)) return null

    const achievement: Achievement = {
      id: crypto.randomUUID(),
      user_id: userId,
      achievement_id: achievementId,
      unlocked_at: new Date().toISOString(),
      metadata: metadata || {},
    }
    achievements.push(achievement)
    memoryStore.achievements.set(userId, achievements)
    return achievement
  },
}

// ============ 支付服务 ============
export const paymentService = {
  async list(userId: string): Promise<Payment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('payments').select('*').eq('user_id', userId)
      return error ? [] : data as Payment[]
    }
    return memoryStore.payments.get(userId) || []
  },

  async create(userId: string, paymentData: Partial<Payment>): Promise<Payment | null> {
    const payment: Payment = {
      id: crypto.randomUUID(),
      user_id: userId,
      product_id: paymentData.product_id || '',
      product_name: paymentData.product_name || '',
      product_type: paymentData.product_type || 'premium',
      amount: paymentData.amount || 0,
      currency: paymentData.currency || 'CNY',
      status: paymentData.status || 'pending',
      payment_method: paymentData.payment_method || null,
      paid_at: paymentData.paid_at || null,
      metadata: paymentData.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('payments').insert(payment).select().single()
      return error ? null : data as Payment
    }

    const payments = memoryStore.payments.get(userId) || []
    payments.push(payment)
    memoryStore.payments.set(userId, payments)
    return payment
  },

  async updateStatus(paymentId: string, status: Payment['status'], paymentMethod?: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const updates: any = { status, updated_at: new Date().toISOString() }
      if (status === 'paid') {
        updates.paid_at = new Date().toISOString()
        if (paymentMethod) updates.payment_method = paymentMethod
      }
      const { error } = await supabase.from('payments').update(updates).eq('id', paymentId)
      return !error
    }

    for (const payments of memoryStore.payments.values()) {
      const payment = payments.find(p => p.id === paymentId)
      if (payment) {
        payment.status = status
        payment.updated_at = new Date().toISOString()
        if (status === 'paid') {
          payment.paid_at = new Date().toISOString()
          if (paymentMethod) payment.payment_method = paymentMethod as 'wechat' | 'alipay'
        }
        return true
      }
    }
    return false
  },
}

export { isSupabaseConfigured }