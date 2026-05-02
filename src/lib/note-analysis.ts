// 笔记AI分析模块

export interface NoteAnalysis {
  summary: string
  keywords: string[]
  mood: 'positive' | 'neutral' | 'concerned'
  suggestions: string[]
  healthAlert?: string
}

// 情感关键词
const POSITIVE_WORDS = ['开心', '高兴', '可爱', '乖', '亲', '睡', '玩', '蹭', '呼噜', '活泼', '好奇']
const CONCERN_WORDS = ['担心', '不吃', '不喝', '吐', '拉稀', '精神差', '躲', '叫', '瘦', '不吃不喝']

// 健康预警关键词
const HEALTH_ALERTS: Record<string, string> = {
  '不吃不喝': '超过24小时不吃不喝需要关注，超过48小时建议就医',
  '呕吐': '偶尔呕吐正常，频繁呕吐需要就医检查',
  '拉稀': '轻微腹泻观察24小时，持续或带血立即就医',
  '精神差': '精神萎靡可能是疾病信号，观察其他症状',
  '躲着': '躲藏可能是应激或疾病，结合其他表现判断',
  '叫个不停': '可能是发情、疼痛或焦虑，需要排查原因',
  '瘦了': '体重下降需要注意，记录体重变化趋势',
  '不吃': '拒食超过24小时需要关注，检查是否有其他症状',
  '不拉': '超过48小时不排便需要就医'
}

// 分析笔记内容
export function analyzeNote(content: string): NoteAnalysis {
  const keywords = extractNoteKeywords(content)
  const mood = analyzeMood(content)
  const healthAlert = detectHealthAlert(content)
  const suggestions = generateSuggestions(mood, keywords, healthAlert)
  const summary = generateSummary(content, keywords, mood)
  
  return {
    summary,
    keywords,
    mood,
    suggestions,
    healthAlert
  }
}

// 提取关键词
function extractNoteKeywords(content: string): string[] {
  const keywords: string[] = []
  
  // 行为关键词
  const behaviorWords = ['玩', '睡', '吃', '喝', '跑', '跳', '躲', '叫', '蹭', '摸', '抱', '抓']
  for (const word of behaviorWords) {
    if (content.includes(word)) {
      keywords.push(word)
    }
  }
  
  // 状态关键词
  const statusWords = ['精神好', '精神差', '活泼', '安静', '粘人', '独立']
  for (const word of statusWords) {
    if (content.includes(word)) {
      keywords.push(word)
    }
  }
  
  return keywords
}

// 分析情感
function analyzeMood(content: string): 'positive' | 'neutral' | 'concerned' {
  let positiveScore = 0
  let concernScore = 0
  
  for (const word of POSITIVE_WORDS) {
    if (content.includes(word)) positiveScore++
  }
  
  for (const word of CONCERN_WORDS) {
    if (content.includes(word)) concernScore++
  }
  
  if (concernScore > positiveScore) return 'concerned'
  if (positiveScore > concernScore) return 'positive'
  return 'neutral'
}

// 检测健康预警
function detectHealthAlert(content: string): string | undefined {
  for (const [keyword, alert] of Object.entries(HEALTH_ALERTS)) {
    if (content.includes(keyword)) {
      return alert
    }
  }
  return undefined
}

// 生成建议
function generateSuggestions(
  mood: 'positive' | 'neutral' | 'concerned',
  keywords: string[],
  healthAlert?: string
): string[] {
  const suggestions: string[] = []
  
  if (healthAlert) {
    suggestions.push('⚠️ ' + healthAlert)
  }
  
  if (mood === 'concerned') {
    suggestions.push('建议记录更多细节，方便判断猫咪状态')
    suggestions.push('如果担心，可以拍照记录症状')
  }
  
  if (mood === 'positive') {
    suggestions.push('继续保持，你和小猫咪相处得很好！')
  }
  
  if (keywords.includes('玩')) {
    suggestions.push('互动玩耍有助于建立信任关系')
  }
  
  if (keywords.includes('睡')) {
    suggestions.push('猫咪睡眠时间长是正常的')
  }
  
  return suggestions.slice(0, 3)
}

// 生成摘要
function generateSummary(
  content: string,
  keywords: string[],
  mood: 'positive' | 'neutral' | 'concerned'
): string {
  const moodEmoji = mood === 'positive' ? '😊' : mood === 'concerned' ? '😟' : '😐'
  const moodText = mood === 'positive' ? '状态良好' : mood === 'concerned' ? '需要关注' : '状态正常'
  
  const keywordStr = keywords.length > 0 ? `，关键词：${keywords.slice(0, 3).join('、')}` : ''
  
  return `${moodEmoji} ${moodText}${keywordStr}`
}

// 生成周报
export function generateWeeklyReport(
  notes: Array<{ date: string; content: string; dayNumber: number }>,
  weekStart: number
): {
  summary: string
  highlights: string[]
  concerns: string[]
  suggestions: string[]
} {
  const weekNotes = notes.filter(n => n.dayNumber >= weekStart && n.dayNumber < weekStart + 7)
  
  const analyses = weekNotes.map(n => ({
    ...n,
    analysis: analyzeNote(n.content)
  }))
  
  const highlights: string[] = []
  const concerns: string[] = []
  
  for (const note of analyses) {
    if (note.analysis.mood === 'positive') {
      highlights.push(`Day ${note.dayNumber}: ${note.analysis.summary}`)
    } else if (note.analysis.mood === 'concerned') {
      concerns.push(`Day ${note.dayNumber}: ${note.analysis.healthAlert || note.analysis.summary}`)
    }
  }
  
  const positiveCount = analyses.filter(a => a.analysis.mood === 'positive').length
  const summary = `本周记录了${weekNotes.length}天，其中${positiveCount}天状态良好`
  
  const suggestions = concerns.length > 0 
    ? ['建议关注异常情况', '必要时咨询兽医']
    : ['继续保持良好状态']
  
  return {
    summary,
    highlights: highlights.slice(0, 3),
    concerns: concerns.slice(0, 3),
    suggestions
  }
}