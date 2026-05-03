/**
 * 数据导入导出模块
 * 支持JSON格式导入导出所有用户数据
 */

import { CatProfile, WeightRecord, VaccineRecord, DewormRecord, VetVisit } from './health-records'

export interface ExportData {
  version: string
  exportedAt: string
  user: {
    name?: string
    email?: string
    dayNumber?: number
    createdAt?: string
  }
  progress: {
    dayNumber: number
    completedDays: number[]
    streakDays: number
  }
  cats: CatProfile[]
  weights: Record<string, WeightRecord[]>
  vaccines: Record<string, VaccineRecord[]>
  deworms: Record<string, DewormRecord[]>
  visits: Record<string, VetVisit[]>
  notes: Array<{
    id: string
    content: string
    type: string
    dayNumber: number
    createdAt: string
  }>
  achievements: Array<{
    id: string
    unlockedAt: string
  }>
}

// 导出所有数据
export function exportAllData(): ExportData {
  const safeStorage = {
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null
      return localStorage.getItem(key)
    }
  }

  // 用户数据
  const userStr = safeStorage.getItem('petmate-user-store')
  const user = userStr ? JSON.parse(userStr).state?.user || {} : {}

  // 进度数据
  const progressStr = safeStorage.getItem('petmate-progress-store')
  const progress = progressStr ? JSON.parse(progressStr).state || { dayNumber: 1, completedDays: [], streakDays: 0 } : { dayNumber: 1, completedDays: [], streakDays: 0 }

  // 笔记数据
  const notesStr = safeStorage.getItem('petmate-note-store')
  const notes = notesStr ? JSON.parse(notesStr).state?.notes || [] : []

  // 成就数据
  const achievementsStr = safeStorage.getItem('petmate-achievements')
  const achievements = achievementsStr ? JSON.parse(achievementsStr) || [] : []

  // 猫咪数据
  const catsStr = safeStorage.getItem('petmate_cats')
  const cats: CatProfile[] = catsStr ? JSON.parse(catsStr) : []

  // 各猫咪的健康记录
  const weights: Record<string, WeightRecord[]> = {}
  const vaccines: Record<string, VaccineRecord[]> = {}
  const deworms: Record<string, DewormRecord[]> = {}
  const visits: Record<string, VetVisit[]> = {}

  cats.forEach(cat => {
    const weightsStr = safeStorage.getItem(`petmate_weights_${cat.id}`)
    weights[cat.id] = weightsStr ? JSON.parse(weightsStr) : []

    const vaccinesStr = safeStorage.getItem(`petmate_vaccines_${cat.id}`)
    vaccines[cat.id] = vaccinesStr ? JSON.parse(vaccinesStr) : []

    const dewormsStr = safeStorage.getItem(`petmate_deworms_${cat.id}`)
    deworms[cat.id] = dewormsStr ? JSON.parse(dewormsStr) : []

    const visitsStr = safeStorage.getItem(`petmate_visits_${cat.id}`)
    visits[cat.id] = visitsStr ? JSON.parse(visitsStr) : []
  })

  return {
    version: '2.2.0',
    exportedAt: new Date().toISOString(),
    user,
    progress,
    cats,
    weights,
    vaccines,
    deworms,
    visits,
    notes,
    achievements
  }
}

// 导入数据
export function importAllData(data: ExportData): {
  success: boolean
  message: string
  imported: {
    cats: number
    notes: number
    achievements: number
  }
} {
  if (typeof window === 'undefined') {
    return { success: false, message: '只能在浏览器中导入', imported: { cats: 0, notes: 0, achievements: 0 } }
  }

  try {
    // 验证数据格式
    if (!data.version || !data.exportedAt) {
      return { success: false, message: '数据格式不正确', imported: { cats: 0, notes: 0, achievements: 0 } }
    }

    // 导入用户数据
    if (data.user) {
      localStorage.setItem('petmate-user-store', JSON.stringify({
        state: { user: data.user, isAuthenticated: true },
        version: 0
      }))
    }

    // 导入进度数据
    if (data.progress) {
      localStorage.setItem('petmate-progress-store', JSON.stringify({
        state: data.progress,
        version: 0
      }))
    }

    // 导入猫咪数据
    if (data.cats && data.cats.length > 0) {
      localStorage.setItem('petmate_cats', JSON.stringify(data.cats))

      // 导入各猫咪的健康记录
      data.cats.forEach(cat => {
        if (data.weights?.[cat.id]) {
          localStorage.setItem(`petmate_weights_${cat.id}`, JSON.stringify(data.weights[cat.id]))
        }
        if (data.vaccines?.[cat.id]) {
          localStorage.setItem(`petmate_vaccines_${cat.id}`, JSON.stringify(data.vaccines[cat.id]))
        }
        if (data.deworms?.[cat.id]) {
          localStorage.setItem(`petmate_deworms_${cat.id}`, JSON.stringify(data.deworms[cat.id]))
        }
        if (data.visits?.[cat.id]) {
          localStorage.setItem(`petmate_visits_${cat.id}`, JSON.stringify(data.visits[cat.id]))
        }
      })
    }

    // 导入笔记数据
    if (data.notes && data.notes.length > 0) {
      localStorage.setItem('petmate-note-store', JSON.stringify({
        state: { notes: data.notes },
        version: 0
      }))
    }

    // 导入成就数据
    if (data.achievements && data.achievements.length > 0) {
      localStorage.setItem('petmate-achievements', JSON.stringify(data.achievements))
    }

    return {
      success: true,
      message: '数据导入成功',
      imported: {
        cats: data.cats?.length || 0,
        notes: data.notes?.length || 0,
        achievements: data.achievements?.length || 0
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `导入失败: ${error instanceof Error ? error.message : '未知错误'}`,
      imported: { cats: 0, notes: 0, achievements: 0 }
    }
  }
}

// 下载JSON文件
export function downloadData(data: ExportData, filename: string = 'petmate_data') {
  if (typeof window === 'undefined') return

  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 从文件读取数据
export function readDataFromFile(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data)
      } catch (error) {
        reject(new Error('文件格式不正确，请确保是有效的JSON文件'))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}

// 清除所有数据
export function clearAllData(): void {
  if (typeof window === 'undefined') return

  const keysToRemove: string[] = []
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('petmate')) {
      keysToRemove.push(key)
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key))
}

// 获取存储统计
export function getStorageStats(): {
  totalKeys: number
  totalSize: string
  breakdown: Record<string, number>
} {
  if (typeof window === 'undefined') {
    return { totalKeys: 0, totalSize: '0 KB', breakdown: {} }
  }

  let totalSize = 0
  const breakdown: Record<string, number> = {}

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('petmate')) {
      const value = localStorage.getItem(key) || ''
      const size = new Blob([value]).size
      totalSize += size
      
      // 分类统计
      const category = key.replace('petmate_', '').split('_')[0]
      breakdown[category] = (breakdown[category] || 0) + size
    }
  }

  return {
    totalKeys: Object.keys(breakdown).length,
    totalSize: `${(totalSize / 1024).toFixed(2)} KB`,
    breakdown
  }
}