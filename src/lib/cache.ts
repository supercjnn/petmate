/**
 * 数据缓存工具
 */

// 内存缓存
class MemoryCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map()
  private maxSize: number
  
  constructor(maxSize: number = 100) {
    this.maxSize = maxSize
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    if (!item) return null
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }
  
  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    // LRU: 如果超过最大容量，删除最旧的
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }
    
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl
    })
  }
  
  delete(key: string): boolean {
    return this.cache.delete(key)
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  has(key: string): boolean {
    const item = this.cache.get(key)
    if (!item) return false
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key)
      return false
    }
    
    return true
  }
  
  size(): number {
    return this.cache.size
  }
}

// 全局缓存实例
export const cardCache = new MemoryCache<any>(50)
export const userCache = new MemoryCache<any>(10)
export const analyticsCache = new MemoryCache<any>(100)

// 本地存储缓存
export const localStorageCache = {
  get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      if (Date.now() > parsed.expiry) {
        localStorage.removeItem(key)
        return null
      }
      
      return parsed.data as T
    } catch {
      return null
    }
  },
  
  set<T>(key: string, data: T, ttl: number = 24 * 60 * 60 * 1000): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(key, JSON.stringify({
        data,
        expiry: Date.now() + ttl
      }))
    } catch {
      // 存储空间不足时清理过期数据
      localStorageCache.clearExpired()
    }
  },
  
  delete(key: string): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(key)
  },
  
  clearExpired(): void {
    if (typeof window === 'undefined') return
    
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      try {
        const item = localStorage.getItem(key)
        if (item) {
          const parsed = JSON.parse(item)
          if (parsed.expiry && Date.now() > parsed.expiry) {
            localStorage.removeItem(key)
          }
        }
      } catch {
        // 忽略解析错误
      }
    })
  },
  
  clear(): void {
    if (typeof window === 'undefined') return
    localStorage.clear()
  }
}

// 带缓存的数据获取
export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: {
    ttl?: number
    memoryCache?: boolean
    localStorageCache?: boolean
  } = {}
): Promise<T> {
  const { ttl = 5 * 60 * 1000, memoryCache: useMemoryCache = true } = options
  
  // 检查内存缓存
  if (useMemoryCache) {
    const cached = cardCache.get(key)
    if (cached !== null) {
      return cached as T
    }
  }
  
  // 获取数据
  const data = await fetcher()
  
  // 存入缓存
  if (useMemoryCache) {
    cardCache.set(key, data, ttl)
  }
  
  return data
}

// 清理所有缓存
export function clearAllCaches(): void {
  cardCache.clear()
  userCache.clear()
  analyticsCache.clear()
}