/**
 * RAG知识库系统
 * 品种知识图谱 + 智能问答增强
 */

import { callLLM } from './ai'

// ============ 知识库结构 ============

export interface KnowledgeEntry {
  id: string
  category: 'breed' | 'health' | 'behavior' | 'nutrition' | 'training' | 'environment'
  title: string
  content: string
  keywords: string[]
  relatedBreeds?: string[]
  relatedEntries?: string[]
  source: string
  confidence: number // 0-1
  lastUpdated: string
}

export interface BreedKnowledge {
  breedId: string
  breedName: string
  characteristics: {
    personality: string[]
    activityLevel: 'low' | 'medium' | 'high'
    groomingNeeds: 'low' | 'medium' | 'high'
    healthIssues: string[]
    lifespan: string
    weightRange: { min: number; max: number }
  }
  careGuide: {
    feeding: string[]
    grooming: string[]
    exercise: string[]
    healthCheck: string[]
  }
  commonProblems: {
    problem: string
    solution: string
    severity: 'low' | 'medium' | 'high'
  }[]
  expertTips: string[]
}

// ============ 知识库数据 ============

const BREED_KNOWLEDGE_BASE: Record<string, BreedKnowledge> = {
  'british-shorthair': {
    breedId: 'british-shorthair',
    breedName: '英国短毛猫',
    characteristics: {
      personality: ['温顺', '独立', '友善', '安静'],
      activityLevel: 'medium',
      groomingNeeds: 'low',
      healthIssues: ['肥胖倾向', '心脏病(HCM)', '多囊肾病'],
      lifespan: '12-17年',
      weightRange: { min: 4, max: 8 }
    },
    careGuide: {
      feeding: ['控制食量防止肥胖', '高质量蛋白质', '定时定量喂养'],
      grooming: ['每周梳毛1-2次', '定期检查耳朵', '修剪指甲'],
      exercise: ['每天15-30分钟互动', '提供攀爬空间', '益智玩具'],
      healthCheck: ['年度心脏检查', '体重监测', '肾脏功能检查']
    },
    commonProblems: [
      { problem: '过度肥胖', solution: '控制饮食+增加运动', severity: 'high' },
      { problem: '懒惰不爱动', solution: '用玩具激发兴趣', severity: 'low' },
      { problem: '毛发打结', solution: '定期梳毛', severity: 'low' }
    ],
    expertTips: [
      '英短容易发胖，建议使用自动喂食器控制食量',
      '性格独立但喜欢陪伴，每天至少花30分钟互动',
      '注意观察呼吸情况，HCM早期很难发现'
    ]
  },
  'ragdoll': {
    breedId: 'ragdoll',
    breedName: '布偶猫',
    characteristics: {
      personality: ['温柔', '粘人', '安静', '忍耐力强'],
      activityLevel: 'low',
      groomingNeeds: 'medium',
      healthIssues: ['心脏病(HCM)', '膀胱结石', '肠胃敏感'],
      lifespan: '12-16年',
      weightRange: { min: 4.5, max: 9 }
    },
    careGuide: {
      feeding: ['易消化食物', '少量多餐', '充足饮水'],
      grooming: ['每天梳毛', '定期洗澡', '注意毛发清洁'],
      exercise: ['温和互动', '避免剧烈运动', '室内活动为主'],
      healthCheck: ['心脏超声', '尿液检查', '肠胃功能']
    },
    commonProblems: [
      { problem: '毛发过长打结', solution: '每天梳毛+定期洗澡', severity: 'medium' },
      { problem: '肠胃不适', solution: '选择低敏食物', severity: 'medium' },
      { problem: '过度依赖主人', solution: '逐步培养独立性', severity: 'low' }
    ],
    expertTips: [
      '布偶猫非常粘人，不适合长时间独处',
      '肠胃敏感，换粮要循序渐进',
      '定期心脏检查非常重要'
    ]
  },
  'american-shorthair': {
    breedId: 'american-shorthair',
    breedName: '美短猫',
    characteristics: {
      personality: ['活泼', '好奇', '友善', '适应性强'],
      activityLevel: 'high',
      groomingNeeds: 'low',
      healthIssues: ['心脏病', '肥胖', '尿路问题'],
      lifespan: '15-20年',
      weightRange: { min: 3.5, max: 7 }
    },
    careGuide: {
      feeding: ['高蛋白食物', '控制热量', '充足饮水'],
      grooming: ['每周梳毛', '定期清洁', '检查牙齿'],
      exercise: ['充足活动空间', '互动游戏', '攀爬架'],
      healthCheck: ['年度体检', '心脏筛查', '尿路检查']
    },
    commonProblems: [
      { problem: '过度活跃', solution: '提供足够玩具和空间', severity: 'low' },
      { problem: '尿路感染', solution: '多喝水+定期检查', severity: 'medium' },
      { problem: '抓挠家具', solution: '提供猫抓板', severity: 'low' }
    ],
    expertTips: [
      '美短精力旺盛，需要足够的活动空间',
      '好奇心强，注意家中安全隐患',
      '定期尿路检查很重要'
    ]
  }
}

