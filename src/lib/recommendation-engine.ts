/**
 * 智能推荐引擎
 * 基于用户进度、猫咪档案、行为数据生成个性化推荐
 */

import { searchKnowledge } from './knowledge-base'

export interface Recommendation {
  id: string
  type: 'action' | 'article' | 'reminder' | 'tip' | 'warning'
  title: string
  content: string
  priority: 'high' | 'medium' | 'low'
  reason: string
  actionLabel?: string
  actionLink?: string
  createdAt: string
}

export interface UserProfile {
  dayNumber: number
  phase: string
  catBreed?: string
  catAge?: string
  catGender?: 'male' | 'female'
  catNeutered?: boolean
  experience?: 'new' | 'some' | 'experienced'
  recentIssues?: string[]
  completedActions?: number
  totalActions?: number
}

// 基于进度生成推荐
export function generateProgressRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = []
  const { dayNumber, phase } = profile

  // 阶段里程碑提醒
  if (dayNumber === 7) {
    recommendations.push({
      id: 'milestone_week1',
      type: 'tip',
      title: '🎉 恭喜完成第一周！',
      content: '猫咪已经适应了基本环境。接下来可以尝试更多互动，建立亲密关系。',
      priority: 'medium',
      reason: '适应期完成里程碑',
      actionLabel: '查看第8天行动卡',
      actionLink: '/dashboard',
      createdAt: new Date().toISOString()
    })
  }

  if (dayNumber === 30) {
    recommendations.push({
      id: 'milestone_month1',
      type: 'action',
      title: '📅 一个月回顾',
      content: '建议带猫咪做一次体检，确认健康状况。同时回顾这30天的变化。',
      priority: 'high',
      reason: '月度里程碑',
      actionLabel: '记录里程碑',
      actionLink: '/notes?type=milestone',
      createdAt: new Date().toISOString()
    })
  }

  if (dayNumber === 60 && !profile.catNeutered) {
    recommendations.push({
      id: 'neuter_reminder',
      type: 'reminder',
      title: '🏥 绝育建议',
      content: '如果还没有绝育，建议咨询兽医。绝育有助于预防疾病、延长寿命。',
      priority: 'high',
      reason: '适合绝育的年龄阶段',
      actionLabel: '了解更多',
      actionLink: '/ai-chat?q=猫咪绝育',
      createdAt: new Date().toISOString()
    })
  }

  // 阶段特定提醒
  if (phase === 'adapt' && dayNumber > 3) {
    recommendations.push({
      id: 'play_intro',
      type: 'tip',
      title: '🎾 开始互动',
      content: '如果猫咪已经出来活动，可以尝试用逗猫棒开始互动，建立信任。',
      priority: 'medium',
      reason: '适应期后期适合开始互动',
      createdAt: new Date().toISOString()
    })
  }

  if (phase === 'explore' && dayNumber > 15) {
    recommendations.push({
      id: 'vaccine_check',
      type: 'reminder',
      title: '💉 疫苗提醒',
      content: '确认猫咪疫苗接种情况。如果已完成第一针，记得按时打加强针。',
      priority: 'high',
      reason: '探索期需要确认疫苗状态',
      actionLabel: '查看疫苗知识',
      actionLink: '/ai-chat?q=猫咪疫苗',
      createdAt: new Date().toISOString()
    })
  }

  return recommendations
}

