// 健康档案数据模型

export interface HealthRecord {
  id: string
  date: string
  type: 'weight' | 'vaccine' | 'checkup' | 'illness'
  value?: number  // 体重kg
  description: string
  vetName?: string  // 医院/医生
  notes?: string
  createdAt: string
}

export interface VaccineSchedule {
  id: string
  name: string
  dueDate: string
  status: 'pending' | 'done'
  doneDate?: string
}

export interface CatHealth {
  catId: string
  records: HealthRecord[]
  weightHistory: { date: string; weight: number }[]
  vaccines: VaccineSchedule[]
}

// 默认疫苗计划
export const DEFAULT_VACCINES: Omit<VaccineSchedule, 'id'>[] = [
  { name: '猫三联（第1针）', dueDate: '', status: 'pending' },
  { name: '猫三联（第2针）', dueDate: '', status: 'pending' },
  { name: '狂犬疫苗', dueDate: '', status: 'pending' },
  { name: '猫三联（加强针）', dueDate: '', status: 'pending' },
]

// 获取健康档案
export function getHealthRecords(catId: string): CatHealth {
  const key = `petmate_health_${catId}`
  const data = localStorage.getItem(key)
  
  if (data) {
    return JSON.parse(data)
  }
  
  return {
    catId,
    records: [],
    weightHistory: [],
    vaccines: DEFAULT_VACCINES.map((v, i) => ({ ...v, id: `vaccine_${i}` }))
  }
}

// 保存健康档案
export function saveHealthRecords(health: CatHealth) {
  const key = `petmate_health_${health.catId}`
  localStorage.setItem(key, JSON.stringify(health))
}

// 添加记录
export function addHealthRecord(
  catId: string,
  record: Omit<HealthRecord, 'id' | 'createdAt'>
): HealthRecord {
  const health = getHealthRecords(catId)
  
  const newRecord: HealthRecord = {
    ...record,
    id: `record_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
  
  health.records.unshift(newRecord)
  
  // 如果是体重记录，添加到体重历史
  if (record.type === 'weight' && record.value) {
    health.weightHistory.push({
      date: record.date,
      weight: record.value
    })
  }
  
  saveHealthRecords(health)
  return newRecord
}

// 更新疫苗状态
export function updateVaccineStatus(
  catId: string,
  vaccineId: string,
  status: 'done' | 'pending',
  doneDate?: string
) {
  const health = getHealthRecords(catId)
  const vaccine = health.vaccines.find(v => v.id === vaccineId)
  
  if (vaccine) {
    vaccine.status = status
    vaccine.doneDate = doneDate
    saveHealthRecords(health)
  }
}

// 获取体重趋势
export function getWeightTrend(catId: string): {
  trend: 'up' | 'down' | 'stable'
  change: number
  latest: number | null
} {
  const health = getHealthRecords(catId)
  const history = health.weightHistory
  
  if (history.length < 2) {
    return { trend: 'stable', change: 0, latest: history[0]?.weight || null }
  }
  
  const latest = history[history.length - 1].weight
  const previous = history[history.length - 2].weight
  const change = latest - previous
  
  return {
    trend: change > 0.1 ? 'up' : change < -0.1 ? 'down' : 'stable',
    change: Math.abs(change),
    latest
  }
}

// 获取待办疫苗
export function getPendingVaccines(catId: string): VaccineSchedule[] {
  const health = getHealthRecords(catId)
  return health.vaccines.filter(v => v.status === 'pending')
}

// 格式化日期
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}