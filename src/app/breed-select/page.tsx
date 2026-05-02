'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const BREEDS = [
  { id: 'chinese-domestic', name: '中华田园猫', emoji: '🐱', popular: true },
  { id: 'british-shorthair', name: '英国短毛猫', emoji: '🦁', popular: true },
  { id: 'american-shorthair', name: '美国短毛猫', emoji: '🐯', popular: true },
  { id: 'ragdoll', name: '布偶猫', emoji: '🧸', popular: true },
  { id: 'persian', name: '波斯猫', emoji: '👑' },
  { id: 'maine-coon', name: '缅因猫', emoji: '🌲' },
  { id: 'siamese', name: '暹罗猫', emoji: '🗣️' },
  { id: 'russian-blue', name: '俄罗斯蓝猫', emoji: '💎' },
  { id: 'sphynx', name: '无毛猫', emoji: '🌡️' },
  { id: 'scottish-fold', name: '折耳猫', emoji: '🎧' },
]

export default function BreedSelectPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const handleSelect = (breedId: string) => {
    setSelected(breedId)
  }

  const handleNext = () => {
    if (step === 1 && selected) {
      setStep(2)
    } else if (step === 2) {
      // 保存到本地存储
      localStorage.setItem('petmate_breed', selected || '')
      router.push('/onboarding')
    }
  }

  return (
    <div className="min-h-screen">
      {step === 1 && (
        <section className="py-6">
          <h1 className="text-lg font-bold mb-2 text-center">你的猫咪是什么品种？</h1>
          <p className="text-sm text-gray-500 mb-6 text-center">
            选择品种后，我们会为你定制专属行动卡
          </p>

          {/* 热门品种 */}
          <div className="mb-6">
            <p className="text-xs text-gray-400 mb-2">热门品种</p>
            <div className="grid grid-cols-2 gap-3">
              {BREEDS.filter(b => b.popular).map(breed => (
                <button
                  key={breed.id}
                  onClick={() => handleSelect(breed.id)}
                  className={`bg-white rounded-lg p-4 shadow-sm text-left transition-all ${
                    selected === breed.id
                      ? 'ring-2 ring-petmate-primary bg-petmate-primary/5'
                      : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{breed.emoji}</div>
                  <div className="font-medium text-sm">{breed.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 其他品种 */}
          <div>
            <p className="text-xs text-gray-400 mb-2">其他品种</p>
            <div className="grid grid-cols-2 gap-3">
              {BREEDS.filter(b => !b.popular).map(breed => (
                <button
                  key={breed.id}
                  onClick={() => handleSelect(breed.id)}
                  className={`bg-white rounded-lg p-4 shadow-sm text-left transition-all ${
                    selected === breed.id
                      ? 'ring-2 ring-petmate-primary bg-petmate-primary/5'
                      : ''
                  }`}
                >
                  <div className="text-2xl mb-1">{breed.emoji}</div>
                  <div className="font-medium text-sm">{breed.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 不确定选项 */}
          <button
            onClick={() => handleSelect('unknown')}
            className={`w-full mt-4 bg-gray-50 rounded-lg p-4 text-center text-sm ${
              selected === 'unknown' ? 'ring-2 ring-petmate-primary' : ''
            }`}
          >
            不确定 / 混合品种
          </button>

          <button
            onClick={handleNext}
            disabled={!selected}
            className={`btn-primary w-full mt-6 ${!selected ? 'opacity-50' : ''}`}
          >
            下一步
          </button>

          <Link href="/onboarding" className="block text-center text-sm text-gray-500 mt-4">
            跳过，使用标准行动卡
          </Link>
        </section>
      )}

      {step === 2 && selected && (
        <section className="py-6">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">
              {BREEDS.find(b => b.id === selected)?.emoji || '🐱'}
            </div>
            <h1 className="text-lg font-bold">
              {BREEDS.find(b => b.id === selected)?.name || '你的猫咪'}
            </h1>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-md mb-6">
            <p className="text-sm mb-4">我们会为你定制以下内容：</p>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                适配该品种的适应期节奏
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                品种特定的护理建议
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                健康风险监测提醒
              </p>
              <p className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                适合的活动量建议
              </p>
            </div>
          </div>

          <button onClick={handleNext} className="btn-primary w-full">
            开始生成行动卡
          </button>
        </section>
      )}
    </div>
  )
}