/**
 * 健康档案完整版
 * 支持体重追踪、疫苗记录、就医记录、驱虫记录
 */

export interface WeightRecord {
  id: string
  date: string
  weight: number // kg
  note?: string
  createdAt: string
}

export interface VaccinationRecord {
  id: string
  name: string // 疫苗名称
  date: string
  nextDueDate?: string
  hospital?: string
  batchNumber?: string
  note?: string
  createdAt: string
}

export interface MedicalRecord {
  id: string
  date: string
  hospital: string
  doctor?: string
  diagnosis: string
  treatment?: string
  cost?: number
  medications?: MedicationRecord[]
  followUp?: string
  note?: string
  createdAt: string
}

export interface MedicationRecord {
  name: string
  dosage: string
  frequency: string
  duration: string
  note?: string
}

export interface DewormingRecord {
  id: string
  date: string
  type: 'internal' | 'external' | 'both'
  product: string
  nextDueDate?: string
  note?: string
  createdAt: string
}

export interface HealthRecord {
  weightRecords: WeightRecord[]
  vaccinationRecords: VaccinationRecord[]
  medicalRecords: MedicalRecord[]
  dewormingRecords: DewormingRecord[]
  allergies?: string[]
  chronicConditions?: string[]
  lastVetVisit?: string
  bloodType?: string
  microchipId?: string
  insuranceProvider?: string
  insuranceNumber?: string
}

// ============ 默认数据 ============

export const defaultHealthRecord: HealthRecord = {
  weightRecords: [],
  vaccinationRecords: [],
  medicalRecords: [],
  dewormingRecords: [],
  allergies: [],
  chronicConditions: []
}

// ============ 疫苗建议时间表 ============

export const vaccinationSchedule = [
  {
    name: '猫三联（第一针）',
    recommendedAge: '6-8周',
    description: '预防猫瘟、猫鼻支、猫杯状病毒'
  },
  {
    name: '猫三联（第二针）',
    recommendedAge: '10-12周',
    description: '加强免疫'
  },
  {
    name: '猫三联（第三针）',
    recommendedAge: '14-16周',
    description: '完成基础免疫'
  },
  {
    name: '狂犬疫苗',
    recommendedAge: '12周以上',
    description: '法律要求，每年接种'
  },
  {
    name: '猫三联（加强针）',
    recommendedAge: '1岁',
    description: '首次免疫后一年加强'
  }
]

// ============ 体重分析 ============

export function analyzeWeight(records: WeightRecord[]): {
  trend: 'gaining' | 'losing' | 'stable' | 'unknown'
  averageWeight: number
  changeRate: number // kg/month
  healthStatus: 'underweight' | 'normal' | 'overweight' | 'unknown'
  alerts: string[]
} {
  if (records.length < 2) {
    return {
      trend: 'unknown',
      averageWeight: 0,
      changeRate: 0,
      healthStatus: 'unknown',
      alerts: ['需要至少2次体重记录才能分析趋势']
    }
  }

  const sortedRecords = [...records].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const weights = sortedRecords.map(r => r.weight)
  const averageWeight = weights.reduce((a, b) => a + b, 0) / weights.length

  // 计算变化率（kg/月）
  const firstDate = new Date(sortedRecords[0].date)
  const lastDate = new Date(sortedRecords[sortedRecords.length - 1].date)
  const monthsDiff = (lastDate.getTime() - firstDate.getTime()) / (30 * 24 * 60 * 60 * 1000)
  const weightChange = sortedRecords[sortedRecords.length - 1].weight - sortedRecords[0].weight
  const changeRate = monthsDiff > 0 ? weightChange / monthsDiff : 0

  // 判断趋势
  let trend: 'gaining' | 'losing' | 'stable' = 'stable'
  if (changeRate > 0.3) trend = 'gaining'
  else if (changeRate < -0.3) trend = 'losing'

  // 健康状态（基于成年猫标准体重）
  let healthStatus: 'underweight' | 'normal' | 'overweight' | 'unknown' = 'unknown'
  if (averageWeight < 3) healthStatus = 'underweight'
  else if (averageWeight > 6) healthStatus = 'overweight'
  else healthStatus = 'normal'

  // 生成警告
  const alerts: string[] = []
  if (trend === 'losing' && Math.abs(changeRate) > 0.5) {
    alerts.push('体重下降过快，建议就医检查')
  }
  if (trend === 'gaining' && changeRate > 0.5) {
    alerts.push('体重增长过快，注意控制饮食')
  }
  if (healthStatus === 'overweight') {
    alerts.push('体重超标，建议咨询兽医制定减重计划')
  }

  return {
    trend,
    averageWeight: Math.round(averageWeight * 100) / 100,
    changeRate: Math.round(changeRate * 100) / 100,
    healthStatus,
    alerts
  }
}