// 基于猫咪品种生成推荐
export function generateBreedRecommendations(breed: string): Recommendation[] {
  const recommendations: Recommendation[] = []
  
  const breedTips: Record<string, { issues: string[], tips: string[] }> = {
    'british_shorthair': {
      issues: ['容易肥胖', '心脏问题'],
      tips: ['控制饮食量', '定期称重', '年度心脏检查']
    },
    'ragdoll': {
      issues: ['心肌病', '肠胃敏感'],
      tips: ['避免剧烈运动', '注意饮食过渡', '定期心脏筛查']
    },
    'american_shorthair': {
      issues: ['容易发胖'],
      tips: ['控制食量', '多运动互动']
    },
    'persian': {
      issues: ['呼吸道问题', '眼睛分泌物', '毛球症'],
      tips: ['保持环境凉爽', '每日清洁眼部', '每天梳毛']
    },
    'siamese': {
      issues: ['活泼好动', '爱叫'],
      tips: ['提供足够玩具', '多陪伴互动', '考虑养两只']
    },
    'scottish_fold': {
      issues: ['软骨病风险'],
      tips: ['避免高处跳跃', '定期关节检查', '关注活动状态']
    }
  }

  const breedKey = breed.toLowerCase().replace(/[\s-]/g, '_')
  const breedInfo = breedTips[breedKey]
  
  if (breedInfo) {
    recommendations.push({
      id: 'breed_health',
      type: 'warning',
      title: `${breed}健康关注`,
      content: `该品种常见问题：${breedInfo.issues.join('、')}。建议：${breedInfo.tips.join('、')}。`,
      priority: 'high',
      reason: `品种特定健康建议`,
      createdAt: new Date().toISOString()
    })
  }

  return recommendations
}

// 基于问题生成推荐
export function generateIssueRecommendations(issues: string[]): Recommendation[] {
  const recommendations: Recommendation[] = []

  for (const issue of issues) {
    const knowledge = searchKnowledge(issue, 1)[0]
    
    if (knowledge) {
      recommendations.push({
        id: `issue_${knowledge.id}`,
        type: knowledge.severity === 'critical' || knowledge.severity === 'high' 
          ? 'warning' 
          : 'tip',
        title: knowledge.title,
        content: knowledge.content.slice(0, 150) + '...',
        priority: knowledge.severity === 'critical' ? 'high' 
          : knowledge.severity === 'high' ? 'high' 
          : 'medium',
        reason: '基于您记录的问题',
        actionLabel: '了解更多',
        actionLink: `/ai-chat?q=${encodeURIComponent(issue)}`,
        createdAt: new Date().toISOString()
      })
    }
  }

  return recommendations
}

// 综合推荐生成
export function generateAllRecommendations(profile: UserProfile): Recommendation[] {
  const allRecs: Recommendation[] = []

  // 进度推荐
  allRecs.push(...generateProgressRecommendations(profile))

  // 品种推荐
  if (profile.catBreed) {
    allRecs.push(...generateBreedRecommendations(profile.catBreed))
  }

  // 问题推荐
  if (profile.recentIssues && profile.recentIssues.length > 0) {
    allRecs.push(...generateIssueRecommendations(profile.recentIssues))
  }

  // 按优先级排序，去重
  const uniqueRecs = allRecs.filter((rec, index, self) => 
    index === self.findIndex(r => r.id === rec.id)
  )

  const priorityOrder = { high: 0, medium: 1, low: 2 }
  uniqueRecs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

  return uniqueRecs.slice(0, 5) // 最多返回5条
}

// 智能提醒生成
export function generateSmartReminders(profile: UserProfile): Recommendation[] {
  const reminders: Recommendation[] = []
  const now = new Date()
  const hour = now.getHours()

  // 早晨提醒
  if (hour >= 7 && hour <= 9) {
    reminders.push({
      id: 'morning_feed',
      type: 'reminder',
      title: '🌅 早间提醒',
      content: '记得给猫咪准备早餐，检查水碗是否需要添水。',
      priority: 'medium',
      reason: '早间日常提醒',
      createdAt: now.toISOString()
    })
  }

  // 晚间提醒
  if (hour >= 19 && hour <= 21) {
    reminders.push({
      id: 'evening_play',
      type: 'reminder',
      title: '🌙 晚间互动',
      content: '现在是猫咪最活跃的时候，可以花15分钟陪它玩耍。',
      priority: 'medium',
      reason: '猫咪晨昏性活跃期',
      createdAt: now.toISOString()
    })
  }

  // 周末提醒
  if (now.getDay() === 0 || now.getDay() === 6) {
    reminders.push({
      id: 'weekend_check',
      type: 'reminder',
      title: '📋 周末检查',
      content: '周末适合：检查猫咪身体状况、清洁猫砂盆、整理本周笔记。',
      priority: 'low',
      reason: '周末综合提醒',
      createdAt: now.toISOString()
    })
  }

  return reminders
}