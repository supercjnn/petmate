// 简化类型定义
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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