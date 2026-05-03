'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  ACHIEVEMENTS, 
  Achievement, 
  AchievementProgress,
  getAllAchievementProgress, 
  getUnlockedCount,
  getUnlockedAchievements
} from '@/lib/achievements'
import { copyShareText, getAvailableTemplates, achievementTemplate, generateXHSText } from '@/lib/xiaohongshu'
import { generateAchievementCard, downloadPoster } from '@/lib/poster'

export default function AchievementsPage() {
  const [progressList, setProgressList] = useState<AchievementProgress[]>([])
  const [unlockedTimes, setUnlockedTimes] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementProgress | null>(null)
  const [showShareModal, setShowShareModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const userDataStr = localStorage.getItem('petmate_user')
    if (userDataStr) {
      const user = JSON.parse(userDataStr)
      setUserData(user)
      const progress = getAllAchievementProgress({
        currentDay: user.dayNumber || user.currentDay || 1,
        totalDaysCompleted: user.totalDaysCompleted || Object.keys(user.history || {}).length,
        streakDays: user.streakDays || 0,
        postsCount: user.postsCount || 0,
        commentsCount: user.commentsCount || 0,
        likesReceived: user.likesReceived || 0,
        followersCount: user.followersCount || 0,
        healthRecordsCount: user.healthRecordsCount || 0,
        achievementsUnlocked: user.achievements || [],
        history: user.history || {},
        notes: user.notes || {}
      })
      setProgressList(progress)
      setUnlockedTimes({})
    }
    setLoading(false)
  }, [])
  
  // 按类型分组
  const milestoneAchievements = progressList.filter(p => p.achievement.category === 'progress')
  const streakAchievements = progressList.filter(p => p.achievement.category === 'social')
  const specialAchievements = progressList.filter(p => p.achievement.category === 'special')
  
  const unlockedCount = getUnlockedCount(progressList)
  const totalCount = ACHIEVEMENTS.length
  
  // 渲染成就卡片
  const renderAchievementCard = (progress: AchievementProgress) => {
    const { achievement, unlocked, progress: percent } = progress
    const unlockedAt = unlockedTimes[achievement.id]
    const progressText = `${progress.current}/${progress.target}`
    
    return (
      <div
        key={achievement.id}
        onClick={() => setSelectedAchievement(progress)}
        className={`
          relative p-4 rounded-xl border-2 transition-all cursor-pointer
          ${unlocked 
            ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-300 shadow-md' 
            : 'bg-gray-50 border-gray-200 opacity-75'
          }
          hover:scale-[1.02] hover:shadow-lg
        `}
      >
        {/* 成就图标 */}
        <div className={`
          text-4xl mb-2 text-center
          ${unlocked ? '' : 'grayscale'}
        `}>
          {achievement.icon}
        </div>
        
        {/* 成就名称 */}
        <h3 className={`
          font-semibold text-center mb-1
          ${unlocked ? 'text-amber-700' : 'text-gray-500'}
        `}>
          {achievement.name}
        </h3>
        
        {/* 进度条 */}
        {!unlocked && percent > 0 && (
          <div className="mt-2">
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gray-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">{progressText}</p>
          </div>
        )}
        
        {/* 已解锁标记 */}
        {unlocked && (
          <div className="absolute top-2 right-2">
            <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full">
              已解锁
            </span>
          </div>
        )}
        
        {/* 解锁时间 */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-amber-600 text-center mt-1">
            {new Date(unlockedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        加载中...
      </div>
    )
  }
  
  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl">←</Link>
            <h1 className="font-semibold text-lg">我的成就</h1>
          </div>
          <div className="text-sm text-gray-500">
            {unlockedCount}/{totalCount} 已解锁
          </div>
        </div>
      </div>
      
      {/* 总进度 */}
      <div className="px-4 py-4">
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🏆</div>
            <div className="flex-1">
              <h2 className="font-semibold text-amber-800 mb-2">成就收集进度</h2>
              <div className="h-3 bg-amber-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                  style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                />
              </div>
              <p className="text-sm text-amber-700 mt-1">
                已解锁 {unlockedCount} 个成就，还剩 {totalCount - unlockedCount} 个等待解锁
              </p>
            </div>
          </div>
        </div>
        
        {/* 里程碑成就 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>🎯</span> 里程碑成就
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {milestoneAchievements.map(renderAchievementCard)}
          </div>
        </section>
        
        {/* 连续成就 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>🔥</span> 连续成就
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {streakAchievements.map(renderAchievementCard)}
          </div>
        </section>
        
        {/* 特殊成就 */}
        <section className="mb-6">
          <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span>⭐</span> 特殊成就
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {specialAchievements.map(renderAchievementCard)}
          </div>
        </section>
      </div>
      
      {/* 成就详情弹窗 */}
      {selectedAchievement && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAchievement(null)}
        >
          <div 
            className="bg-white rounded-2xl p-6 w-full max-w-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              {/* 图标 */}
              <div className={`
                text-6xl mb-4
                ${selectedAchievement.unlocked ? '' : 'grayscale'}
              `}>
                {selectedAchievement.achievement.icon}
              </div>
              
              {/* 名称 */}
              <h2 className={`
                text-xl font-bold mb-2
                ${selectedAchievement.unlocked ? 'text-amber-600' : 'text-gray-500'}
              `}>
                {selectedAchievement.achievement.name}
              </h2>
              
              {/* 描述 */}
              <p className="text-gray-600 mb-4">
                {selectedAchievement.achievement.description}
              </p>
              
              {/* 状态 */}
              {selectedAchievement.unlocked ? (
                <div className="bg-amber-50 rounded-lg p-3 mb-4">
                  <p className="text-amber-700 font-medium">已解锁</p>
                  {unlockedTimes[selectedAchievement.achievement.id] && (
                    <p className="text-sm text-amber-600">
                      解锁时间：{new Date(unlockedTimes[selectedAchievement.achievement.id]).toLocaleString()}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div 
                      className="h-full bg-petmate-primary transition-all"
                      style={{ width: `${selectedAchievement.progress}%` }}
                    />
                  </div>
                  <p className="text-gray-600 text-sm">
                    进度：{`${selectedAchievement.current}/${selectedAchievement.target}`}
                  </p>
                </div>
              )}
              
              {/* 分享按钮 */}
              {selectedAchievement.unlocked && (
                <button
                  onClick={async () => {
                    const template = achievementTemplate(
                      selectedAchievement.achievement.name,
                      userData?.dayNumber || userData?.currentDay || 7
                    )
                    const text = generateXHSText(template)
                    const success = await copyShareText(text)
                    if (success) {
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }
                  }}
                  className="w-full py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-lg font-medium mb-2"
                >
                  {copied ? '已复制分享文案' : '分享到小红书'}
                </button>
              )}
              
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg font-medium"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 分享按钮 */}
      <div className="fixed bottom-20 right-4">
        <button
          onClick={() => setShowShareModal(true)}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg flex items-center justify-center text-xl"
          title="分享成就"
        >
          📱
        </button>
      </div>
      
      {/* 分享弹窗 */}
      {showShareModal && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center"
          onClick={() => setShowShareModal(false)}
        >
          <div 
            className="bg-white rounded-t-2xl w-full max-w-lg p-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">分享成就</h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-400 text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* 分享模板选择 */}
            <div className="space-y-3 mb-4">
              {getAvailableTemplates().slice(0, 3).map(template => (
                <button
                  key={template.type}
                  onClick={async () => {
                    const shareTemplate = achievementTemplate('养猫达人', userData?.dayNumber || userData?.currentDay || 7)
                    const text = generateXHSText(shareTemplate)
                    const success = await copyShareText(text)
                    if (success) {
                      setCopied(true)
                      setTimeout(() => {
                        setCopied(false)
                        setShowShareModal(false)
                      }, 1500)
                    }
                  }}
                  className="w-full p-4 border rounded-xl text-left hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">点击复制分享文案</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            {/* 生成成就卡片 */}
            <button
              onClick={async () => {
                if (!selectedAchievement || !selectedAchievement.unlocked) return
                setGenerating(true)
                try {
                  const blob = await generateAchievementCard({
                    title: selectedAchievement.achievement.name,
                    icon: selectedAchievement.achievement.icon,
                    description: selectedAchievement.achievement.description,
                    brand: '宠伴 PetMate'
                  })
                  downloadPoster(blob, `achievement-${selectedAchievement.achievement.id}.png`)
                } catch (e) {
                  console.error('生成失败', e)
                }
                setGenerating(false)
              }}
              disabled={generating}
              className="w-full py-3 bg-amber-500 text-white rounded-lg font-medium"
            >
              {generating ? '生成中...' : '生成成就卡片图片'}
            </button>
            
            {/* 提示 */}
            <p className="text-xs text-gray-400 text-center mt-4">
              文案已复制，可直接粘贴到小红书发布
            </p>
          </div>
        </div>
      )}
    </div>
  )
}