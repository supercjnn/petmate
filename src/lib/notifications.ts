/**
 * 通知提醒系统
 * 支持浏览器通知和应用内提醒
 */

export interface Notification {
  id: string
  type: 'health' | 'task' | 'milestone' | 'system'
  title: string
  message: string
  icon?: string
  priority: 'low' | 'medium' | 'high'
  scheduledAt?: string
  readAt?: string
  actionUrl?: string
  createdAt: string
}

// 检查浏览器通知权限
export function checkNotificationPermission(): NotificationPermission | null {
  if (typeof window === 'undefined') return null
  if (!('Notification' in window)) return null
  return Notification.permission
}

// 请求通知权限
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  if (!('Notification' in window)) return false
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

// 发送浏览器通知
export function sendBrowserNotification(
  title: string,
  options: {
    body?: string
    icon?: string
    tag?: string
    requireInteraction?: boolean
  } = {}
): boolean {
  if (typeof window === 'undefined') return false
  if (Notification.permission !== 'granted') return false
  
  const notification = new Notification(title, {
    body: options.body || '',
    icon: options.icon || '/icon-192x192.png',
    tag: options.tag,
    requireInteraction: options.requireInteraction || false
  })
  
  notification.onclick = () => {
    window.focus()
    notification.close()
  }
  
  return true
}

// 保存通知到本地
export function saveNotification(notification: Notification): void {
  if (typeof window === 'undefined') return
  
  const notifications = getAllNotifications()
  notifications.unshift(notification)
  
  // 只保留最近100条
  if (notifications.length > 100) {
    notifications.splice(100)
  }
  
  localStorage.setItem('petmate_notifications', JSON.stringify(notifications))
}

// 获取所有通知
export function getAllNotifications(): Notification[] {
  if (typeof window === 'undefined') return []
  
  const data = localStorage.getItem('petmate_notifications')
  return data ? JSON.parse(data) : []
}

// 获取未读通知
export function getUnreadNotifications(): Notification[] {
  return getAllNotifications().filter(n => !n.readAt)
}

// 标记通知为已读
export function markNotificationRead(id: string): void {
  if (typeof window === 'undefined') return
  
  const notifications = getAllNotifications()
  const index = notifications.findIndex(n => n.id === id)
  
  if (index >= 0) {
    notifications[index].readAt = new Date().toISOString()
    localStorage.setItem('petmate_notifications', JSON.stringify(notifications))
  }
}

// 标记所有通知为已读
export function markAllNotificationsRead(): void {
  if (typeof window === 'undefined') return
  
  const notifications = getAllNotifications()
  notifications.forEach(n => {
    if (!n.readAt) {
      n.readAt = new Date().toISOString()
    }
  })
  
  localStorage.setItem('petmate_notifications', JSON.stringify(notifications))
}

// 删除通知
export function deleteNotification(id: string): void {
  if (typeof window === 'undefined') return
  
  const notifications = getAllNotifications().filter(n => n.id !== id)
  localStorage.setItem('petmate_notifications', JSON.stringify(notifications))
}

// 创建健康提醒通知
export function createHealthNotification(
  type: 'vaccine' | 'deworm' | 'checkup' | 'weight',
  catName: string,
  dueDate: string
): Notification {
  const titles: Record<string, string> = {
    vaccine: '疫苗接种提醒',
    deworm: '驱虫提醒',
    checkup: '复查提醒',
    weight: '体重记录提醒'
  }
  
  const messages: Record<string, string> = {
    vaccine: `${catName}需要接种���苗`,
    deworm: `${catName}需要进行驱虫`,
    checkup: `${catName}需要复查`,
    weight: `该给${catName}记录体重了`
  }
  
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type: 'health',
    title: titles[type],
    message: messages[type],
    icon: '🐱',
    priority: type === 'checkup' || type === 'vaccine' ? 'high' : 'medium',
    scheduledAt: dueDate,
    actionUrl: '/health',
    createdAt: new Date().toISOString()
  }
  
  saveNotification(notification)
  
  // 发送浏览器通知
  sendBrowserNotification(notification.title, {
    body: notification.message,
    tag: `health_${type}_${catName}`
  })
  
  return notification
}

// 创建里程碑通知
export function createMilestoneNotification(
  dayNumber: number,
  title: string,
  message: string
): Notification {
  const notification: Notification = {
    id: `notif_milestone_${dayNumber}`,
    type: 'milestone',
    title,
    message,
    icon: '🏆',
    priority: 'medium',
    actionUrl: '/dashboard',
    createdAt: new Date().toISOString()
  }
  
  saveNotification(notification)
  
  sendBrowserNotification(title, {
    body: message,
    tag: `milestone_${dayNumber}`
  })
  
  return notification
}

// 创建每日提醒
export function createDailyReminder(): void {
  if (typeof window === 'undefined') return
  
  // 检查今天是否已经提醒过
  const today = new Date().toLocaleDateString('zh-CN')
  const dailyReminderKey = `petmate_daily_reminder_${today}`
  
  if (localStorage.getItem(dailyReminderKey)) return
  
  const progressStr = localStorage.getItem('petmate-progress-store')
  const progress = progressStr ? JSON.parse(progressStr).state : null
  
  if (!progress) return
  
  const dayNumber = progress.dayNumber || 1
  
  createMilestoneNotification(
    dayNumber,
    '今日养猫提醒',
    `第${dayNumber}天的养猫任务，快来查看今天的内容吧！`
  )
  
  localStorage.setItem(dailyReminderKey, 'true')
}

// 设置定时检查健康提醒
export function setupHealthReminderChecks(): void {
  if (typeof window === 'undefined') return
  
  // 每小时检查一次待处理的健康提醒
  setInterval(() => {
    const alertsStr = localStorage.getItem('petmate_health_alerts')
    const alerts = alertsStr ? JSON.parse(alertsStr) : []
    
    const now = new Date()
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    
    alerts.forEach((alert: any) => {
      if (alert.status !== 'pending') return
      
      const dueDate = new Date(alert.dueDate)
      
      // 如果明天到期，发送提醒
      if (dueDate <= tomorrow && dueDate > now) {
        const catsStr = localStorage.getItem('petmate_cats')
        const cats = catsStr ? JSON.parse(catsStr) : []
        const cat = cats.find((c: any) => c.id === alert.catId)
        
        if (cat) {
          createHealthNotification(
            alert.type,
            cat.name,
            alert.dueDate
          )
        }
      }
    })
  }, 60 * 60 * 1000) // 每小时
}

// 获取通知统计
export function getNotificationStats(): {
  total: number
  unread: number
  byType: Record<string, number>
  byPriority: Record<string, number>
} {
  const notifications = getAllNotifications()
  
  return {
    total: notifications.length,
    unread: notifications.filter(n => !n.readAt).length,
    byType: {
      health: notifications.filter(n => n.type === 'health').length,
      task: notifications.filter(n => n.type === 'task').length,
      milestone: notifications.filter(n => n.type === 'milestone').length,
      system: notifications.filter(n => n.type === 'system').length
    },
    byPriority: {
      high: notifications.filter(n => n.priority === 'high').length,
      medium: notifications.filter(n => n.priority === 'medium').length,
      low: notifications.filter(n => n.priority === 'low').length
    }
  }
}