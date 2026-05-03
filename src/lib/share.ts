/**
 * 分享功能服务
 * 生成分享海报、分享链接
 */

// ============ 分享类型 ============

export interface ShareContent {
  type: 'progress' | 'achievement' | 'post' | 'profile' | 'daily_card' | 'milestone' | 'streak'
  title: string
  description: string
  image?: string
  data: Record<string, any>
}

export interface ShareLink {
  id: string
  type: string
  userId: string
  content: ShareContent
  createdAt: string
  expiresAt?: string
  viewCount: number
  likeCount: number
}

// ============ 内存存储 ============

const shareLinksStore = new Map<string, ShareLink>()

// ============ 分享链接生成 ============

/**
 * 创建分享链接
 */
export function createShareLink(
  userId: string,
  content: ShareContent
): ShareLink {
  const id = `share_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  
  const shareLink: ShareLink = {
    id,
    type: content.type,
    userId,
    content,
    createdAt: new Date().toISOString(),
    viewCount: 0,
    likeCount: 0
  }
  
  shareLinksStore.set(id, shareLink)
  return shareLink
}

/**
 * 获取分享链接
 */
export function getShareLink(shareId: string): ShareLink | null {
  const link = shareLinksStore.get(shareId)
  if (link) {
    link.viewCount++
  }
  return link || null
}

/**
 * 点赞分享
 */
export function likeShare(shareId: string): boolean {
  const link = shareLinksStore.get(shareId)
  if (link) {
    link.likeCount++
    return true
  }
  return false
}

// ============ 分享内容生成 ============

/**
 * 生成进度分享内容
 */
export function generateProgressShare(data: {
  currentDay: number
  streakDays: number
  catName: string
  achievements: string[]
}): ShareContent {
  return {
    type: 'progress',
    title: `我和${data.catName}的第${data.currentDay}天`,
    description: `已连续打卡${data.streakDays}天，解锁${data.achievements.length}个成就！`,
    data
  }
}

/**
 * 生成成就分享内容
 */
export function generateAchievementShare(data: {
  achievementName: string
  achievementIcon: string
  achievementDescription: string
  catName: string
}): ShareContent {
  return {
    type: 'achievement',
    title: `解锁成就：${data.achievementName} ${data.achievementIcon}`,
    description: data.achievementDescription,
    data
  }
}

// ============ 分享海报生成 ============

/**
 * 生成分享海报（Canvas方案）
 */
export async function generateSharePoster(content: ShareContent): Promise<string> {
  // 简化版：返回占位符
  // 实际需要Canvas绘制或后端生成
  
  const templates: Record<string, string> = {
    progress: '/assets/share/progress-template.png',
    achievement: '/assets/share/achievement-template.png',
    daily_card: '/assets/share/daily-template.png',
    post: '/assets/share/post-template.png',
    profile: '/assets/share/profile-template.png'
  }
  
  return templates[content.type] || templates.progress
}

// ============ 社交平台分享 ============

/**
 * 分享到微信
 */
export function shareToWechat(content: ShareContent): void {
  // 微信分享需要JS-SDK
  console.log('分享到微信:', content)
}

/**
 * 分享到微博
 */
export function shareToWeibo(content: ShareContent): string {
  const text = encodeURIComponent(`${content.title} - ${content.description}`)
  const url = encodeURIComponent('https://petmate.app')
  return `https://service.weibo.com/share/share.php?title=${text}&url=${url}`
}

/**
 * 复制分享链接
 */
export async function copyShareLink(shareId: string): Promise<boolean> {
  const link = `https://petmate.app/share/${shareId}`
  try {
    await navigator.clipboard.writeText(link)
    return true
  } catch {
    return false
  }
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

/**
 * 分享到社交平台（统一接口）
 */
export function shareToSocial(platform: string, content: ShareContent): void {
  switch (platform) {
    case 'wechat':
      shareToWechat(content)
      break
    case 'weibo':
      window.open(shareToWeibo(content), '_blank')
      break
    default:
      console.log('分享到:', platform, content)
  }
}

// ============ 导出 ============