// ============ 疫苗提醒 ============

export function checkVaccinationDue(records: VaccinationRecord[]): {
  overdue: VaccinationRecord[]
  dueSoon: VaccinationRecord[]
  upcoming: VaccinationRecord[]
} {
  const now = new Date()
  const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
  const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  const overdue: VaccinationRecord[] = []
  const dueSoon: VaccinationRecord[] = []
  const upcoming: VaccinationRecord[] = []

  records.forEach(record => {
    if (record.nextDueDate) {
      const dueDate = new Date(record.nextDueDate)
      if (dueDate < now) {
        overdue.push(record)
      } else if (dueDate < twoWeeksLater) {
        dueSoon.push(record)
      } else if (dueDate < oneMonthLater) {
        upcoming.push(record)
      }
    }
  })

  return { overdue, dueSoon, upcoming }
}

// ============ 驱虫提醒 ============

export function checkDewormingDue(records: DewormingRecord[]): {
  overdue: DewormingRecord[]
  dueSoon: DewormingRecord[]
} {
  const now = new Date()
  const oneWeekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const overdue: DewormingRecord[] = []
  const dueSoon: DewormingRecord[] = []

  records.forEach(record => {
    if (record.nextDueDate) {
      const dueDate = new Date(record.nextDueDate)
      if (dueDate < now) {
        overdue.push(record)
      } else if (dueDate < oneWeekLater) {
        dueSoon.push(record)
      }
    }
  })

  return { overdue, dueSoon }
}

// ============ 健康报告生成 ============

export function generateHealthReport(record: HealthRecord): string {
  const weightAnalysis = analyzeWeight(record.weightRecords)
  const vaccinationDue = checkVaccinationDue(record.vaccinationRecords)
  const dewormingDue = checkDewormingDue(record.dewormingRecords)

  let report = `# 猫咪健康报告\n\n`
  report += `生成时间: ${new Date().toLocaleDateString()}\n\n`

  // 体重部分
  report += `## 体重状况\n`
  if (record.weightRecords.length > 0) {
    const latest = record.weightRecords[record.weightRecords.length - 1]
    report += `- 当前体重: ${latest.weight}kg (${latest.date})\n`
    report += `- 体重趋势: ${
      weightAnalysis.trend === 'gaining' ? '上升' :
      weightAnalysis.trend === 'losing' ? '下降' : '稳定'
    }\n`
    if (weightAnalysis.alerts.length > 0) {
      report += `- 注意事项: ${weightAnalysis.alerts.join('; ')}\n`
    }
  } else {
    report += `- 暂无体重记录\n`
  }

  // 疫苗部分
  report += `\n## 疫苗接种\n`
  if (record.vaccinationRecords.length > 0) {
    record.vaccinationRecords.forEach(v => {
      report += `- ${v.name}: ${v.date}\n`
    })
    if (vaccinationDue.overdue.length > 0) {
      report += `- ⚠️ 已过期: ${vaccinationDue.overdue.map(v => v.name).join(', ')}\n`
    }
  } else {
    report += `- 暂无疫苗记录\n`
  }

  // 驱虫部分
  report += `\n## 驱虫记录\n`
  if (record.dewormingRecords.length > 0) {
    const latest = record.dewormingRecords[record.dewormingRecords.length - 1]
    report += `- 最近驱虫: ${latest.date} (${latest.type === 'both' ? '内外同驱' : latest.type === 'internal' ? '内驱' : '外驱'})\n`
  } else {
    report += `- 暂无驱虫记录\n`
  }

  // 就医记录
  report += `\n## 就医记录\n`
  if (record.medicalRecords.length > 0) {
    report += `- 共${record.medicalRecords.length}次就医\n`
  } else {
    report += `- 暂无就医记录\n`
  }

  return report
}
