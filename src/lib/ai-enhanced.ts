// AI增强模块 - RAG + 上下文记忆

import { searchKnowledge, getStageFAQ, KnowledgeEntry } from './knowledge'

// 对话历史记录
interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

// 用户上下文
interface UserContext {
  userId: string
  dayNumber: number
  catName?: string
  catBreed?: string
  recentQuestions: string[]
}

// 本地存储的对话历史
const CONVERSATION_KEY = 'petmate_conversations'

// 获取对话历史
export function getConversationHistory(limit: number = 5): Message[] {
  try {
    const data = localStorage.getItem(CONVERSATION_KEY)
    if (data) {
      const messages = JSON.parse(data)
      return messages.slice(-limit)
    }
  } catch {}
  return []
}

// 保存对话历史
export function saveMessage(role: 'user' | 'assistant', content: string) {
  const messages = getConversationHistory(20)
  messages.push({
    role,
    content,
    timestamp: Date.now()
  })
  localStorage.setItem(CONVERSATION_KEY, JSON.stringify(messages))
}

// 清空对话历史
export function clearConversation() {
  localStorage.removeItem(CONVERSATION_KEY)
}

// 构建增强Prompt
export function buildEnhancedPrompt(
  question: string,
  context: UserContext
): { prompt: string; sources: KnowledgeEntry[] } {
  // 1. 检索相关知识
  const searchResults = searchKnowledge(question)
  const stageFAQs = getStageFAQ(context.dayNumber)
  
  // 合并去重
  const allSources = [...new Map([...searchResults, ...stageFAQs].map(s => [s.id, s])).values()]
  const topSources = [...allSources].slice(0, 3)
  
  // 2. 构建RAG Prompt
  const systemPrompt = `你是宠伴PetMate的AI助手，专门帮助新手养猫人。

用户信息：
- 当前天数：Day ${context.dayNumber}
- 猫咪名字：${context.catName || '小猫咪'}
- 猫咪品种：${context.catBreed || '未知'}

相关知识库参考：
${topSources.map((s, i) => `[${i + 1}] Q: ${s.question}\nA: ${s.answer}`).join('\n\n')}

回答要求：
1. 根据用户当前天数给出针对性建议
2. 结合知识库内容，确保准确
3. 如果涉及紧急健康问题，提醒就医
4. 语气温暖、简洁，使用emoji增加亲和力
5. 如果知识库中有相关内容，优先使用
6. 如果不确定，诚实说明建议咨询兽医`

  const history = getConversationHistory(3)
  const historyText = history.length > 0 
    ? `\n\n最近对话：\n${history.map(h => `${h.role === 'user' ? '用户' : '助手'}：${h.content}`).join('\n')}`
    : ''

  const prompt = `${systemPrompt}${historyText}

用户问题：${question}

请给出回答：`

  return { prompt, sources: topSources }
}

// AI回答生成（调用API）
export async function generateAIAnswer(
  question: string,
  context: UserContext
): Promise<{ answer: string; sources: KnowledgeEntry[] }> {
  // 1. 先查知识库，看是否有直接匹配
  const directMatch = searchKnowledge(question)[0]
  
  // 如果匹配度高，直接返回
  if (directMatch && directMatch.question.includes(question.slice(0, 4))) {
    const answer = formatKnowledgeAnswer(directMatch)
    saveMessage('user', question)
    saveMessage('assistant', answer)
    return { answer, sources: [directMatch] }
  }
  
  // 2. 否则调用LLM增强生成
  const { prompt, sources } = buildEnhancedPrompt(question, context)
  
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        question,
        enhanced: true,
        prompt: prompt.slice(0, 2000) // 限制长度
      })
    })
    
    const data = await response.json()
    const answer = data.data?.answer || '抱歉，我暂时无法回答这个问题。建议咨询专业兽医。'
    
    saveMessage('user', question)
    saveMessage('assistant', answer)
    
    return { answer, sources }
  } catch (error) {
    return { 
      answer: '网络错误，请稍后重试。如果是紧急问题，请直接联系兽医。',
      sources: []
    }
  }
}

// 格式化知识库回答
function formatKnowledgeAnswer(entry: KnowledgeEntry): string {
  return `${entry.answer}

💡 这是一个常见问题，已为你找到标准答案。`
}

// 智能问题推荐
export function getRecommendedQuestions(dayNumber: number): string[] {
  const stageFAQs = getStageFAQ(dayNumber)
  return stageFAQs.slice(0, 5).map(f => f.question)
}

// 分析用户意图
export function analyzeUserIntent(question: string): {
  type: 'health' | 'behavior' | 'care' | 'other'
  urgency: 'high' | 'medium' | 'low'
} {
  const healthKeywords = ['不吃', '不喝', '呕吐', '腹泻', '拉稀', '发烧', '精神差', '不动', '抽搐', '中毒', '外伤', '血']
  const behaviorKeywords = ['咬人', '抓', '叫', '跑', '躲', '攻击', '乱尿', '破坏']
  const careKeywords = ['喂', '洗', '剪', '换', '买', '准备', '教', '训练']
  
  // 判断类型
  let type: 'health' | 'behavior' | 'care' | 'other' = 'other'
  if (healthKeywords.some(k => question.includes(k))) type = 'health'
  else if (behaviorKeywords.some(k => question.includes(k))) type = 'behavior'
  else if (careKeywords.some(k => question.includes(k))) type = 'care'
  
  // 判断紧急程度
  const urgentKeywords = ['不吃', '不喝', '呕吐', '腹泻', '抽搐', '中毒', '血', '外伤', '呼吸困难']
  const mediumKeywords = ['精神差', '拉稀', '发烧', '一直叫', '不尿']
  
  let urgency: 'high' | 'medium' | 'low' = 'low'
  if (urgentKeywords.some(k => question.includes(k))) urgency = 'high'
  else if (mediumKeywords.some(k => question.includes(k))) urgency = 'medium'
  
  return { type, urgency }
}