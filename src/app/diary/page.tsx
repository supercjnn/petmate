'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generateXHSText, diaryTemplate, milestoneTemplate, copyToClipboard } from '@/lib/xiaohongshu'

interface DiaryEntry {
  dayNumber: number
  date: string
  notes: string[]
  completedActions: string[]
  stage: string
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 加载用户数据
    const userData = localStorage.getItem('petmate_user')
    const notesData = localStorage.getItem('petmate_notes')
    const historyData = localStorage.getItem('petmate_history')
    
    if (userData) {
      const user = JSON.parse(userData)
      const notes = notesData ? JSON.parse(notesData) : {}
      const history = historyData ? JSON.parse(historyData) : {}
      
      // 生成时间线
      const timeline: DiaryEntry[] = []
      
      for (let day = user.currentDay || 1; day >= 1; day--) {
        const dayNotes = notes[day] || []
        const dayActions = history[day] || []
        
        if (dayNotes.length > 0 || dayActions.length > 0) {
          const stage = getStage(day)
          const date = new Date(user.startDate)
          date.setDate(date.getDate() + day - 1)
          
          timeline.push({
            dayNumber: day,
            date: date.toLocaleDateString('zh-CN'),
            notes: dayNotes.map((n: any) => n.content || n),
            completedActions: dayActions,
            stage
          })
        }
      }
      
      setEntries(timeline)
    }
  }, [])

  const getStage = (day: number): string => {
    if (day <= 3) return '适应期'
    if (day <= 14) return '信任建立期'
    if (day <= 30) return '行为塑造期'
    if (day <= 60) return '稳定护理期'
    return '长期优化期'
  }

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.stage === filter)

  const handleShareXHS = (entry: DiaryEntry) => {
    const template = diaryTemplate(entry.dayNumber, entry.notes.length > 0 ? entry.notes : entry.completedActions)
    const text = generateXHSText(template)
    copyToClipboard(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleExportAll = () => {
    const lines: string[] = ['📖 我的养猫90天日记\n']
    
    for (const entry of entries) {
      lines.push(`\n━━━ Day ${entry.dayNumber} · ${entry.stage} ━━━`)
      lines.push(`日期：${entry.date}`)
      
      if (entry.notes.length > 0) {
        lines.push('\n📝 记录：')
        entry.notes.forEach(n => lines.push(`  · ${n}`))
      }
      
      if (entry.completedActions.length > 0) {
        lines.push('\n✅ 完成的行动：')
        entry.completedActions.forEach(a => lines.push(`  · ${a}`))
      }
    }
    
    lines.push('\n\n——来自宠伴 PetMate')
    
    const text = lines.join('\n')
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>养猫日记</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              padding: 40px;
              max-width: 600px;
              margin: 0 auto;
              background: #FFF8E7;
            }
            h1 { color: #5D4037; text-align: center; }
            .day { 
              margin: 30px 0; 
              padding: 20px;
              background: white;
              border-radius: 10px;
            }
            .day-title { 
              font-weight: bold; 
              font-size: 18px;
              color: #FF6B6B;
              border-bottom: 2px solid #FFD700;
              padding-bottom: 10px;
            }
            .note { margin: 10px 0; color: #333; }
            .footer { text-align: center; color: #999; margin-top: 40px; }
          </style>
        </head>
        <body>
          <h1>🐱 我的养猫90天日记</h1>
          ${entries.map(e => `
            <div class="day">
              <div class="day-title">Day ${e.dayNumber} · ${e.stage} · ${e.date}</div>
              ${e.notes.length > 0 ? `<div class="note">${e.notes.map(n => `📝 ${n}`).join('</div><div class="note">')}</div>` : ''}
              ${e.completedActions.length > 0 ? `<div class="note" style="color: #4CAF50;">${e.completedActions.map(a => `✅ ${a}`).join('</div><div class="note" style="color: #4CAF50;">')}</div>` : ''}
            </div>
          `).join('')}
          <div class="footer">宠伴 PetMate · 守护养猫前90天</div>
        </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const stats = {
    totalNotes: entries.reduce((sum, e) => sum + e.notes.length, 0),
    totalDays: entries.length,
    milestones: entries.filter(e => [7, 15, 30, 60, 90].includes(e.dayNumber)).length
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-petmate-primary to-petmate-secondary text-white sticky top-0 z-10 px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-white/80">←</Link>
          <h1 className="font-semibold text-lg">养猫日记</h1>
        </div>
        
        {/* 统计概览 */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
            <div className="text-sm text-white/80">条记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalDays}</div>
            <div className="text-sm text-white/80">天有记录</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.milestones}</div>
            <div className="text-sm text-white/80">个里程碑</div>
          </div>
        </div>
      </header>

      {/* 筛选器 */}
      <div className="px-4 py-3 bg-white border-b sticky top-[140px] z-10">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
              filter === 'all' ? 'bg-petmate-primary text-white' : 'bg-gray-100'
            }`}
          >
            全部
          </button>
          {['适应期', '信任建立期', '行为塑造期', '稳定护理期', '长期优化期'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap ${
                filter === s ? 'bg-petmate-primary text-white' : 'bg-gray-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* 时间线 */}
      <div className="px-4 py-4">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500">还没有记录</p>
            <Link href="/dashboard" className="text-sm text-petmate-primary mt-2 block">
              去记录今天
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <div key={entry.dayNumber} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Day 头部 */}
                <div className="px-4 py-3 bg-gradient-to-r from-petmate-light to-petmate-bg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-petmate-primary">Day {entry.dayNumber}</span>
                    <span className="text-sm text-gray-500 ml-2">{entry.stage}</span>
                    <div className="text-xs text-gray-400">{entry.date}</div>
                  </div>
                  <button
                    onClick={() => handleShareXHS(entry)}
                    className="text-xs bg-red-500 text-white px-3 py-1 rounded-full"
                  >
                    小红书分享
                  </button>
                </div>
                
                {/* 内容 */}
                <div className="p-4">
                  {entry.notes.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-400 mb-1">📝 笔记</p>
                      {entry.notes.map((n, i) => (
                        <p key={i} className="text-sm text-gray-700">{n}</p>
                      ))}
                    </div>
                  )}
                  
                  {entry.completedActions.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-1">✅ 完成</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.completedActions.map((a, i) => (
                          <span key={i} className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                            {a}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 导出按钮 */}
      <div className="fixed bottom-20 right-6 flex flex-col gap-3">
        <button
          onClick={handleExportAll}
          className="w-14 h-14 bg-petmate-primary text-white rounded-full shadow-lg flex items-center justify-center"
          title="导出全部"
        >
          📄
        </button>
      </div>

      {/* 复制成功提示 */}
      {copied && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white px-6 py-3 rounded-lg z-50">
          ✓ 已复制到剪贴板
        </div>
      )}
    </div>
  )
}