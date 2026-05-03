/**
 * 状态管理 - Zustand
 * 替代localStorage和分散的状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { db, UserData, NoteData, UserSettings } from '@/lib/database'
import { HealthRecord, defaultHealthRecord } from '@/lib/health-records'
import { AchievementState, defaultAchievementState, checkAllAchievements, showAchievementNotification } from '@/lib/achievements-full'

// ============ 用户状态 ============

interface UserState {
  user: UserData | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean

  // Actions
  login: (user: UserData, token: string) => void
  logout: () => void
  updateUser: (updates: Partial<UserData>) => Promise<void>
  syncFromDatabase: () => Promise<void>
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: (user, token) => {
        set({ user, token, isAuthenticated: true })
        if (user.id) {
          db.setUserId(user.id)
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
        localStorage.removeItem('petmate_user')
        localStorage.removeItem('petmate_token')
      },

      updateUser: async (updates) => {
        const { user } = get()
        if (!user) return

        const updatedUser = { ...user, ...updates }
        set({ user: updatedUser })

        if (user.id) {
          await db.updateUser(updates)
        }
      },

      syncFromDatabase: async () => {
        const { user } = get()
        if (!user?.id) return

        set({ isLoading: true })

        try {
          const dbUser = await db.getUser()
          if (dbUser) {
            set({ user: dbUser })
          }
        } catch (error) {
          console.error('同步失败:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'petmate-user',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// ============ 进度状态 ============

interface ProgressState {
  currentDay: number
  completedDays: number[]
  completedActions: string[] // 当天完成的行动
  history: Record<number, string[]>

  // Actions
  setCurrentDay: (day: number) => void
  toggleAction: (action: string) => void
  completeDay: () => Promise<void>
  loadHistory: () => Promise<void>
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      currentDay: 1,
      completedDays: [],
      completedActions: [],
      history: {},
      setCurrentDay: (day) => set({ currentDay: day, completedActions: [] }),

      toggleAction: (action) => {
        const { completedActions } = get()
        const exists = completedActions.includes(action)

        if (exists) {
          set({ completedActions: completedActions.filter(a => a !== action) })
        } else {
          set({ completedActions: [...completedActions, action] })
        }
      },

      completeDay: async () => {
        const { currentDay, completedActions, history, completedDays } = get()
        const user = useUserStore.getState().user

        // 保存到历史
        const newHistory = { ...history, [currentDay]: completedActions }
        set({
          history: newHistory,
          completedDays: [...completedDays, currentDay],
          currentDay: currentDay + 1,
          completedActions: []
        })

        // 同步到数据库
        if (user?.id) {
          await db.saveDayRecord(currentDay, completedActions)
        }

        // 更新用户总天数
        await useUserStore.getState().updateUser({
          currentDay: currentDay + 1,
          totalDaysCompleted: completedDays.length + 1
        })
      },

      loadHistory: async () => {
        const user = useUserStore.getState().user
        if (!user?.id) return

        try {
          const history = await db.getHistory()
          set({
            history,
            completedDays: Object.keys(history).map(Number)
          })
        } catch (error) {
          console.error('加载历史失败:', error)
        }
      }
    }),
    {
      name: 'petmate-progress'
    }
  )
)

// ============ 笔记状态 ============

interface NoteState {
  notes: Record<number, NoteData[]>
  currentNoteContent: string

  // Actions
  addNote: (day: number, note: Omit<NoteData, 'id' | 'createdAt'>) => Promise<void>
  deleteNote: (noteId: string) => Promise<void>
  loadNotes: () => Promise<void>
  setCurrentNoteContent: (content: string) => void
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: {},
      currentNoteContent: '',

      addNote: async (day, note) => {
        const user = useUserStore.getState().user
        if (!user?.id) return

        const savedNote = await db.addNote(day, note)

        if (savedNote) {
          const { notes } = get()
          const dayNotes = notes[day] || []
          set({ notes: { ...notes, [day]: [...dayNotes, savedNote] } })
        }
      },

      deleteNote: async (noteId) => {
        const user = useUserStore.getState().user
        if (!user?.id) return

        await db.deleteNote(noteId)

        const { notes } = get()
        const updatedNotes: Record<number, NoteData[]> = {}

        for (const [day, dayNotes] of Object.entries(notes)) {
          updatedNotes[Number(day)] = dayNotes.filter(n => n.id !== noteId)
        }

        set({ notes: updatedNotes })
      },

      loadNotes: async () => {
        const user = useUserStore.getState().user
        if (!user?.id) return

        try {
          const notes = await db.getAllNotes()
          set({ notes })
        } catch (error) {
          console.error('加载笔记失败:', error)
        }
      },

      setCurrentNoteContent: (content) => set({ currentNoteContent: content })
    }),
    {
      name: 'petmate-notes'
    }
  )
)

// ============ 健康档案状态 ============

interface HealthState {
  healthRecord: HealthRecord
  isLoading: boolean

  // Actions
  addWeightRecord: (weight: number, note?: string) => Promise<void>
  addVaccinationRecord: (record: any) => Promise<void>
  addDewormingRecord: (record: any) => Promise<void>
  loadHealthRecords: () => Promise<void>
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      healthRecord: defaultHealthRecord,
      isLoading: false,

      addWeightRecord: async (weight, note) => {
        const { healthRecord } = get()
        const newRecord = {
          id: `weight_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          weight,
          note,
          createdAt: new Date().toISOString()
        }

        const updated = {
          ...healthRecord,
          weightRecords: [...healthRecord.weightRecords, newRecord]
        }

        set({ healthRecord: updated })

        await db.updateHealthRecords(updated)
      },

      addVaccinationRecord: async (record) => {
        const { healthRecord } = get()
        const newRecord = {
          id: `vaccine_${Date.now()}`,
          ...record,
          createdAt: new Date().toISOString()
        }

        const updated = {
          ...healthRecord,
          vaccinationRecords: [...healthRecord.vaccinationRecords, newRecord]
        }

        set({ healthRecord: updated })
        await db.updateHealthRecords(updated)
      },

      addDewormingRecord: async (record) => {
        const { healthRecord } = get()
        const newRecord = {
          id: `deworm_${Date.now()}`,
          ...record,
          createdAt: new Date().toISOString()
        }

        const updated = {
          ...healthRecord,
          dewormingRecords: [...healthRecord.dewormingRecords, newRecord]
        }

        set({ healthRecord: updated })
        await db.updateHealthRecords(updated)
      },

      loadHealthRecords: async () => {
        const user = useUserStore.getState().user
        if (!user?.id) return

        set({ isLoading: true })

        try {
          const records = await db.getHealthRecords()
          if (records) {
            set({ healthRecord: records })
          }
        } catch (error) {
          console.error('加载健康档案失败:', error)
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'petmate-health'
    }
  )
)

// ============ 成就状态 ============

interface AchievementStoreState {
  achievementState: AchievementState
  newlyUnlocked: any[] // 新解锁的成就（用于弹窗）

  // Actions
  updateStats: (stats: Partial<AchievementState['stats']>) => void
  checkAchievements: () => any[]
  clearNewlyUnlocked: () => void
}

export const useAchievementStore = create<AchievementStoreState>()(
  persist(
    (set, get) => ({
      achievementState: defaultAchievementState,
      newlyUnlocked: [],

      updateStats: (stats) => {
        const { achievementState } = get()
        const updatedState = {
          ...achievementState,
          stats: { ...achievementState.stats, ...stats }
        }

        set({ achievementState: updatedState })
      },

      checkAchievements: () => {
        const { achievementState } = get()
        const { newlyUnlocked, allAchievements } = checkAllAchievements(achievementState)

        // 更新解锁列表
        const unlockedIds = allAchievements
          .filter(a => a.unlockedAt)
          .map(a => a.id)

        set({
          achievementState: {
            ...achievementState,
            unlockedIds
          },
          newlyUnlocked
        })

        // 显示通知
        newlyUnlocked.forEach(showAchievementNotification)

        return newlyUnlocked
      },

      clearNewlyUnlocked: () => set({ newlyUnlocked: [] })
    }),
    {
      name: 'petmate-achievements'
    }
  )
)

// ============ UI状态（不持久化）============

interface UIState {
  showAIPanel: boolean
  showHistoryPanel: boolean
  showNotePanel: boolean
  showSettingsPanel: boolean
  showDayNavModal: boolean
  showShoppingPanel: boolean
  showAchievementModal: boolean

  // Actions
  toggleAIPanel: () => void
  toggleHistoryPanel: () => void
  toggleNotePanel: () => void
  toggleSettingsPanel: () => void
  openDayNavModal: () => void
  closeDayNavModal: () => void
  toggleShoppingPanel: () => void
  showAchievement: (achievementId: string) => void
  closeAchievementModal: () => void
}

export const useUIStore = create<UIState>((set) => ({
  showAIPanel: false,
  showHistoryPanel: false,
  showNotePanel: false,
  showSettingsPanel: false,
  showDayNavModal: false,
  showShoppingPanel: false,
  showAchievementModal: false,

  toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),
  toggleHistoryPanel: () => set((state) => ({ showHistoryPanel: !state.showHistoryPanel })),
  toggleNotePanel: () => set((state) => ({ showNotePanel: !state.showNotePanel })),
  toggleSettingsPanel: () => set((state) => ({ showSettingsPanel: !state.showSettingsPanel })),
  openDayNavModal: () => set({ showDayNavModal: true }),
  closeDayNavModal: () => set({ showDayNavModal: false }),
  toggleShoppingPanel: () => set((state) => ({ showShoppingPanel: !state.showShoppingPanel })),
  showAchievement: () => set({ showAchievementModal: true }),
  closeAchievementModal: () => set({ showAchievementModal: false })
}))