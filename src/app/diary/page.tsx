'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner, EmptyState } from '@/components/ui'
import { IconArrowLeft, IconCalendar, IconCheck, IconHeart, IconEdit } from '@/components/icons'
import { FadeIn, SlideIn, CountUp } from '@/components/animations'
import {
  DiaryEntry,
  DailyCheckIn,
  getAllDiaryEntries,
  getTodayCheckIn,
  createCheckIn,
  createDiaryEntry,
  getStreakDays,
  getDiaryStats
} from '@/lib/diary'

export default function DiaryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null)
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [streak, setStreak] = useState(0)
  const [stats, setStats] = useState<any>(null)
  const [showCheckIn, setShowCheckIn] = useState(false)
  const [showNewEntry, setShowNewEntry] = useState(false)
  const [dayNumber, setDayNumber] = useState(1)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const progressStr = localStorage.getItem('petmate-progress-store')
    if (progressStr) {
      try {
        const progress = JSON.parse(progressStr).state
        setDayNumber(progress.dayNumber || 1)
      } catch {}
    }

    setTodayCheckIn(getTodayCheckIn())
    setEntries(getAllDiaryEntries())
    setStreak(getStreakDays())
    setStats(getDiaryStats())
    setLoading(false)
  }

  const handleCheckIn = (mood: 'happy' | 'neutral' | 'worried' | 'proud') => {
    const today = new Date().toLocaleDateString('zh-CN')
    createCheckIn({
      dayNumber,
      date: today,
      completedTasks: [],
      mood
    })
    setTodayCheckIn(getTodayCheckIn())
    setStreak(getStreakDays())
    setStats(getDiaryStats())
    setShowCheckIn(false)
  }

  const handleAddEntry = (type: DiaryEntry['type'], content: string) => {
    const today = new Date().toLocaleDateString('zh-CN')
    createDiaryEntry({
      dayNumber,
      date: today,
      type,
      content
    })
    setEntries(getAllDiaryEntries())
    setStats(getDiaryStats())
    setShowNewEntry(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  const moodEmoji: Record<string, string> = {
    happy: '😊',
    neutral: '😐',
    worried: '😟',
    proud: '😎'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">养猫日记</h1>
          <button onClick={() => setShowNewEntry(true)} className="p-2 -mr-2">
            <IconEdit className="w-5 h-5 text-orange-500" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 打卡统计 */}
        <FadeIn>
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">连续打卡</p>
                <p className="text-4xl font-bold">{streak}天</p>
              </div>
              <div className="text-5xl">🔥</div>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/20">
              <div className="text-center">
                <p className="text-xl font-bold">{stats?.totalEntries || 0}</p>
                <p className="text-xs text-white/70">日记条数</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{stats?.totalCheckIns || 0}</p>
                <p className="text-xs text-white/70">打卡次数</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{stats?.byMood?.happy || 0}</p>
                <p className="text-xs text-white/70">开心天数</p>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* 今日打卡 */}
        {!todayCheckIn ? (
          <FadeIn delay={50}>
            <Card>
              <div className="text-center py-4">
                <p className="font-medium mb-4">今天 Day {dayNumber}，来打个卡吧！</p>
                <div className="flex justify-center gap-4">
                  {[
                    { mood: 'happy', emoji: '😊', label: '开心' },
                    { mood: 'neutral', emoji: '😐', label: '一般' },
                    { mood: 'worried', emoji: '😟', label: '担心' },
                    { mood: 'proud', emoji: '😎', label: '骄傲' }
                  ].map(item => (
                    <button
                      key={item.mood}
                      onClick={() => handleCheckIn(item.mood as any)}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </FadeIn>
        ) : (
          <FadeIn delay={50}>
            <Card className="bg-green-50 border border-green-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-2xl">
                  {moodEmoji[todayCheckIn.mood]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-green-700">今日已打卡</p>
                  <p className="text-sm text-green-600">
                    Day {todayCheckIn.dayNumber} · {todayCheckIn.date}
                  </p>
                </div>
                <IconCheck className="w-6 h-6 text-green-500" />
              </div>
            </Card>
          </FadeIn>
        )}

        {/* 快捷操作 */}
        <FadeIn delay={100}>
          <div className="grid grid-cols-2 gap-3">
            <Card 
              hover 
              onClick={() => handleAddEntry('observation', '')}
              className="text-center py-4"
            >
              <span className="text-3xl mb-2 block">👀</span>
              <p className="text-sm font-medium">观察记录</p>
            </Card>
            <Card 
              hover 
              onClick={() => handleAddEntry('photo', '')}
              className="text-center py-4"
            >
              <span className="text-3xl mb-2 block">📸</span>
              <p className="text-sm font-medium">照片日记</p>
            </Card>
          </div>
        </FadeIn>

        {/* 日记列表 */}
        {entries.length > 0 ? (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-700">最近日记</h3>
            {entries.slice(0, 20).map((entry, index) => (
              <SlideIn direction="up" delay={index * 30} key={entry.id}>
                <Card>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      entry.type === 'observation' ? 'bg-blue-100' :
                      entry.type === 'photo' ? 'bg-pink-100' :
                      entry.type === 'milestone' ? 'bg-yellow-100' :
                      'bg-gray-100'
                    }`}>
                      {entry.type === 'observation' ? '👀' :
                       entry.type === 'photo' ? '📸' :
                       entry.type === 'milestone' ? '🏆' :
                       '📝'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge size="sm" variant="default">Day {entry.dayNumber}</Badge>
                        <span className="text-xs text-gray-400">{entry.date}</span>
                      </div>
                      <p className="text-gray-700">{entry.content || '点击查看详情'}</p>
                    </div>
                  </div>
                </Card>
              </SlideIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              icon={<IconCalendar className="w-12 h-12" />}
              title="还没有日记"
              description="开始记录你的养猫日常吧"
              action={
                <Button onClick={() => setShowNewEntry(true)}>写第一篇日记</Button>
              }
            />
          </FadeIn>
        )}
      </div>

      {/* 新建日记弹窗 */}
      {showNewEntry && (
        <NewEntryModal
          onClose={() => setShowNewEntry(false)}
          onSubmit={handleAddEntry}
        />
      )}
    </div>
  )
}

function NewEntryModal({
  onClose,
  onSubmit
}: {
  onClose: () => void
  onSubmit: (type: DiaryEntry['type'], content: string) => void
}) {
  const [type, setType] = useState<DiaryEntry['type']>('note')
  const [content, setContent] = useState('')

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(type, content)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">写日记</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">类型</label>
              <div className="flex gap-2">
                {[
                  { value: 'observation', label: '观察', emoji: '👀' },
                  { value: 'note', label: '笔记', emoji: '📝' },
                  { value: 'milestone', label: '里程碑', emoji: '🏆' }
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value as any)}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      type === t.value ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' : 'bg-gray-100'
                    }`}
                  >
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">内容</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="记录今天和猫咪的故事..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-orange-500"
                autoFocus
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth disabled={!content.trim()}>保存</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}