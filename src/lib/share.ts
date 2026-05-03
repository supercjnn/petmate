/**
 * 分享功能核心
 * 支持小红书、朋友圈、微信等多种分享场景
 */

export interface ShareContent {
  type: 'achievement' | 'progress' | 'note' | 'milestone'
  title: string
  message: string
  hashtags: string[]
  gradient: string
  icon?: string
  data?: Record<string, any>
}

export interface ShareTemplate {
  id: string
  name: string
  platform: 'xiaohongshu' | 'wechat' | 'weibo' | 'generic'
  preview: string
  generateContent: (data: ShareContent) => {
    title: string
    content: string
    hashtags: string[]
    imagePrompt?: string
  }
}

// 分享模板
export const SHARE_TEMPLATES: ShareTemplate[] = [
  {
    id: 'achievement_xhs',
    name: '小红书风格',
    platform: 'xiaohongshu',
    preview: '🎉 成就解锁！快来看看我的养猫成绩~',
    generateContent: (data) => ({
      title: data.title,
      content: `${data.message}\n\n${data.hashtags.map(h => `#${h}`).join(' ')}`,
      hashtags: data.hashtags,
      imagePrompt: `温馨猫咪主题，${data.gradient}渐变背景，成就徽章居中`
    })
  },
  {
    id: 'progress_card',
    name: '进度卡片',
    platform: 'generic',
    preview: 'Day 30 | 养猫进度更新',
    generateContent: (data) => ({
      title: `Day ${data.data?.dayNumber || '?'} | ${data.title}`,
      content: data.message,
      hashtags: data.hashtags
    })
  },
  {
    id: 'milestone_share',
    name: '里程碑分享',
    platform: 'wechat',
    preview: '已坚持30天，感谢有你在身边',
    generateContent: (data) => ({
      title: data.title,
      content: `${data.message}\n\n🎁 点击查看我的养猫日记`,
      hashtags: data.hashtags
    })
  }
]

// 生成分享图片配置
export function generateShareImage(content: ShareContent): {
  width: number
  height: number
  background: string
  elements: Array<{
    type: 'text' | 'icon' | 'image' | 'qrcode'
    content: string
    position: { x: number; y: number }
    style?: Record<string, any>
  }>
} {
  return {
    width: 750,
    height: 1000,
    background: content.gradient,
    elements: [
      {
        type: 'icon',
        content: content.icon || '🐱',
        position: { x: 375, y: 150 },
        style: { fontSize: 80 }
      },
      {
        type: 'text',
        content: content.title,
        position: { x: 375, y: 300 },
        style: { fontSize: 36, fontWeight: 'bold', textAlign: 'center' }
      },
      {
        type: 'text',
        content: content.message,
        position: { x: 375, y: 400 },
        style: { fontSize: 24, textAlign: 'center', maxWidth: 600 }
      },
      {
        type: 'text',
        content: content.hashtags.map(h => `#${h}`).join(' '),
        position: { x: 375, y: 550 },
        style: { fontSize: 20, color: '#666' }
      },
      {
        type: 'qrcode',
        content: 'https://petmate.vercel.app',
        position: { x: 375, y: 850 },
        style: { size: 120 }
      }
    ]
  }
}

// 小红书合规内容生成
export function generateXiaohongshuContent(content: ShareContent): {
  title: string
  body: string
  tags: string[]
  isCompliant: boolean
  warnings: string[]
} {
  const warnings: string[] = []
  let isCompliant = true

  // 检查违规词汇
  const violations = [
    { pattern: /私信|加我|加微信/, message: '避免诱导私信' },
    { pattern: /评论.*领|评论.*发/, message: '避免诱导评论' },
    { pattern: /点击.*领取|点击.*免费/, message: '避免诱导点击' },
    { pattern: /必看|不看后悔|错过拍大腿/, message: '避免夸张表达' }
  ]

  const fullText = content.title + content.message
  for (const v of violations) {
    if (v.pattern.test(fullText)) {
      warnings.push(v.message)
      isCompliant = false
    }
  }

  // 生成合规内容
  const title = content.title.slice(0, 20) // 小红书标题限制20字

  // 正文：只给价值，不诱导互动
  const body = `${content.message}

养猫90天，我学到了这些：
✅ 耐心比技巧更重要
✅ 每只猫都有自己的性格
✅ 科学养猫真的能少走弯路

想了解更多养猫经验，可以看看我主页的其他笔记~`

  // 标签：最多10个
  const tags = content.hashtags.slice(0, 10)

  return {
    title,
    body,
    tags,
    isCompliant,
    warnings
  }
}

// 生成分享链接
export function generateShareLink(
  type: ShareContent['type'],
  data: Record<string, any>
): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://petmate.vercel.app'
  const params = new URLSearchParams({
    type,
    ...data
  })
  return `${baseUrl}/share?${params.toString()}`
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // 降级方案
    const textarea = document.createElement('textarea')
    textarea.value = text
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

// 生成分享海报数据
export function generatePosterData(content: ShareContent): {
  background: string
  title: string
  subtitle: string
  stats: Array<{ label: string; value: string }>
  qrCode: string
  watermark: string
} {
  return {
    background: content.gradient,
    title: content.title,
    subtitle: content.message,
    stats: [
      { label: '坚持天数', value: `${content.data?.dayNumber || 0}天` },
      { label: '完成行动', value: `${content.data?.actionsCompleted || 0}项` },
      { label: '养猫笔记', value: `${content.data?.notesCount || 0}篇` }
    ],
    qrCode: 'https://petmate.vercel.app',
    watermark: '宠伴 PetMate'
  }
}

// 分享追踪
export function trackShare(
  platform: string,
  contentType: ShareContent['type'],
  contentId?: string
) {
  // 发送埋点
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'share', {
      platform,
      content_type: contentType,
      content_id: contentId
    })
  }

  // 本地记录
  const shareHistory = JSON.parse(localStorage.getItem('petmate_shares') || '[]')
  shareHistory.push({
    platform,
    contentType,
    contentId,
    timestamp: new Date().toISOString()
  })
  localStorage.setItem('petmate_shares', JSON.stringify(shareHistory.slice(-100)))
}