// 常见问题知识库
const GENERAL_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    id: 'feeding-kitten',
    category: 'nutrition',
    title: '幼猫喂养指南',
    content: `幼猫(0-6个月)喂养要点：
1. 0-4周：母乳或羊奶粉，每2-3小时一次
2. 4-8周：逐渐过渡到幼猫粮，泡软喂食
3. 2-6月：幼猫专用粮，每天3-4次
4. 6月后：可过渡到成猫粮

注意事项：
- 不要喂牛奶，会导致腹泻
- 幼猫粮蛋白质含量应≥30%
- 定时定量，避免暴饮暴食`,
    keywords: ['幼猫', '喂养', '猫粮', '奶粉', '饮食'],
    source: 'veterinary-guide',
    confidence: 0.95,
    lastUpdated: '2026-01-01'
  },
  {
    id: 'vaccine-schedule',
    category: 'health',
    title: '猫咪疫苗接种时间表',
    content: `猫咪疫苗接种时间：
1. 猫三联（第1针）：6-8周龄
2. 猫三联（第2针）：10-12周龄
3. 狂犬疫苗：12周龄以上
4. 猫三联（加强针）：每年一次

注意事项：
- 疫苗前需健康检查
- 接种后观察1-2天
- 记录疫苗本，按时加强`,
    keywords: ['疫苗', '猫三联', '狂犬', '接种', '健康'],
    source: 'veterinary-guide',
    confidence: 0.98,
    lastUpdated: '2026-01-01'
  },
  {
    id: 'litter-training',
    category: 'training',
    title: '猫砂盆训练指南',
    content: `猫砂盆训练步骤：
1. 选择合适位置：安静、易到达
2. 猫砂选择：幼猫用细砂，成猫可选择
3. 引导方法：饭后、睡醒后放入砂盆
4. 建立习惯：固定时间引导

常见问题：
- 不用砂盆：可能是位置不对或砂盆脏
- 乱尿：检查健康问题或压力源
- 多猫家庭：N+1个砂盆原则`,
    keywords: ['猫砂', '训练', '如厕', '习惯', '幼猫'],
    source: 'behavior-guide',
    confidence: 0.90,
    lastUpdated: '2026-01-01'
  },
  {
    id: 'introduction-to-existing-cat',
    category: 'behavior',
    title: '新猫与原住民相处指南',
    content: `新猫引入步骤（14天渐进法）：
第1-3天：隔离期
- 新猫单独房间
- 闻气味不见面

第4-7天：视觉接触
- 门缝见面
- 喂食时拉近

第8-10天：有限接触
- 短时间共处
- 观察反应

第11-14天：完全融合
- 全天共处
- 监督互动

关键要点：
- 资源分开：砂盆、食盆各用各
- 等级尊重：原住民优先
- 耐心观察：打闹vs打架要分清`,
    keywords: ['新猫', '多猫', '相处', '引入', '隔离'],
    source: 'behavior-expert',
    confidence: 0.92,
    lastUpdated: '2026-01-01'
  }
]

