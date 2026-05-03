/**
 * 社区功能服务
 * 用户互动、关注、通知
 */

import { postsStore, commentsStore } from './ugc'

// ============ 用户关系 ============

export interface UserRelation {
  userId: string
  followers: string[]  // 粉丝列表
  following: string[]  // 关注列表
  blocked: string[]    // 黑名单
}

export interface Notification {
  id: string
  userId: string
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'system'
  title: string
  content: string
  link?: string
  read: boolean
  createdAt: string
}

// ============ 内存存储 ============

const relationsStore = new Map<string, UserRelation>()
const notificationsStore = new Map<string, Notification[]>()

// ============ 关注功能 ============

/**
 * 关注用户
 */
export function followUser(followerId: string, targetId: string): boolean {
  if (followerId === targetId) return false
  
  // 更新关注者的关注列表
  const followerRelation = relationsStore.get(followerId) || {
    userId: followerId,
    followers: [],
    following: [],
    blocked: []
  }
  
  if (!followerRelation.following.includes(targetId)) {
    followerRelation.following.push(targetId)
    relationsStore.set(followerId, followerRelation)
  }
  
  // 更新被关注者的粉丝列表
  const targetRelation = relationsStore.get(targetId) || {
    userId: targetId,
    followers: [],
    following: [],
    blocked: []
  }
  
  if (!targetRelation.followers.includes(followerId)) {
    targetRelation.followers.push(followerId)
    relationsStore.set(targetId, targetRelation)
  }
  
  // 发送通知
  sendNotification({
    userId: targetId,
    type: 'follow',
    title: '新粉丝',
    content: '有人关注了你',
    link: `/profile/${followerId}`
  })
  
  return true
}

/**
 * 取消关注
 */
export function unfollowUser(followerId: string, targetId: string): boolean {
  const followerRelation = relationsStore.get(followerId)
  const targetRelation = relationsStore.get(targetId)
  
  if (followerRelation) {
    followerRelation.following = followerRelation.following.filter(id => id !== targetId)
    relationsStore.set(followerId, followerRelation)
  }
  
  if (targetRelation) {
    targetRelation.followers = targetRelation.followers.filter(id => id !== followerId)
    relationsStore.set(targetId, targetRelation)
  }
  
  return true
}

/**
 * 获取用户关系
 */
export function getUserRelation(userId: string): UserRelation {
  return relationsStore.get(userId) || {
    userId,
    followers: [],
    following: [],
    blocked: []
  }
}

/**
 * 检查是否关注
 */
export function isFollowing(followerId: string, targetId: string): boolean {
  const relation = relationsStore.get(followerId)
  return relation?.following.includes(targetId) || false
}

// ============ 通知功能 ============

/**
 * 发送通知
 */
export function sendNotification(notification: Omit<Notification, 'id' | 'read' | 'createdAt'>): Notification {
  const id = `notif_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  const newNotification: Notification = {
    ...notification,
    id,
    read: false,
    createdAt: new Date().toISOString()
  }
  
  const userNotifications = notificationsStore.get(notification.userId) || []
  userNotifications.unshift(newNotification)
  
  // 只保留最近100条通知
  if (userNotifications.length > 100) {
    userNotifications.pop()
  }
  
  notificationsStore.set(notification.userId, userNotifications)
  
  return newNotification
}

/**
 * 获取用户通知
 */
export function getNotifications(userId: string, limit: number = 20): Notification[] {
  const notifications = notificationsStore.get(userId) || []
  return notifications.slice(0, limit)
}

/**
 * 获取未读通知数
 */
export function getUnreadCount(userId: string): number {
  const notifications = notificationsStore.get(userId) || []
  return notifications.filter(n => !n.read).length
}

/**
 * 标记通知已读
 */
export function markAsRead(notificationId: string, userId: string): boolean {
  const notifications = notificationsStore.get(userId) || []
  const notification = notifications.find(n => n.id === notificationId)
  
  if (notification) {
    notification.read = true
    return true
  }
  
  return false
}

/**
 * 全部标记已读
 */
export function markAllAsRead(userId: string): boolean {
  const notifications = notificationsStore.get(userId) || []
  notifications.forEach(n => n.read = true)
  return true
}

// ============ 活动动态 ============

export interface Activity {
  id: string
  userId: string
  userName: string
  action: 'post' | 'comment' | 'like' | 'achievement' | 'follow'
  targetId?: string
  targetType?: 'post' | 'user' | 'achievement'
  content: string
  createdAt: string
}

const activitiesStore: Activity[] = []

/**
 * 记录活动
 */
export function recordActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Activity {
  const id = `activity_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  const newActivity: Activity = {
    ...activity,
    id,
    createdAt: new Date().toISOString()
  }
  
  activitiesStore.unshift(newActivity)
  
  // 只保留最近1000条
  if (activitiesStore.length > 1000) {
    activitiesStore.pop()
  }
  
  return newActivity
}

/**
 * 获取活动动态
 */
export function getActivities(options?: {
  userId?: string
  action?: Activity['action']
  limit?: number
}): Activity[] {
  let activities = [...activitiesStore]
  
  if (options?.userId) {
    activities = activities.filter(a => a.userId === options.userId)
  }
  
  if (options?.action) {
    activities = activities.filter(a => a.action === options.action)
  }
  
  return activities.slice(0, options?.limit || 50)
}

// ============ 社区统计 ============

/**
 * 获取社区统计
 */
export function getCommunityStats() {
  return {
    totalPosts: postsStore.size,
    totalUsers: relationsStore.size,
    totalComments: Array.from(commentsStore.values()).reduce((sum: number, arr: PostComment[]) => sum + arr.length, 0),
    activeToday: Math.floor(relationsStore.size * 0.3), // 模拟数据
    trendingTags: ['英短', '布偶', '新手养猫', '猫粮推荐', '疫苗']
  }
}

import { PostComment } from './ugc'