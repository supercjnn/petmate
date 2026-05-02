// RAG知识库检索系统

export interface KnowledgeEntry {
  id: string
  question: string
  answer: string
  tags: string[]
  stage?: string
  keywords: string[]
}

// FAQ知识库
export const FAQ_KNOWLEDGE: KnowledgeEntry[] = [
  {
    id: 'faq_001',
    question: '接猫前需要准备什么？',
    answer: `必备清单：
1. 安全空间 - 一个小房间或大笼子
2. 食物和水 - 两个碗，最好和原家庭一致的品牌
3. 猫砂盆 - 建议1.5倍猫的体长大小
4. 猫砂 - 豆腐砂或膨润土砂
5. 航空箱 - 接猫必需`,
    tags: ['准备', 'Day0'],
    stage: 'Day 0',
    keywords: ['准备', '接猫', '必备', '用品', '清单']
  },
  {
    id: 'faq_002',
    question: '猫咪一直躲着不出来怎么办？',
    answer: `正常行为！
- Day 1：可能完全不出现
- Day 2：可能趁没人时出来吃喝
- Day 3：开始探索

建议：
• 不要强行拉出来
• 把食物、水、猫砂盆放在它附近
• 超过48小时不吃不喝，联系卖家或就医`,
    tags: ['适应', '躲藏', 'Day1-3'],
    stage: 'Day 1-3',
    keywords: ['躲', '不出来', '藏', '适应', '害怕']
  },
  {
    id: 'faq_003',
    question: '猫咪不吃东西怎么办？',
    answer: `处理方法：
• 24小时内：正常，应激反应
• 24-48小时：尝试加热食物、手喂
• 超过48小时：联系卖家或就医

技巧：
- 用它原来吃的品牌
- 稍微加热增加香味
- 减少人为打扰`,
    tags: ['饮食', '应激', 'Day1-7'],
    stage: 'Day 1-7',
    keywords: ['不吃', '不喝', '进食', '拒食', '厌食']
  },
  {
    id: 'faq_004',
    question: '猫咪叫个不停怎么办？',
    answer: `原因可能是：
1. 想妈妈/兄弟姐妹 - 正常，需要时间
2. 饿了/渴了 - 检查食物水
3. 猫砂盆脏了 - 及时清理
4. 想出来玩 - 等适应后再放

建议：
• 睡前陪玩消耗精力
• 不要回应叫声（会强化行为）
• 可以播放白噪音`,
    tags: ['行为', '叫声', 'Day1-7'],
    stage: 'Day 1-7',
    keywords: ['叫', '叫声', '喵', '吵', '晚上']
  },
  {
    id: 'faq_005',
    question: '什么时候可以开始互动？',
    answer: `时间线：
• Day 1-3：不要互动，让它适应
• Day 4-7：可以尝试玩具互动
• Day 7-14：可以尝试摸头、下巴
• Day 14+：可以抱起来

节奏判断：
- 如果猫躲：退后一步
- 如果猫主动靠近：可以继续`,
    tags: ['互动', '信任', 'Day4-14'],
    stage: 'Day 4-14',
    keywords: ['互动', '摸', '抱', '亲近', '信任']
  },
  {
    id: 'faq_006',
    question: '猫咪咬人/抓人怎么办？',
    answer: `区分情况：
1. 玩耍性咬：轻轻咬、不破皮 → 用玩具替代手
2. 恐惧性咬：压力大、威胁 → 后退给空间
3. 攻击性咬：用力咬、破皮 → 需要行为调整

处理：
• 被咬时立刻停止互动
• 不要用手逗猫
• 提供足够的玩具
• 定期剪指甲`,
    tags: ['行为', '咬人', '抓人'],
    stage: 'Day 4-30',
    keywords: ['咬', '抓', '攻击', '凶', '咬人']
  },
  {
    id: 'faq_007',
    question: '猫咪乱抓家具怎么办？',
    answer: `解决方案：
1. 提供猫抓板（多个位置）
2. 在抓板撒猫薄荷
3. 抓家具时引导到抓板
4. 家具贴双面胶（猫讨厌）

注意：
• 猫需要磨爪，不能完全禁止
• 提供合适的替代品
• 耐心引导，不要惩罚`,
    tags: ['行为', '抓家具', 'Day15+'],
    stage: 'Day 15+',
    keywords: ['抓', '家具', '沙发', '磨爪', '抓板']
  },
  {
    id: 'faq_008',
    question: '什么时候必须就医？',
    answer: `紧急情况：
⚠️ 超过48小时不进食
⚠️ 呕吐超过24小时或带血
⚠️ 腹泻带血或持续超过24小时
⚠️ 排尿困难（公猫紧急！）
⚠️ 呼吸困难
⚠️ 眼睛受伤
⚠️ 抽搐`,
    tags: ['健康', '就医', '紧急'],
    stage: '全程',
    keywords: ['就医', '医院', '生病', '紧急', '严重', '呕吐', '腹泻']
  },
  {
    id: 'faq_009',
    question: '需要洗猫吗？',
    answer: `洗澡建议：
• 猫会自己清洁
• 家养猫一般不需要洗澡
• 如果脏了：用湿巾擦
• 真需要洗澡：2-3个月一次足够
• 用猫专用沐浴露`,
    tags: ['护理', '洗澡', '清洁'],
    stage: 'Day 30+',
    keywords: ['洗澡', '洗', '清洁', '脏']
  },
  {
    id: 'faq_010',
    question: '需要绝育吗？',
    answer: `建议绝育：
• 公猫：6-8个月
• 母猫：6-10个月

好处：
- 减少乱尿、叫春
- 预防生殖系统疾病
- 性格更稳定`,
    tags: ['绝育', '健康', 'Day60+'],
    stage: 'Day 60+',
    keywords: ['绝育', '结扎', '手术', '发情', '叫春']
  },
  {
    id: 'faq_011',
    question: '猫咪晚上不睡觉怎么办？',
    answer: `猫是晨昏性动物，晚上活跃正常。

建议：
• 睡前陪玩30分钟
• 喂一顿夜宵
• 白天减少睡眠
• 忽略夜间叫声
• 关门睡觉`,
    tags: ['行为', '睡眠', '晚上'],
    stage: 'Day 7+',
    keywords: ['睡觉', '晚上', '夜', '吵', '失眠']
  },
  {
    id: 'faq_012',
    question: '猫咪挑食怎么办？',
    answer: `解决方案：
1. 固定喂食时间
2. 30分钟不吃就收走
3. 不要频繁换粮
4. 少给零食
5. 确保健康无问题`,
    tags: ['饮食', '挑食'],
    stage: 'Day 30+',
    keywords: ['挑食', '不吃', '馋', '换粮']
  },
  {
    id: 'faq_013',
    question: '多久喂一次？',
    answer: `喂食频率：
• 幼猫（2-6月）：一天3-4次
• 成猫：一天2次或自由采食
• 定时定量喂食更好控制`,
    tags: ['饮食', '喂食'],
    stage: '全程',
    keywords: ['喂', '频率', '几次', '喂食']
  },
  {
    id: 'faq_014',
    question: '多久剪一次指甲？',
    answer: `剪指甲建议：
• 建议2-3周一次
• 只剪透明部分
• 准备止血粉（万一剪到血线）`,
    tags: ['护理', '指甲'],
    stage: 'Day 15+',
    keywords: ['指甲', '剪', '爪子']
  },
  {
    id: 'faq_015',
    question: '怎么教猫用猫砂盆？',
    answer: `教学步骤：
1. 饭后30分钟放进去
2. 刚睡醒放进去
3. 用它的爪子扒砂
4. 正确使用后奖励

注意：
• 猫砂盆保持干净
• 位置要安静
• 大小要合适`,
    tags: ['训练', '猫砂'],
    stage: 'Day 1-7',
    keywords: ['猫砂', '上厕所', '拉屎', '尿', '盆']
  }
]

