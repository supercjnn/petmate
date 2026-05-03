/**
 * 数据库服务层
 * 统一的数据访问接口，支持 Supabase + localStorage 双模式
 */

// 从health-records.ts导入完整健康记录类型
import { supabase, isSupabaseConfigured } from './supabase'

// 健康记录完整版类型（来自health-records.ts）
export interface FullHealthRecord {
  weightRecords: any[]
  vaccinationRecords: any[]
  medicalRecords: any[]
  dewormingRecords: any[]
  allergies: string[]
  chronicConditions: string[]
  vetInfo?: {
    name: string
    phone: string
    address: string
  }
  insuranceNumber?: string
}

// ============ 用户数据 ============

export interface UserData {
  id: string
  phone?: string
  email?: string
  nickname: string
  currentDay: number
  startDate: string
  catName?: string
  catBirthDate?: string
  catBreed?: string
  isPaid: boolean
  paidAt?: string
  paidAmount?: number
  paymentMethod?: string
  settings: UserSettings
  history: Record<number, string[]>
  notes: Record<number, NoteData[]>
  healthRecords?: FullHealthRecord
  achievements: string[]
  totalDaysCompleted: number
  createdAt: string
  updatedAt: string
}

export interface UserSettings {
  reminderEnabled: boolean
  reminderTime: string
  reminderMethod: 'browser' | 'wechat' | 'sms'
  theme: 'light' | 'dark' | 'auto'
  language: 'zh-CN' | 'en-US'
}

export interface NoteData {
  id: string
  content: string
  type: 'observation' | 'health' | 'behavior' | 'mood'
  mood?: 'happy' | 'normal' | 'worried' | 'sad'
  tags?: string[]
  createdAt: string
}

// ============ 内存存储（Fallback）============

const memoryStore = {
  users: new Map<string, UserData>(),
  notes: new Map<string, NoteData[]>(),
  history: new Map<string, Record<number, string[]>>(),
  healthRecords: new Map<string, FullHealthRecord>()
}

// ============ 数据库服务类 ============

export class DatabaseService {
  private userId: string | null = null
  private useDatabase: boolean
  private memoryUsers: Map<string, UserData> = new Map()

