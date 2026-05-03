'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Progress } from '@/components/ui'
import { IconArrowLeft, IconArrowRight, IconCat, IconCalendar, IconHeart, IconBell, IconAI, IconCheck } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'

const steps = [
  {
    title: '欢迎来到 PetMate',
    description: '你的新手养猫90天决策伙伴',
    icon: '🐱',
    content: 'PetMate将陪伴你度过养猫最初的90天，每天提供专业的行动指导，帮助你成为一名合格的铲屎官。'
  },
  {
    title: '每日行动卡',
    description: '每天都有明确的任务',
    icon: '📅',
    content: '根据你当前的天数，我们会为你推荐今天最适合做的事情，让你不再迷茫。'
  },
  {
    title: 'AI问答助手',
    description: '随时解答你的疑问',
    icon: '🤖',
    content: '遇到问题随时问AI，从猫咪行为到健康护理，获得专业的建议。'
  },
  {
    title: '健康档案',
    description: '记录猫咪的成长',
    icon: '❤️',
    content: '体重追踪、疫苗记录、驱虫提醒，全方位管理猫咪健康。'
  },
  {
    title: '开始你的旅程',
    description: '设置你的猫咪信息',
    icon: '🚀',
    content: '告诉我们你的猫咪叫什么，我们将为你定制专属计划。'
  }
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [catName, setCatName] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [catGender, setCatGender] = useState<'male' | 'female' | ''>('')
  const [loading, setLoading] = useState(false)

  const isLastStep = currentStep === steps.length - 1
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (isLastStep) {
      handleComplete()
    } else {
      setCurrentStep(s => s + 1)
    }
  }

  const handleComplete = async () => {
    if (!catName.trim()) {
      alert('请输入猫咪名字')
      return
    }

    setLoading(true)

    // 保存用户数据
    const userData = {
      name: '新晋铲屎官',
      dayNumber: 1,
      createdAt: new Date().toISOString(),
      cat: {
        name: catName,
        breed: catBreed,
        gender: catGender
      }
    }

    localStorage.setItem('petmate_user', JSON.stringify(userData))

    // 创建猫咪档案
    const catProfile = {
      id: `cat_${Date.now()}`,
      name: catName,
      breed: catBreed || undefined,
      gender: catGender || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const existingCats = localStorage.getItem('petmate_cats')
    const cats = existingCats ? JSON.parse(existingCats) : []
    cats.push(catProfile)
    localStorage.setItem('petmate_cats', JSON.stringify(cats))

    // 跳转到dashboard
    router.push('/dashboard')
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-purple-50 flex flex-col">
      {/* 顶部进度条 */}
      <div className="p-4">
        <Progress value={progress} className="h-1" />
        <div className="flex justify-between mt-2 text-xs text-gray-400">
          <span>步骤 {currentStep + 1}/{steps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      {/* 内容区 */}
      <div className="flex-1 flex items-center justify-center p-4">
        <FadeIn key={currentStep}>
          <Card className="w-full max-w-md text-center py-8">
            {/* 图标 */}
            <div className="text-6xl mb-4">{step.icon}</div>

            {/* 标题 */}
            <h1 className="text-2xl font-bold mb-2">{step.title}</h1>
            <p className="text-gray-500 mb-6">{step.description}</p>

            {/* 内容 */}
            <p className="text-gray-600 mb-8 leading-relaxed">{step.content}</p>

            {/* 最后一步：输入猫咪信息 */}
            {isLastStep && (
              <SlideIn direction="up">
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      猫咪名字 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      placeholder="你的猫咪叫什么？"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">品种</label>
                      <select
                        value={catBreed}
                        onChange={(e) => setCatBreed(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300"
                      >
                        <option value="">选择品种</option>
                        <option value="英国短毛猫">英国短毛猫</option>
                        <option value="美国短毛猫">美国短毛猫</option>
                        <option value="布偶猫">布偶猫</option>
                        <option value="暹罗猫">暹罗猫</option>
                        <option value="中华田园猫">中华田园猫</option>
                        <option value="其他">其他</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">性别</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCatGender('male')}
                          className={`flex-1 py-3 rounded-xl border-2 ${
                            catGender === 'male' 
                              ? 'border-blue-500 bg-blue-50 text-blue-700' 
                              : 'border-gray-200'
                          }`}
                        >
                          ♂ 公
                        </button>
                        <button
                          onClick={() => setCatGender('female')}
                          className={`flex-1 py-3 rounded-xl border-2 ${
                            catGender === 'female' 
                              ? 'border-pink-500 bg-pink-50 text-pink-700' 
                              : 'border-gray-200'
                          }`}
                        >
                          ♀ 母
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </SlideIn>
            )}
          </Card>
        </FadeIn>
      </div>

      {/* 底部按钮 */}
      <div className="p-4 space-y-3">
        {currentStep > 0 && (
          <Button 
            variant="ghost" 
            fullWidth 
            onClick={() => setCurrentStep(s => s - 1)}
          >
            上一步
          </Button>
        )}
        
        <Button 
          fullWidth 
          size="lg"
          onClick={handleNext}
          disabled={loading || (isLastStep && !catName.trim())}
        >
          {loading ? '创建中...' : isLastStep ? '开始养猫之旅' : '下一步'}
          {!isLastStep && <IconArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        {currentStep === 0 && (
          <p className="text-center text-sm text-gray-400">
            已有账号？ <span onClick={() => router.push('/dashboard')} className="text-orange-500 cursor-pointer">直接进入</span>
          </p>
        )}
      </div>
    </div>
  )
}