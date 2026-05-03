/**
 * UGC内容系统
 * 用户生成内容入口
 */

import { db } from './database'

// ============ 内容类型 ============

export interface UserPost {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  
  type: 'story' | 'question' | 'tip' | 'photo' | 'diary'
  category: 'daily' | 'health' | 'behavior' | 'food' | 'training' | 'other'
  
  title: string
  content: string
  images?: string[]
  tags: string[]
  
  // 猫咪信息
  catName?: string
  catBreed?: string
  catAge?: number
  
  // 互动数据
  likes: number
  comments: number
  shares: number
  views: number
  
  // 状态
  status: 'draft' | 'published' | 'hidden' | 'featured'
  
  createdAt: string
  updatedAt: string
}

export interface PostComment {
  id: string
  postId: string
  userId: string
  userName: string
  content: string
  likes: number
  createdAt: string
}

// ============ 内存存储 ============

export const postsStore = new Map<string, UserPost>()
export const commentsStore = new Map<string, PostComment[]>()

// ============ 发帖功能 ============

/**
 * 创建帖子
 */
export async function createPost(post: Omit<UserPost, 'id' | 'likes' | 'comments' | 'shares' | 'views' | 'createdAt' | 'updatedAt'>): Promise<UserPost> {
  const id = `post_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  const newPost: UserPost = {
    ...post,
    id,
    likes: 0,
    comments: 0,
    shares: 0,
    views: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  postsStore.set(id, newPost)
  commentsStore.set(id, [])
  
  return newPost
}

/**
 * 获取帖子列表
 */
export function getPosts(options?: {
  type?: UserPost['type']
  category?: UserPost['category']
  userId?: string
  status?: UserPost['status']
  limit?: number
  offset?: number
}): UserPost[] {
  let posts = Array.from(postsStore.values())
  
  if (options?.type) {
    posts = posts.filter(p => p.type === options.type)
  }
  if (options?.category) {
    posts = posts.filter(p => p.category === options.category)
  }
  if (options?.userId) {
    posts = posts.filter(p => p.userId === options.userId)
  }
  if (options?.status) {
    posts = posts.filter(p => p.status === options.status)
  } else {
    posts = posts.filter(p => p.status === 'published' || p.status === 'featured')
  }
  
  // 按时间倒序
  posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  
  // 精选优先
  posts.sort((a, b) => {
    if (a.status === 'featured' && b.status !== 'featured') return -1
    if (a.status !== 'featured' && b.status === 'featured') return 1
    return 0
  })
  
  const offset = options?.offset || 0
  const limit = options?.limit || 20
  
  return posts.slice(offset, offset + limit)
}

/**
 * 获取单个帖子
 */
export function getPost(postId: string): UserPost | null {
  const post = postsStore.get(postId)
  if (post) {
    // 增加浏览量
    post.views++
  }
  return post || null
}

/**
 * 点赞帖子
 */
export function likePost(postId: string): boolean {
  const post = postsStore.get(postId)
  if (post) {
    post.likes++
    post.updatedAt = new Date().toISOString()
    return true
  }
  return false
}

/**
 * 评论帖子
 */
export function commentPost(postId: string, comment: Omit<PostComment, 'id' | 'postId' | 'likes' | 'createdAt'>): PostComment | null {
  const post = postsStore.get(postId)
  if (!post) return null
  
  const newComment: PostComment = {
    ...comment,
    id: `comment_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    postId,
    likes: 0,
    createdAt: new Date().toISOString()
  }
  
  const comments = commentsStore.get(postId) || []
  comments.unshift(newComment)
  commentsStore.set(postId, comments)
  
  post.comments++
  post.updatedAt = new Date().toISOString()
  
  return newComment
}

/**
 * 获取帖子评论
 */
export function getComments(postId: string, limit: number = 20): PostComment[] {
  const comments = commentsStore.get(postId) || []
  return comments.slice(0, limit)
}

// ============ 内容模板 ============

export const POST_TEMPLATES = {
  story: {
    title: '分享我和猫咪的故事',
    placeholder: '分享你和猫咪之间温暖的、有趣的、感人的故事...',
    suggestedTags: ['日常', '暖心', '趣事', '成长']
  },
  question: {
    title: '向其他铲屎官请教',
    placeholder: '描述你遇到的问题，其他铲屎官会帮你解答...',
    suggestedTags: ['求助', '健康', '行为', '饮食']
  },
  tip: {
    title: '分享养猫小技巧',
    placeholder: '分享你发现的养猫好物、技巧、经验...',
    suggestedTags: ['技巧', '好物', '省钱', '护理']
  },
  photo: {
    title: '晒晒我家主子',
    placeholder: '分享你家猫咪的美照...',
    suggestedTags: ['晒猫', '萌照', '日常']
  },
  diary: {
    title: '今日养猫日记',
    placeholder: '记录今天和猫咪的点点滴滴...',
    suggestedTags: ['日记', '日常', '记录']
  }
}

// ============ 内容审核 ============

/**
 * 简单的内容审核
 */
export function moderateContent(content: string): { approved: boolean; reason?: string } {
  // 敏感词列表（示例）
  const sensitiveWords = ['广告', '推销', '微信', '加我']
  
  for (const word of sensitiveWords) {
    if (content.includes(word)) {
      return { approved: false, reason: `内容包含敏感词：${word}` }
    }
  }
  
  // 最小长度检查
  if (content.length < 10) {
    return { approved: false, reason: '内容太短，请至少输入10个字' }
  }
  
  return { approved: true }
}