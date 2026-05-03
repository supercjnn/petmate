'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Spinner, EmptyState } from '@/components/ui'
import { IconEdit, IconTrash, IconCalendar, IconPlus, IconCat } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'

interface Note {
  id: string
  content: string
  type: 'observation' | 'question' | 'milestone'
  createdAt: string
  dayNumber: number
}

export default function NotesPage() {
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [noteType, setNoteType] = useState<Note['type']>('observation')
  const [dayNumber, setDayNumber] = useState(1)

  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    setNotes(saved.notes || [])
    setDayNumber(saved.dayNumber || 1)
    setLoading(false)
  }, [])

  const saveNotes = (updatedNotes: Note[]) => {
    setNotes(updatedNotes)
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    saved.notes = updatedNotes
    localStorage.setItem('petmate_user', JSON.stringify(saved))
  }

  const addNote = () => {
    if (!newNote.trim()) return

    const note: Note = {
      id: 'note_' + Date.now().toString(36),
      content: newNote,
      type: noteType,
      createdAt: new Date().toISOString(),
      dayNumber
    }

    saveNotes([note, ...notes])
    setNewNote('')
    setShowForm(false)
  }

  const deleteNote = (id: string) => {
    saveNotes(notes.filter(n => n.id !== id))
  }

  const typeConfig = {
    observation: { label: '观察记录', color: 'info', icon: '👀' },
    question: { label: '疑问待解', color: 'warning', icon: '❓' },
    milestone: { label: '重要里程碑', color: 'success', icon: '🎉' },
  }

  if (loading) {
    return (
      <AppLayout title="养猫笔记">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="养猫笔记">
      <FadeIn>
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold">养猫笔记</h1>
            <p className="text-sm text-gray-500">记录你和猫咪的每个瞬间</p>
          </div>
          <Button
            size="sm"
            leftIcon={<IconPlus className="w-4 h-4" />}
            onClick={() => setShowForm(!showForm)}
          >
            记录
          </Button>
        </div>

        {/* 新建笔记表单 */}
        {showForm && (
          <SlideIn direction="down" className="mb-6">
            <Card>
              {/* 类型选择 */}
              <div className="flex gap-2 mb-4">
                {(Object.keys(typeConfig) as Note['type'][]).map(type => (
                  <button
                    key={type}
                    onClick={() => setNoteType(type)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      noteType === type
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {typeConfig[type].icon} {typeConfig[type].label}
                  </button>
                ))}
              </div>

              {/* 输入框 */}
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`记录你的${typeConfig[noteType].label.toLowerCase()}...`}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={4}
              />

              {/* 操作按钮 */}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                  取消
                </Button>
                <Button size="sm" onClick={addNote}>
                  保存
                </Button>
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 笔记列表 */}
        {notes.length === 0 ? (
          <EmptyState
            icon={<IconEdit className="w-12 h-12" />}
            title="还没有笔记"
            description="点击右上角「记录」按钮，开始记录你和猫咪的故事"
          />
        ) : (
          <div className="space-y-4">
            {notes.map((note, i) => (
              <SlideIn key={note.id} delay={i * 30}>
                <Card>
                  {/* 头部 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge size="sm" variant={typeConfig[note.type].color as any}>
                        {typeConfig[note.type].icon} {typeConfig[note.type].label}
                      </Badge>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <IconCalendar className="w-3 h-3" />
                        Day {note.dayNumber}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-500"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 内容 */}
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>

                  {/* 时间 */}
                  <p className="text-xs text-gray-400 mt-3">
                    {new Date(note.createdAt).toLocaleString('zh-CN')}
                  </p>
                </Card>
              </SlideIn>
            ))}
          </div>
        )}

        {/* 统计卡片 */}
        {notes.length > 0 && (
          <Card className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-around">
              <div className="text-center">
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-sm opacity-80">总笔记</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {notes.filter(n => n.type === 'observation').length}
                </p>
                <p className="text-sm opacity-80">观察记录</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {notes.filter(n => n.type === 'milestone').length}
                </p>
                <p className="text-sm opacity-80">里程碑</p>
              </div>
            </div>
          </Card>
        )}
      </FadeIn>
    </AppLayout>
  )
}