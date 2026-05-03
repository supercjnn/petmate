/**
 * 猫咪健康档案系统
 * 支持体重追踪、疫苗记录、驱虫记录、就诊记录
 */

// 安全的localStorage访问
const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(key)
  },
  setItem: (key: string, value: string) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(key, value)
  }
}

export interface CatProfile {
  id: string
  name: string
  breed?: string
  gender?: 'male' | 'female'
  birthDate?: string
  adoptionDate?: string
  color?: string
  microchip?: string
  neutered?: boolean
  neuteredDate?: string
  avatar?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface WeightRecord {
  id: string
  catId: string
  weight: number
  unit: 'kg' | 'lb'
  date: string
  notes?: string
}

export interface VaccineRecord {
  id: string
  catId: string
  vaccineType: 'FVRCP' | 'Rabies' | 'FeLV' | 'FIV' | 'Other'
  vaccineName?: string
  date: string
  nextDueDate?: string
  veterinarian?: string
  clinic?: string
  batchNumber?: string
  notes?: string
}

export interface DewormRecord {
  id: string
  catId: string
  product: string
  type: 'internal' | 'external' | 'combined'
  date: string
  nextDueDate?: string
  notes?: string
}

export interface VetVisit {
  id: string
  catId: string
  date: string
  type: 'checkup' | 'illness' | 'emergency' | 'vaccination' | 'surgery' | 'other'
  clinic: string
  veterinarian?: string
  reason?: string
  diagnosis?: string
  treatment?: string
  medications?: string[]
  cost?: number
  followUpDate?: string
  notes?: string
}

export interface HealthAlert {
  id: string
  catId: string
  type: 'vaccine' | 'deworm' | 'weight' | 'checkup' | 'medication'
  title: string
  message: string
  dueDate: string
  status: 'pending' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

// ============ 猫咪档案管理 ============

export function createCatProfile(data: Omit<CatProfile, 'id' | 'createdAt' | 'updatedAt'>): CatProfile {
  const cat: CatProfile = {
    ...data,
    id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  saveCatProfile(cat)
  return cat
}

export function saveCatProfile(cat: CatProfile) {
  const cats = getAllCats()
  const index = cats.findIndex(c => c.id === cat.id)
  
  if (index >= 0) {
    cats[index] = { ...cat, updatedAt: new Date().toISOString() }
  } else {
    cats.push(cat)
  }
  
  safeStorage.setItem('petmate_cats', JSON.stringify(cats))
}

export function getAllCats(): CatProfile[] {
  const data = safeStorage.getItem('petmate_cats')
  return data ? JSON.parse(data) : []
}

export function getCatById(id: string): CatProfile | undefined {
  return getAllCats().find(c => c.id === id)
}

export function deleteCat(id: string) {
  const cats = getAllCats().filter(c => c.id !== id)
  safeStorage.setItem('petmate_cats', JSON.stringify(cats))
}

// ============ 体重记录 ============

export function addWeightRecord(catId: string, weight: number, unit: 'kg' | 'lb' = 'kg', notes?: string): WeightRecord {
  const record: WeightRecord = {
    id: `weight_${Date.now()}`,
    catId,
    weight,
    unit,
    date: new Date().toISOString(),
    notes
  }

  const records = getWeightRecords(catId)
  records.push(record)
  safeStorage.setItem(`petmate_weights_${catId}`, JSON.stringify(records))

  return record
}

export function getWeightRecords(catId: string): WeightRecord[] {
  const data = safeStorage.getItem(`petmate_weights_${catId}`)
  return data ? JSON.parse(data) : []
}

export function getWeightTrend(catId: string, days: number = 30): {
  trend: 'gaining' | 'losing' | 'stable'
  change: number
  records: WeightRecord[]
} {
  const records = getWeightRecords(catId)
    .filter(r => new Date(r.date) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  if (records.length < 2) {
    return { trend: 'stable', change: 0, records }
  }

  const latest = records[records.length - 1].weight
  const earliest = records[0].weight
  const change = latest - earliest

  let trend: 'gaining' | 'losing' | 'stable'
  if (Math.abs(change) < 0.1) {
    trend = 'stable'
  } else if (change > 0) {
    trend = 'gaining'
  } else {
    trend = 'losing'
  }

  return { trend, change, records }
}

// ============ 疫苗记录 ============

export function addVaccineRecord(catId: string, data: Omit<VaccineRecord, 'id' | 'catId'>): VaccineRecord {
  const record: VaccineRecord = {
    ...data,
    id: `vaccine_${Date.now()}`,
    catId
  }

  const records = getVaccineRecords(catId)
  records.push(record)
  safeStorage.setItem(`petmate_vaccines_${catId}`, JSON.stringify(records))

  // 创建提醒
  if (record.nextDueDate) {
    createHealthAlert(catId, 'vaccine', record)
  }

  return record
}

export function getVaccineRecords(catId: string): VaccineRecord[] {
  const data = safeStorage.getItem(`petmate_vaccines_${catId}`)
  return data ? JSON.parse(data) : []
}

// ============ 驱虫记录 ============

export function addDewormRecord(catId: string, data: Omit<DewormRecord, 'id' | 'catId'>): DewormRecord {
  const record: DewormRecord = {
    ...data,
    id: `deworm_${Date.now()}`,
    catId
  }

  const records = getDewormRecords(catId)
  records.push(record)
  safeStorage.setItem(`petmate_deworms_${catId}`, JSON.stringify(records))

  if (record.nextDueDate) {
    createHealthAlert(catId, 'deworm', record)
  }

  return record
}

export function getDewormRecords(catId: string): DewormRecord[] {
  const data = safeStorage.getItem(`petmate_deworms_${catId}`)
  return data ? JSON.parse(data) : []
}

// ============ 就诊记录 ============

export function addVetVisit(catId: string, data: Omit<VetVisit, 'id' | 'catId'>): VetVisit {
  const record: VetVisit = {
    ...data,
    id: `visit_${Date.now()}`,
    catId
  }

  const records = getVetVisits(catId)
  records.push(record)
  safeStorage.setItem(`petmate_visits_${catId}`, JSON.stringify(records))

  if (record.followUpDate) {
    createHealthAlert(catId, 'checkup', record)
  }

  return record
}

export function getVetVisits(catId: string): VetVisit[] {
  const data = safeStorage.getItem(`petmate_visits_${catId}`)
  return data ? JSON.parse(data) : []
}

// ============ 健康提醒 ============

function createHealthAlert(catId: string, type: HealthAlert['type'], data: any): HealthAlert {
  const cat = getCatById(catId)
  
  let title: string
  let message: string
  let dueDate: string
  let priority: HealthAlert['priority'] = 'medium'

  switch (type) {
    case 'vaccine':
      title = '疫苗接种提醒'
      message = `${cat?.name || '猫咪'}需要接种${data.vaccineName || data.vaccineType}疫苗`
      dueDate = data.nextDueDate
      priority = 'high'
      break
    case 'deworm':
      title = '驱虫提醒'
      message = `${cat?.name || '猫咪'}需要进行${data.type === 'internal' ? '体内' : data.type === 'external' ? '体外' : ''}驱虫`
      dueDate = data.nextDueDate
      priority = 'medium'
      break
    case 'checkup':
      title = '复查提醒'
      message = `${cat?.name || '猫咪'}需要复查`
      dueDate = data.followUpDate
      priority = 'high'
      break
    default:
      title = '健康提醒'
      message = '查看详情'
      dueDate = new Date().toISOString()
  }

  const alert: HealthAlert = {
    id: `alert_${Date.now()}`,
    catId,
    type,
    title,
    message,
    dueDate,
    status: 'pending',
    priority,
    createdAt: new Date().toISOString()
  }

  saveAlert(alert)
  return alert
}

function saveAlert(alert: HealthAlert) {
  const alerts = getAllAlerts()
  alerts.push(alert)
  safeStorage.setItem('petmate_health_alerts', JSON.stringify(alerts))
}

export function getAllAlerts(): HealthAlert[] {
  const data = safeStorage.getItem('petmate_health_alerts')
  return data ? JSON.parse(data) : []
}

export function getPendingAlerts(): HealthAlert[] {
  return getAllAlerts()
    .filter(a => a.status === 'pending')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}

export function markAlertCompleted(id: string) {
  const alerts = getAllAlerts()
  const index = alerts.findIndex(a => a.id === id)
  if (index >= 0) {
    alerts[index].status = 'completed'
    safeStorage.setItem('petmate_health_alerts', JSON.stringify(alerts))
  }
}

// ============ 工具函数 ============

export function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate)
  const now = new Date()
  
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  
  if (months < 1) {
    const days = Math.floor((now.getTime() - birth.getTime()) / (24 * 60 * 60 * 1000))
    return `${days}天`
  } else if (months < 12) {
    return `${months}个月`
  } else {
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) {
      return `${years}岁`
    }
    return `${years}岁${remainingMonths}个月`
  }
}

export function getWeightStatus(weight: number, breed?: string): {
  status: 'underweight' | 'ideal' | 'overweight'
  range: string
  advice: string
} {
  // 简化版体重评估（实际应该根据品种和年龄）
  const idealMin = 3.5
  const idealMax = 5.5
  
  if (weight < idealMin) {
    return {
      status: 'underweight',
      range: `理想范围: ${idealMin}-${idealMax}kg`,
      advice: '体重偏轻，建议咨询兽医，增加营养摄入'
    }
  } else if (weight > idealMax) {
    return {
      status: 'overweight',
      range: `理想范围: ${idealMin}-${idealMax}kg`,
      advice: '体重偏重，建议控制饮食，增加运动'
    }
  } else {
    return {
      status: 'ideal',
      range: `理想范围: ${idealMin}-${idealMax}kg`,
      advice: '体重正常，继续保持'
    }
  }
}

export function getNextVaccineDue(catId: string): VaccineRecord | null {
  const records = getVaccineRecords(catId)
  const pending = records
    .filter(r => r.nextDueDate && new Date(r.nextDueDate) > new Date())
    .sort((a, b) => new Date(a.nextDueDate!).getTime() - new Date(b.nextDueDate!).getTime())
  
  return pending[0] || null
}

export function exportHealthData(catId: string): string {
  const cat = getCatById(catId)
  const weights = getWeightRecords(catId)
  const vaccines = getVaccineRecords(catId)
  const deworms = getDewormRecords(catId)
  const visits = getVetVisits(catId)

  return JSON.stringify({
    cat,
    weights,
    vaccines,
    deworms,
    visits,
    exportedAt: new Date().toISOString()
  }, null, 2)
}