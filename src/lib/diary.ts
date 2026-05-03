/**
 * 日记打卡系统
 * 记录每日养猫活动和里程碑
 */

export interface DiaryEntry {
  id: string
  dayNumber: number
  date: string
  type: 'task' | 'observation' | 'milestone' | 'photo' | 'note'
  content: string
  mood?: 'happy' | 'neutral' | 'worried' | 'proud'
  photos?: string[]
  catId?: string
  tags?: string[]
  createdAt: string
}

export interface DailyCheckIn {
  id: string
  dayNumber: number
  date: string
  completedTasks: string[]
  mood: 'happy' | 'neutral' | 'worried' | 'proud'
  notes?: string
  photoUrl?: string
  createdAt: string
}

// 创建日记条目
export function createDiaryEntry(data: Omit<DiaryEntry, 'id' | 'createdAt'>): DiaryEntry {
  const entry: DiaryEntry = {
    ...data,
    id: `diary_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  }

  saveDiaryEntry(entry)
  return entry
}

// 保存日记条目
function saveDiaryEntry(entry: DiaryEntry): void {
  if (typeof window === 'undefined') return

  const entries = getAllDiaryEntries()
  entries.unshift(entry)

  // 只保留最近365条
  if (entries.length > 365) {
    entries.splice(365)
  }

  localStorage.setItem('petmate_diaries', JSON.stringify(entries))
}

// 获取所有日记
export function getAllDiaryEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem('petmate_diaries')
  return data ? JSON.parse(data) : []
}

// 获取指定天数的日记
export function getDiaryByDay(dayNumber: number): DiaryEntry[] {
  return getAllDiaryEntries().filter(e => e.dayNumber === dayNumber)
}

// 获取指定日期的日记
export function getDiaryByDate(date: string): DiaryEntry[] {
  return getAllDiaryEntries().filter(e => e.date === date)
}

// 创建每日打卡
export function createCheckIn(data: Omit<DailyCheckIn, 'id' | 'createdAt'>): DailyCheckIn {
  const checkIn: DailyCheckIn = {
    ...data,
    id: `checkin_${Date.now()}`,
    createdAt: new Date().toISOString()
  }

  saveCheckIn(checkIn)

  // 更新进度
  updateProgress(data.dayNumber)

  return checkIn
}

// 保存打卡记录
function saveCheckIn(checkIn: DailyCheckIn): void {
  if (typeof window === 'undefined') return

  const checkIns = getAllCheckIns()
  
  // 检查是否已有当天的打卡
  const existingIndex = checkIns.findIndex(c => c.dayNumber === checkIn.dayNumber)
  
  if (existingIndex >= 0) {
    checkIns[existingIndex] = checkIn
  } else {
    checkIns.unshift(checkIn)
  }

  localStorage.setItem('petmate_checkins', JSON.stringify(checkIns))
}

// 获取所有打卡
export function getAllCheckIns(): DailyCheckIn[] {
  if (typeof window === 'undefined') return []

  const data = localStorage.getItem('petmate_checkins')
  return data ? JSON.parse(data) : []
}

// 获取今天的打卡
export function getTodayCheckIn(): DailyCheckIn | null {
  const today = new Date().toLocaleDateString('zh-CN')
  return getAllCheckIns().find(c => c.date === today) || null
}

// 更新进度
function updateProgress(dayNumber: number): void {
  if (typeof window === 'undefined') return

  const progressStr = localStorage.getItem('petmate-progress-store')
  const progress = progressStr ? JSON.parse(progressStr).state : { dayNumber: 1, completedDays: [], streakDays: 0 }

  if (!progress.completedDays.includes(dayNumber)) {
    progress.completedDays.push(dayNumber)
    progress.streakDays = progress.completedDays.length

    // 自动推进天数
    if (dayNumber === progress.dayNumber) {
      progress.dayNumber = Math.min(90, dayNumber + 1)
    }

    localStorage.setItem('petmate-progress-store', JSON.stringify({ state: progress, version: 0 }))
  }
}

// 获取连续打卡天数
export function getStreakDays(): number {
  const checkIns = getAllCheckIns().sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  if (checkIns.length === 0) return 0

  let streak = 0
  const today = new Date()

  for (let i = 0; i < checkIns.length; i++) {
    const checkInDate = new Date(checkIns[i].date)
    const expectedDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)

    if (checkInDate.toLocaleDateString('zh-CN') === expectedDate.toLocaleDateString('zh-CN')) {
      streak++
    } else {
      break
    }
  }

  return streak
}

// 获取日记统计
export function getDiaryStats(): {
  totalEntries: number
  totalCheckIns: number
  streakDays: number
  byMood: Record<string, number>
  byType: Record<string, number>
} {
  const entries = getAllDiaryEntries()
  const checkIns = getAllCheckIns()

  return {
    totalEntries: entries.length,
    totalCheckIns: checkIns.length,
    streakDays: getStreakDays(),
    byMood: {
      happy: entries.filter(e => e.mood === 'happy').length + checkIns.filter(c => c.mood === 'happy').length,
      neutral: entries.filter(e => e.mood === 'neutral').length + checkIns.filter(c => c.mood === 'neutral').length,
      worried: entries.filter(e => e.mood === 'worried').length + checkIns.filter(c => c.mood === 'worried').length,
      proud: entries.filter(e => e.mood === 'proud').length + checkIns.filter(c => c.mood === 'proud').length
    },
    byType: {
      task: entries.filter(e => e.type === 'task').length,
      observation: entries.filter(e => e.type === 'observation').length,
      milestone: entries.filter(e => e.type === 'milestone').length,
      photo: entries.filter(e => e.type === 'photo').length,
      note: entries.filter(e => e.type === 'note').length
    }
  }
}

// 导出日记数据
export function exportDiaryData(): string {
  const entries = getAllDiaryEntries()
  const checkIns = getAllCheckIns()

  return JSON.stringify({
    entries,
    checkIns,
    stats: getDiaryStats(),
    exportedAt: new Date().toISOString()
  }, null, 2)
}