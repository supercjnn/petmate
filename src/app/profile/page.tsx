'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Experience = 'beginner' | 'intermediate' | 'experienced'
type Environment = 'single' | 'family' | 'multi-pet'

export default function ProfilePage() {
  const [nickname, setNickname] = useState('')
  const [experience, setExperience] = useState<Experience>('beginner')
  const [environment, setEnvironment] = useState<Environment>('single')
  const [catName, setCatName] = useState('')
  const [catBreed, setCatBreed] = useState('')
  const [catBirthday, setCatBirthday] = useState('')
  const [reminderTime, setReminderTime] = useState('09:00')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // 加载已保存的用户数据
    const userData = localStorage.getItem('petmate_user')
    if (userData) {
      const user = JSON.parse(userData)
      setNickname(user.nickname || '')
      setCatName(user.catName || '')
      setCatBreed(user.catBreed || '')
      setCatBirthday(user.catBirthDate || '')
      if (user.settings) {
        setReminderTime(user.settings.reminderTime || '09:00')
        setExperience(user.settings.userExperience || 'beginner')
        setEnvironment(user.settings.homeEnvironment || 'single')
      }
    }
  }, [])

  const handleSave = () => {
    const userData = {
      id: localStorage.getItem('petmate_user_id') || `user_${Date.now()}`,
      nickname: nickname || '铲屎官',
      currentDay: 1,
      startDate: new Date().toISOString(),
      catName,
      catBreed,
      catBirthDate: catBirthday,
      isPaid: false,
      settings: {
        reminderEnabled: true,
        reminderTime,
        reminderMethod: 'browser',
        userExperience: experience,
        homeEnvironment: environment
      }
    }
    
    localStorage.setItem('petmate_user', JSON.stringify(userData))
    localStorage.setItem('petmate_user_id', userData.id)
    setSaved(true)
    
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b">
        <Link href="/dashboard" className="text-gray-500">←</Link>
        <h1 className="font-semibold">个人设置</h1>
      </header>

      {/* 用户信息 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-4">基本资料</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="铲屎官"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            />
          </div>
        </div>
      </section>

      {/* 养猫经验 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-4">养猫经验</h2>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setExperience('beginner')}
            className={`p-3 rounded-lg border text-center transition-all ${
              experience === 'beginner'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">🌱</div>
            <div className="text-sm">新手</div>
            <div className="text-xs text-gray-400">第一次养猫</div>
          </button>
          
          <button
            onClick={() => setExperience('intermediate')}
            className={`p-3 rounded-lg border text-center transition-all ${
              experience === 'intermediate'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">🌿</div>
            <div className="text-sm">有经验</div>
            <div className="text-xs text-gray-400">养过1-2只</div>
          </button>
          
          <button
            onClick={() => setExperience('experienced')}
            className={`p-3 rounded-lg border text-center transition-all ${
              experience === 'experienced'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="text-2xl mb-1">🌳</div>
            <div className="text-sm">资深</div>
            <div className="text-xs text-gray-400">养猫达人</div>
          </button>
        </div>
      </section>

      {/* 家庭环境 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-4">家庭环境</h2>
        
        <div className="space-y-3">
          <button
            onClick={() => setEnvironment('single')}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              environment === 'single'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🏠</span>
              <div>
                <div className="text-sm font-medium">独居</div>
                <div className="text-xs text-gray-400">只有我和猫</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setEnvironment('family')}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              environment === 'family'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">👨‍👩‍👧</span>
              <div>
                <div className="text-sm font-medium">有家庭成员</div>
                <div className="text-xs text-gray-400">有小孩或其他家人</div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => setEnvironment('multi-pet')}
            className={`w-full p-3 rounded-lg border text-left transition-all ${
              environment === 'multi-pet'
                ? 'border-petmate-primary bg-petmate-primary/10'
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-xl">🐱🐱</span>
              <div>
                <div className="text-sm font-medium">多宠物家庭</div>
                <div className="text-xs text-gray-400">还有其他宠物</div>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 猫咪信息 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-4">猫咪信息</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">猫咪名字</label>
            <input
              type="text"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="给它起个名字"
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            />
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-1 block">品种</label>
            <select
              value={catBreed}
              onChange={(e) => setCatBreed(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            >
              <option value="">选择品种</option>
              <option value="chinese-domestic">中华田园猫</option>
              <option value="british-shorthair">英国短毛猫</option>
              <option value="american-shorthair">美国短毛猫</option>
              <option value="ragdoll">布偶猫</option>
              <option value="persian">波斯猫</option>
              <option value="maine-coon">缅因猫</option>
              <option value="siamese">暹罗猫</option>
              <option value="russian-blue">俄罗斯蓝猫</option>
              <option value="sphynx">无毛猫</option>
              <option value="scottish-fold">折耳猫</option>
              <option value="other">其他/混合</option>
            </select>
          </div>
          
          <div>
            <label className="text-sm text-gray-500 mb-1 block">生日/接回家日期</label>
            <input
              type="date"
              value={catBirthday}
              onChange={(e) => setCatBirthday(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            />
          </div>
        </div>
      </section>

      {/* 提醒设置 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-4">提醒设置</h2>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-500 mb-1 block">每日提醒时间</label>
            <input
              type="time"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-petmate-primary"
            />
          </div>
          
          <p className="text-xs text-gray-400">
            系统会在设定时间提醒你查看今日行动卡
          </p>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="mx-4 mt-6">
        <button
          onClick={handleSave}
          className={`w-full py-3 rounded-lg font-medium transition-all ${
            saved
              ? 'bg-green-500 text-white'
              : 'bg-petmate-primary text-white'
          }`}
        >
          {saved ? '✓ 已保存' : '保存设置'}
        </button>
      </div>

      {/* 版本信息 */}
      <div className="text-center text-xs text-gray-400 mt-8">
        <p>宠伴 PetMate v1.2.0</p>
        <p className="mt-1">© 2026 PetMate</p>
      </div>
    </div>
  )
}