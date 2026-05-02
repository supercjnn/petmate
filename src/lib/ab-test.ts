// A/B测试框架

export interface ABTestConfig {
  id: string
  name: string
  variants: {
    id: string
    name: string
    weight: number // 权重 0-1
    config: Record<string, any>
  }[]
  startDate: string
  endDate?: string
  metrics: string[] // 追踪的指标
  status: 'running' | 'completed' | 'paused'
}

// 当前运行的实验
const ACTIVE_TESTS: ABTestConfig[] = [
  {
    id: 'landing_cta',
    name: 'Landing Page CTA文案测试',
    variants: [
      { id: 'a', name: '控制组', weight: 0.5, config: { ctaText: '立即生成我的行动卡' } },
      { id: 'b', name: '实验组', weight: 0.5, config: { ctaText: '开始我的90天守护之旅' } }
    ],
    startDate: '2026-05-01',
    metrics: ['signup_start', 'signup_complete'],
    status: 'running'
  },
  {
    id: 'price_display',
    name: '价格展示方式测试',
    variants: [
      { id: 'a', name: '直接展示', weight: 0.5, config: { showPrice: true, priceText: '¥29解锁完整版' } },
      { id: 'b', name: '价值强调', weight: 0.5, config: { showPrice: true, priceText: '不到一杯奶茶钱，解锁90天专业指导' } }
    ],
    startDate: '2026-05-01',
    metrics: ['payment_start', 'payment_complete'],
    status: 'running'
  }
]

// 本地存储Key
const AB_TEST_KEY = 'petmate_ab_tests'

// 为用户分配实验变体
export function assignVariant(testId: string): string {
  const test = ACTIVE_TESTS.find(t => t.id === testId)
  if (!test || test.status !== 'running') {
    return 'a' // 默认控制组
  }
  
  // 检查是否已分配
  const assignments = getAssignments()
  if (assignments[testId]) {
    return assignments[testId]
  }
  
  // 按权重随机分配
  const random = Math.random()
  let cumulative = 0
  
  for (const variant of test.variants) {
    cumulative += variant.weight
    if (random < cumulative) {
      // 保存分配
      assignments[testId] = variant.id
      saveAssignments(assignments)
      
      // 记录分配事件
      trackABAssignment(testId, variant.id)
      
      return variant.id
    }
  }
  
  return test.variants[0].id
}

// 获取用户的实验配置
export function getTestConfig(testId: string): Record<string, any> {
  const test = ACTIVE_TESTS.find(t => t.id === testId)
  if (!test) return {}
  
  const variantId = assignVariant(testId)
  const variant = test.variants.find(v => v.id === variantId)
  
  return variant?.config || {}
}

// 获取所有分配
function getAssignments(): Record<string, string> {
  try {
    const data = localStorage.getItem(AB_TEST_KEY)
    return data ? JSON.parse(data) : {}
  } catch {
    return {}
  }
}

// 保存分配
function saveAssignments(assignments: Record<string, string>): void {
  localStorage.setItem(AB_TEST_KEY, JSON.stringify(assignments))
}

// 记录A/B分配
function trackABAssignment(testId: string, variantId: string): void {
  // 这里可以调用tracking系统
  console.log('[AB Test]', testId, 'assigned to', variantId)
}

// 记录实验指标
export function trackABMetric(testId: string, metric: string): void {
  const assignments = getAssignments()
  const variantId = assignments[testId]
  
  if (variantId) {
    // 记录到tracking系统
    console.log('[AB Metric]', testId, variantId, metric)
  }
}

// 获取实验结果（简化版）
export function getTestResults(testId: string): {
  test: ABTestConfig | null
  variantResults: Record<string, { count: number; metrics: Record<string, number> }>
} {
  const test = ACTIVE_TESTS.find(t => t.id === testId)
  
  if (!test) {
    return { test: null, variantResults: {} }
  }
  
  // 从tracking数据中计算结果（简化版）
  const variantResults: Record<string, { count: number; metrics: Record<string, number> }> = {}
  
  for (const variant of test.variants) {
    variantResults[variant.id] = {
      count: 0,
      metrics: {}
    }
    
    for (const metric of test.metrics) {
      variantResults[variant.id].metrics[metric] = 0
    }
  }
  
  return { test, variantResults }
}

// 获取所有运行中的实验
export function getActiveTests(): ABTestConfig[] {
  return ACTIVE_TESTS.filter(t => t.status === 'running')
}

// 清除实验分配（用于测试）
export function clearAssignments(): void {
  localStorage.removeItem(AB_TEST_KEY)
}