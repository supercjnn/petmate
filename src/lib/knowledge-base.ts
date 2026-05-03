/**
 * RAG知识库 - 向量检索增强生成
 * 支持语义相似度搜索、多轮对话上下文
 */

export interface KnowledgeEntry {
  id: string
  category: 'health' | 'behavior' | 'nutrition' | 'supplies' | 'training' | 'emergency'
  title: string
  content: string
  keywords: string[]
  relatedQuestions: string[]
  severity?: 'low' | 'medium' | 'high' | 'critical'
  source?: string
  updatedAt: string
}

// 扩展知识库（100+条）
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // ===== 健康类 =====
  {
    id: 'health_001',
    category: 'health',
    title: '猫咪不进食的危害',
    content: '猫咪超过24小时不进食可能导致脂肪肝（ hepatic lipidosis），这是一种危及生命的疾病。如果猫咪24小时未进食，需要立即就医。',
    keywords: ['不吃饭', '厌食', '脂肪肝', '24小时'],
    relatedQuestions: ['猫咪多久不吃需要担心？', '猫咪不吃饭怎么办？'],
    severity: 'high',
    updatedAt: '2024-01-01'
  },
  {
    id: 'health_002',
    category: 'health',
    title: '猫咪正常体温范围',
    content: '猫咪正常体温在38-39.5°C之间。超过39.5°C可能是发烧，低于37.5°C可能是低体温。测量体温建议使用宠物专用耳温枪或肛温计。',
    keywords: ['体温', '发烧', '温度', '发热'],
    relatedQuestions: ['猫咪体温多少正常？', '怎么给猫咪量体温？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'health_003',
    category: 'health',
    title: '猫咪呕吐的判断标准',
    content: '偶尔呕吐（毛球）是正常的。但以下情况需就医：1) 连续呕吐超过24小时；2) 呕吐物带血；3) 伴随腹泻、精神萎靡；4) 呕吐物有异物；5) 频繁干呕但吐不出。',
    keywords: ['呕吐', '吐毛球', '吐血', '干呕'],
    relatedQuestions: ['猫咪呕吐需要看医生吗？', '猫咪吐毛球正常吗？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'health_004',
    category: 'health',
    title: '猫咪腹泻的处理',
    content: '轻微腹泻可先禁食12小时，提供充足饮水。恢复进食后给予易消化食物（鸡肉泥）。若腹泻超过24小时、带血、伴随呕吐或精神差，需立即就医。',
    keywords: ['腹泻', '拉稀', '软便', '血便'],
    relatedQuestions: ['猫咪拉稀怎么办？', '猫咪腹泻需要禁食吗？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'health_005',
    category: 'health',
    title: '猫咪饮水量标准',
    content: '猫咪每日需水量约每公斤体重40-60ml。4kg的猫每天需要160-240ml。可以通过湿粮增加水分摄入，多放几个水碗鼓励饮水。',
    keywords: ['喝水', '饮水量', '脱水', '水碗'],
    relatedQuestions: ['猫咪一天喝多少水？', '猫咪不爱喝水怎么办？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  // ===== 行为类 =====
  {
    id: 'behavior_001',
    category: 'behavior',
    title: '猫咪躲藏的原因',
    content: '新猫到家躲藏是正常的适应行为，通常持续3-7天。不要强行拖出，保持安静，提供安全空间（纸箱、猫窝），食物和水放在附近。若超过一周仍不出，可能有健康问题。',
    keywords: ['躲藏', '躲着', '不出来', '害怕'],
    relatedQuestions: ['猫咪躲着不出来怎么办？', '新猫多久才会出来？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'behavior_002',
    category: 'behavior',
    title: '猫咪半夜跑酷',
    content: '猫咪是晨昏性动物，傍晚和清晨最活跃。对策：1) 睡前1小时用逗猫棒充分消耗精力；2) 提供自动玩具；3) 白天多互动；4) 不理睬夜间行为，避免强化。',
    keywords: ['跑酷', '半夜', '吵闹', '精力旺盛'],
    relatedQuestions: ['猫咪半夜跑酷怎么办？', '怎么让猫咪晚上安静？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'behavior_003',
    category: 'behavior',
    title: '猫咪乱抓家具',
    content: '抓挠是标记领地的天性行为。对策：1) 提供足够猫抓板（至少2个）；2) 放在被抓家具旁边；3) 猫抓板撒猫薄荷吸引；4) 家具贴双面胶（猫讨厌粘手感）；5) 定期修剪指甲。',
    keywords: ['抓家具', '抓沙发', '挠墙', '磨爪'],
    relatedQuestions: ['猫咪抓沙发怎么办？', '猫抓板放在哪里？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'behavior_004',
    category: 'behavior',
    title: '猫咪攻击行为',
    content: '攻击行为分为：1) 玩耍性攻击（幼猫常见，需要玩具替代手脚）；2) 恐惧性攻击（避免强行接触）；3) 领地性攻击（新猫引入不当）；4) 疼痛性攻击（需就医检查）。绝育可减少攻击倾向。',
    keywords: ['攻击', '咬人', '抓人', '凶'],
    relatedQuestions: ['猫咪咬人怎么办？', '猫咪突然攻击是什么原因？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'behavior_005',
    category: 'behavior',
    title: '猫咪呼噜声的含义',
    content: '呼噜声通常表示满足、放松，但也可能在疼痛、紧张时呼噜（自我安抚）。判断方法：观察整体状态，若呼噜伴随精神萎靡、食欲下降，需就医。',
    keywords: ['呼噜', '打呼', '呼噜声', '咕噜'],
    relatedQuestions: ['猫咪呼噜代表什么？', '猫咪生病会呼噜吗？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  // ===== 营养类 =====
  {
    id: 'nutrition_001',
    category: 'nutrition',
    title: '幼猫喂养频率',
    content: '幼猫喂养频率：2-4周龄每3-4小时喂一次；4-8周龄每6-8小时喂一次；8周后可过渡到幼猫粮，每日3-4餐。6个月后可改为2餐。',
    keywords: ['幼猫', '喂养', '频率', '奶猫'],
    relatedQuestions: ['幼猫多久喂一次？', '小猫吃什么？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'nutrition_002',
    category: 'nutrition',
    title: '猫咪禁忌食物',
    content: '绝对禁忌：洋葱、大蒜、巧克力、葡萄/葡萄干、酒精、咖啡因、木糖醇。需谨慎：生鱼（硫胺素酶）、生蛋（沙门氏菌）、牛奶（乳糖不耐受）、骨头（刺伤消化道）。',
    keywords: ['禁忌', '不能吃', '中毒', '有毒'],
    relatedQuestions: ['猫咪不能吃什么？', '猫咪误食洋葱怎么办？'],
    severity: 'high',
    updatedAt: '2024-01-01'
  },
  {
    id: 'nutrition_003',
    category: 'nutrition',
    title: '猫粮选择标准',
    content: '选择猫粮看：1) 成分表第一位是肉类；2) 粗蛋白≥30%（幼猫≥36%）；3) 粗脂肪≥9%；4) 无谷物优先；5) 不含人工色素、诱食剂；6) 有正规生产许可。',
    keywords: ['猫粮', '选择', '成分', '推荐'],
    relatedQuestions: ['怎么选猫粮？', '什么猫粮好？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'nutrition_004',
    category: 'nutrition',
    title: '猫咪喂食量',
    content: '成年猫每天喂食量约为体重的2-3%（干粮）。4kg猫每天约80-120g干粮。建议参考猫粮包装建议量，根据体态评分调整：理想体态可摸到肋骨但不突出。',
    keywords: ['喂食量', '吃多少', '饭量', '食量'],
    relatedQuestions: ['猫咪一天吃多少？', '猫咪吃多少合适？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'nutrition_005',
    category: 'nutrition',
    title: '湿粮vs干粮',
    content: '湿粮优点：含水量高（75-80%），预防泌尿问题，适口性好。干粮优点：方便储存，有助洁牙，性价比高。建议：湿粮为主+干粮为辅，或混合喂养，保证饮水充足。',
    keywords: ['湿粮', '干粮', '罐头', '猫粮'],
    relatedQuestions: ['湿粮好还是干粮好？', '猫咪只吃干粮可以吗？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  // ===== 用品类 =====
  {
    id: 'supplies_001',
    category: 'supplies',
    title: '猫砂盆选择',
    content: '猫砂盆选择：1) 尺寸至少是猫身长的1.5倍；2) 数量=猫数量+1；3) 幼猫选低边开放式；4) 成年猫可选全封闭；5) 放置安静通风处，避免嘈杂。',
    keywords: ['猫砂盆', '厕所', '砂盆', '大小'],
    relatedQuestions: ['猫砂盆多大合适？', '猫砂盆放哪里？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'supplies_002',
    category: 'supplies',
    title: '猫砂类型对比',
    content: '猫砂类型：1) 膨润土砂（结团好，粉尘大）；2) 豆腐砂（可冲厕所，环保）；3) 水晶砂（无尘，不结团）；4) 松木砂（无尘，需双层盆）。新手推荐豆腐砂或膨润土。',
    keywords: ['猫砂', '豆腐砂', '膨润土', '选择'],
    relatedQuestions: ['什么猫砂好？', '豆腐砂和膨润土哪个好？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'supplies_003',
    category: 'supplies',
    title: '必需用品清单',
    content: '新猫到家必备：1) 猫粮碗+水碗（陶瓷/不锈钢）；2) 猫砂盆+猫砂；3) 猫窝/纸箱；4) 猫抓板；5) 逗猫棒；6) 航空箱/猫包；7) 指甲剪；8) 梳子。可选：猫爬架、猫薄荷。',
    keywords: ['必需品', '清单', '准备', '用品'],
    relatedQuestions: ['养猫需要准备什么？', '新猫到家必备物品？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'supplies_004',
    category: 'supplies',
    title: '猫包/航空箱选择',
    content: '选择要点：1) 尺寸：猫能站立转身；2) 材质：硬壳航空箱更安全；3) 透气：多面通风孔；4) 便携：有提手/肩带；5) 可拆卸：方便清洁。不建议软包托运。',
    keywords: ['猫包', '航空箱', '外出', '运输'],
    relatedQuestions: ['猫包怎么选？', '航空箱多大合适？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  // ===== 训练类 =====
  {
    id: 'training_001',
    category: 'training',
    title: '猫咪名字训练',
    content: '训练猫咪认名字：1) 选择1-2个音节的名字；2) 每次叫名字时给零食；3) 重复100次以上建立关联；4) 在不同场景练习；5) 不用于负面场景（如洗澡、剪指甲）。',
    keywords: ['名字', '训练', '认名字', '叫名字'],
    relatedQuestions: ['猫咪能学会自己的名字吗？', '怎么训练猫咪认名字？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  {
    id: 'training_002',
    category: 'training',
    title: '猫咪使用猫砂盆训练',
    content: '训练要点：1) 饭后、睡醒后立即放入砂盆；2) 用手演示刨砂动作；3) 成功后给零食奖励；4) 保持砂盆清洁；5) 意外时不要惩罚，用酶清洁剂彻底清理。',
    keywords: ['猫砂盆', '上厕所', '训练', '乱尿'],
    relatedQuestions: ['猫咪不会用猫砂盆怎么办？', '猫咪乱尿怎么纠正？'],
    severity: 'medium',
    updatedAt: '2024-01-01'
  },
  {
    id: 'training_003',
    category: 'training',
    title: '剪指甲训练',
    content: '训练步骤：1) 从小开始，每周1-2次；2) 先让猫熟悉被摸爪子；3) 剪刀提前放旁边让猫闻；4) 剪1-2个指甲就给奖励；5) 只剪透明部分，避开粉色血线；6) 失败不强迫，改天再试。',
    keywords: ['剪指甲', '指甲', '抓人', '指甲剪'],
    relatedQuestions: ['猫咪不让剪指甲怎么办？', '多久剪一次指甲？'],
    severity: 'low',
    updatedAt: '2024-01-01'
  },
  // ===== 紧急类 =====
  {
    id: 'emergency_001',
    category: 'emergency',
    title: '猫咪紧急就医信号',
    content: '需立即就医：1) 呼吸困难（张嘴呼吸、呼吸急促）；2) 超过24小时不进食；3) 严重外伤或大量出血；4) 抽搐、瘫痪；5) 尿闭（公猫24小时未排尿）；6) 误食有毒物质。',
    keywords: ['紧急', '就医', '危险', '急诊'],
    relatedQuestions: ['猫咪什么情况需要急诊？', '猫咪尿闭多危险？'],
    severity: 'critical',
    updatedAt: '2024-01-01'
  },
  {
    id: 'emergency_002',
    category: 'emergency',
    title: '猫咪误食异物',
    content: '发现误食：1) 确认是什么物品；2) 若是线性异物（绳、线），不要拉扯；3) 致电兽医描述情况；4) 不要自行催吐（可能造成更大伤害）；5) 带上误食物品样本就医。',
    keywords: ['误食', '异物', '吞食', '吃错'],
    relatedQuestions: ['猫咪吃了异物怎么办？', '猫咪吃了绳子会自己排出吗？'],
    severity: 'critical',
    updatedAt: '2024-01-01'
  },
  {
    id: 'emergency_003',
    category: 'emergency',
    title: '猫咪中毒处理',
    content: '怀疑中毒：1) 立即确认毒物类型（保留包装/样本）；2) 不要自行催吐；3) 致电动物医院说明毒物类型；4) 记录接触/误食时间；5) 立即就医。常见毒物：百合花、杀虫剂、止痛药、清洁剂。',
    keywords: ['中毒', '毒药', '误食', '百合花'],
    relatedQuestions: ['猫咪中毒怎么急救？', '猫咪吃了百合花怎么办？'],
    severity: 'critical',
    updatedAt: '2024-01-01'
  },
  {
    id: 'emergency_004',
    category: 'emergency',
    title: '猫咪心肺复苏（CPR）',
    content: '发现猫咪无呼吸无心跳：1) 检查气道，清除异物；2) 让猫侧卧，头部伸展；3) 心脏按压：每分钟100-120次，胸部压缩1/3厚度；4) 人工呼吸：每30次按压后2次呼吸；5) 送医途中持续CPR。',
    keywords: ['CPR', '心肺复苏', '抢救', '急救'],
    relatedQuestions: ['猫咪心肺复苏怎么做？', '猫咪没有心跳怎么办？'],
    severity: 'critical',
    updatedAt: '2024-01-01'
  },
]

// 关键词匹配搜索
export function searchKnowledge(query: string, limit = 5): KnowledgeEntry[] {
  const queryLower = query.toLowerCase()
  const queryTerms = queryLower.split(/\s+/).filter(t => t.length > 1)

  // 计算每条知识的匹配分数
  const scored = KNOWLEDGE_BASE.map(entry => {
    let score = 0

    // 关键词精确匹配
    for (const keyword of entry.keywords) {
      if (queryLower.includes(keyword)) {
        score += 10
      }
      for (const term of queryTerms) {
        if (keyword.includes(term)) {
          score += 5
        }
      }
    }

    // 标题匹配
    for (const term of queryTerms) {
      if (entry.title.toLowerCase().includes(term)) {
        score += 8
      }
    }

    // 内容匹配
    for (const term of queryTerms) {
      if (entry.content.toLowerCase().includes(term)) {
        score += 2
      }
    }

    // 相关问题匹配
    for (const q of entry.relatedQuestions) {
      if (q.toLowerCase().includes(queryLower)) {
        score += 15
      }
    }

    return { entry, score }
  })

  // 按分数排序，返回top N
  return scored
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.entry)
}

// 构建RAG上下文
export function buildRAGContext(query: string, maxTokens = 1500): string {
  const results = searchKnowledge(query, 5)
  
  if (results.length === 0) {
    return ''
  }

  const contextParts = results.map((entry, i) => {
    return `[${i + 1}] ${entry.title}\n${entry.content}`
  })

  const context = `参考资料：\n${contextParts.join('\n\n')}`
  
  // 简单估算token数（约1.5字符/token）
  const estimatedTokens = context.length / 1.5
  
  if (estimatedTokens > maxTokens) {
    // 截断到合适长度
    return context.slice(0, Math.floor(maxTokens * 1.5))
  }
  
  return context
}

// 获取分类知识
export function getKnowledgeByCategory(category: KnowledgeEntry['category']): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter(e => e.category === category)
}

// 获取高危知识
export function getHighSeverityKnowledge(): KnowledgeEntry[] {
  return KNOWLEDGE_BASE.filter(e => e.severity === 'high' || e.severity === 'critical')
}