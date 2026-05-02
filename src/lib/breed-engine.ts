// 品种个性化引擎

export interface BreedProfile {
  name: string
  nameEn: string
  personality: string[]
  adaptDays: number // 适应期系数 (0.5-2.0)
  activityLevel: 'low' | 'medium' | 'high'
  grooming: 'minimal' | 'moderate' | 'high'
  specialNeeds: string[]
  healthRisks: string[]
}

// 品种数据库
export const BREEDS: Record<string, BreedProfile> = {
  'british-shorthair': {
    name: '英国短毛猫',
    nameEn: 'British Shorthair',
    personality: ['温和', '独立', '不粘人'],
    adaptDays: 1.2,
    activityLevel: 'medium',
    grooming: 'minimal',
    specialNeeds: ['易胖需控饮食'],
    healthRisks: ['肥胖', '心肌病']
  },
  'american-shorthair': {
    name: '美国短毛猫',
    nameEn: 'American Shorthair',
    personality: ['友善', '活泼', '适应力强'],
    adaptDays: 0.8,
    activityLevel: 'high',
    grooming: 'minimal',
    specialNeeds: [],
    healthRisks: []
  },
  'chinese-domestic': {
    name: '中华田园猫',
    nameEn: 'Chinese Domestic',
    personality: ['独立', '聪明', '适应力强'],
    adaptDays: 0.6,
    activityLevel: 'high',
    grooming: 'minimal',
    specialNeeds: [],
    healthRisks: []
  },
  'russian-blue': {
    name: '俄罗斯蓝猫',
    nameEn: 'Russian Blue',
    personality: ['害羞', '敏感', '粘主人'],
    adaptDays: 1.5,
    activityLevel: 'low',
    grooming: 'minimal',
    specialNeeds: ['易应激', '环境变化需缓慢'],
    healthRisks: ['应激反应']
  },
  'persian': {
    name: '波斯猫',
    nameEn: 'Persian',
    personality: ['温和', '安静', '需要陪伴'],
    adaptDays: 1.0,
    activityLevel: 'low',
    grooming: 'high',
    specialNeeds: ['毛发护理', '眼部清洁'],
    healthRisks: ['呼吸道问题', '肾脏疾病']
  },
  'ragdoll': {
    name: '布偶猫',
    nameEn: 'Ragdoll',
    personality: ['温顺', '粘人', '爱跟随'],
    adaptDays: 0.8,
    activityLevel: 'low',
    grooming: 'moderate',
    specialNeeds: ['心脏健康监测'],
    healthRisks: ['肥厚性心肌病']
  },
  'maine-coon': {
    name: '缅因猫',
    nameEn: 'Maine Coon',
    personality: ['温和', '活泼', '亲人'],
    adaptDays: 1.0,
    activityLevel: 'high',
    grooming: 'moderate',
    specialNeeds: ['需要大空间', '心脏监测'],
    healthRisks: ['肥厚性心肌病', '髋关节发育不良']
  },
  'siamese': {
    name: '暹罗猫',
    nameEn: 'Siamese',
    personality: ['活泼', '话多', '粘人'],
    adaptDays: 0.7,
    activityLevel: 'high',
    grooming: 'minimal',
    specialNeeds: ['需要大量互动', '易叫'],
    healthRisks: ['呼吸道问题']
  },
  'sphynx': {
    name: '无毛猫',
    nameEn: 'Sphynx',
    personality: ['活泼', '粘人', '需要保暖'],
    adaptDays: 0.8,
    activityLevel: 'high',
    grooming: 'high',
    specialNeeds: ['皮肤护理', '保暖'],
    healthRisks: ['皮肤问题', '心脏病']
  },
  'scottish-fold': {
    name: '折耳猫',
    nameEn: 'Scottish Fold',
    personality: ['温和', '安静', '粘人'],
    adaptDays: 1.0,
    activityLevel: 'low',
    grooming: 'minimal',
    specialNeeds: ['关节健康监测'],
    healthRisks: ['软骨发育异常', '关节问题']
  }
}

// 个性化配置
export interface PersonalizationConfig {
  breedId: string
  userExperience: 'beginner' | 'intermediate' | 'experienced'
  homeEnvironment: 'single' | 'family' | 'multi-pet'
  catAge: 'kitten' | 'adult' | 'senior'
}

