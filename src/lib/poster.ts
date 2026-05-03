/**
 * 海报生成服务
 * Canvas绘制分享海报
 */

import { ShareContent } from './share'

// ============ 海报模板 ============

export interface PosterTemplate {
  id: string
  name: string
  width: number
  height: number
  background: string
  elements: PosterElement[]
}

export interface PosterElement {
  type: 'text' | 'image' | 'qrcode'
  x: number
  y: number
  width?: number
  height?: number
  style?: {
    fontSize?: number
    fontFamily?: string
    color?: string
    align?: 'left' | 'center' | 'right'
    bold?: boolean
  }
  dataKey?: string // 动态数据键
}

// ============ 默认模板 ============

const DEFAULT_TEMPLATES: Record<string, PosterTemplate> = {
  achievement: {
    id: 'achievement',
    name: '成就海报',
    width: 750,
    height: 1334,
    background: '#f0fdf4',
    elements: [
      { type: 'text', x: 375, y: 200, style: { fontSize: 48, color: '#22c55e', align: 'center', bold: true }, dataKey: 'title' },
      { type: 'text', x: 375, y: 300, style: { fontSize: 72, color: '#166534', align: 'center' }, dataKey: 'icon' },
      { type: 'text', x: 375, y: 450, style: { fontSize: 32, color: '#374151', align: 'center' }, dataKey: 'description' },
      { type: 'text', x: 375, y: 1200, style: { fontSize: 24, color: '#9ca3af', align: 'center' }, dataKey: 'brand' }
    ]
  },
  progress: {
    id: 'progress',
    name: '进度海报',
    width: 750,
    height: 1334,
    background: '#fff7ed',
    elements: [
      { type: 'text', x: 375, y: 150, style: { fontSize: 48, color: '#f97316', align: 'center', bold: true }, dataKey: 'title' },
      { type: 'text', x: 375, y: 400, style: { fontSize: 120, color: '#ea580c', align: 'center', bold: true }, dataKey: 'dayNumber' },
      { type: 'text', x: 375, y: 550, style: { fontSize: 32, color: '#374151', align: 'center' }, dataKey: 'subtitle' },
      { type: 'text', x: 375, y: 1200, style: { fontSize: 24, color: '#9ca3af', align: 'center' }, dataKey: 'brand' }
    ]
  }
}

// ============ 海报生成 ============

/**
 * 生成成就海报
 */
export async function generateAchievementCard(data: {
  title: string
  icon: string
  description: string
  brand?: string
}): Promise<string> {
  const template = DEFAULT_TEMPLATES.achievement
  
  // 简化版：返回数据URL
  // 实际需要Canvas绘制
  
  const canvas = document.createElement('canvas')
  canvas.width = template.width
  canvas.height = template.height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  // 背景
  ctx.fillStyle = template.background
  ctx.fillRect(0, 0, template.width, template.height)
  
  // 绘制元素
  template.elements.forEach(element => {
    if (element.type === 'text') {
      const text = data[element.dataKey as keyof typeof data] || ''
      ctx.font = `${element.style?.bold ? 'bold' : ''} ${element.style?.fontSize || 32}px ${element.style?.fontFamily || 'sans-serif'}`
      ctx.fillStyle = element.style?.color || '#000'
      ctx.textAlign = element.style?.align || 'center'
      ctx.fillText(text, element.x, element.y)
    }
  })
  
  return canvas.toDataURL('image/png')
}

/**
 * 下载海报
 */
export async function downloadPoster(dataUrl: string, filename: string = 'poster.png'): Promise<void> {
  const link = document.createElement('a')
  link.download = filename
  link.href = dataUrl
  link.click()
}

/**
 * 生成分享海报（通用）
 */
export async function generateSharePoster(content: ShareContent): Promise<string> {
  const template = DEFAULT_TEMPLATES[content.type] || DEFAULT_TEMPLATES.progress
  
  // 简化版实现
  const canvas = document.createElement('canvas')
  canvas.width = template.width
  canvas.height = template.height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) return ''
  
  ctx.fillStyle = template.background
  ctx.fillRect(0, 0, template.width, template.height)
  
  ctx.font = 'bold 48px sans-serif'
  ctx.fillStyle = '#22c55e'
  ctx.textAlign = 'center'
  ctx.fillText(content.title, template.width / 2, 200)
  
  ctx.font = '32px sans-serif'
  ctx.fillStyle = '#374151'
  ctx.fillText(content.message, template.width / 2, 300)
  
  return canvas.toDataURL('image/png')
}

// ============ 导出 ============
