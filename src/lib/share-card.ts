/**
 * 分享卡片生成
 * 生成可分享的里程碑卡片图片
 */

export interface ShareCard {
  type: 'milestone' | 'achievement' | 'daily' | 'weight'
  dayNumber: number
  title: string
  subtitle?: string
  content: string
  stats?: {
    label: string
    value: string | number
  }[]
  catName?: string
  catAvatar?: string
}

// 生成里程碑分享卡片
export function generateMilestoneCard(dayNumber: number, title: string, catName?: string): ShareCard {
  return {
    type: 'milestone',
    dayNumber,
    title: `Day ${dayNumber} 达成！`,
    subtitle: catName ? `和${catName}一起成长` : undefined,
    content: title,
    stats: [
      { label: '连续天数', value: dayNumber },
      { label: '里程碑', value: `${Math.floor(dayNumber / 10)}个` }
    ],
    catName
  }
}

// 生成成就分享卡片
export function generateAchievementCard(
  achievementName: string,
  achievementDescription: string,
  catName?: string
): ShareCard {
  return {
    type: 'achievement',
    dayNumber: 0,
    title: '🏆 成就解锁',
    subtitle: achievementName,
    content: achievementDescription,
    catName
  }
}

// 生成每日打卡分享卡片
export function generateDailyCard(
  dayNumber: number,
  mood: string,
  completedTasks: number,
  catName?: string
): ShareCard {
  return {
    type: 'daily',
    dayNumber,
    title: `Day ${dayNumber} 打卡`,
    subtitle: mood,
    content: `今日完成 ${completedTasks} 项任务`,
    stats: [
      { label: '任务', value: completedTasks }
    ],
    catName
  }
}

// 生成体重记录分享卡片
export function generateWeightCard(
  catName: string,
  weight: number,
  unit: string,
  trend: 'gaining' | 'losing' | 'stable'
): ShareCard {
  const trendLabels = {
    gaining: '📈 体重上升',
    losing: '📉 体重下降',
    stable: '⚖️ 体重稳定'
  }
  
  return {
    type: 'weight',
    dayNumber: 0,
    title: `${catName}的体重记录`,
    subtitle: trendLabels[trend],
    content: `当前体重：${weight}${unit}`,
    stats: [
      { label: '体重', value: `${weight}${unit}` }
    ],
    catName
  }
}

// 渲染卡片为Canvas（用于下载）
export function renderCardToCanvas(card: ShareCard, canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const padding = 40

  // 背景
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#fff7ed')
  gradient.addColorStop(1, '#fef3c7')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // 顶部装饰
  ctx.fillStyle = '#f97316'
  ctx.beginPath()
  ctx.arc(width / 2, 60, 40, 0, Math.PI * 2)
  ctx.fill()

  // 头像区域
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(width / 2, 60, 35, 0, Math.PI * 2)
  ctx.fill()

  // 头像文字
  ctx.fillStyle = '#f97316'
  ctx.font = 'bold 30px system-ui'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(card.catAvatar || '🐱', width / 2, 60)

  // 标题
  ctx.fillStyle = '#1f2937'
  ctx.font = 'bold 28px system-ui'
  ctx.fillText(card.title, width / 2, 140)

  // 副标题
  if (card.subtitle) {
    ctx.fillStyle = '#6b7280'
    ctx.font = '18px system-ui'
    ctx.fillText(card.subtitle, width / 2, 180)
  }

  // 内容
  ctx.fillStyle = '#374151'
  ctx.font = '20px system-ui'
  const lines = wrapText(ctx, card.content, width - padding * 2)
  lines.forEach((line, i) => {
    ctx.fillText(line, width / 2, 230 + i * 30)
  })

  // 统计数据
  if (card.stats && card.stats.length > 0) {
    const statsY = 320
    const statWidth = (width - padding * 2) / card.stats.length
    
    card.stats.forEach((stat, i) => {
      const x = padding + statWidth * i + statWidth / 2
      
      ctx.fillStyle = '#f97316'
      ctx.font = 'bold 32px system-ui'
      ctx.fillText(String(stat.value), x, statsY)
      
      ctx.fillStyle = '#9ca3af'
      ctx.font = '14px system-ui'
      ctx.fillText(stat.label, x, statsY + 30)
    })
  }

  // 底部品牌
  ctx.fillStyle = '#d1d5db'
  ctx.font = '14px system-ui'
  ctx.fillText('宠伴 PetMate · 新手养猫90天', width / 2, height - 30)
}

// 文本换行
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  let currentLine = ''

  for (const char of text) {
    const testLine = currentLine + char
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = char
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }
  
  return lines.slice(0, 3) // 最多3行
}

// 下载卡片
export function downloadCard(card: ShareCard): void {
  if (typeof window === 'undefined') return

  const canvas = document.createElement('canvas')
  canvas.width = 600
  canvas.height = 400
  
  renderCardToCanvas(card, canvas)
  
  const link = document.createElement('a')
  link.download = `petmate_day${card.dayNumber}_${Date.now()}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// 分享到社交平台
export async function shareCard(card: ShareCard): Promise<boolean> {
  if (typeof navigator === 'undefined') return false

  const shareData = {
    title: card.title,
    text: `${card.title}\n${card.subtitle || ''}\n${card.content}\n\n来自宠伴 PetMate`,
    url: 'https://petmate-beige.vercel.app'
  }

  try {
    if (navigator.share) {
      await navigator.share(shareData)
      return true
    }
  } catch {
    // 用户取消或分享失败
  }

  return false
}

// 复制分享文案
export function copyShareText(card: ShareCard): string {
  return `${card.title}
${card.subtitle || ''}
${card.content}

${card.stats?.map(s => `${s.label}: ${s.value}`).join(' · ') || ''}

来自宠伴 PetMate - 新手养猫90天决策系统
https://petmate-beige.vercel.app`
}