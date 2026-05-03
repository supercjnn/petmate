/**
 * AI服务统一入口
 * 封装腾讯混元LLM调用
 */

// API配置
const BASE_URL = process.env.BASE_URL || 'https://api.lkeap.cloud.tencent.com/coding/v3'
const API_TOKEN = process.env.TENCENT_CODING_TOKEN

/**
 * 调用LLM生成文本
 */
export async function callLLM(
  prompt: string,
  options?: {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  const systemPrompt = options?.systemPrompt || `你是宠伴 PetMate 的AI助手，专门帮助新手养猫人。
回答要简洁、专业、温暖，控制在200字以内。`

  // 检查Token
  if (!API_TOKEN || API_TOKEN === 'your_token_here' || API_TOKEN === '') {
    console.log('LLM Token未配置，返回默认响应')
    return getDefaultResponse(prompt)
  }

  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        model: 'hunyuan-turbos',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 500
      })
    })

    if (!response.ok) {
      console.error('LLM API错误:', response.status)
      return getDefaultResponse(prompt)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    
    return content || getDefaultResponse(prompt)
  } catch (error) {
    console.error('LLM调用失败:', error)
    return getDefaultResponse(prompt)
  }
}

/**
 * 批量调用LLM
 */
export async function callLLMBatch(
  prompts: string[],
  options?: {
    systemPrompt?: string
    temperature?: number
    maxTokens?: number
  }
): Promise<string[]> {
  const results = await Promise.all(
    prompts.map(prompt => callLLM(prompt, options))
  )
  return results
}

/**
 * 流式调用LLM（用于长文本生成）
 */
export async function* streamLLM(
  prompt: string,
  options?: {
    systemPrompt?: string
    temperature?: number
  }
): AsyncGenerator<string> {
  // 简化版：不支持真正的流式，直接返回
  const result = await callLLM(prompt, options)
  yield result
}

/**
 * 获取默认响应
 */
function getDefaultResponse(prompt: string): string {
  // 根据关键词返回预设响应
  if (prompt.includes('躲') || prompt.includes('藏')) {
    return '猫咪躲藏是正常的适应反应。给它时间和空间，把食物和水放在附近，不要强行打扰。通常2-3天会逐渐适应。'
  }
  if (prompt.includes('吃') || prompt.includes('食')) {
    return '猫咪食欲不振可能是因为环境变化或压力。尝试用罐头、猫条诱导，加热食物增加香味。如果超过24小时不进食，建议就医。'
  }
  if (prompt.includes('叫') || prompt.includes('喵')) {
    return '猫咪叫声可能表示多种需求：饥饿、寂寞、或不舒服。观察它是否同时有其他异常行为。持续尖叫需要排查原因。'
  }
  if (prompt.includes('疫苗') || prompt.includes('打针')) {
    return '疫苗时间表：猫三联第1针(6-8周)、第2针(10-12周)、狂犬(12周+)。接种前需健康检查，接种后观察1-2天。'
  }
  if (prompt.includes('砂') || prompt.includes('厕所')) {
    return '猫砂盆选择原则：大小合适、位置安静、易清理。猫砂类型看猫咪偏好。保持清洁，每天铲屎。'
  }
  
  return '感谢你的问题！建议观察猫咪的基本状态：食欲、精神、排泄是否正常。如有异常持续，请咨询兽医。'
}

/**
 * 检测API是否可用
 */
export function isLLMConfigured(): boolean {
  return !!API_TOKEN && API_TOKEN !== 'your_token_here' && API_TOKEN !== ''
}