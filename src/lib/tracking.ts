// 数据埋点系统

export interface TrackEvent {
  name: string
  category: 'user' | 'content' | 'conversion' | 'engagement'
  properties?: Record<string, any>
  timestamp: number
  userId?: string
  sessionId?: string
}

// 事件定义
export const EVENTS = {
  // 用户行为
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FORM_SUBMIT: 'form_submit',
  
  // 内容消费
  CARD_VIEW: 'card_view',
  ACTION_COMPLETE: 'action_complete',
  AI_ASK: 'ai_ask',
  NOTE_CREATE: 'note_create',
  
  // 转化漏斗
  SIGNUP_START: 'signup_start',
  SIGNUP_COMPLETE: 'signup_complete',
  PAYMENT_START: 'payment_start',
  PAYMENT_COMPLETE: 'payment_complete',
  
  // 用户参与
  SHARE_CLICK: 'share_click',
  ACHIEVEMENT_UNLOCK: 'achievement_unlock',
  REMINDER_SET: 'reminder_set',
  STREAK_MILESTONE: 'streak_milestone'
}

// 本地存储Key
const TRACKING_KEY = 'petmate_tracking'
const SESSION_KEY = 'petmate_session'

// 获取或创建Session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY)
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    sessionStorage.setItem(SESSION_KEY, sessionId)
  }
  return sessionId
}

// 获取用户ID
function getUserId(): string | undefined {
  const userData = localStorage.getItem('petmate_user')
  if (userData) {
    const user = JSON.parse(userData)
    return user.id
  }
  return undefined
}

// 记录事件
export function track(
  name: string,
  category: TrackEvent['category'],
  properties?: Record<string, any>
): void {
  const event: TrackEvent = {
    name,
    category,
    properties,
    timestamp: Date.now(),
    userId: getUserId(),
    sessionId: getSessionId()
  }
  
  // 存储到本地
  saveEvent(event)
  
  // 开发环境日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[Track]', name, properties)
  }
  
  // TODO: 发送到分析服务
  // sendToAnalytics(event)
}

// 保存事件到本地
function saveEvent(event: TrackEvent): void {
  try {
    const data = localStorage.getItem(TRACKING_KEY)
    const events: TrackEvent[] = data ? JSON.parse(data) : []
    
    events.push(event)
    
    // 只保留最近1000条
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }
    
    localStorage.setItem(TRACKING_KEY, JSON.stringify(events))
  } catch (e) {
    console.error('Failed to save event:', e)
  }
}

// 获取所有事件
export function getEvents(limit: number = 100): TrackEvent[] {
  try {
    const data = localStorage.getItem(TRACKING_KEY)
    const events: TrackEvent[] = data ? JSON.parse(data) : []
    return events.slice(-limit)
  } catch {
    return []
  }
}

// 页面浏览追踪
export function trackPageView(pageName: string): void {
  track(EVENTS.PAGE_VIEW, 'user', { page: pageName })
}

// 按钮点击追踪
export function trackButtonClick(buttonName: string, page?: string): void {
  track(EVENTS.BUTTON_CLICK, 'user', { button: buttonName, page })
}

// 行动卡查看
export function trackCardView(dayNumber: number): void {
  track(EVENTS.CARD_VIEW, 'content', { day: dayNumber })
}

// 行动完成
export function trackActionComplete(dayNumber: number, actionText: string): void {
  track(EVENTS.ACTION_COMPLETE, 'content', { 
    day: dayNumber, 
    action: actionText.slice(0, 50) 
  })
}

// AI提问
export function trackAIAsk(question: string, hasAnswer: boolean): void {
  track(EVENTS.AI_ASK, 'content', { 
    question: question.slice(0, 50),
    hasAnswer 
  })
}

// 笔记创建
export function trackNoteCreate(dayNumber: number): void {
  track(EVENTS.NOTE_CREATE, 'content', { day: dayNumber })
}

// 注册开始
export function trackSignupStart(method: 'phone' | 'guest'): void {
  track(EVENTS.SIGNUP_START, 'conversion', { method })
}

// 注册完成
export function trackSignupComplete(method: 'phone' | 'guest'): void {
  track(EVENTS.SIGNUP_COMPLETE, 'conversion', { method })
}

// 支付开始
export function trackPaymentStart(amount: number): void {
  track(EVENTS.PAYMENT_START, 'conversion', { amount })
}

// 支付完成
export function trackPaymentComplete(amount: number, method: string): void {
  track(EVENTS.PAYMENT_COMPLETE, 'conversion', { amount, method })
}

// 分享点击
export function trackShareClick(platform: string, contentType: string): void {
  track(EVENTS.SHARE_CLICK, 'engagement', { platform, contentType })
}

// 成就解锁
export function trackAchievementUnlock(achievementId: string, achievementName: string): void {
  track(EVENTS.ACHIEVEMENT_UNLOCK, 'engagement', { 
    achievementId, 
    achievementName 
  })
}

// 提醒设置
export function trackReminderSet(time: string): void {
  track(EVENTS.REMINDER_SET, 'engagement', { time })
}

// 连续打卡里程碑
export function trackStreakMilestone(days: number): void {
  track(EVENTS.STREAK_MILESTONE, 'engagement', { days })
}

// 分析报告生成
export function generateAnalyticsReport(): {
  totalEvents: number
  eventsByCategory: Record<string, number>
  eventsByName: Record<string, number>
  dailyActive: string[]
  conversionFunnel: Record<string, number>
} {
  const events = getEvents(1000)
  
  const eventsByCategory: Record<string, number> = {}
  const eventsByName: Record<string, number> = {}
  const activeDays = new Set<string>()
  const conversionFunnel: Record<string, number> = {}
  
  for (const event of events) {
    // 按类别统计
    eventsByCategory[event.category] = (eventsByCategory[event.category] || 0) + 1
    
    // 按事件名统计
    eventsByName[event.name] = (eventsByName[event.name] || 0) + 1
    
    // 活跃天数
    const day = new Date(event.timestamp).toLocaleDateString()
    activeDays.add(day)
    
    // 转化漏斗
    if (event.category === 'conversion') {
      conversionFunnel[event.name] = (conversionFunnel[event.name] || 0) + 1
    }
  }
  
  return {
    totalEvents: events.length,
    eventsByCategory,
    eventsByName,
    dailyActive: Array.from(activeDays).slice(-7),
    conversionFunnel
  }
}