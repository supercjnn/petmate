'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RiskCheckPage() {
  const [selected, setSelected] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [showAI, setShowAI] = useState(false)
  const [aiAnswer, setAiAnswer] = useState('')
  
  const categories = [
    {
      name: '进食排泄',
      options: ['不吃东西', '不排尿/不排便', '拉稀/腹泻']
    },
    {
      name: '精神状态',
      options: ['一直躲着', '精神萎靡', '异常兴奋']
    },
    {
      name: '身体症状',
      options: ['呕吐', '打喷嚏', '呼吸异常', '眼鼻分泌物异常']
    },
    {
      name: '行为异常',
      options: ['乱尿', '抓人咬人', '过度抓挠']
    }
  ]
  
  const toggleOption = (opt: string) => {
    setSelected(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])
  }
  
  const handleEvaluate = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayNumber: 1,
          status: {
            eating: selected.includes('不吃东西') ? 'none' : 'normal',
            hiding: selected.includes('一直躲着') ? 'always' : 'no',
            vomiting: selected.includes('呕吐'),
            diarrhea: selected.includes('拉稀/腹泻'),
            sneezing: selected.includes('打喷嚏'),
            drinking: 'normal',
            litter: selected.includes('不排尿/不排便') ? 'none' : 'normal',
            activity: selected.includes('精神萎靡') ? 'low' : 'normal',
            breathing_abnormal: selected.includes('呼吸异常'),
          }
        })
      })
      const data = await res.json()
      if (data.success) setResult(data.data)
    } finally {
      setLoading(false)
    }
  }
  
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200 animate-pulse'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }
  
  const handleAIHelp = async () => {
    setShowAI(true)
    setAiAnswer('')
    
    const question = selected.join('、') + '怎么办？'
    
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          dayNumber: 1,
          riskLevel: result?.level
        })
      })
      const data = await res.json()
      if (data.success) setAiAnswer(data.data.answer)
    } catch (error) {
      setAiAnswer('AI暂时无法回答')
    }
  }
  
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-500">← 返回</Link>
          <h1 className="font-semibold">异常情况判断</h1>
        </div>
      </div>
      
      <div className="px-4 py-4">
        {!result ? (
          <>
            {/* 说明 */}
            <div className="bg-petmate-light rounded-lg p-3 mb-4 text-sm">
              <p>选择你观察到的异常情况，我们会帮你判断严重程度和下一步该做什么。</p>
            </div>
            
            {/* Categories */}
            {categories.map((cat) => (
              <div key={cat.name} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-sm text-gray-600">{cat.name}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cat.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => toggleOption(opt)}
                      className={`p-3 rounded-lg border text-left text-sm transition ${
                        selected.includes(opt)
                          ? 'border-petmate-primary bg-petmate-light ring-2 ring-petmate-primary/30'
                          : 'border-gray-200'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={handleEvaluate}
              disabled={loading || selected.length === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? '判断中...' : '开始判断'}
            </button>
            
            {selected.length === 0 && (
              <p className="text-xs text-center text-gray-500 mt-3">请至少选择一项异常情况</p>
            )}
          </>
        ) : (
          <>
            {/* Result */}
            <div className={`rounded-xl p-6 mb-4 ${getRiskColor(result.level)} border`}>
              <p className="font-bold text-lg mb-2">
                {result.level === 'low' && '✓ 低风险'}
                {result.level === 'medium' && '! 中等风险'}
                {result.level === 'high' && '⚠ 高风险'}
                {result.level === 'urgent' && '🚨 紧急'}
              </p>
              <p className="text-sm">{result.message}</p>
            </div>
            
            {/* Actions */}
            {result.actions && (
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-green-600">现在该做</h3>
                {result.actions.map((a: string, i: number) => (
                  <p key={i} className="text-sm mb-2 flex items-center gap-2">
                    <span className="text-green-500">✓</span> {a}
                  </p>
                ))}
              </div>
            )}
            
            {/* Avoids */}
            {result.avoids && (
              <div className="bg-red-50 rounded-xl p-4 mb-4 border border-red-100">
                <h3 className="font-semibold mb-3 text-red-600">不要做</h3>
                {result.avoids.map((a: string, i: number) => (
                  <p key={i} className="text-sm mb-2 text-red-700">✗ {a}</p>
                ))}
              </div>
            )}
            
            {/* Observe */}
            <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
              <h3 className="font-semibold mb-2 text-blue-600">观察时间</h3>
              <p className="text-sm text-blue-800">{result.observe_duration}</p>
            </div>
            
            {/* Escalate */}
            <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
              <h3 className="font-semibold mb-2 text-yellow-700">什么情况下需要联系兽医</h3>
              {result.escalate_conditions.map((c: string, i: number) => (
                <p key={i} className="text-sm text-yellow-800">• {c}</p>
              ))}
            </div>
            
            {/* AI Help */}
            <button
              onClick={handleAIHelp}
              className="w-full py-3 rounded-lg border border-petmate-secondary text-petmate-secondary mb-3"
            >
              🤖 需要更详细的解释？
            </button>
            
            {showAI && aiAnswer && (
              <div className="bg-white rounded-xl p-4 mb-4 shadow-sm">
                <p className="text-sm whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}
            
            {/* Disclaimer */}
            <div className="text-xs text-center text-gray-400 mb-4">
              本建议仅用于养宠日常决策辅助，不能替代兽医诊断。
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setResult(null); setSelected([]); setShowAI(false); }}
                className="flex-1 py-3 rounded-lg border border-gray-200"
              >
                重新判断
              </button>
              <Link href="/dashboard" className="flex-1 btn-primary py-3 text-center">
                返回行动卡
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}