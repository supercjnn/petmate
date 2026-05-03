/**
 * AI对话管理器
 * 支持多轮对话上下文、个性化回答、引用来源
 */

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  references?: string[]
  metadata?: {
    dayNumber?: number
    phase?: string
    category?: string
  }
}

export interface ConversationContext {
  messages: ChatMessage[]
  userProfile: {
    dayNumber: number
    phase: string
    catName?: string
    catBreed?: string
    catAge?: string
    experience?: 'new' | 'some' | 'experienced'
  }
  lastActiveAt: string
}

const MAX_CONTEXT_MESSAGES = 10
const CONTEXT_EXPIRY_MS = 30 * 60 * 1000 // 30分钟

// 构建系统提示词
export function buildSystemPrompt(context: ConversationContext): string {
  const { userProfile } = context
  const dayPhase = getPhaseInfo(userProfile.dayNumber)
  
  return `你是宠伴(PetMate)的AI养猫顾问，专门帮助新手铲屎官度过养猫前90天。

用户画像：
- 当前进度：Day ${userProfile.dayNumber}（${dayPhase.label}）
- 养猫经验：${getExperienceLabel(userProfile.experience)}
${userProfile.catName ? `- 猫咪名字：${userProfile.catName}` : ''}
${userProfile.catBreed ? `- 猫咪品种：${userProfile.catBreed}` : ''}
${userProfile.catAge ? `- 猫咪年龄：${userProfile.catAge}` : ''}

回答原则：
1. 专业准确：基于知识和经验，给出可靠建议
2. 温暖友好：像朋友一样交流，使用"您"称呼
3. 简洁实用：直接回答问题，避免冗长
4. 区分紧急程度：高危问题明确标注"建议立即就医"
5. 引用来源：如果引用知识库，标注【参考：xxx】

回答风格：科技感、专业、简洁、有温度

紧急情况识别：
- 若问题涉及"不进食超过24小时"、"呼吸困难"、"抽搐"、"尿闭"、"误食有毒物质"
- 需在开头明确提醒："⚠ 紧急提醒：建议立即联系兽医或动物医院"'

当前对话上下文已加载，请根据用户问题提供帮助。`
}

// 构建对话历史上下文
export function buildConversationContext(context: ConversationContext): ChatMessage[] {
  const systemPrompt = buildSystemPrompt(context)
  
  // 只保留最近的N条消息
  const recentMessages = context.messages.slice(-MAX_CONTEXT_MESSAGES)
  
  return [
    { id: 'system', role: 'system', content: systemPrompt, timestamp: new Date().toISOString() },
    ...recentMessages
  ]
}

// 获取阶段信息
function getPhaseInfo(dayNumber: number) {
  if (dayNumber <= 7) return { label: '适应期', days: '1-7' }
  if (dayNumber <= 30) return { label: '探索期', days: '8-30' }
  if (dayNumber <= 60) return { label: '亲密期', days: '31-60' }
  return { label: '稳定期', days: '61-90' }
}

// 获取经验标签
function getExperienceLabel(experience?: string) {
  switch (experience) {
    case 'new': return '完全新手'
    case 'some': return '有一些经验'
    case 'experienced': return '经验丰富'
    default: return '未知'
  }
}

// AI请求配置
export interface AIRequestConfig {
  temperature?: number
  maxTokens?: number
  topP?: number
}

export const DEFAULT_CONFIG: AIRequestConfig = {
  temperature: 0.7,
  maxTokens: 800,
  topP: 0.9
}

// 创建AI请求
export async function createAIRequest(
  messages: ChatMessage[],
  config: AIRequestConfig = DEFAULT_CONFIG
): Promise<Response> {
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      ...config
    })
  })
  
  return response
}

// 解析AI响应中的紧急标记
export function parseAIResponse(content: string): {
  content: string
  isUrgent: boolean
  references: string[]
} {
  const isUrgent = content.includes('⚠') || content.includes('紧急') || content.includes('立即就医')
  
  // 提取引用来源
  const refMatch = content.match(/【参考：([^】]+)】/g)
  const references = refMatch ? refMatch.map(r => r.replace(/【参考：|】/g, '')) : []
  
  return { content, isUrgent, references }
}

// 会话存储管理
export function saveConversation(userId: string, context: ConversationContext) {
  const key = `petmate_chat_${userId}`
  localStorage.setItem(key, JSON.stringify({
    ...context,
    lastActiveAt: new Date().toISOString()
  }))
}

export function loadConversation(userId: string): ConversationContext | null {
  const key = `petmate_chat_${userId}`
  const saved = localStorage.getItem(key)
  
  if (!saved) return null
  
  try {
    const context = JSON.parse(saved) as ConversationContext
    
    // 检查是否过期
    const lastActive = new Date(context.lastActiveAt).getTime()
    const now = Date.now()
    
    if (now - lastActive > CONTEXT_EXPIRY_MS) {
      // 过期则重置消息，保留用户画像
      return {
        ...context,
        messages: [],
        lastActiveAt: new Date().toISOString()
      }
    }
    
    return context
  } catch {
    return null
  }
}

export function clearConversation(userId: string) {
  const key = `petmate_chat_${userId}`
  localStorage.removeItem(key)
}

// 快捷问题生成
export function generateQuickQuestions(context: ConversationContext): string[] {
  const { userProfile } = context
  const phase = getPhaseInfo(userProfile.dayNumber)
  
  const phaseQuestions: Record<string, string[]> = {
    '适应期': [
      '猫咪躲着不出来怎么办？',
      '猫咪多久能适应新家？',
      '新猫到家要注意什么？'
    ],
    '探索期': [
      '猫咪可以自由活动了吗？',
      '什么时候可以洗澡？',
      '需要打什么疫苗？'
    ],
    '亲密期': [
      '猫咪现在可以外出吗？',
      '什么时候绝育合适？',
      '猫咪性格定型了吗？'
    ],
    '稳定期': [
      '猫咪日常护理怎么做？',
      '怎么判断猫咪健康？',
      '猫咪老了要注意什么？'
    ]
  }
  
  return phaseQuestions[phase.label] || phaseQuestions['适应期']
}