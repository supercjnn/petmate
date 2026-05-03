import { MetadataRoute } from 'next'
import { SITE_CONFIG, generateSitemapEntry } from '@/lib/seo'

// 静态页面
const staticPages = [
  { path: '/', priority: 1, changeFrequency: 'daily' as const },
  { path: '/dashboard', priority: 0.9, changeFrequency: 'daily' as const },
  { path: '/onboarding', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/ai', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/pricing', priority: 0.7, changeFrequency: 'weekly' as const },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' as const },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
]

// 动态页面生成（90天决策系统）
const dayPages = Array.from({ length: 90 }, (_, i) => ({
  path: `/day/${i + 1}`,
  priority: 0.6,
  changeFrequency: 'weekly' as const,
}))

export default function sitemap(): MetadataRoute.Sitemap {
  const allPages = [...staticPages, ...dayPages]
  
  return allPages.map(page => generateSitemapEntry(page.path, {
    priority: page.priority,
    changeFrequency: page.changeFrequency,
  }))
}