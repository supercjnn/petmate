'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge } from '@/components/ui'
import { IconShare, IconCopy, IconCheck } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { 
  ShareContent, 
  generateXiaohongshuContent, 
  copyToClipboard, 
  trackShare,
  generateShareLink
} from '@/lib/share'
import { ACHIEVEMENTS } from '@/lib/achievements'

function ShareContentComponent() {
  const searchParams = useSearchParams()
  const [copied, setCopied] = useState(false)
  const [contentType, setContentType] = useState<ShareContent['type'] | null>(null)
  const [shareContent, setShareContent] = useState<ShareContent | null>(null)

  useEffect(() => {
    // 从URL参数获取分享类型
    const type = searchParams.get('type') as ShareContent['type']
    const achievementId = searchParams.get('achievement')

    if (achievementId) {
      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
      if (achievement) {
        setShareContent({
          type: 'achievement',
          title: `🎉 解锁成就：${achievement.title}`,
          message: achievement.description,
          hashtags: ['养猫', '新手养猫', '猫咪日常', '铲屎官'],
          gradient: 'from-orange-400 to-pink-500',
          icon: achievement.icon,
          data: { achievementId }
        })
        setContentType('achievement')
      }
    } else if (type) {
      generateDefaultContent(type)
    }
  }, [searchParams])

  const generateDefaultContent = (type: ShareContent['type']) => {
    const userData = localStorage.getItem('petmate_user')
    const saved = userData ? JSON.parse(userData) : {}
    const dayNumber = saved.dayNumber || 1

    let content: ShareContent

    switch (type) {
      case 'achievement':
        content = {
          type: 'achievement',
          title: '🎉 我解锁了养猫成就！',
          message: `已坚持${dayNumber}天，成为更好的铲屎官`,
          hashtags: ['养猫', '成就', '铲屎官'],
          gradient: 'from-yellow-400 to-orange-500',
          icon: '🏆'
        }
        break
      case 'progress':
        content = {
          type: 'progress',
          title: `Day ${dayNumber} | 养猫进度更新`,
          message: `已坚持${dayNumber}天，每天一点进步`,
          hashtags: ['养猫', '日常', '坚持'],
          gradient: 'from-blue-400 to-purple-500',
          icon: '📅'
        }
        break
      case 'milestone':
        content = {
          type: 'milestone',
          title: `🎊 完成第${dayNumber}天！`,
          message: '感谢有你在身边，每天都是新收获',
          hashtags: ['养猫', '里程碑', '感谢'],
          gradient: 'from-green-400 to-teal-500',
          icon: '🎊'
        }
        break
      default:
        content = {
          type: 'note',
          title: '分享我的养猫笔记',
          message: '记录与猫咪的每个瞬间',
          hashtags: ['养猫', '笔记', '日常'],
          gradient: 'from-pink-400 to-red-500',
          icon: '📝'
        }
    }

    setShareContent(content)
    setContentType(type)
  }

  const handleShare = (platform: string) => {
    if (!shareContent) return

    trackShare(platform, shareContent.type, shareContent.data?.achievementId)

    // 根据平台处理
    switch (platform) {
      case 'xiaohongshu':
        const xhsContent = generateXiaohongshuContent(shareContent)
        copyToClipboard(xhsContent.body)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
      case 'wechat':
        // 微信分享需要调用微信SDK
        alert('请截图后分享到微信')
        break
      case 'copy':
        const text = `${shareContent.title}\n\n${shareContent.message}\n\n${shareContent.hashtags.map(h => `#${h}`).join(' ')}`
        copyToClipboard(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        break
    }
  }

  const shareTypes = [
    { type: 'achievement' as const, label: '成就分享', icon: '🏆', desc: '分享解锁的成就' },
    { type: 'progress' as const, label: '进度卡片', icon: '📅', desc: '分享我的进度' },
    { type: 'milestone' as const, label: '里程碑', icon: '🎊', desc: '分享重要时刻' },
    { type: 'note' as const, label: '养猫笔记', icon: '📝', desc: '分享养猫经验' }
  ]

  return (
    <AppLayout title="分享">
      <FadeIn>
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2">分享我的养猫之旅</h1>
          <p className="text-gray-500">选择你想分享的内容类型</p>
        </div>

        {/* 分享类型选择 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {shareTypes.map((item, i) => (
            <SlideIn key={item.type} delay={i * 50}>
              <Card
                hover
                className={`text-center ${contentType === item.type ? 'ring-2 ring-orange-500' : ''}`}
                onClick={() => generateDefaultContent(item.type)}
              >
                <span className="text-3xl mb-2 block">{item.icon}</span>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* 预览卡片 */}
        {shareContent && (
          <SlideIn direction="up">
            <Card className={`bg-gradient-to-r ${shareContent.gradient} text-white mb-6`}>
              <div className="text-center">
                <span className="text-4xl mb-3 block">{shareContent.icon}</span>
                <h2 className="text-xl font-bold mb-2">{shareContent.title}</h2>
                <p className="opacity-90 mb-4">{shareContent.message}</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {shareContent.hashtags.map(tag => (
                    <Badge key={tag} className="bg-white/20 text-white">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 小红书合规提示 */}
        {shareContent && (
          <Card className="mb-6 bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>💡 小红书分享提示：</strong>
              正文只给价值，用户主动问再回复。不要写"评论XX"、"私信领取"等诱导互动内容。
            </p>
          </Card>
        )}

        {/* 分享按钮 */}
        {shareContent && (
          <div className="space-y-3">
            <Button
              fullWidth
              size="lg"
              onClick={() => handleShare('xiaohongshu')}
            >
              📱 复制小红书内容
            </Button>
            <Button
              fullWidth
              size="lg"
              variant="outline"
              onClick={() => handleShare('wechat')}
            >
              💬 分享到微信
            </Button>
            <Button
              fullWidth
              variant="ghost"
              onClick={() => handleShare('copy')}
            >
              {copied ? <><IconCheck className="w-4 h-4 mr-2" />已复制</> : <><IconCopy className="w-4 h-4 mr-2" />复制纯文本</>}
            </Button>
          </div>
        )}

        {/* 分享历史 */}
        <Card className="mt-6">
          <h3 className="font-bold mb-3">分享记录</h3>
          <div className="text-center py-4 text-gray-500">
            <IconShare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">分享后将在此显示记录</p>
          </div>
        </Card>
      </FadeIn>
    </AppLayout>
  )
}

export default function SharePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-[60vh]">加载中...</div>}>
      <ShareContentComponent />
    </Suspense>
  )
}