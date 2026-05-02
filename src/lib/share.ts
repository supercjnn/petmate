// 分享和导出功能

export interface ShareContent {
  type: 'daily_card' | 'milestone' | 'achievement' | 'journey'
  title: string
  content: string
  day?: number
  achievement?: string
}

// 生成分享图片的Canvas（简版）
export function generateShareImage(content: ShareContent): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    canvas.width = 750
    canvas.height = 1334
    const ctx = canvas.getContext('2d')!
    
    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#FFF8E7')
    gradient.addColorStop(1, '#FFE4D6')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 标题
    ctx.fillStyle = '#5D4037'
    ctx.font = 'bold 48px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(content.title, canvas.width / 2, 200)
    
    // 内容
    ctx.font = '32px sans-serif'
    const lines = wrapText(ctx, content.content, 650)
    let y = 350
    lines.forEach(line => {
      ctx.fillText(line, canvas.width / 2, y)
      y += 60
    })
    
    // Day 标签
    if (content.day) {
      ctx.fillStyle = '#FF6B6B'
      ctx.font = 'bold 36px sans-serif'
      ctx.fillText(`Day ${content.day}`, canvas.width / 2, canvas.height - 200)
    }
    
    // 品牌
    ctx.fillStyle = '#999'
    ctx.font = '28px sans-serif'
    ctx.fillText('宠伴 PetMate', canvas.width / 2, canvas.height - 100)
    
    canvas.toBlob((blob) => {
      resolve(blob!)
    }, 'image/png')
  })
}

// 文字换行
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = []
  const paragraphs = text.split('\n')
  
  paragraphs.forEach(paragraph => {
    let line = ''
    for (const char of paragraph) {
      const testLine = line + char
      const metrics = ctx.measureText(testLine)
      if (metrics.width > maxWidth && line) {
        lines.push(line)
        line = char
      } else {
        line = testLine
      }
    }
    if (line) lines.push(line)
  })
  
  return lines
}

// 导出为PDF（简化版，使用浏览器打印）
export function exportToPDF(title: string, content: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
          background: #FFF8E7;
        }
        h1 {
          color: #5D4037;
          border-bottom: 2px solid #FF6B6B;
          padding-bottom: 10px;
        }
        .meta {
          color: #666;
          font-size: 14px;
          margin-bottom: 20px;
        }
        .content {
          line-height: 1.8;
          color: #333;
        }
        .brand {
          text-align: center;
          margin-top: 40px;
          color: #999;
          font-size: 14px;
        }
        @media print {
          body { background: white; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">宠伴 PetMate · ${new Date().toLocaleDateString('zh-CN')}</div>
      <div class="content">${content.replace(/\n/g, '<br>')}</div>
      <div class="brand">宠伴 PetMate - 守护养猫前90天</div>
    </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

// 分享到社交平台（使用Web Share API）
export async function shareToSocial(content: ShareContent): Promise<boolean> {
  const shareData = {
    title: content.title,
    text: content.content,
    url: window.location.origin
  }
  
  if (navigator.share) {
    try {
      await navigator.share(shareData)
      return true
    } catch (e) {
      console.log('分享取消')
      return false
    }
  }
  
  // 降级：复制到剪贴板
  try {
    await navigator.clipboard.writeText(`${content.title}\n\n${content.content}\n\n——来自宠伴 PetMate`)
    return true
  } catch (e) {
    return false
  }
}

// 复制文本
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// 生成养猫日记文本
export function generateJourneyText(
  day: number,
  card: any,
  notes: string[],
  completedActions: string[]
): string {
  const lines = [
    `【宠伴日记 - Day ${day}】`,
    '',
    `📋 今日行动卡：${card.title}`,
    '',
    `✅ 已完成：${completedActions.length}项`,
    ...completedActions.map(a => `  · ${a}`),
  ]
  
  if (notes.length > 0) {
    lines.push('', '📝 今日观察：')
    notes.forEach(note => lines.push(`  ${note}`))
  }
  
  lines.push('', '——来自宠伴 PetMate')
  
  return lines.join('\n')
}