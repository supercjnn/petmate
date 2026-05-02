'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getRecommendedQuestions, analyzeUserIntent } from '@/lib/ai-enhanced'

export default function AIEnhancedPage() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [dayNumber, setDayNumber] = useState(1)
  const [catName, setCatName] = useState('')
  const [history, setHistory] = useState<Array<{ q: string; a: string; intent?: any }>>([])
  const [showHistory, setShowHistory] = useState(true)

  useEffect(() => {
    // 加载用户信息
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      const user = JSON.parse(userData)
      setDayNumber(user.currentDay || 1)
      setCatName(user.catName || '')
    }
    
    // 加载对话历史
    const convData = localStorage.getItem('petmate_conversations')
    if (convData) {
      const messages = JSON.parse(convData)
      const pairs = []
      for (let i = 0; i < messages.length - 1; i += 2) {
        if (messages[i] && messages[i + 1]) {
          pairs.push({
            q: messages[i].content,
            a: messages[i + 1].content
          })
        }
      }
      setHistory(pairs.slice(-10))
    }
  }, [])

  const recommendedQuestions = getRecommendedQuestions(dayNumber)

  const handleAsk = async (q?: string) => {
    const questionText = q || question
    if (!questionText.trim()) return
    
    setLoading(true)
    setQuestion(questionText)
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          dayNumber,
          catName
        })
      })
      
      const data = await response.json()
      const answerText = data.data?.answer || '抱歉，我暂时无法回答这个问题。'
      
      setAnswer(answerText)
      
      // 分析意图
      const intent = analyzeUserIntent(questionText)
      
      // 添加到历史
      setHistory(prev => [...prev.slice(-9), {
        q: questionText,
        a: answerText,
        intent
      }])
      
      // 如果是健康紧急问题，显示警告
      if (intent.urgency === 'high') {
        setAnswer(prev => prev + '\n\n⚠️ 这可能是一个紧急情况，建议尽快联系兽医或前往宠物医院！')
      }
      
    } catch (error) {
      setAnswer('网络错误，请稍后重试。')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-petmate-primary to-petmate-secondary text-white sticky top-0 z-10 px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-white/80">←</Link>
          <h1 className="font-semibold text-lg">AI智能助手</h1>
        </div>
        <p className="text-sm text-white/80">
          Day {dayNumber} · {catName ? `${catName}的专属顾问` : '你的养猫顾问'}
        </p>
      </header>

      {/* 推荐问题 */}
      <section className="px-4 py-3">
        <p className="text-xs text-gray-500 mb-2">💡 你可能想问：</p>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {recommendedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleAsk(q)}
              className="px-3 py-1.5 bg-petmate-bg rounded-full text-sm whitespace-nowrap"
            >
              {q.slice(0, 15)}...
            </button>
          ))}
        </div>
      </section>

      {/* 对话历史 */}
      {showHistory && history.length > 0 && (
        <section className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-500">📜 对话记录</p>
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-gray-400"
            >
              收起
            </button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {history.slice().reverse().map((h, i) => (
              <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm font-medium">{h.q}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{h.a}</p>
                {h.intent && h.intent.urgency === 'high' && (
                  <span className="text-xs text-red-500">⚠️ 紧急</span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* AI回答区域 */}
      {answer && (
        <section className="px-4 py-3">
          <div className="bg-white rounded-xl p-5 shadow-md">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-petmate-primary flex items-center justify-center text-white">
                🤖
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium mb-1">AI助手</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
              </div>
            </div>
          </div>
          
          {/* 快捷操作 */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => navigator.clipboard.writeText(answer)}
              className="flex-1 py-2 bg-gray-100 rounded-lg text-sm"
            >
              复制
            </button>
            <button
              onClick={() => setAnswer('')}
              className="flex-1 py-2 bg-gray-100 rounded-lg text-sm"
            >
              继续问
            </button>
          </div>
        </section>
      )}

      {/* 输入区域 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-md mx-auto flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="输入你的问题..."
            className="flex-1 px-4 py-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading}
            className="w-12 h-12 bg-petmate-primary text-white rounded-full flex items-center justify-center disabled:opacity-50"
          >
            {loading ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  )
}