// 获取品种列表
export function getBreedList() {
  return Object.entries(BREEDS).map(([id, breed]) => ({
    id,
    name: breed.name,
    nameEn: breed.nameEn
  }))
}

// 计算适应期天数调整
export function calculateAdaptDays(baseDays: number, breedId: string): number {
  const breed = BREEDS[breedId]
  if (!breed) return baseDays
  
  return Math.round(baseDays * breed.adaptDays)
}

// 获取品种特定护理提醒
export function getBreedSpecificReminders(breedId: string): string[] {
  const breed = BREEDS[breedId]
  if (!breed) return []
  
  return breed.specialNeeds
}

// 获取健康监测提醒
export function getHealthRiskWarnings(breedId: string): { day: number; warning: string }[] {
  const breed = BREEDS[breedId]
  if (!breed || breed.healthRisks.length === 0) return []
  
  // 根据品种风险返回监测提醒
  return breed.healthRisks.map((risk, index) => ({
    day: 30 + index * 15, // Day 30, 45, 60...
    warning: `建议关注${breed.name}常见的健康问题：${risk}`
  }))
}

// 获取活动量建议
export function getActivityRecommendation(breedId: string): {
  level: string
  toys: string[]
  frequency: string
} {
  const breed = BREEDS[breedId]
  if (!breed) {
    return {
      level: '中等',
      toys: ['逗猫棒', '小球'],
      frequency: '每天1次'
    }
  }
  
  const recommendations = {
    high: {
      level: '高',
      toys: ['逗猫棒', '跑轮', '激光笔'],
      frequency: '每天2-3次'
    },
    medium: {
      level: '中等',
      toys: ['逗猫棒', '激光笔'],
      frequency: '每天1-2次'
    },
    low: {
      level: '低',
      toys: ['静态玩具', '小球'],
      frequency: '每2天1次'
    }
  }
  
  return recommendations[breed.activityLevel]
}

// 个性化行动卡内容
export function personalizeActionCard(
  baseCard: any,
  config: PersonalizationConfig
): any {
  const breed = BREEDS[config.breedId]
  if (!breed) return baseCard
  
  // 复制基础卡片
  const personalized = { ...baseCard }
  
  // 1. 调整适应期（Day 1-7）
  if (baseCard.day_number <= 7) {
    // 敏感型品种：减少打扰
    if (breed.adaptDays > 1.2) {
      personalized.focus = personalized.focus + '（给它更多时间）'
      personalized.reassurance = `你的${breed.name}可能需要更长时间适应，这是正常的。`
    }
    
    // 依赖型品种：增加陪伴
    if (breed.adaptDays < 0.8) {
      personalized.actions.unshift({
        text: '多花时间陪在它身边',
        reason: `${breed.name}喜欢陪伴，你的存在让它更有安全感`
      })
    }
  }
  
  // 2. 添加品种特殊护理（Day 15+）
  if (baseCard.day_number >= 15 && breed.grooming === 'high') {
    personalized.actions.push({
      text: '梳理毛发（每天）',
      reason: `${breed.name}需要定期毛发护理`
    })
  }
  
  // 3. 添加健康监测（Day 30+）
  if (baseCard.day_number >= 30 && breed.healthRisks.length > 0) {
    personalized.breedHealthNote = `${breed.name}常见健康关注：${breed.healthRisks.join('、')}`
  }
  
  // 4. 根据用户经验调整提示
  if (config.userExperience === 'beginner') {
    personalized.reassurance = personalized.reassurance + '\n\n💡 小贴士：养猫是循序渐进的过程，慢慢来就好。'
  }
  
  return personalized
}

// 获取品种选择页面数据
export function getBreedSelectionData() {
  return {
    popular: ['chinese-domestic', 'british-shorthair', 'american-shorthair', 'ragdoll'],
    shorthair: ['british-shorthair', 'american-shorthair', 'chinese-domestic', 'russian-blue', 'siamese'],
    longhair: ['persian', 'ragdoll', 'maine-coon'],
    special: ['sphynx', 'scottish-fold']
  }
}