// ============ RAG检索引擎 ============

/**
 * 关键词匹配检索
 */
export function searchKnowledge(query: string, limit: number = 5): KnowledgeEntry[] {
  const keywords = extractKeywords(query)
  
  const results = GENERAL_KNOWLEDGE_BASE
    .map(entry => ({
      entry,
      score: calculateRelevanceScore(entry, keywords)
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.entry)

  return results
}

/**
 * 品种知识检索
 */
export function getBreedKnowledge(breedId: string): BreedKnowledge | null {
  return BREED_KNOWLEDGE_BASE[breedId] || null
}

/**
 * 智能问答（RAG增强）
 */
export async function ragEnhancedAnswer(
  question: string,
  breedId?: string,
  userContext?: {
    currentDay?: number
    catAge?: number
    healthRecords?: any[]
  }
): Promise<string> {
  // 1. 检索相关知识
  const knowledgeResults = searchKnowledge(question, 3)
  
  // 2. 品种特定知识
  const breedKnowledge = breedId ? getBreedKnowledge(breedId) : null
  
  // 3. 构建增强上下文
  const context = buildRAGContext(knowledgeResults, breedKnowledge, userContext)
  
  // 4. 调用LLM生成回答
  const prompt = `你是一位专业的猫咪养护顾问。请根据以下知识库信息回答用户问题。

知识库信息：
${context}

用户问题：${question}

请提供：
1. 基于知识库的专业回答
2. 如有品种特定建议，请补充
3. 如有用户当前阶段相关建议，请补充
4. 实用可操作的建议

回答要简洁、专业、温暖，控制在200字以内。`

  const answer = await callLLM(prompt)
  return answer
}

// ============ 辅助函数 ============

function extractKeywords(text: string): string[] {
  // 简化版关键词提取
  const stopWords = ['的', '是', '在', '有', '和', '了', '我', '要', '会', '能', '怎么', '什么', '为什么', '吗', '呢']
  
  const words = text.toLowerCase()
    .replace(/[？？!！。，,]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !stopWords.includes(word))
  
  return words
}

function calculateRelevanceScore(entry: KnowledgeEntry, keywords: string[]): number {
  const entryKeywords = entry.keywords.map(k => k.toLowerCase())
  
  let score = 0
  for (const keyword of keywords) {
    if (entryKeywords.some(ek => ek.includes(keyword) || keyword.includes(ek))) {
      score += 1
    }
    if (entry.title.toLowerCase().includes(keyword)) {
      score += 0.5
    }
    if (entry.content.toLowerCase().includes(keyword)) {
      score += 0.3
    }
  }
  
  return score * entry.confidence
}

function buildRAGContext(
  knowledge: KnowledgeEntry[],
  breedInfo: BreedKnowledge | null,
  userContext?: any
): string {
  let context = ''
  
  // 知识库信息
  if (knowledge.length > 0) {
    context += '相关知识：\n'
    knowledge.forEach(entry => {
      context += `【${entry.title}】\n${entry.content}\n\n`
    })
  }
  
  // 品种信息
  if (breedInfo) {
    context += `\n${breedInfo.breedName}品种特点：\n`
    context += `性格：${breedInfo.characteristics.personality.join('、')}\n`
    context += `活动量：${breedInfo.characteristics.activityLevel}\n`
    context += `常见健康问题：${breedInfo.characteristics.healthIssues.join('、')}\n`
    context += `护理要点：${breedInfo.careGuide.grooming.join('、')}\n`
    if (breedInfo.expertTips.length > 0) {
      context += `专家建议：${breedInfo.expertTips.join('；')}\n`
    }
  }
  
  // 用户上下文
  if (userContext) {
    context += `\n用户情况：\n`
    if (userContext.currentDay) {
      context += `养护天数：${userContext.currentDay}天\n`
    }
    if (userContext.catAge) {
      context += `猫咪年龄：${userContext.catAge}月\n`
    }
  }
  
  return context
}

// ============ 导出 ============

export { BREED_KNOWLEDGE_BASE, GENERAL_KNOWLEDGE_BASE }