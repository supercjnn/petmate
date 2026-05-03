/**
 * AI个性化引擎
 * 基于用户画像定制内容和推荐
 */

import { callLLM } from './ai'
import { db } from './database'
import { BREED_KNOWLEDGE_BASE, getBreedKnowledge } from './rag'

// ============ 用户画像 ============

export interface UserProfile {
  userId: string
  experience: 'beginner' | 'intermediate' | 'advanced'  // 养猫经验
  personality: 'anxious' | 'relaxed' | 'curious' | 'practical'  // 用户性格
  goals: string[]  // 养猫目标
  concerns: string[]  // 主要担忧
  preferredStyle: 'detailed' | 'concise' | 'visual'  // 内容偏好
  
  // 猫咪信息
  catProfile: {
    name: string
    breed: string
    age: number  // 月龄
    gender?: 'male' | 'female'
    healthStatus?: 'healthy' | 'chronic' | 'recovering'
    personality?: 'active' | 'calm' | 'shy' | 'social'
  }
  
  // 交互历史分析
  interactionStats: {
    avgSessionLength: number  // 分钟
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'night'
    mostViewedCategories: string[]
    completionRate: number  // 行动完成率
    aiQueryCount: number
  }
}

// ============ 个性化推荐引擎 ============

/**
 * 生成个性化行动卡片
 */
export async function generatePersonalizedCard(
  profile: UserProfile,
  dayNumber: number
): Promise<{
  title: string
  actions: Array<{
    title: string
    description: string
    difficulty: 'easy' | 'medium' | 'hard'
    estimatedTime: number  // 分钟
    personalizedTip?: string
  }>
}> {
  const breedInfo = getBreedKnowledge(profile.catProfile.breed)
  
  const prompt = `基于以下用户画像生成第${dayNumber}天的个性化行动卡：

用户画像：
- 养猫经验：${profile.experience}
- 性格类型：${profile.personality}
- 养猫目标：${profile.goals.join('、')}
- 主要担忧：${profile.concerns.join('、')}
- 内容偏好：${profile.preferredStyle}

猫咪信息：
- 名字：${profile.catProfile.name}
- 品种：${profile.catProfile.breed}
- 年龄：${profile.catProfile.age}月
- 健康状态：${profile.catProfile.healthStatus || '健康'}
- 性格：${profile.catProfile.personality || '未知'}

${breedInfo ? `品种知识：${breedInfo.breedName}，${breedInfo.characteristics.personality.join('、')}` : ''}

交互数据：
- 平均会话时长：${profile.interactionStats.avgSessionLength}分钟
- 行动完成率：${Math.round(profile.interactionStats.completionRate * 100)}%

请生成适合该用户第${dayNumber}天的行动卡，包含：
1. 卡片标题（温暖有温度）
2. 3-5个具体行动，每个包含：
   - 标题
   - 简洁描述
   - 难度（easy/medium/hard）
   - 预估时间（分钟）
   - 个性化小贴士（结合用户特点）

返回JSON格式。`

  try {
    const response = await callLLM(prompt)
    // 解析JSON响应
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
  } catch (error) {
    console.error('生成个性化卡片失败:', error)
  }

  // 返回默认卡片
  return getDefaultCard(dayNumber, profile)
}

/**
 * 个性化AI回答
 */
export async function getPersonalizedAnswer(
  question: string,
  profile: UserProfile
): Promise<string> {
  const breedInfo = getBreedKnowledge(profile.catProfile.breed)
  
  const prompt = `你是一位专业的猫咪养护顾问，请根据用户画像提供个性化回答。

用户画像：
- 经验水平：${profile.experience}
- 性格：${profile.personality}
- 偏好风格：${profile.preferredStyle}

猫咪：${profile.catProfile.name}，${profile.catProfile.breed}，${profile.catProfile.age}月龄
${breedInfo ? `品种特点：${breedInfo.characteristics.personality.join('、')}` : ''}

用户问题：${question}

请根据用户画像调整回答：
- ${profile.experience === 'beginner' ? '详细解释基础概念，避免专业术语' : '可以适度使用专业术语'}
- ${profile.personality === 'anxious' ? '语气温暖安抚，强调正面结果' : profile.personality === 'curious' ? '提供更多背景知识和原理' : '简洁直接'}
- ${profile.preferredStyle === 'detailed' ? '提供完整步骤' : profile.preferredStyle === 'concise' ? '要点式回答' : '可以提到图片或视频'}
- 结合猫咪品种特点提供针对性建议

回答控制在150字以内。`

  return await callLLM(prompt)
}

