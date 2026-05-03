/**
 * 状态管理 - Zustand
 * 替代localStorage和分散的状态管理
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============ 用户状态 ============

interface UserData {
  id: string
  email?: string
  name?: string
  dayNumber?: number
  isPaid?: boolean
  createdAt?: string
}

interface UserState {
  user: UserData | null
  isAuthenticated: boolean
  
  login: (user: UserData) => void
  logout: () => void
  updateUser: (updates: Partial<UserData>) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (user) => {
        set({ user, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
        if (typeof window !== 'undefined') {
          localStorage.removeItem('petmate_user')
        }
      },

      updateUser: (updates) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, ...updates } })
      }
    }),
    {
      name: 'petmate-user-store'
    }
  )
)

// ============ 进度状态 ============

interface ProgressState {
  dayNumber: number
  completedDays: number[]
  streakDays: number
  
  setDay: (day: number) => void
  completeDay: (day: number) => void
  incrementDay: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      dayNumber: 1,
      completedDays: [],
      streakDays: 0,

      setDay: (day) => set({ dayNumber: day }),
      
      completeDay: (day) => {
        const { completedDays, streakDays } = get()
        if (!completedDays.includes(day)) {
          set({
            completedDays: [...completedDays, day],
            streakDays: streakDays + 1
          })
        }
      },

      incrementDay: () => {
        const { dayNumber } = get()
        set({ dayNumber: Math.min(90, dayNumber + 1) })
      }
    }),
    {
      name: 'petmate-progress-store'
    }
  )
)

// ============ 笔记状态 ============

interface Note {
  id: string
  content: string
  type: 'observation' | 'question' | 'milestone'
  dayNumber: number
  createdAt: string
}

interface NoteState {
  notes: Note[]
  
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
  deleteNote: (id: string) => void
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],

      addNote: (note) => {
        const newNote: Note = {
          ...note,
          id: `note_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          createdAt: new Date().toISOString()
        }
        set({ notes: [newNote, ...get().notes] })
      },

      deleteNote: (id) => {
        set({ notes: get().notes.filter(n => n.id !== id) })
      }
    }),
    {
      name: 'petmate-note-store'
    }
  )
)

// ============ AI对话状态 ============

interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface ChatState {
  messages: ChatMessage[]
  
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      messages: [],

      addMessage: (message) => {
        const newMessage: ChatMessage = {
          ...message,
          id: `msg_${Date.now()}`,
          timestamp: new Date().toISOString()
        }
        set({ messages: [...get().messages, newMessage] })
      },

      clearMessages: () => {
        set({ messages: [] })
      }
    }),
    {
      name: 'petmate-chat-store'
    }
  )
)

// ============ 设置状态 ============

interface SettingsState {
  theme: 'light' | 'dark' | 'system'
  notifications: boolean
  reminderTime: string
  
  setTheme: (theme: SettingsState['theme']) => void
  setNotifications: (enabled: boolean) => void
  setReminderTime: (time: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      notifications: true,
      reminderTime: '09:00',

      setTheme: (theme) => set({ theme }),
      setNotifications: (notifications) => set({ notifications }),
      setReminderTime: (reminderTime) => set({ reminderTime })
    }),
    {
      name: 'petmate-settings-store'
    }
  )
)