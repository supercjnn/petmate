// 小红书分享模板系统

export interface ShareTemplate {
  type: 'diary' | 'achievement' | 'milestone' | 'help' | 'tips'
  title: string
  content: string
  tags: string[]
}

// 合规标签（不使用诱导互动类标签）
const SAFE_TAGS = [
  '#新手养猫',
  '#养猫攻略',
  '#猫咪日常',
  '#养猫心得',
  '#猫咪成长记录',
  '#第一只猫',
  '#猫咪养护',
  '#科学养猫',
  '#猫奴日常',
  '#养猫经验分享'
]

// 生成小红书分享文案
export function generateXHSText(template: ShareTemplate): string {
  const lines = [
    template.title,
    '',
    template.content,
    '',
    ...template.tags,
    '',
    '——来自宠伴PetMate'
  ]
  return lines.join('\n')
}

// 日记型模板
export function diaryTemplate(dayNumber: number, highlights: string[]): ShareTemplate {
  return {
    type: 'diary',
    title: `📅 Day ${dayNumber} 养猫日记`,
    content: `今天和小猫咪的日常：

${highlights.map(h => `✨ ${h}`).join('\n')}

每一天都在进步，养猫真的很有成就感！`,
    tags: SAFE_TAGS.slice(0, 3)
  }
}

// 成就型模板
export function achievementTemplate(achievementName: string, dayNumber: number): ShareTemplate {
  return {
    type: 'achievement',
    title: `🏆 解锁成就：${achievementName}`,
    content: `坚持养猫${dayNumber}天，解锁了"${achievementName}"成就！

从手忙脚乱到默契十足，每一天都在和小猫咪一起成长。

宠伴PetMate陪伴我的${dayNumber}天，让新手养猫不再焦虑。`,
    tags: ['#养猫成就', ...SAFE_TAGS.slice(0, 2)]
  }
}

// 里程碑模板
export function milestoneTemplate(dayNumber: number, catName: string, stage: string): ShareTemplate {
  const milestoneText: Record<number, string> = {
    7: '第一周守护者 - 熬过了最难的适应期',
    15: '半月陪伴者 - 我们越来越熟悉了',
    30: '满月守护者 - 这一个月变化真大',
    60: '双月陪伴者 - 已经是养猫老手了',
    90: '90天守护神 - 我们是最好的伙伴'
  }
  
  return {
    type: 'milestone',
    title: `🎉 ${catName}和我，Day ${dayNumber}！`,
    content: `${milestoneText[dayNumber] || '又一个新的里程碑'}

从Day 1的慌张到现在的从容，感谢这个小家伙陪我走过每一天。

${stage}顺利度过！期待接下来的日子～`,
    tags: ['#养猫里程碑', ...SAFE_TAGS.slice(0, 2)]
  }
}

// 求助型模板
export function helpTemplate(question: string): ShareTemplate {
  return {
    type: 'help',
    title: '🙏 新手求助',
    content: `${question}

有没有有经验的铲屎官指点一下？新手真的有点担心...

已经在用宠伴PetMate记录养猫日记，但这个问题需要大家的帮助！`,
    tags: ['#新手求助', '#养猫问题', ...SAFE_TAGS.slice(0, 1)]
  }
}

// 经验分享模板
export function tipsTemplate(dayNumber: number, tips: string[]): ShareTemplate {
  return {
    type: 'tips',
    title: `💡 养猫${dayNumber}天，我总结了这些经验`,
    content: `作为一个新手，分享一些这${dayNumber}天的感悟：

${tips.map((t, i) => `${i + 1}. ${t}`).join('\n\n')}

希望对同样新手养猫的你有帮助！`,
    tags: ['#养猫经验', ...SAFE_TAGS.slice(0, 2)]
  }
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
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const success = document.execCommand('copy')
    document.body.removeChild(textarea)
    return success
  }
}

// 获取用户数据生成分享
export function generateUserShare(
  type: 'diary' | 'achievement' | 'milestone',
  data: { dayNumber: number; catName?: string; highlights?: string[]; achievement?: string }
): ShareTemplate {
  switch (type) {
    case 'diary':
      return diaryTemplate(data.dayNumber, data.highlights || [])
    case 'achievement':
      return achievementTemplate(data.achievement || '养猫达人', data.dayNumber)
    case 'milestone':
      const stages: Record<number, string> = {
        7: '适应期',
        15: '信任建立期',
        30: '行为塑造期',
        60: '稳定护理期',
        90: '长期优化期'
      }
      return milestoneTemplate(
        data.dayNumber,
        data.catName || '小猫咪',
        stages[data.dayNumber] || '新阶段'
      )
    default:
      return diaryTemplate(data.dayNumber, data.highlights || [])
  }
}

// 小红书分享卡片数据
export function generateXHSCardData(template: ShareTemplate): {
  title: string
  content: string
  preview: string
} {
  const fullText = generateXHSText(template)
  return {
    title: template.title,
    content: fullText,
    preview: fullText.slice(0, 100) + '...'
  }
}

// 复制分享文本（别名）
export const copyShareText = copyToClipboard

// 获取可用模板列表
export function getAvailableTemplates(): { type: string; name: string; icon: string }[] {
  return [
    { type: 'diary', name: '日记型', icon: '📅' },
    { type: 'achievement', name: '成就型', icon: '🏆' },
    { type: 'milestone', name: '里程碑型', icon: '🎉' },
    { type: 'tips', name: '经验型', icon: '💡' },
    { type: 'help', name: '求助型', icon: '🙏' }
  ]
}