'use client'

import { useState } from 'react'
import Link from 'next/link'
import { shareToSocial, copyToClipboard, ShareContent } from '@/lib/share'

export default function SharePage() {
  const [copied, setCopied] = useState(false)

  const handleShare = async (type: ShareContent['type']) => {
    let content: ShareContent
    
    switch (type) {
      case 'daily_card':
        content = {
type: 'daily_card',
          title: '今日行动卡',
          description: '今天和小猫咪的互动进展...',
          data: { day: 1 }
        }
        break
      case 'milestone':
        content = {
          type: 'milestone',
          title: '🎉 我完成了7天守护',
          description: '第一阶段适应期顺利度过！感谢宠伴的每日指导。',
          data: { day: 7 }
        }
        break
      case 'achievement':
        content = {
          type: 'achievement',
          title: '🏆 获得"第一周守护者"徽章',
          description: '坚持7天陪伴，解锁了第一个成就徽章！',
          data: { achievement: '第一周守护者' }
        }
        break
      case 'streak':
        content = {
          type: 'streak',
          title: '🔥 连续打卡30天',
          description: '我的养猫90天日记，宠伴陪我一路成长',
          data: { days: 30 }
        }
        break
      default:
        content = {
          type: 'progress',
          title: '养猫进展',
          description: '今天和小猫咪的互动进展',
          data: {}
        }
    }
    
    shareToSocial('wechat', content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b">
        <Link href="/dashboard" className="text-gray-500">←</Link>
        <h1 className="font-semibold">分享</h1>
      </header>

      {/* 分享卡片 */}
      <div className="p-4 space-y-4">
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-medium mb-3">分享到社交平台</h2>
          <p className="text-sm text-gray-500 mb-4">
            把你的养猫进展分享给朋友，邀请他们一起见证
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleShare('daily_card')}
              className="p-4 bg-petmate-bg rounded-lg text-left"
            >
              <div className="text-2xl mb-2">📋</div>
              <div className="text-sm font-medium">今日行动卡</div>
              <div className="text-xs text-gray-400">分享今天的进展</div>
            </button>
            
            <button
              onClick={() => handleShare('milestone')}
              className="p-4 bg-petmate-bg rounded-lg text-left"
            >
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-medium">里程碑</div>
              <div className="text-xs text-gray-400">分享阶段性成就</div>
            </button>
            
            <button
              onClick={() => handleShare('achievement')}
              className="p-4 bg-petmate-bg rounded-lg text-left"
            >
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm font-medium">成就徽章</div>
              <div className="text-xs text-gray-400">晒出你的徽章</div>
            </button>
            
            <button
              onClick={() => handleShare('streak')}
              className="p-4 bg-petmate-bg rounded-lg text-left"
            >
              <div className="text-2xl mb-2">📖</div>
              <div className="text-sm font-medium">养猫日记</div>
              <div className="text-xs text-gray-400">90天完整记录</div>
            </button>
          </div>
        </section>

        {/* 导出功能 */}
        <section className="bg-white rounded-xl p-5 shadow-sm">
          <h2 className="font-medium mb-3">导出记录</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                // 简单导出提示
                alert('功能开发中，敬请期待！')
              }}
              className="w-full p-3 border rounded-lg flex items-center gap-3 text-left"
            >
              <span className="text-xl">📄</span>
              <div>
                <div className="text-sm font-medium">导出PDF</div>
                <div className="text-xs text-gray-400">保存完整90天记录</div>
              </div>
              <span className="ml-auto text-gray-300">›</span>
            </button>
            
            <button
              onClick={async () => {
                const data = localStorage.getItem('petmate_user')
                if (data) {
                  await copyToClipboard(data)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }
              }}
              className="w-full p-3 border rounded-lg flex items-center gap-3 text-left"
            >
              <span className="text-xl">📋</span>
              <div>
                <div className="text-sm font-medium">备份数据</div>
                <div className="text-xs text-gray-400">复制到剪贴板</div>
              </div>
              <span className="ml-auto text-gray-300">›</span>
            </button>
          </div>
        </section>

        {/* 小红书分享提示 */}
        <section className="bg-gradient-to-r from-pink-50 to-red-50 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📱</span>
            <div>
              <div className="font-medium text-sm">分享到小红书</div>
              <div className="text-xs text-gray-500">获得更多新手铲屎官关注</div>
            </div>
          </div>
          <button
            onClick={() => {
              const text = `我已经使用宠伴PetMate陪伴猫咪7天了！每天都在进步~

✅ 有详细的行动指导
✅ AI问答解答养猫疑惑  
✅ 还能记录每天的观察

新手养猫真的不焦虑了！

#新手养猫 #养猫攻略 #猫咪日常`
              copyToClipboard(text).then(() => {
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              })
            }}
            className={`w-full py-2 rounded-lg text-sm ${
              copied ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {copied ? '✓ 已复制文案' : '复制分享文案'}
          </button>
        </section>

        {/* 提示 */}
        <p className="text-xs text-gray-400 text-center">
          分享你的养猫故事，帮助更多新手铲屎官
        </p>
      </div>
    </div>
  )
}