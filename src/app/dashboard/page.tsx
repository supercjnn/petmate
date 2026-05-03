'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Progress, Spinner, EmptyState } from '@/components/ui'
import { IconChevronDown, IconChevronUp, IconCheck, IconAI, IconCalendar, IconClock, IconTrophy, IconEdit, IconHeart, IconCat, IconBell, IconDownload, IconSettings, IconUser } from '@/components/icons'
import { FadeIn, SlideIn, CountUp, AnimatedProgress } from '@/components/animations'
import { getAllCats } from '@/lib/health-records'
import { getUnreadNotifications } from '@/lib/notifications'

export default function DashboardPage() {
  const [dayNumber, setDayNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<any>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [catsCount, setCatsCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    setDayNumber(saved.dayNumber || 1)

    // 加载数据
    setCatsCount(getAllCats().length)
    setUnreadCount(getUnreadNotifications().length)

    fetch(`/api/card?day=${saved.dayNumber || 1}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCard(data.data.card)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const completionRate = card?.actions
    ? Math.round((completedActions.length / card.actions.length) * 100)
    : 0

  const toggleAction = (text: string) => {
    setCompletedActions(prev =>
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    )
  }

  const handleAIAsk = async (question?: string) => {
    const q = question || aiQuestion
    if (!q.trim()) return

    setAiLoading(true)
    setAiAnswer('')
    setShowAI(true)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          dayNumber,
          cardTitle: card?.title
        })
      })

      const data = await res.json()
      if (data.success) {
        setAiAnswer(data.data.answer)
      }
    } catch {
      setAiAnswer('抱歉，AI暂时无法回答，请稍后再试。')
    } finally {
      setAiLoading(false)
    }
  }

  if (loading) {
    return (
      <AppLayout title="Dashboard">
        <div className="flex items-center justify-center h-[60vh]">
          <Spinner size="lg" />
        </div>
      </AppLayout>
    )
  }

  if (!card) {
    return (
      <AppLayout title="Dashboard">
        <EmptyState
          icon={<IconCalendar className="w-12 h-12" />}
          title="暂无行动卡"
          description="请先完成新手引导"
          action={
            <Link href="/onboarding">
              <Button>开始引导</Button>
            </Link>
          }
        />
      </AppLayout>
    )
  }

  const phaseInfo = {
    adapt: { label: '适应期', color: 'default', days: '1-7' },
    explore: { label: '探索期', color: 'info', days: '8-30' },
    bond: { label: '亲密期', color: 'success', days: '31-60' },
    stable: { label: '稳定期', color: 'warning', days: '61-90' },
  }

  const currentPhase = phaseInfo[card.phase as keyof typeof phaseInfo] || phaseInfo.adapt

  return (
    <AppLayout title="Dashboard">
      <FadeIn>
        {/* 进度概览 */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <IconCalendar className="w-5 h-5 text-orange-500" />
              <span className="font-medium">Day <CountUp end={dayNumber} /></span>
            </div>
            <Badge variant={currentPhase.color as any}>{currentPhase.label}</Badge>
          </div>

          <div className="mb-2">
            <AnimatedProgress value={dayNumber} max={90} />
          </div>
          <p className="text-sm text-gray-500">
            90天计划进度 {Math.round((dayNumber / 90) * 100)}%
          </p>
        </Card>

        {/* 今日行动卡 */}
        <SlideIn direction="up" delay={100}>
          <Card padding="lg">
            {/* 卡片头部 */}
            <div className="flex items-center justify-between mb-4">
              <Badge variant="default">{currentPhase.label}</Badge>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <IconClock className="w-4 h-4" />
                Day {dayNumber}
              </span>
            </div>

            {/* 标题 */}
            <h2 className="text-xl font-bold mb-3">{card.title}</h2>

            {/* 描述 */}
            <p className="text-gray-600 mb-4">{card.description}</p>

            {/* 进度 */}
            <div className="flex items-center gap-2 mb-4">
              <Progress value={completionRate} className="flex-1" />
              <span className="text-sm font-medium">{completionRate}%</span>
            </div>

            {/* 行动清单 */}
            <div className="space-y-3 mb-4">
              {card.actions?.map((action: any, i: number) => {
                const isDone = completedActions.includes(action.text)
                return (
                  <div
                    key={i}
                    onClick={() => toggleAction(action.text)}
                    className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                      isDone ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className={`mt-0.5 ${isDone ? 'text-green-500' : 'text-gray-400'}`}>
                      {isDone ? <IconCheck className="w-5 h-5" /> : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isDone ? 'text-green-700 line-through' : ''}`}>
                        {action.text}
                      </p>
                      {action.hint && (
                        <p className="text-sm text-gray-500 mt-1">{action.hint}</p>
                      )}
                    </div>
                    {action.priority === 'high' && (
                      <Badge size="sm" variant="warning">重要</Badge>
                    )}
                  </div>
                )
              })}
            </div>

            {/* 不要做的事 */}
            {card.donts?.length > 0 && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-700 mb-2">⚠ 不要做</h4>
                <ul className="space-y-1">
                  {card.donts.map((dont: string, i: number) => (
                    <li key={i} className="text-sm text-red-600 flex items-center gap-2">
                      <IconX className="w-4 h-4" />
                      {dont}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI问答入口 */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<IconAI className="w-5 h-5" />}
                onClick={() => setShowAI(!showAI)}
              >
                AI问答助手
              </Button>
            </div>
          </Card>
        </SlideIn>

        {/* AI问答面板 */}
        {showAI && (
          <SlideIn direction="up" className="mt-4">
            <Card>
              <div className="mb-4">
                <h3 className="font-bold mb-2 flex items-center gap-2">
                  <IconAI className="w-5 h-5 text-orange-500" />
                  AI问答
                </h3>

                {/* 快捷问题 */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {['猫咪为什么躲着?', '今天该喂多少?', '出现这种行为正常吗?'].map(q => (
                    <Button
                      key={q}
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAIAsk(q)}
                    >
                      {q}
                    </Button>
                  ))}
                </div>

                {/* 输入框 */}
                <div className="flex gap-2">
                  <input
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="输入你的问题..."
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <Button onClick={() => handleAIAsk()}>发送</Button>
                </div>
              </div>

              {/* AI回答 */}
              {(aiLoading || aiAnswer) && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  {aiLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-gray-500">AI思考中...</span>
                    </div>
                  ) : (
                    <p className="text-gray-700">{aiAnswer}</p>
                  )}
                </div>
              )}
            </Card>
          </SlideIn>
        )}

        {/* 功能入口网格 */}
        <div className="mt-6">
          <h3 className="font-bold mb-3 text-gray-700">功能中心</h3>
          <div className="grid grid-cols-3 gap-3">
            {/* 健康档案 */}
            <Link href="/health">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center">
                  <IconCat className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm font-medium">健康档案</p>
                {catsCount > 0 && (
                  <Badge size="sm" variant="success" className="mt-1">{catsCount}只</Badge>
                )}
              </Card>
            </Link>

            {/* AI问答 */}
            <Link href="/ai-chat">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-orange-100 to-yellow-100 flex items-center justify-center">
                  <IconAI className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-sm font-medium">AI问答</p>
              </Card>
            </Link>

            {/* 通知中心 */}
            <Link href="/notifications">
              <Card hover className="text-center py-4 relative">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center">
                  <IconBell className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-sm font-medium">通知</p>
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Card>
            </Link>

            {/* 笔记 */}
            <Link href="/notes">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-purple-100 to-violet-100 flex items-center justify-center">
                  <IconEdit className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-sm font-medium">笔记</p>
              </Card>
            </Link>

            {/* 成就 */}
            <Link href="/achievements">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-yellow-100 to-amber-100 flex items-center justify-center">
                  <IconTrophy className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-sm font-medium">成就</p>
              </Card>
            </Link>

            {/* 数据管理 */}
            <Link href="/data">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                  <IconDownload className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-sm font-medium">数据</p>
              </Card>
            </Link>

            {/* 知识库 */}
            <Link href="/knowledge">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                  <IconHeart className="w-5 h-5 text-indigo-500" />
                </div>
                <p className="text-sm font-medium">知识库</p>
              </Card>
            </Link>

            {/* 品种百科 */}
            <Link href="/breed-encyclopedia">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                  <IconCat className="w-5 h-5 text-teal-500" />
                </div>
                <p className="text-sm font-medium">品种百科</p>
              </Card>
            </Link>

            {/* 设置 */}
            <Link href="/settings">
              <Card hover className="text-center py-4">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-gradient-to-br from-gray-100 to-slate-100 flex items-center justify-center">
                  <IconSettings className="w-5 h-5 text-gray-500" />
                </div>
                <p className="text-sm font-medium">设置</p>
              </Card>
            </Link>
          </div>
        </div>
      </FadeIn>
    </AppLayout>
  )
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}