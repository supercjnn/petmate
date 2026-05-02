// Supabase客户端配置
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || ''

// 只有配置了Supabase才创建客户端
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => {
  return supabaseUrl !== '' && supabaseAnonKey !== ''
}

// 用户相关操作
export async function getUser(userId: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  return error ? null : data
}

export async function createUser(user: any) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .insert([user])
    .select()
    .single()
  
  return error ? null : data
}

export async function updateUser(userId: string, updates: any) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  return error ? null : data
}

// 笔记相关操作
export async function getNotes(userId: string, dayNumber: number) {
  if (!supabase) return []
  
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('day_number', dayNumber)
    .order('created_at', { ascending: true })
  
  return error ? [] : data
}

export async function addNote(userId: string, dayNumber: number, note: any) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('notes')
    .insert([
      {
        user_id: userId,
        day_number: dayNumber,
        content: note.content,
        type: note.type || 'observation'
      }
    ])
    .select()
    .single()
  
  return error ? null : data
}

export async function deleteNote(noteId: string) {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)
  
  return !error
}

// 历史记录操作
export async function getHistory(userId: string) {
  if (!supabase) return {}
  
  const { data, error } = await supabase
    .from('daily_records')
    .select('*')
    .eq('user_id', userId)
  
  if (error) return {}
  
  // 转换为 Record<number, string[]>
  const history: Record<number, string[]> = {}
  data.forEach((record: any) => {
    history[record.day_number] = record.completed_actions || []
  })
  
  return history
}

export async function saveDailyRecord(userId: string, dayNumber: number, completedActions: string[]) {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('daily_records')
    .upsert([
      {
        user_id: userId,
        day_number: dayNumber,
        completed_actions: completedActions,
        updated_at: new Date().toISOString()
      }
    ])
  
  return !error
}

// 支付记录
export async function createPaymentRecord(userId: string, orderId: string, amount: number, method: string) {
  if (!supabase) return null
  
  const { data, error } = await supabase
    .from('payments')
    .insert([
      {
        user_id: userId,
        order_id: orderId,
        amount,
        method,
        status: 'pending'
      }
    ])
    .select()
    .single()
  
  return error ? null : data
}

export async function updatePaymentStatus(orderId: string, status: string) {
  if (!supabase) return false
  
  const { error } = await supabase
    .from('payments')
    .update({ status, paid_at: new Date().toISOString() })
    .eq('order_id', orderId)
  
  return !error
}