/**
 * 推荐相关内容
 */
export function getPersonalizedRecommendations(
  profile: UserProfile,
  currentDay: number
): Array<{
  type: 'action' | 'article' | 'video' | 'tool'
  title: string
  description: string
  relevance: number  // 0-1
}> {
  const recommendations: any[] = []
  
  // 基于进度的推荐
  if (currentDay < 30) {
    recommendations.push({
      type: 'article' as const,
      title: '新手必读：第一个月的10个常见错误',
      description: '避开这些坑，让猫咪更快适应新家',
      relevance: 0.9
    })
  }
  
  // 基于品种的推荐
  const breedInfo = getBreedKnowledge(profile.catProfile.breed)
  if (breedInfo) {
    breedInfo.characteristics.healthIssues.forEach(issue => {
      if (issue.includes('肥胖')) {
        recommendations.push({
          type: 'action' as const,
          title: '体重管理计划',
          description: `${profile.catProfile.breed}容易发胖，建立健康饮食习惯`,
          relevance: 0.85
        })
      }
      if (issue.includes('心脏')) {
        recommendations.push({
          type: 'article' as const,
          title: '猫咪心脏健康自查指南',
          description: '早期发现心脏问题的日常观察要点',
          relevance: 0.95
        })
      }
    })
  }
  
  // 基于用户担忧的推荐
  profile.concerns.forEach(concern => {
    if (concern.includes('健康')) {
      recommendations.push({
        type: 'tool' as const,
        title: '健康档案',
        description: '记录体重、疫苗、就医历史',
        relevance: 0.8
      })
    }
    if (concern.includes('行为')) {
      recommendations.push({
        type: 'article' as const,
        title: '理解猫咪肢体语言',
        description: '从尾巴、耳朵、眼睛读懂猫咪心情',
        relevance: 0.85
      })
    }
  })
  
  // 按相关度排序
  return recommendations
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
}

/**
 * 分析用户偏好
 */
export function analyzeUserPreferences(
  history: {
    completedActions: string[]
    viewedPages: string[]
    aiQueries: string[]
    sessionLengths: number[]
  }
): Partial<UserProfile> {
  const analysis: Partial<UserProfile> = {}
  
  // 分析经验水平
  const technicalTerms = history.aiQueries.filter(q => 
    ['疫苗', '驱虫', '猫三联', 'HCM', 'FIP', '传腹'].some(t => q.includes(t))
  ).length
  analysis.experience = technicalTerms > 5 ? 'intermediate' : 'beginner'
  
  // 分析内容偏好
  const avgLength = history.sessionLengths.reduce((a, b) => a + b, 0) / history.sessionLengths.length
  analysis.preferredStyle = avgLength < 5 ? 'concise' : 'detailed'
  
  // 分析活跃时间
  // （需要更多时间数据）
  
  return analysis
}

// ============ 辅助函数 ============

function getDefaultCard(dayNumber: number, profile: UserProfile) {
  const catName = profile.catProfile.name || '小猫'
  
  return {
    title: `第${dayNumber}天：和${catName}的日常`,
    actions: [
      {
        title: '晨间问候',
        description: `起床后花5分钟和${catName}互动`,
        difficulty: 'easy' as const,
        estimatedTime: 5,
        personalizedTip: '用温柔的声音叫它的名字'
      },
      {
        title: '检查食盆水盆',
        description: '确保食物和水新鲜充足',
        difficulty: 'easy' as const,
        estimatedTime: 2
      },
      {
        title: '观察行为',
        description: '注意猫咪的精神状态和食欲',
        difficulty: 'easy' as const,
        estimatedTime: 3
      }
    ]
  }
}