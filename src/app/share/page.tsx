'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconArrowLeft, IconDownload, IconShare, IconCopy, IconCheck } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import {
  ShareCard,
  generateMilestoneCard,
  generateAchievementCard,
  generateDailyCard,
  generateWeightCard,
  renderCardToCanvas,
  downloadCard,
  shareCard,
  copyShareText
} from '@/lib/share-card'

export default function SharePage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)
  const [card, setCard] = useState<ShareCard | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // 从URL参数获取分享类型
    const params = new URLSearchParams(window.location.search)
    const type = params.get('type') || 'milestone'
    const dayNumber = parseInt(params.get('day') || '1')
    const catName = params.get('cat') || '小橘'

    let shareCard: ShareCard

    switch (type) {
      case 'milestone':
        shareCard = generateMilestoneCard(dayNumber, '完成每日任务', catName)
        break
      case 'achievement':
        shareCard = generateAchievementCard('第一周达成', '坚持7天，养成养猫好习惯', catName)
        break
      case 'daily':
        shareCard = generateDailyCard(dayNumber, '😊 开心', 3, catName)
        break
      case 'weight':
        shareCard = generateWeightCard(catName, 3.5, 'kg', 'stable')
        break
      default:
        shareCard = generateMilestoneCard(dayNumber, '完成每日任务', catName)
    }

    setCard(shareCard)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (card && canvasRef.current) {
      renderCardToCanvas(card, canvasRef.current)
    }
  }, [card])

  const handleDownload = () => {
    if (card) {
      downloadCard(card)
    }
  }

  const handleShare = async () => {
    if (card) {
      const shared = await shareCard(card)
      if (!shared) {
        handleCopy()
      }
    }
  }

  const handleCopy = () => {
    if (card) {
      navigator.clipboard.writeText(copyShareText(card))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">加载失败</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">分享卡片</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4">
        <FadeIn>
          {/* 卡片预览 */}
          <Card className="overflow-hidden">
            <canvas
              ref={canvasRef}
              width={600}
              height={400}
              className="w-full h-auto"
              style={{ display: 'block' }}
            />
          </Card>

          {/* 分享提示 */}
          <p className="text-center text-sm text-gray-500 mt-4">
            长按图片保存到手机相册
          </p>

          {/* 操作按钮 */}
          <div className="space-y-3 mt-6">
            <SlideIn direction="up" delay={100}>
              <Button onClick={handleDownload} fullWidth size="lg">
                <IconDownload className="w-5 h-5 mr-2" />
                保存图片
              </Button>
            </SlideIn>

            <SlideIn direction="up" delay={200}>
              <Button variant="outline" onClick={handleShare} fullWidth size="lg">
                <IconShare className="w-5 h-5 mr-2" />
                分享到微信
              </Button>
            </SlideIn>

            <SlideIn direction="up" delay={300}>
              <Button 
                variant="ghost" 
                onClick={handleCopy} 
                fullWidth
              >
                {copied ? (
                  <>
                    <IconCheck className="w-4 h-4 mr-2 text-green-500" />
                    已复制文案
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4 mr-2" />
                    复制分享文案
                  </>
                )}
              </Button>
            </SlideIn>
          </div>

          {/* 分享建议 */}
          <SlideIn direction="up" delay={400}>
            <Card className="mt-6 bg-blue-50 border border-blue-100">
              <p className="text-sm text-blue-700">
                💡 分享建议：可以将卡片分享到小红书、朋友圈或养猫群，记录你和猫咪的成长！
              </p>
            </Card>
          </SlideIn>
        </FadeIn>
      </div>
    </div>
  )
}