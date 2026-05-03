'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner, EmptyState } from '@/components/ui'
import { IconArrowLeft, IconBell, IconCheck, IconTrash, IconCat, IconCalendar, IconTrophy, IconSettings } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import {
  Notification,
  getAllNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  checkNotificationPermission,
  requestNotificationPermission,
  getNotificationStats
} from '@/lib/notifications'

export default function NotificationsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState(getNotificationStats())
  const [permission, setPermission] = useState<NotificationPermission | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setNotifications(getAllNotifications())
    setStats(getNotificationStats())
    setPermission(checkNotificationPermission())
    setLoading(false)
  }

  const handleMarkRead = (id: string) => {
    markNotificationRead(id)
    loadData()
  }

  const handleMarkAllRead = () => {
    markAllNotificationsRead()
    loadData()
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    loadData()
  }

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission()
    setPermission(checkNotificationPermission())
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold flex items-center gap-2">
            <IconBell className="w-5 h-5" />
            通知
          </h1>
          <button onClick={() => setShowSettings(true)} className="p-2 -mr-2">
            <IconSettings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 未读统计 */}
        {stats.unread > 0 && (
          <SlideIn direction="down">
            <Card className="bg-orange-50 border border-orange-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconBell className="w-5 h-5 text-orange-500" />
                  <span className="font-medium text-orange-700">
                    {stats.unread} 条未读通知
                  </span>
                </div>
                <Button size="sm" onClick={handleMarkAllRead}>
                  全部已读
                </Button>
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 通知列表 */}
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <FadeIn key={notification.id} delay={index * 30}>
                <NotificationCard
                  notification={notification}
                  onMarkRead={handleMarkRead}
                  onDelete={handleDelete}
                  onClick={() => {
                    if (!notification.readAt) {
                      handleMarkRead(notification.id)
                    }
                    if (notification.actionUrl) {
                      router.push(notification.actionUrl)
                    }
                  }}
                />
              </FadeIn>
            ))}
          </div>
        ) : (
          <FadeIn>
            <EmptyState
              icon={<IconBell className="w-12 h-12" />}
              title="暂无通知"
              description="当你有健康提醒、里程碑达成时，会在这里显示"
            />
          </FadeIn>
        )}
      </div>

      {/* 设置弹窗 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
          <SlideIn direction="up">
            <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
              <h2 className="text-lg font-bold mb-4">通知设置</h2>
              
              <div className="space-y-4">
                {/* 浏览器通知权限 */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">浏览器通知</p>
                      <p className="text-sm text-gray-500">
                        接收疫苗提醒、里程碑通知等
                      </p>
                    </div>
                    <Badge variant={
                      permission === 'granted' ? 'success' :
                      permission === 'denied' ? 'error' :
                      'info'
                    }>
                      {permission === 'granted' ? '已开启' :
                       permission === 'denied' ? '已拒绝' :
                       '未开启'}
                    </Badge>
                  </div>
                  
                  {permission !== 'granted' && permission !== 'denied' && (
                    <Button 
                      size="sm" 
                      onClick={handleRequestPermission}
                      className="mt-3 w-full"
                    >
                      开启通知
                    </Button>
                  )}
                  
                  {permission === 'denied' && (
                    <p className="text-xs text-gray-500 mt-3">
                      请在浏览器设置中允许通知权限
                    </p>
                  )}
                </div>

                {/* 通知统计 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-sm text-gray-500">总通知</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-500">{stats.unread}</p>
                    <p className="text-sm text-gray-500">未读</p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="ghost" onClick={() => setShowSettings(false)} fullWidth>
                  关闭
                </Button>
              </div>
            </Card>
          </SlideIn>
        </div>
      )}
    </div>
  )
}

// 通知卡片组件
function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  onClick
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  onClick: () => void
}) {
  const typeIcons: Record<string, typeof IconCat> = {
    health: IconCat,
    task: IconCalendar,
    milestone: IconTrophy,
    system: IconBell
  }

  const IconComponent = typeIcons[notification.type] || IconBell

  return (
    <Card
      className={`cursor-pointer transition-all ${
        notification.readAt ? 'opacity-60' : ''
      } ${
        notification.priority === 'high' ? 'border-l-4 border-l-red-500' :
        notification.priority === 'medium' ? 'border-l-4 border-l-orange-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        {/* 图标 */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          notification.type === 'health' ? 'bg-blue-100 text-blue-500' :
          notification.type === 'milestone' ? 'bg-purple-100 text-purple-500' :
          notification.type === 'task' ? 'bg-green-100 text-green-500' :
          'bg-gray-100 text-gray-500'
        }`}>
          <IconComponent className="w-5 h-5" />
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{notification.title}</p>
            {!notification.readAt && (
              <span className="w-2 h-2 rounded-full bg-orange-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{notification.message}</p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(notification.createdAt).toLocaleString('zh-CN', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-1">
          {!notification.readAt && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead(notification.id)
              }}
              className="p-1 text-gray-400 hover:text-green-500"
            >
              <IconCheck className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(notification.id)
            }}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <IconTrash className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  )
}