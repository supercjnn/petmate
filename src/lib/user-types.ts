// PetMate 用户数据模型

export interface User {
  id: string
  phone?: string
  email?: string
  nickname?: string
  createdAt: string
  
  // 养猫进度
  currentDay: number
  startDate: string
  catName?: string
  catBreed?: string  // 品种ID
  catBirthDate?: string
  catAge?: 'kitten' | 'adult' | 'senior'
  
  // 付费状态
  isPaid: boolean
  paidAt?: string
  paidAmount?: number
  paymentMethod?: 'wechat' | 'alipay'
  
  // 每日记录
  history: Record<number, DailyRecord>
  
  // 设置
  settings: UserSettings
}

export interface DailyRecord {
  completedActions: string[]
  notes: Note[]
  photos?: string[]
  createdAt: string
  updatedAt: string
}

export interface Note {
  id: string
  content: string
  type: 'observation' | 'question' | 'milestone'
  createdAt: string
  mood?: 'happy' | 'worried' | 'confused' | 'neutral'
  tags?: string[]
  imageUrl?: string
}

export interface UserSettings {
  reminderEnabled: boolean
  reminderTime: string // HH:mm
  reminderMethod: 'browser' | 'wechat'
  // 用户画像
  userExperience?: 'beginner' | 'intermediate' | 'experienced'
  homeEnvironment?: 'single' | 'family' | 'multi-pet'
}

// 本地存储键
export const STORAGE_KEYS = {
  USER: 'petmate_user',
  TOKEN: 'petmate_token',
  NOTES: 'petmate_notes',
}