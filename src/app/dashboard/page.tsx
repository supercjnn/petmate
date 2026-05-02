'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [dayNumber, setDayNumber] = useState(1)
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<any>(null)
  const [completedActions, setCompletedActions] = useState<string[]>([])
  
  // AI相关
  const [showAI, setShowAI] = useState(false)
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiAnswer, setAiAnswer] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  
  // 新增：面板状态
  const [showHistory, setShowHistory] = useState(false)
  const [showShopping, setShowShopping] = useState(false)
  const [showDayNav, setShowDayNav] = useState(false)
  const [showNote, setShowNote] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  // 新增：数据状态
  const [history, setHistory] = useState<Record<number, string[]>>({})
  const [notes, setNotes] = useState<Record<number, any[]>>({})
  const [currentNote, setCurrentNote] = useState('')
  const [viewingDay, setViewingDay] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  
  // 新增：提醒设置
  const [reminderEnabled, setReminderEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState('09:00')
  const [notificationPermission, setNotificationPermission] = useState<string>('default')
  
  const isPaid = user?.isPaid || false
  
  useEffect(() => {
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    setDayNumber(saved.dayNumber || 1)
    setHistory(saved.history || {})
    setNotes(saved.notes || {})
    setUser(saved)
    setReminderEnabled(saved.settings?.reminderEnabled ?? true)
    setReminderTime(saved.settings?.reminderTime || '09:00')
    
    // 检查通知权限
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission)
    }
    
    fetch(`/api/card?day=${saved.dayNumber || 1}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCard(data.data.card)
        }
      })
      .finally(() => setLoading(false))
  }, [])
  
  // 计算完成率
  const completionRate = card?.actions 
    ? Math.round((completedActions.length / card.actions.length) * 100)
    : 0
  
  const toggleAction = (text: string) => {
    setCompletedActions(prev => 
      prev.includes(text) ? prev.filter(t => t !== text) : [...prev, text]
    )
  }
  
  // AI问答
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
    } catch (error) {
      setAiAnswer('抱歉，AI暂时无法回答，请稍后再试。')
    } finally {
      setAiLoading(false)
    }
  }
  
  // 保存笔记
  const saveNote = async () => {
    if (!currentNote.trim()) return
    
    const dayNotes = notes[dayNumber] || []
    const newNote = {
      id: 'note_' + Date.now().toString(36),
      content: currentNote,
      type: 'observation',
      createdAt: new Date().toISOString()
    }
    dayNotes.push(newNote)
    
    const updatedNotes = { ...notes, [dayNumber]: dayNotes }
    setNotes(updatedNotes)
    setCurrentNote('')
    setShowNote(false)
    
    // 保存到本地
    const userData = JSON.parse(localStorage.getItem('petmate_user') || '{}')
    userData.notes = updatedNotes
    localStorage.setItem('petmate_user', JSON.stringify(userData))
  }
  
  // 完成当天
  const completeDay = () => {
    const userData = JSON.parse(localStorage.getItem('petmate_user') || '{}')
    userData.history = userData.history || {}
    userData.history[dayNumber] = completedActions
    userData.notes = notes
    userData.dayNumber = dayNumber + 1
    localStorage.setItem('petmate_user', JSON.stringify(userData))
    window.location.reload()
  }
  
  // 请求通知权限
  const requestNotificationPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
      
      if (permission === 'granted') {
        // 测试通知
        new Notification('宠伴提醒已开启 🐱', {
          body: `每天 ${reminderTime} 会提醒你查看今日行动卡`,
          icon: '/favicon.ico'
        })
      }
    }
  }
  
  // 查看其他天
  const viewDay = async (day: number) => {
    if (day > 3 && !isPaid) {
      alert('付费用户可解锁完整90天内容')
      return
    }
    setViewingDay(day)
    const res = await fetch(`/api/card?day=${day}`)
    const data = await res.json()
    if (data.success) {
      setCard(data.data.card)
      setCompletedActions(history[day] || [])
    }
    setShowDayNav(false)
  }
  
  // 采购清单
  const shoppingLists: Record<string, { name: string; items: string[] }[]> = {
    '适应期': [
      { name: '猫粮', items: ['同款猫粮', '猫罐头', '羊奶粉'] },
      { name: '猫砂', items: ['猫砂盆', '猫砂', '猫砂铲'] },
      { name: '水具', items: ['水碗', '食碗'] },
    ],
    '信任建立期': [
      { name: '互动玩具', items: ['逗猫棒', '猫抓板'] },
      { name: '舒适用品', items: ['猫窝/垫子'] },
    ],
    '行为塑造期': [
      { name: '训练用品', items: ['猫零食', '指甲剪'] },
      { name: '清洁用品', items: ['宠物湿巾', '梳子'] },
    ],
    '稳定护理期': [
      { name: '医疗准备', items: ['猫包/航空箱', '常备药'] },
    ],
  }
  
  const quickQuestions = [
    '猫咪一直躲着怎么办？',
    '猫咪不吃饭怎么办？',
    '猫咪呕吐了怎么办？'
  ]
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">加载中...</div>
  }
  
  if (!card) {
    return <div className="min-h-screen flex items-center justify-center">加载失败</div>
  }
  
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="stage-badge bg-petmate-primary/10 text-petmate-primary">
              {card.stage_name}
            </span>
            <span className="text-sm text-gray-500">Day {viewingDay || dayNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/achievements" className="text-sm" title="成就">
              🏆
            </Link>
            <button onClick={() => setShowHistory(!showHistory)} className="text-sm" title="历史">
              📊
            </button>
            <button onClick={() => setShowNote(!showNote)} className="text-sm" title="笔记">
              📝
            </button>
            <button onClick={() => setShowShopping(!showShopping)} className="text-sm" title="采购">
              🛒
            </button>
            <button onClick={() => setShowSettings(!showSettings)} className="text-sm" title="设置">
              ⚙️
            </button>
          </div>
        </div>
      </div>
      
      {/* 进度条 */}
      <div className="bg-white px-4 py-2 border-b">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-500">今日完成度</span>
          <span className="text-xs font-medium text-petmate-primary">{completionRate}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-petmate-primary to-petmate-secondary transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
      
      <div className="px-4 py-4">
        {/* 设置面板 */}
        {showSettings && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>⚙️ 设置</span>
              <button onClick={() => setShowSettings(false)} className="text-gray-400">✕</button>
            </h3>
            
            {/* 提醒设置 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">每日提醒</span>
                <button
                  onClick={() => {
                    const enabled = !reminderEnabled
                    setReminderEnabled(enabled)
                    if (enabled && notificationPermission !== 'granted') {
                      requestNotificationPermission()
                    }
                  }}
                  className={`w-12 h-6 rounded-full transition ${
                    reminderEnabled ? 'bg-petmate-primary' : 'bg-gray-200'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full shadow transition ${
                    reminderEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              
              {reminderEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">提醒时间</span>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
              
              {notificationPermission !== 'granted' && reminderEnabled && (
                <button
                  onClick={requestNotificationPermission}
                  className="w-full py-2 text-sm bg-blue-50 text-blue-600 rounded-lg"
                >
                  开启浏览器通知
                </button>
              )}
              
              {/* 付费状态 */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm">会员状态</span>
                  <span className={`text-sm ${isPaid ? 'text-green-600' : 'text-gray-500'}`}>
                    {isPaid ? '✓ 已付费' : '免费版'}
                  </span>
                </div>
                {!isPaid && (
                  <Link href="/payment" className="block mt-2 text-center text-sm text-petmate-primary">
                    升级完整版 ¥29
                  </Link>
                )}
              </div>
              
              {/* 登出 */}
              <button
                onClick={() => {
                  localStorage.removeItem('petmate_user')
                  localStorage.removeItem('petmate_token')
                  window.location.href = '/login'
                }}
                className="w-full py-2 text-sm text-red-500 border border-red-200 rounded-lg mt-2"
              >
                退出登录
              </button>
            </div>
          </div>
        )}
        
        {/* 笔记面板 */}
        {showNote && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>📝 今日笔记</span>
              <button onClick={() => setShowNote(false)} className="text-gray-400">✕</button>
            </h3>
            
            {/* 今日笔记列表 */}
            {notes[dayNumber]?.length > 0 && (
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {notes[dayNumber].map((note: any, i: number) => (
                  <div key={i} className="p-2 bg-gray-50 rounded text-sm">
                    <p>{note.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(note.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
            
            {/* 添加笔记 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={currentNote}
                onChange={(e) => setCurrentNote(e.target.value)}
                placeholder="记录今天的观察..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
                onKeyDown={(e) => e.key === 'Enter' && saveNote()}
              />
              <button
                onClick={saveNote}
                className="px-4 py-2 bg-petmate-primary text-white rounded-lg text-sm"
              >
                保存
              </button>
            </div>
          </div>
        )}
        
        {/* 历史面板 */}
        {showHistory && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>📅 历史记录</span>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 text-sm">✕</button>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(history).map(([day, actions]) => (
                <div key={day} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">Day {day}</span>
                  <div className="flex items-center gap-2">
                    {notes[Number(day)]?.length > 0 && (
                      <span className="text-xs text-blue-500">📝{notes[Number(day)].length}</span>
                    )}
                    <span className="text-xs text-green-600">✅ {(actions as string[]).length}</span>
                  </div>
                </div>
              ))}
              {Object.keys(history).length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">暂无历史记录</p>
              )}
            </div>
          </div>
        )}
        
        {/* 采购面板 */}
        {showShopping && (
          <div className="bg-white rounded-xl p-4 mb-4 shadow-lg border">
            <h3 className="font-semibold mb-3 flex items-center justify-between">
              <span>🛒 采购清单</span>
              <button onClick={() => setShowShopping(false)} className="text-gray-400 text-sm">✕</button>
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {(shoppingLists[card.stage_name] || []).map((category, i) => (
                <div key={i} className="border-b pb-2">
                  <p className="font-medium text-sm mb-1">{category.name}</p>
                  <div className="flex flex-wrap gap-1">
                    {category.items.map((item, j) => (
                      <span key={j} className="text-xs px-2 py-1 bg-petmate-light rounded">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* 天数导航 */}
        {showDayNav && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-4 w-full max-w-sm max-h-[80vh] overflow-hidden">
              <h3 className="font-semibold mb-3 flex items-center justify-between">
                <span>📆 选择天数</span>
                <button onClick={() => setShowDayNav(false)} className="text-gray-400">✕</button>
              </h3>
              <div className="grid grid-cols-7 gap-1 max-h-60 overflow-y-auto">
                {Array.from({ length: 91 }, (_, i) => {
                  const day = i
                  const isLocked = day > 3 && !isPaid
                  const isCurrent = day === dayNumber
                  const isCompleted = history[day]?.length > 0
                  const hasNote = notes[day]?.length > 0
                  
                  return (
                    <button
                      key={day}
                      onClick={() => !isLocked && viewDay(day)}
                      disabled={isLocked}
                      className={`p-2 text-xs rounded transition ${
                        isCurrent ? 'bg-petmate-primary text-white' :
                        isLocked ? 'bg-gray-100 text-gray-400' :
                        isCompleted ? 'bg-green-100 text-green-700' :
                        'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {hasNote ? '📝' : ''}{day}
                    </button>
                  )
                })}
              </div>
              {!isPaid && (
                <p className="text-xs text-center text-gray-500 mt-3">
                  🔒 付费解锁完整90天 (Day 4-90)
                </p>
              )}
            </div>
          </div>
        )}
        
        {/* Focus */}
        <div className="bg-gradient-to-r from-petmate-primary/10 to-petmate-secondary/10 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-lg mb-1">{card.title}</h2>
              <p className="text-sm text-gray-600">{card.focus}</p>
            </div>
            <button 
              onClick={() => setShowDayNav(true)}
              className="text-xs px-2 py-1 border border-gray-300 rounded"
            >
              📅
            </button>
          </div>
        </div>
        
        {/* Actions */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-green-500">✓</span> 今天该做
            <span className="text-xs text-gray-400 ml-auto">
              {completedActions.length}/{card.actions?.length || 0}
            </span>
          </h3>
          <div className="space-y-3">
            {(card.actions || []).map((action: any, i: number) => (
              <div 
                key={i}
                onClick={() => toggleAction(action.text)}
                className={`p-3 rounded-lg border transition cursor-pointer ${
                  completedActions.includes(action.text)
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5">
                    {completedActions.includes(action.text) ? '✅' : '⬜'}
                  </span>
                  <div>
                    <p className="text-sm font-medium">{action.text}</p>
                    <p className="text-xs text-gray-500">{action.reason}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Avoids */}
        <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
          <h3 className="font-semibold mb-3 text-red-600 flex items-center gap-2">
            <span>✗</span> 今天不要做
          </h3>
          <div className="space-y-2">
            {(card.avoids || []).map((avoid: any, i: number) => (
              <p key={i} className="text-sm text-red-700">• {avoid.text}</p>
            ))}
          </div>
        </div>
        
        {/* Observe */}
        {card.observe && (
          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
            <h3 className="font-semibold mb-2 text-blue-600 flex items-center gap-2">
              <span>👁</span> 观察重点
            </h3>
            <div className="space-y-1">
              {card.observe.map((item: string, i: number) => (
                <p key={i} className="text-sm text-blue-700">• {item}</p>
              ))}
            </div>
          </div>
        )}
        
        {/* Risk Tip */}
        <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
          <h3 className="font-semibold mb-2 text-yellow-700 flex items-center gap-2">
            <span>⚠️</span> 风险提示
          </h3>
          <p className="text-sm text-yellow-800">{card.risk_tip}</p>
        </div>
        
        {/* Reassurance */}
        <div className="bg-gradient-to-r from-petmate-secondary/10 to-petmate-accent/20 rounded-xl p-4 mb-4">
          <p className="text-sm text-center italic">"{card.reassurance}"</p>
        </div>
        
        {/* AI问答 */}
        <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-petmate-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🤖</span> AI助手
            </h3>
            <button onClick={() => setShowAI(!showAI)} className="text-xs text-petmate-primary">
              {showAI ? '收起' : '展开'}
            </button>
          </div>
          
          {showAI && (
            <>
              <div className="flex gap-2 mb-3 flex-wrap">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleAIAsk(q)}
                    className="text-xs px-3 py-1 bg-petmate-light rounded-full hover:bg-petmate-primary/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={aiQuestion}
                  onChange={(e) => setAiQuestion(e.target.value)}
                  placeholder="输入你的问题..."
                  className="flex-1 px-3 py-2 border rounded-lg text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleAIAsk()}
                />
                <button
                  onClick={() => handleAIAsk()}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-petmate-primary text-white rounded-lg text-sm disabled:opacity-50"
                >
                  {aiLoading ? '...' : '问'}
                </button>
              </div>
              
              {aiAnswer && (
                <div className="bg-gray-50 rounded-lg p-3 text-sm whitespace-pre-wrap max-h-60 overflow-y-auto">
                  {aiAnswer}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Link 
            href="/risk-check"
            className="flex-1 py-3 px-4 rounded-lg border border-petmate-primary text-petmate-primary text-center font-medium"
          >
            有点担心
          </Link>
          <button 
            onClick={completeDay}
            disabled={completionRate < 50}
            className={`flex-1 py-3 rounded-lg font-medium transition ${
              completionRate >= 50
                ? 'bg-petmate-primary text-white hover:opacity-90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            完成今日任务
          </button>
        </div>
        
        {completionRate === 100 && (
          <div className="mt-4 p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl text-center">
            <p className="text-2xl mb-2">🎉</p>
            <p className="font-semibold text-green-700">太棒了！今日任务全部完成！</p>
          </div>
        )}
      </div>
    </div>
  )
}