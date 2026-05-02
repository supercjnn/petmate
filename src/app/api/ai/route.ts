import { NextRequest, NextResponse } from 'next/server'

// 腾讯Coding API配置
const BASE_URL = process.env.BASE_URL || 'https://api.lkeap.cloud.tencent.com/coding/v3'
const API_TOKEN = process.env.TENCENT_CODING_TOKEN

// 调用腾讯Coding API
async function callLLMApi(question: string, context: string): Promise<{ answer: string; source: string }> {
  if (!API_TOKEN || API_TOKEN === '***' || API_TOKEN === '') {
    console.log('Tencent Coding API token not configured, using static response')
    return { answer: getStaticResponse(question), source: 'static' }
  }
  
  try {
    // 腾讯Coding API格式
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        model: 'hunyuan-turbos', // 腾讯混元快速模型
        messages: [
          {
            role: 'system',
            content: `你是宠伴 PetMate 的AI助手，专门帮助新手养猫人解决困惑。
你的回答要：
1. 简单易懂，避免专业术语
2. 先告诉用户当前情况是否正常/需要关注/需要就医
3. 给出具体可执行的建议（2-4条）
4. 最后告诉用户什么情况下需要升级处理
5. 用鼓励的语气，减少用户焦虑

格式要求：
- 使用简洁的段落，不要过长
- 重点内容可以用**加粗**
- 每条建议一行

结尾必须加上：
"本建议仅用于养宠日常决策辅助，不能替代兽医诊断。"`
          },
          {
            role: 'user',
            content: `背景：${context}\n\n问题：${question}`
          }
        ],
        temperature: 0.7,
        max_tokens: 600
      })
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('LLM API error:', response.status, errorText)
      return { answer: getStaticResponse(question), source: 'static' }
    }
    
    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content
    
    if (!answer) {
      console.error('LLM API no content:', data)
      return { answer: getStaticResponse(question), source: 'static' }
    }
    
    return { answer, source: 'tencent-llm' }
  } catch (error) {
    console.error('LLM API call failed:', error)
    return { answer: getStaticResponse(question), source: 'static' }
  }
}

// 静态回复兜底
function getStaticResponse(question: string): string {
  const responses: Record<string, string> = {
    '躲': `猫咪躲藏是正常的适应反应。

**情况判断：** 正常（只要进食排泄正常）

**你该做的：**
- 把食物、水放在它躲的附近
- 不要强行抱它出来
- 假装没看见它，正常走动

**需要担心的情况：**
- 超过48小时不进食
- 出现呕吐、腹泻
- 呼吸异常

本建议仅用于养宠日常决策辅助，不能替代兽医诊断。`,
    
    '不吃': `猫咪不进食需要分情况处理。

**情况判断：** 需要关注

**你该做的：**
- 尝试用罐头、猫条、羊奶粉诱导
- 加热食物让它更香
- 放到它躲的地方附近

**需要就医的情况：**
- 超过48小时完全不进食
- 出现呕吐、精神萎靡
- 幼猫超过24小时不进食

本建议仅用于养宠日常决策辅助，不能替代兽医诊断。`,
    
    '呕吐': `猫咪呕吐需要观察具体情况。

**情况判断：** 观 severity

**如果是吐毛球：**
- 正常现象，喂化毛膏即可

**如果是吐食物：**
- 可能吃太快，减少喂食量
- 观察精神状态

**需要就医的情况：**
- 24小时内呕吐超过3次
- 呕吐物带血或异物
- 伴随精神萎靡

本建议仅用于养宠日常决策辅助，不能替代兽医诊断。`,
    
    '腹泻': `猫咪腹泻需要关注程度和持续时间。

**情况判断：** 需要关注

**你该做的：**
- 确保充足饮水，防止脱水
- 暂时不要换新食物
- 观察粪便状态

**需要就医的情况：**
- 腹泻带血
- 超过48小时持续
- 伴随呕吐或精神萎靡

本建议仅用于养宠日常决策辅助，不能替代兽医诊断。`
  }
  
  // 关键词匹配
  for (const [keyword, response] of Object.entries(responses)) {
    if (question.includes(keyword)) {
      return response
    }
  }
  
  // 默认回复
  return `感谢你的提问！

**建议你：**
1. 观察记录猫咪的进食、排泄、精神状态
2. 查看当天行动卡是否有相关建议
3. 如有明显异常，不要犹豫咨询兽医

本建议仅用于养宠日常决策辅助，不能替代兽医诊断。`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, dayNumber, cardTitle, riskLevel } = body
    
    if (!question) {
      return NextResponse.json({ 
        success: false, 
        error: '请提供问题' 
      }, { status: 400 })
    }
    
    // 构建上下文
    const stageName = getStageName(dayNumber || 1)
    const context = `用户养猫第${dayNumber || 1}天，当前阶段：${stageName}。${cardTitle ? `今日主题：${cardTitle}` : ''}${riskLevel ? `，风险等级：${riskLevel}` : ''}`
    
    // 调用LLM
    const { answer, source } = await callLLMApi(question, context)
    
    return NextResponse.json({
      success: true,
      data: {
        answer,
        source,
        disclaimer: '本建议仅用于养宠日常决策辅助，不能替代兽医诊断。'
      }
    })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: '处理失败，请稍后重试' 
    }, { status: 500 })
  }
}

function getStageName(dayNumber: number): string {
  if (dayNumber <= 0) return '接猫准备期'
  if (dayNumber <= 3) return '适应期'
  if (dayNumber <= 14) return '信任建立期'
  if (dayNumber <= 30) return '行为塑造期'
  if (dayNumber <= 60) return '稳定护理期'
  return '长期优化期'
}