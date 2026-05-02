import { NextRequest, NextResponse } from 'next/server'
import { 
  supabase, 
  isSupabaseConfigured, 
  createPaymentRecord, 
  updatePaymentStatus 
} from '@/lib/supabase'

// MVP阶段：内存存储作为fallback
interface PaymentRecord {
  id: string
  userId: string
  orderId: string
  amount: number
  method: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paidAt?: string
  createdAt: string
}

const payments: Map<string, PaymentRecord> = new Map() // orderId -> payment

// 生成订单ID
function generateOrderId(): string {
  return 'PM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
}

// POST: 创建支付记录 / 更新支付状态
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, amount, method, orderId, status } = body
    
    if (action === 'create') {
      // 创建支付记录
      if (!userId || !amount || !method) {
        return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
      }
      
      const newOrderId = generateOrderId()
      
      // Supabase 模式
      if (isSupabaseConfigured() && supabase) {
        const payment = await createPaymentRecord(userId, newOrderId, amount, method)
        
        if (!payment) {
          console.error('Supabase 创建支付记录失败')
          // 降级到内存
          return await handlePaymentCreateMemory(userId, newOrderId, amount, method)
        }
        
        return NextResponse.json({
          success: true,
          data: { 
            orderId: newOrderId,
            payment
          },
          message: '支付记录创建成功（Supabase）'
        })
      }
      
      // 内存存储模式
      return await handlePaymentCreateMemory(userId, newOrderId, amount, method)
    }
    
    if (action === 'update') {
      // 更新支付状态
      if (!orderId || !status) {
        return NextResponse.json({ success: false, error: '缺少参数' }, { status: 400 })
      }
      
      // Supabase 模式
      if (isSupabaseConfigured() && supabase) {
        const success = await updatePaymentStatus(orderId, status)
        
        if (!success) {
          console.error('Supabase 更新支付状态失败')
          // 降级到内存
          const payment = payments.get(orderId)
          if (payment) {
            payment.status = status
            if (status === 'paid') {
              payment.paidAt = new Date().toISOString()
            }
          }
        }
        
        // 同时更新用户支付状态
        if (status === 'paid') {
          const { data: payment } = await supabase
            .from('payments')
            .select('user_id')
            .eq('order_id', orderId)
            .single()
          
          if (payment) {
            await supabase
              .from('users')
              .update({ 
                is_paid: true, 
                paid_at: new Date().toISOString(),
                paid_amount: amount,
                payment_method: method
              })
              .eq('id', payment.user_id)
          }
        }
        
        return NextResponse.json({
          success: true,
          message: '支付状态更新成功（Supabase）'
        })
      }
      
      // 内存存储模式
      const payment = payments.get(orderId)
      if (!payment) {
        return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })
      }
      
      payment.status = status
      if (status === 'paid') {
        payment.paidAt = new Date().toISOString()
      }
      
      return NextResponse.json({
        success: true,
        message: '支付状态更新成功'
      })
    }
    
    return NextResponse.json({ success: false, error: '未知操作' }, { status: 400 })
  } catch (error) {
    console.error('Payment API 错误:', error)
    return NextResponse.json({ success: false, error: '服务器错误' }, { status: 500 })
  }
}

// 内存支付记录创建
async function handlePaymentCreateMemory(userId: string, orderId: string, amount: number, method: string) {
  const payment: PaymentRecord = {
    id: 'pay_' + Date.now().toString(36),
    userId,
    orderId,
    amount,
    method,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  
  payments.set(orderId, payment)
  
  return NextResponse.json({
    success: true,
    data: { 
      orderId,
      payment
    },
    message: '支付记录创建成功'
  })
}

// GET: 查询支付记录
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const orderId = searchParams.get('orderId')
  const userId = searchParams.get('userId')
  
  // Supabase 模式
  if (isSupabaseConfigured() && supabase) {
    if (orderId) {
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('order_id', orderId)
        .single()
      
      if (error || !payment) {
        return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })
      }
      
      return NextResponse.json({
        success: true,
        data: { payment }
      })
    }
    
    if (userId) {
      const { data: userPayments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      
      if (error) {
        return NextResponse.json({ success: false, error: '查询失败' }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        data: { payments: userPayments }
      })
    }
    
    return NextResponse.json({ success: false, error: '缺少查询参数' }, { status: 400 })
  }
  
  // 内存存储模式
  if (orderId) {
    const payment = payments.get(orderId)
    if (!payment) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: { payment }
    })
  }
  
  if (userId) {
    const userPayments = Array.from(payments.values())
      .filter(p => p.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    return NextResponse.json({
      success: true,
      data: { payments: userPayments }
    })
  }
  
  return NextResponse.json({ success: false, error: '缺少查询参数' }, { status: 400 })
}