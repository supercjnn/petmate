// 智能提醒系统

export interface Reminder {
  id: string
  type: 'daily' | 'vaccine' | 'checkup' | 'custom'
  title: string
  message: string
  scheduledTime: string // HH:mm
  dayNumber?: number
  recurring: boolean
  enabled: boolean
  createdAt: string
}

export interface SmartReminder extends Reminder {
  priority: 'high' | 'medium' | 'low'
  condition?: () => boolean // 触发条件
}

// 默认提醒
export const DEFAULT_REMINDERS: Omit<Reminder, 'id' | 'createdAt'>[] = [
  {
    type: 'daily',
    title: '今日行动卡',
    message: '今天的行动卡已准备好，来看看今天该做什么吧！',
    scheduledTime: '09:00',
    recurring: true,
    enabled: true
  },
  {
    type: 'vaccine',
    title: '疫苗提醒',
    message: '猫咪到了接种时间，记得预约哦',
    scheduledTime: '10:00',
    recurring: false,
    enabled: true
  }
]

// 获取所有提醒
export function getReminders(): Reminder[] {
  const data = localStorage.getItem('petmate_reminders')
  if (data) {
    return JSON.parse(data)
  }
  
  // 初始化默认提醒
  const defaults = DEFAULT_REMINDERS.map((r, i) => ({
    ...r,
    id: `reminder_${i}`,
    createdAt: new Date().toISOString()
  }))
  
  localStorage.setItem('petmate_reminders', JSON.stringify(defaults))
  return defaults
}

// 添加提醒
export function addReminder(reminder: Omit<Reminder, 'id' | 'createdAt'>): Reminder {
  const reminders = getReminders()
  
  const newReminder: Reminder = {
    ...reminder,
    id: `reminder_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  reminders.push(newReminder)
  localStorage.setItem('petmate_reminders', JSON.stringify(reminders))
  
  return newReminder
}

// 更新提醒
export function updateReminder(id: string, updates: Partial<Reminder>): boolean {
  const reminders = getReminders()
  const index = reminders.findIndex(r => r.id === id)
  
  if (index >= 0) {
    reminders[index] = { ...reminders[index], ...updates }
    localStorage.setItem('petmate_reminders', JSON.stringify(reminders))
    return true
  }
  return false
}

// 删除提醒
export function deleteReminder(id: string): boolean {
  const reminders = getReminders()
  const filtered = reminders.filter(r => r.id !== id)
  
  if (filtered.length < reminders.length) {
    localStorage.setItem('petmate_reminders', JSON.stringify(filtered))
    return true
  }
  return false
}

// 智能提醒生成
export function generateSmartReminders(
  dayNumber: number,
  userProgress: { completedDays: number[]; streak: number },
  catHealth: { nextVaccine?: string; lastWeight?: number }
): SmartReminder[] {
  const reminders: SmartReminder[] = []
  
  // 1. 连续打卡激励
  if (userProgress.streak > 0 && userProgress.streak % 7 === 0) {
    reminders.push({
      id: `streak_${userProgress.streak}`,
      type: 'daily',
      title: '🎉 连续打卡成就',
      message: `太棒了！你已经坚持${userProgress.streak}天了！继续保持！`,
      scheduledTime: '09:00',
      recurring: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      priority: 'medium'
    })
  }
  
  // 2. 里程碑提醒
  const milestones = [7, 15, 30, 60, 90]
  if (milestones.includes(dayNumber)) {
    reminders.push({
      id: `milestone_${dayNumber}`,
      type: 'daily',
      title: `🏆 Day ${dayNumber}里程碑`,
      message: `恭喜完成${dayNumber}天守护！新的阶段开始了`,
      scheduledTime: '09:00',
      recurring: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      priority: 'high'
    })
  }
  
  // 3. 疫苗提醒
  if (catHealth.nextVaccine) {
    const vaccineDate = new Date(catHealth.nextVaccine)
    const today = new Date()
    const daysUntil = Math.ceil((vaccineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil <= 7 && daysUntil > 0) {
      reminders.push({
        id: 'vaccine_upcoming',
        type: 'vaccine',
        title: '💉 疫苗提醒',
        message: `${daysUntil}天后需要接种疫苗，记得提前预约`,
        scheduledTime: '10:00',
        recurring: false,
        enabled: true,
        createdAt: new Date().toISOString(),
        priority: 'high'
      })
    }
  }
  
  // 4. 进度滞后提醒
  const expectedDay = Math.ceil((Date.now() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  if (dayNumber < expectedDay - 2) {
    reminders.push({
      id: 'progress_catchup',
      type: 'daily',
      title: '⏰ 进度提醒',
      message: '你已经落后计划几天了，今天来补上吧！',
      scheduledTime: '20:00',
      recurring: false,
      enabled: true,
      createdAt: new Date().toISOString(),
      priority: 'medium'
    })
  }
  
  return reminders
}

// 浏览器通知
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false
  }
  
  if (Notification.permission === 'granted') {
    return true
  }
  
  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendBrowserNotification(title: string, body: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: 'petmate-reminder',
      requireInteraction: false
    })
  }
}

// 定时检查提醒
export function startReminderCheck(): void {
  setInterval(() => {
    const now = new Date()
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    const reminders = getReminders().filter(r => r.enabled && r.scheduledTime === currentTime)
    
    for (const reminder of reminders) {
      sendBrowserNotification(reminder.title, reminder.message)
    }
  }, 60000) // 每分钟检查
}