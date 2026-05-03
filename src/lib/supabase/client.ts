import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''

// 检查是否配置了Supabase
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// 创建Supabase客户端（使用any类型避免类型问题）
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    }) as any
  : null

// 获取客户端
export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured')
  }
  return supabase
}