  constructor() {
    this.useDatabase = isSupabaseConfigured()
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  // 创建用户
  async createUser(user: Partial<UserData>): Promise<UserData | null> {
    const userId = user.id || `user_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const newUser: UserData = {
      id: userId,
      nickname: user.nickname || '铲屎官',
      currentDay: user.currentDay || 1,
      startDate: user.startDate || new Date().toISOString(),
      isPaid: user.isPaid || false,
      history: user.history || {},
      notes: user.notes || {},
      achievements: user.achievements || [],
      totalDaysCompleted: user.totalDaysCompleted || 0,
      settings: user.settings || {
        reminderEnabled: true,
        reminderTime: '09:00',
        reminderMethod: 'browser',
        theme: 'light',
        language: 'zh-CN'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      email: user.email,
      phone: user.phone,
      catName: user.catName,
      catBreed: user.catBreed,
      catBirthDate: user.catBirthDate
    }

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select()
        .single()

      if (error) {
        console.error('创建用户失败:', error)
        this.memoryUsers.set(userId, newUser)
        return newUser
      }
      return data
    }

    this.memoryUsers.set(userId, newUser)
    return newUser
  }

  // ============ 用户操作 ============

  async getUser(): Promise<UserData | null> {
    if (!this.userId) return null

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', this.userId)
        .single()

      if (error) {
        console.error('获取用户失败:', error)
        return memoryStore.users.get(this.userId) || null
      }

      // 获取关联数据
      const [history, notes, healthRecords] = await Promise.all([
        this.getHistory(),
        this.getAllNotes(),
        this.getHealthRecords()
      ])

      return {
        ...data,
        history,
        notes,
        healthRecords
      }
    }

    return memoryStore.users.get(this.userId) || null
  }

  async updateUser(updates: Partial<UserData>): Promise<boolean> {
    if (!this.userId) return false

    if (this.useDatabase && supabase) {
      const { error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.userId)

      if (error) {
        console.error('更新用户失败:', error)
        // 降级到内存
        const user = memoryStore.users.get(this.userId)
        if (user) {
          memoryStore.users.set(this.userId, { ...user, ...updates })
        }
        return false
      }

      return true
    }

    // 内存模式
    const user = memoryStore.users.get(this.userId)
    if (user) {
      memoryStore.users.set(this.userId, { ...user, ...updates })
      return true
    }
    return false
  }

  // ============ 历史记录 ============

  async getHistory(): Promise<Record<number, string[]>> {
    if (!this.userId) return {}

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('daily_records')
        .select('*')
        .eq('user_id', this.userId)

      if (error) return memoryStore.history.get(this.userId) || {}

      const history: Record<number, string[]> = {}
      data.forEach((record: any) => {
        history[record.day_number] = record.completed_actions || []
      })

      return history
    }

    return memoryStore.history.get(this.userId) || {}
  }

  async saveDayRecord(dayNumber: number, completedActions: string[]): Promise<boolean> {
    if (!this.userId) return false

    if (this.useDatabase && supabase) {
      const { error } = await supabase
        .from('daily_records')
        .upsert({
          user_id: this.userId,
          day_number: dayNumber,
          completed_actions: completedActions,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('保存记录失败:', error)
        return false
      }

      return true
    }

    // 内存模式
    const history = memoryStore.history.get(this.userId) || {}
    history[dayNumber] = completedActions
    memoryStore.history.set(this.userId, history)
    return true
  }

  // ============ 笔记操作 ============

  async getNotes(dayNumber: number): Promise<NoteData[]> {
    if (!this.userId) return []

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', this.userId)
        .eq('day_number', dayNumber)
        .order('created_at', { ascending: true })

      if (error) return []
      return data.map(this.mapNote)
    }

    const notes = memoryStore.notes.get(this.userId)
    return notes?.filter(n => n.createdAt.includes(`day${dayNumber}`)) || []
  }

  async getAllNotes(): Promise<Record<number, NoteData[]>> {
    if (!this.userId) return {}

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', this.userId)
        .order('created_at', { ascending: true })

      if (error) return {}

      const notes: Record<number, NoteData[]> = {}
      data.forEach((note: any) => {
        if (!notes[note.day_number]) {
          notes[note.day_number] = []
        }
        notes[note.day_number].push(this.mapNote(note))
      })

      return notes
    }

    return {}
  }

  async addNote(dayNumber: number, note: Omit<NoteData, 'id' | 'createdAt'>): Promise<NoteData | null> {
    if (!this.userId) return null

    const newNote: NoteData = {
      ...note,
      id: `note_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      createdAt: new Date().toISOString()
    }

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: this.userId,
          day_number: dayNumber,
          content: note.content,
          type: note.type,
          mood: note.mood,
          tags: note.tags
        })
        .select()
        .single()

      if (error) {
        console.error('添加笔记失败:', error)
        return null
      }

      return this.mapNote(data)
    }

    return newNote
  }

  async deleteNote(noteId: string): Promise<boolean> {
    if (!this.userId) return false

    if (this.useDatabase && supabase) {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', this.userId)

      return !error
    }

    return true
  }

  // ============ 健康档案 ============

  async getHealthRecords(): Promise<FullHealthRecord | null> {
    if (!this.userId) return null

    if (this.useDatabase && supabase) {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      if (error) return null
      return data
    }

    return memoryStore.healthRecords.get(this.userId) || null
  }

  async updateHealthRecords(records: Partial<FullHealthRecord>): Promise<boolean> {
    if (!this.userId) return false

    if (this.useDatabase && supabase) {
      const { error } = await supabase
        .from('health_records')
        .upsert({
          user_id: this.userId,
          ...records,
          updated_at: new Date().toISOString()
        })

      return !error
    }

    const existing = memoryStore.healthRecords.get(this.userId) || {}
    memoryStore.healthRecords.set(this.userId, { ...existing, ...records } as FullHealthRecord)
    return true
  }

  // ============ 成就系统 ============

  async getAchievements(): Promise<string[]> {
    const user = await this.getUser()
    return user?.achievements || []
  }

  async unlockAchievement(achievementId: string): Promise<boolean> {
    const achievements = await this.getAchievements()
    if (achievements.includes(achievementId)) return false

    achievements.push(achievementId)
    return this.updateUser({ achievements } as Partial<UserData>)
  }

  // ============ 工具方法 ============

  private mapNote(dbNote: any): NoteData {
    return {
      id: dbNote.id,
      content: dbNote.content,
      type: dbNote.type || 'observation',
      mood: dbNote.mood,
      tags: dbNote.tags || [],
      createdAt: dbNote.created_at
    }
  }

  // ============ 数据迁移 ============

  async migrateFromLocalStorage(localStorageData: any): Promise<boolean> {
    if (!this.userId) return false

    console.log('开始迁移localStorage数据到Supabase...')

    try {
      // 迁移历史记录
      if (localStorageData.history) {
        for (const [day, actions] of Object.entries(localStorageData.history)) {
          await this.saveDayRecord(Number(day), actions as string[])
        }
      }

      // 迁移笔记
      if (localStorageData.notes) {
        for (const [day, notes] of Object.entries(localStorageData.notes)) {
          for (const note of notes as any[]) {
            await this.addNote(Number(day), {
              content: note.content,
              type: note.type || 'observation',
              mood: note.mood,
              tags: note.tags
            })
          }
        }
      }

      // 迁移用户设置
      if (localStorageData.settings) {
        await this.updateUser({
          settings: localStorageData.settings
        } as Partial<UserData>)
      }

      console.log('数据迁移完成')
      return true
    } catch (error) {
      console.error('数据迁移失败:', error)
      return false
    }
  }
}

// 单例导出
export const db = new DatabaseService()
