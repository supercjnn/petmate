/**
 * 数据迁移工具
 * localStorage → Supabase
 */

import { db, UserData } from './database'

export interface LocalStorageData {
  dayNumber?: number
  history?: Record<number, string[]>
  notes?: Record<number, any[]>
  settings?: any
  catName?: string
  catBreed?: string
  catBirthDate?: string
  isPaid?: boolean
}

/**
 * 从localStorage读取数据
 */
export function loadFromLocalStorage(): LocalStorageData | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem('petmate_user')
    if (!stored) return null

    return JSON.parse(stored)
  } catch (error) {
    console.error('读取localStorage失败:', error)
    return null
  }
}

/**
 * 保存到localStorage（降级方案）
 */
export function saveToLocalStorage(data: LocalStorageData): boolean {
  if (typeof window === 'undefined') return false

  try {
    localStorage.setItem('petmate_user', JSON.stringify(data))
    return true
  } catch (error) {
    console.error('保存localStorage失败:', error)
    return false
  }
}

/**
 * 清空localStorage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('petmate_user')
  localStorage.removeItem('petmate_token')
}

/**
 * 迁移数据到Supabase
 */
export async function migrateToSupabase(userId: string): Promise<{
  success: boolean
  migrated: {
    historyRecords: number
    notes: number
  }
  errors: string[]
}> {
  const result = {
    success: true,
    migrated: {
      historyRecords: 0,
      notes: 0
    },
    errors: [] as string[]
  }

  const localData = loadFromLocalStorage()
  if (!localData) {
    return { ...result, success: false }
  }

  db.setUserId(userId)

  try {
    // 迁移历史记录
    if (localData.history) {
      for (const [day, actions] of Object.entries(localData.history)) {
        const success = await db.saveDayRecord(Number(day), actions as string[])
        if (success) {
          result.migrated.historyRecords++
        } else {
          result.errors.push(`Day ${day} 历史记录迁移失败`)
        }
      }
    }

    // 迁移笔记
    if (localData.notes) {
      for (const [day, notes] of Object.entries(localData.notes)) {
        for (const note of notes as any[]) {
          const saved = await db.addNote(Number(day), {
            content: note.content,
            type: note.type || 'observation',
            mood: note.mood,
            tags: note.tags
          })

          if (saved) {
            result.migrated.notes++
          } else {
            result.errors.push(`Day ${day} 笔记迁移失败`)
          }
        }
      }
    }

    // 迁移用户设置
    if (localData.settings) {
      await db.updateUser({
        settings: localData.settings
      } as Partial<UserData>)
    }

    // 迁移猫咪信息
    if (localData.catName || localData.catBreed) {
      await db.updateUser({
        catName: localData.catName,
        catBreed: localData.catBreed,
        catBirthDate: localData.catBirthDate
      } as Partial<UserData>)
    }

    // 清空localStorage
    if (result.migrated.historyRecords > 0 || result.migrated.notes > 0) {
      console.log('迁移成功，清空localStorage')
      // 暂不清空，保留一份备份
      // clearLocalStorage()
    }

  } catch (error) {
    result.success = false
    result.errors.push(`迁移过程出错: ${error}`)
  }

  return result
}

/**
 * 检查是否需要迁移
 */
export function checkMigrationStatus(): {
  hasLocalData: boolean
  needsMigration: boolean
  localDataSize: string
} {
  if (typeof window === 'undefined') {
    return { hasLocalData: false, needsMigration: false, localDataSize: '0KB' }
  }

  const stored = localStorage.getItem('petmate_user')

  if (!stored) {
    return { hasLocalData: false, needsMigration: false, localDataSize: '0KB' }
  }

  const data = JSON.parse(stored)
  const hasHistory = data.history && Object.keys(data.history).length > 0
  const hasNotes = data.notes && Object.keys(data.notes).length > 0

  const sizeInBytes = new Blob([stored]).size
  const sizeInKB = (sizeInBytes / 1024).toFixed(2)

  return {
    hasLocalData: true,
    needsMigration: hasHistory || hasNotes,
    localDataSize: `${sizeInKB}KB`
  }
}

/**
 * 创建数据备份
 */
export function createBackup(): string {
  const localData = loadFromLocalStorage()
  if (!localData) return ''

  const backup = {
    version: '1.8.0',
    exportedAt: new Date().toISOString(),
    data: localData
  }

  return JSON.stringify(backup, null, 2)
}

/**
 * 恢复数据
 */
export async function restoreFromBackup(backupJson: string): Promise<boolean> {
  try {
    const backup = JSON.parse(backupJson)

    if (!backup.data) {
      throw new Error('备份数据格式错误')
    }

    saveToLocalStorage(backup.data)

    return true
  } catch (error) {
    console.error('恢复备份失败:', error)
    return false
  }
}

/**
 * 导出为JSON文件
 */
export function downloadAsFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return

  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()

  URL.revokeObjectURL(url)
}
