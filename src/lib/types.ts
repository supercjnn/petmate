// PetMate 核心类型定义

export type StageId = 'S0' | 'S1' | 'S2' | 'S3' | 'S4' | 'S5'
export type RiskLevel = 'low' | 'medium' | 'high' | 'urgent'

export interface CatStatus {
  eating: 'normal' | 'low' | 'none' | 'unknown'
  drinking: 'normal' | 'low' | 'none' | 'unknown'
  litter: 'normal' | 'abnormal' | 'none' | 'unknown'
  hiding: 'no' | 'sometimes' | 'often' | 'always'
  activity: 'low' | 'normal' | 'high' | 'unknown'
  vomiting: boolean
  diarrhea: boolean
  sneezing: boolean
  breathing_abnormal: boolean
}

export interface RiskResult {
  level: RiskLevel
  message: string
  observe_duration: string
  escalate_conditions: string[]
  actions?: string[]
  avoids?: string[]
}

// 阶段定义
export const STAGES = [
  { id: 'S0' as StageId, name: '接猫准备期', dayStart: -14, dayEnd: 0, goal: '准备用品和环境' },
  { id: 'S1' as StageId, name: '适应期', dayStart: 1, dayEnd: 3, goal: '降低应激' },
  { id: 'S2' as StageId, name: '信任建立期', dayStart: 4, dayEnd: 14, goal: '建立节奏' },
  { id: 'S3' as StageId, name: '行为塑造期', dayStart: 15, dayEnd: 30, goal: '建立好习惯' },
  { id: 'S4' as StageId, name: '稳定护理期', dayStart: 31, dayEnd: 60, goal: '完成疫苗驱虫' },
  { id: 'S5' as StageId, name: '长期优化期', dayStart: 61, dayEnd: 90, goal: '长期系统' },
]