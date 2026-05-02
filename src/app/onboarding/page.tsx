'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  const questions = [
    { id: 'status', text: '猫咪是否已经到家？', options: ['还没到家', '已经到家了'] },
    { id: 'eating', text: '猫咪进食情况如何？', options: ['正常进食', '吃得少', '不吃', '没观察'] },
    { id: 'hiding', text: '猫咪躲藏情况？', options: ['不躲', '偶尔躲', '经常躲', '一直躲'] },
  ]
  
  const currentQ = questions[step]
  const progress = ((step + 1) / questions.length) * 100
  
  const handleAnswer = (value: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: value }))
    if (step < questions.length - 1) {
      setStep(step + 1)
    } else {
      // 完成
      localStorage.setItem('petmate_user', JSON.stringify({ ...answers, dayNumber: 1 }))
      router.push('/dashboard')
    }
  }
  
  return (
    <div className="min-h-screen py-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-petmate-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">步骤 {step + 1} / {questions.length}</p>
      </div>
      
      {/* Question */}
      <div className="bg-white rounded-xl p-6 shadow-md">
        <h2 className="text-lg font-semibold mb-6">{currentQ.text}</h2>
        <div className="space-y-3">
          {currentQ.options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleAnswer(opt)}
              className="w-full py-3 px-4 text-left rounded-lg border border-gray-200 hover:border-petmate-primary hover:bg-petmate-light transition"
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}