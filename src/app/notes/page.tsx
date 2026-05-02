'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Note } from '@/lib/user-types'

type NoteWithType = Note & { dayNumber: number }

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteWithType[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterMood, setFilterMood] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  
  // 新笔记表单
  const [newNote, setNewNote] = useState({
    content: '',
    type: 'observation' as Note['type'],
    mood: 'neutral' as Note['mood'],
    tags: ''
  })

  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      const user = JSON.parse(userData)
      const allNotes: NoteWithType[] = []
      
      // 从 notes 对象中提取所有笔记
      if (user.notes) {
        Object.entries(user.notes).forEach(([day, dayNotes]) => {
          (dayNotes as Note[]).forEach(note => {
            allNotes.push({ ...note, dayNumber: Number(day) })
          })
        })
      }
      
      // 按创建时间倒序排列
      allNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      setNotes(allNotes)
    }
    setLoading(false)
  }, [])

  // 筛选后的笔记
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      if (filterType !== 'all' && note.type !== filterType) return false
      if (filterMood !== 'all' && note.mood !== filterMood) return false
      return true
    })
  }, [notes, filterType, filterMood])

  // 按日期分组
  const groupedNotes = useMemo(() => {
    const groups: Record<string, NoteWithType[]> = {}
    
    filteredNotes.forEach(note => {
      const date = new Date(note.createdAt).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(note)
    })
    
    return groups
  }, [filteredNotes])

  // 添加新笔记
  const handleAddNote = () => {
    if (!newNote.content.trim()) return

    const userData = JSON.parse(localStorage.getItem('petmate_user') || '{}')
    const dayNumber = userData.dayNumber || 1
    
    const note: Note = {
      id: 'note_' + Date.now().toString(36),
      content: newNote.content,
      type: newNote.type,
      mood: newNote.mood,
      tags: newNote.tags ? newNote.tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      createdAt: new Date().toISOString()
    }

    // 更新本地存储
    if (!userData.notes) userData.notes = {}
    if (!userData.notes[dayNumber]) userData.notes[dayNumber] = []
    userData.notes[dayNumber].push(note)
    localStorage.setItem('petmate_user', JSON.stringify(userData))

    // 更新状态
    setNotes(prev => [{ ...note, dayNumber }, ...prev])
    
    // 重置表单
    setNewNote({ content: '', type: 'observation', mood: 'neutral', tags: '' })
    setShowAddModal(false)
  }

  // 获取类型标签
  const getTypeInfo = (type: Note['type']) => {
    const types: Record<Note['type'], { label: string; color: string }> = {
      observation: { label: '观察', color: 'bg-blue-100 text-blue-700' },
      question: { label: '疑问', color: 'bg-yellow-100 text-yellow-700' },
      milestone: { label: '里程碑', color: 'bg-green-100 text-green-700' }
    }
    return types[type]
  }

  // 获取心情图标
  const getMoodEmoji = (mood?: Note['mood']) => {
    const moods: Record<NonNullable<Note['mood']>, string> = {
      happy: '😊',
      worried: '😰',
      confused: '😕',
      neutral: '😐'
    }
    return mood ? moods[mood] : ''
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        加载中...
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-lg">
              ←
            </Link>
            <h1 className="font-semibold text-lg">📝 笔记列表</h1>
          </div>
          <span className="text-sm text-gray-500">{notes.length} 条笔记</span>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="bg-white px-4 py-3 border-b">
        <div className="flex gap-3">
          {/* 类型筛选 */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
          >
            <option value="all">全部类型</option>
            <option value="observation">观察</option>
            <option value="question">疑问</option>
            <option value="milestone">里程碑</option>
          </select>
          
          {/* 心情筛选 */}
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm bg-gray-50"
          >
            <option value="all">全部心情</option>
            <option value="happy">😊 开心</option>
            <option value="worried">😰 担忧</option>
            <option value="confused">😕 困惑</option>
            <option value="neutral">😐 平静</option>
          </select>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 笔记列表 */}
        {Object.keys(groupedNotes).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500">暂无笔记</p>
            <p className="text-sm text-gray-400 mt-1">点击右下角按钮添加笔记</p>
          </div>
        ) : (
          Object.entries(groupedNotes).map(([date, dateNotes]) => (
            <div key={date} className="mb-6">
              {/* 日期标题 */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-gray-600">{date}</span>
                <span className="text-xs text-gray-400">({dateNotes.length}条)</span>
              </div>
              
              {/* 笔记卡片 */}
              <div className="space-y-3">
                {dateNotes.map((note) => {
                  const typeInfo = getTypeInfo(note.type)
                  return (
                    <div
                      key={note.id}
                      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                    >
                      {/* 卡片头部 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                        {note.mood && (
                          <span className="text-lg" title={note.mood}>
                            {getMoodEmoji(note.mood)}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 ml-auto">
                          Day {note.dayNumber}
                        </span>
                      </div>
                      
                      {/* 内容 */}
                      <p className="text-sm text-gray-700 mb-2">{note.content}</p>
                      
                      {/* 标签 */}
                      {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {note.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 bg-petmate-light text-petmate-text rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      {/* 时间 */}
                      <p className="text-xs text-gray-400">
                        {new Date(note.createdAt).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 添加笔记按钮 */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-petmate-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl hover:opacity-90 transition"
      >
        +
      </button>

      {/* 添加笔记弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center">
          <div className="bg-white rounded-t-2xl w-full max-w-lg p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">添加笔记</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* 类型选择 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">类型</label>
                <div className="flex gap-2">
                  {(['observation', 'question', 'milestone'] as const).map((type) => {
                    const info = getTypeInfo(type)
                    return (
                      <button
                        key={type}
                        onClick={() => setNewNote(prev => ({ ...prev, type }))}
                        className={`flex-1 py-2 rounded-lg text-sm transition ${
                          newNote.type === type
                            ? info.color
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {info.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 心情选择 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">心情</label>
                <div className="flex gap-2">
                  {(['happy', 'neutral', 'confused', 'worried'] as const).map((mood) => (
                    <button
                      key={mood}
                      onClick={() => setNewNote(prev => ({ ...prev, mood }))}
                      className={`flex-1 py-2 rounded-lg text-lg transition ${
                        newNote.mood === mood
                          ? 'bg-petmate-primary/10 ring-2 ring-petmate-primary'
                          : 'bg-gray-100'
                      }`}
                    >
                      {getMoodEmoji(mood)}
                    </button>
                  ))}
                </div>
              </div>

              {/* 内容输入 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">内容</label>
                <textarea
                  value={newNote.content}
                  onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="记录今天的观察或想法..."
                  className="w-full px-3 py-2 border rounded-lg text-sm resize-none h-24"
                />
              </div>

              {/* 标签输入 */}
              <div>
                <label className="text-sm text-gray-600 mb-1 block">标签（用逗号分隔）</label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="例如：饮食, 健康, 行为"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>

              {/* 提交按钮 */}
              <button
                onClick={handleAddNote}
                disabled={!newNote.content.trim()}
                className={`w-full py-3 rounded-lg font-medium transition ${
                  newNote.content.trim()
                    ? 'bg-petmate-primary text-white hover:opacity-90'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                保存笔记
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
