import { CatStatus, RiskResult } from './types'
import * as fs from 'fs'
import * as path from 'path'
import * as yaml from 'yaml'

// 项目根目录
const PROJECT_ROOT = process.cwd()
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content')

// 阶段判断
export function getStage(dayNumber: number) {
  if (dayNumber <= 0) return { id: 'S0', name: '接猫准备期' }
  if (dayNumber <= 3) return { id: 'S1', name: '适应期' }
  if (dayNumber <= 14) return { id: 'S2', name: '信任建立期' }
  if (dayNumber <= 30) return { id: 'S3', name: '行为塑造期' }
  if (dayNumber <= 60) return { id: 'S4', name: '稳定护理期' }
  return { id: 'S5', name: '长期优化期' }
}

// 加载每日行动卡 (从YAML文件)
export function loadDailyCard(dayNumber: number): any {
  const stage = getStage(dayNumber)
  
  try {
    // 构建文件路径
    const dayStr = String(dayNumber).padStart(3, '0')
    const filePath = path.join(CONTENT_DIR, 'daily_cards', `day_${dayStr}.yaml`)
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      console.warn(`Daily card file not found: ${filePath}`)
      return getDefaultCard(dayNumber, stage)
    }
    
    // 读取并解析YAML
    const content = fs.readFileSync(filePath, 'utf-8')
    const cardData = yaml.parse(content)
    
    return {
      ...cardData,
      loaded_from_yaml: true
    }
  } catch (error) {
    console.error(`Error loading daily card for day ${dayNumber}:`, error)
    return getDefaultCard(dayNumber, stage)
  }
}

// 默认卡片 (当YAML文件不存在时)
function getDefaultCard(dayNumber: number, stage: { id: string; name: string }): any {
  return {
    day_number: dayNumber,
    stage_name: stage.name,
    title: '日常养护',
    focus: '继续保持规律',
    actions: [
      { text: '固定时间喂食', reason: '规律有利健康' },
      { text: '观察精神状态', reason: '日常关注' }
    ],
    avoids: [
      { text: '不要频繁换粮', reason: '可能引起不适' }
    ],
    observe: ['进食情况', '排泄情况'],
    risk_tip: '如出现异常，点击"有点担心"',
    reassurance: '你已经是合格的铲屎官了',
    loaded_from_yaml: false
  }
}

// 风险判断 (基于规则库)
export function evaluateRisk(status: CatStatus, dayNumber: number): RiskResult {
  // 紧急风险 - 最高优先级
  if (status.breathing_abnormal) {
    return {
      level: 'urgent',
      message: '呼吸异常（张嘴呼吸、呼吸急促、呼吸声异常）属于高风险信号，建议立即就医。',
      observe_duration: '立即',
      escalate_conditions: ['无需观察，直接就医'],
      actions: ['立即带猫咪就医', '记录呼吸异常表现'],
      avoids: ['不要等待观察', '不要自行用药']
    }
  }
  
  // 高风险 - 不进食
  if (status.eating === 'none') {
    return {
      level: 'high',
      message: '猫咪完全不进食需要重视，可能导致脂肪肝等严重问题。',
      observe_duration: '不超过12小时',
      escalate_conditions: ['超过48小时仍不进食建议就医', '出现精神萎靡立即就医'],
      actions: ['尝试用更香的食物诱导', '检查是否有其他异常', '准备就医'],
      avoids: ['不要强迫喂食', '不要拖延观察']
    }
  }
  
  // 高风险 - 呕吐
  if (status.vomiting) {
    return {
      level: 'high',
      message: '呕吐需要观察频率和精神状态。多次呕吐需重视。',
      observe_duration: '24小时',
      escalate_conditions: ['24小时内呕吐3次以上需就医', '呕吐物带血立即就医'],
      actions: ['观察呕吐物内容', '暂时减少食物', '确保饮水'],
      avoids: ['不要随意用药', '不要继续正常喂食']
    }
  }
  
  // 高风险 - 腹泻带血
  if (status.diarrhea) {
    return {
      level: 'medium',
      message: '腹泻应加强观察，注意补水。检查是否有其他异常。',
      observe_duration: '24-48小时',
      escalate_conditions: ['腹泻带血立即就医', '超过48小时需就医', '伴随呕吐升级'],
      actions: ['确保充足饮水', '观察粪便状态', '暂时减少食物'],
      avoids: ['不要随便用药', '不要喂新食物']
    }
  }
  
  // 中等风险 - 不排泄
  if (status.litter === 'none') {
    return {
      level: 'medium',
      message: '猫咪未排泄需要关注，可能涉及泌尿系统问题。',
      observe_duration: '24小时',
      escalate_conditions: ['超过48小时不排尿立即就医', '公猫尤其高危'],
      actions: ['观察是否尝试排泄', '检查猫砂盆位置', '确保饮水充足'],
      avoids: ['不要忽视此信号']
    }
  }
  
  // 中等风险 - 打喷嚏
  if (status.sneezing) {
    return {
      level: 'medium',
      message: '打喷嚏可能是上呼吸道问题或环境刺激，加强观察。',
      observe_duration: '48小时',
      escalate_conditions: ['频繁打喷嚏超过24小时需关注', '出现呼吸困难立即就医'],
      actions: ['观察是否有眼鼻分泌物', '检查环境灰尘', '注意体温'],
      avoids: ['不要忽视伴随症状']
    }
  }
  
  // 低风险 - 适应期躲藏
  if (dayNumber <= 3 && status.hiding === 'always') {
    // 检查进食和排泄是否正常
    const eatingOk = status.eating === 'normal' || status.eating === 'low'
    const litterOk = status.litter === 'normal' || status.litter === 'abnormal'
    
    if (eatingOk && litterOk) {
      return {
        level: 'low',
        message: '到家前3天躲藏是正常的适应反应，只要进食排泄正常，可以继续观察。',
        observe_duration: '续观察至Day 4',
        escalate_conditions: ['第4天后仍不出来需关注', '进食变差升级'],
        actions: ['保持安静环境', '不强行互动', '固定喂食时间'],
        avoids: ['不要强行抱出来', '不要频繁打扰', '不要盯着看']
      }
    }
  }
  
  // 低风险 - 默认
  return {
    level: 'low',
    message: '当前暂无明显高风险信号，继续按行动卡执行日常养护。',
    observe_duration: '日常观察即可',
    escalate_conditions: ['出现新异常信号及时判断'],
    actions: ['继续按行动卡执行', '日常观察进食排泄'],
    avoids: ['不要过度焦虑']
  }
}

// 获取风险规则列表 (用于展示)
export function getRiskRules(): any[] {
  try {
    const filePath = path.join(CONTENT_DIR, 'risk_rules', 'cat_risk_rules.yaml')
    if (!fs.existsSync(filePath)) {
      return []
    }
    
    const content = fs.readFileSync(filePath, 'utf-8')
    // 解析YAML，提取规则部分
    const lines = content.split('\n')
    const rules: any[] = []
    
    for (const line of lines) {
      if (line.startsWith('- id:')) {
        const ruleMatch = line.match(/- id: (\w+)/)
        if (ruleMatch) {
          rules.push({ id: ruleMatch[1] })
        }
      }
    }
    
    return rules
  } catch (error) {
    console.error('Error loading risk rules:', error)
    return []
  }
}