// 关键词匹配搜索
export function searchKnowledge(query: string): KnowledgeEntry[] {
  const keywords = extractKeywords(query)
  const results: { entry: KnowledgeEntry; score: number }[] = []
  
  for (const entry of FAQ_KNOWLEDGE) {
    let score = 0
    
    // 关键词匹配
    for (const kw of keywords) {
      if (entry.keywords.some(k => k.includes(kw) || kw.includes(k))) {
        score += 2
      }
      if (entry.question.includes(kw)) {
        score += 3
      }
      if (entry.tags.some(t => t.includes(kw))) {
        score += 1
      }
    }
    
    if (score > 0) {
      results.push({ entry, score })
    }
  }
  
  // 按分数排序，返回前3个
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.entry)
}

// 提取关键词
function extractKeywords(text: string): string[] {
  // 简单分词（中文按字符，移除常用词）
  const stopWords = ['的', '了', '吗', '呢', '啊', '呀', '吧', '吗', '什么', '怎么', '为什么', '如何']
  const words: string[] = []
  
  // 移除标点
  const cleaned = text.replace(/[？？！!，,.。]/g, '')
  
  // 提取2-4字的词组
  for (let i = 0; i < cleaned.length; i++) {
    for (let len = 4; len >= 2; len--) {
      if (i + len <= cleaned.length) {
        const word = cleaned.slice(i, i + len)
        if (!stopWords.some(sw => word.includes(sw))) {
          words.push(word)
        }
      }
    }
  }
  
  return [...new Set(words)]
}

// 根据用户当前天数获取相关FAQ
export function getStageFAQ(dayNumber: number): KnowledgeEntry[] {
  let stage = '全程'
  
  if (dayNumber === 0) {
    stage = 'Day 0'
  } else if (dayNumber <= 3) {
    stage = 'Day 1-3'
  } else if (dayNumber <= 7) {
    stage = 'Day 1-7'
  } else if (dayNumber <= 14) {
    stage = 'Day 4-14'
  } else if (dayNumber <= 30) {
    stage = 'Day 15-30'
  } else if (dayNumber <= 60) {
    stage = 'Day 30+'
  } else {
    stage = 'Day 60+'
  }
  
  return FAQ_KNOWLEDGE.filter(e => 
    e.stage === stage || e.stage === '全程' || e.stage?.includes(`${dayNumber}`)
  )
}