// PetMate Service Worker - PWA离线支持

const CACHE_NAME = 'petmate-v1'
const STATIC_CACHE = 'petmate-static-v1'
const DYNAMIC_CACHE = 'petmate-dynamic-v1'

// 需要缓存的静态资源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
]

// 安装事件
self.addEventListener('install', (event: any) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('缓存静态资源')
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// 激活事件
self.addEventListener('activate', (event: any) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// 请求拦截
self.addEventListener('fetch', (event: any) => {
  const { request } = event
  const url = new URL(request.url)
  
  // API请求不缓存（动态数据）
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => {
          return new Response(JSON.stringify({ error: '网络错误' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          })
        })
    )
    return
  }
  
  // 静态资源优先缓存
  if (STATIC_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        return fetch(request).then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response.clone())
            return response
          })
        })
      })
    )
    return
  }
  
  // 其他请求：网络优先，缓存兜底
  event.respondWith(
    fetch(request)
      .then((response) => {
        // 缓存成功响应
        if (response.status === 200) {
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, response.clone())
          })
        }
        return response
      })
      .catch(() => {
        // 网络失败，尝试缓存
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse
          }
          // 返回离线页面
          return new Response('离线状态，请检查网络连接', {
            status: 503,
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
          })
        })
      })
  )
})

// 推送通知
self.addEventListener('push', (event: any) => {
  const data = event.data ? event.data.json() : {}
  
  const options = {
    body: data.body || '今日行动卡已更新',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    },
    actions: [
      { action: 'view', title: '查看' },
      { action: 'close', title: '关闭' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || '宠伴 PetMate', options)
  )
})

// 通知点击
self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    )
  }
})

// 定时提醒（后台同步）
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'daily-reminder') {
    event.waitUntil(
      // 发送每日提醒
      self.registration.showNotification('宠伴提醒 🐱', {
        body: '今天的行动卡已准备好，快来查看吧！',
        icon: '/icons/icon-192.png',
        data: { url: '/dashboard' }
      })
    )
  }
})