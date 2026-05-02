// 海报生成模块

export interface PosterData {
  type: 'milestone' | 'achievement' | 'diary'
  dayNumber: number
  catName: string
  userName?: string
  achievement?: string
  highlights?: string[]
  stats?: {
    totalDays: number
    completedActions: number
    notes: number
  }
}

// 里程碑海报模板
const MILESTONE_TEMPLATES: Record<number, { title: string; subtitle: string; color: string }> = {
  7: { title: '第一周守护者', subtitle: '完成了最难的适应期', color: '#4ECDC4' },
  15: { title: '半月陪伴者', subtitle: '我们越来越熟悉了', color: '#45B7D1' },
  30: { title: '满月守护者', subtitle: '这一个月变化真大', color: '#96CEB4' },
  60: { title: '双月陪伴者', subtitle: '已经是养猫老手了', color: '#FFEAA7' },
  90: { title: '90天守护神', subtitle: '我们是最好的伙伴', color: '#FF6B6B' }
}

// 生成Canvas海报
export function generatePoster(data: PosterData): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 750
  canvas.height = 1334
  const ctx = canvas.getContext('2d')!
  
  // 背景
  drawBackground(ctx, data)
  
  // 内容
  switch (data.type) {
    case 'milestone':
      drawMilestoneContent(ctx, data)
      break
    case 'achievement':
      drawAchievementContent(ctx, data)
      break
    case 'diary':
      drawDiaryContent(ctx, data)
      break
  }
  
  // 品牌水印
  drawBrand(ctx)
  
  return canvas
}

// 绘制背景
function drawBackground(ctx: CanvasRenderingContext2D, data: PosterData) {
  const template = MILESTONE_TEMPLATES[data.dayNumber] || MILESTONE_TEMPLATES[7]
  
  // 渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height)
  gradient.addColorStop(0, '#FFF8E7')
  gradient.addColorStop(0.5, '#FFE4D6')
  gradient.addColorStop(1, template.color + '40')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  
  // 装饰圆形
  ctx.fillStyle = template.color + '20'
  ctx.beginPath()
  ctx.arc(600, 200, 150, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.beginPath()
  ctx.arc(100, 1000, 200, 0, Math.PI * 2)
  ctx.fill()
}

// 里程碑内容
function drawMilestoneContent(ctx: CanvasRenderingContext2D, data: PosterData) {
  const template = MILESTONE_TEMPLATES[data.dayNumber] || MILESTONE_TEMPLATES[7]
  
  // Day 数字
  ctx.fillStyle = template.color
  ctx.font = 'bold 120px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`Day ${data.dayNumber}`, ctx.canvas.width / 2, 280)
  
  // 标题
  ctx.fillStyle = '#5D4037'
  ctx.font = 'bold 48px sans-serif'
  ctx.fillText(template.title, ctx.canvas.width / 2, 380)
  
  // 副标题
  ctx.fillStyle = '#8D6E63'
  ctx.font = '32px sans-serif'
  ctx.fillText(template.subtitle, ctx.canvas.width / 2, 440)
  
  // 猫咪名称
  ctx.fillStyle = '#5D4037'
  ctx.font = '40px sans-serif'
  ctx.fillText(`${data.catName}和我`, ctx.canvas.width / 2, 550)
  
  // 统计卡片
  if (data.stats) {
    drawStatsCard(ctx, data.stats, 600)
  }
}

// 成就内容
function drawAchievementContent(ctx: CanvasRenderingContext2D, data: PosterData) {
  // 成就图标区域
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(ctx.canvas.width / 2, 300, 100, 0, Math.PI * 2)
  ctx.fill()
  
  // 奖杯
  ctx.fillStyle = '#FFF'
  ctx.font = '80px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('🏆', ctx.canvas.width / 2, 330)
  
  // 成就名称
  ctx.fillStyle = '#5D4037'
  ctx.font = 'bold 44px sans-serif'
  ctx.fillText(data.achievement || '养猫达人', ctx.canvas.width / 2, 480)
  
  // Day 信息
  ctx.fillStyle = '#8D6E63'
  ctx.font = '36px sans-serif'
  ctx.fillText(`坚持${data.dayNumber}天`, ctx.canvas.width / 2, 550)
}

// 日记内容
function drawDiaryContent(ctx: CanvasRenderingContext2D, data: PosterData) {
  ctx.fillStyle = '#5D4037'
  ctx.font = 'bold 48px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(`📅 Day ${data.dayNumber} 养猫日记`, ctx.canvas.width / 2, 280)
  
  if (data.highlights && data.highlights.length > 0) {
    let y = 380
    ctx.font = '32px sans-serif'
    ctx.textAlign = 'left'
    
    for (const h of data.highlights.slice(0, 5)) {
      ctx.fillText(`✨ ${h}`, 100, y)
      y += 60
    }
  }
}

// 统计卡片
function drawStatsCard(ctx: CanvasRenderingContext2D, stats: any, y: number) {
  // 卡片背景
  ctx.fillStyle = '#FFF'
  ctx.beginPath()
  ctx.roundRect(75, y, 600, 200, 20)
  ctx.fill()
  
  // 统计数据
  const items = [
    { label: '守护天数', value: stats.totalDays },
    { label: '完成行动', value: stats.completedActions },
    { label: '记录笔记', value: stats.notes }
  ]
  
  items.forEach((item, i) => {
    const x = 175 + i * 200
    ctx.fillStyle = '#5D4037'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(String(item.value), x, y + 80)
    ctx.font = '24px sans-serif'
    ctx.fillStyle = '#8D6E63'
    ctx.fillText(item.label, x, y + 120)
  })
}

// 品牌水印
function drawBrand(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#999'
  ctx.font = '28px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('宠伴 PetMate', ctx.canvas.width / 2, ctx.canvas.height - 100)
  ctx.font = '22px sans-serif'
  ctx.fillText('守护养猫前90天', ctx.canvas.width / 2, ctx.canvas.height - 60)
}

// 下载海报
export function downloadPoster(canvas: HTMLCanvasElement, filename: string = 'petmate-poster.png') {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png')
  link.click()
}

// 生成成就分享卡片
export function generateAchievementCard(achievement: {
  name: string
  icon: string
  description: string
  unlockedAt?: string
}): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 750
  canvas.height = 750
  const ctx = canvas.getContext('2d')!
  
  // 金色渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 750, 750)
  gradient.addColorStop(0, '#FFF8E7')
  gradient.addColorStop(1, '#FFE4B5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 750, 750)
  
  // 成就图标
  ctx.fillStyle = '#FFD700'
  ctx.beginPath()
  ctx.arc(375, 250, 120, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.font = '100px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(achievement.icon, 375, 290)
  
  // 成就名称
  ctx.fillStyle = '#5D4037'
  ctx.font = 'bold 48px sans-serif'
  ctx.fillText(achievement.name, 375, 450)
  
  // 描述
  ctx.fillStyle = '#8D6E63'
  ctx.font = '28px sans-serif'
  ctx.fillText(achievement.description, 375, 520)
  
  // 品牌水印
  ctx.fillStyle = '#999'
  ctx.font = '24px sans-serif'
  ctx.fillText('宠伴 PetMate', 375, 680)
  
  return canvas
}