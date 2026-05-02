// SEO优化配置

import { Metadata } from 'next'

// 基础SEO配置
export const SITE_CONFIG = {
  name: '宠伴 PetMate',
  description: '新手养猫前90天，每天一张行动卡。告诉你今天该做什么、不要做什么、哪些信号要警惕。让新手养猫不再焦虑。',
  url: 'https://petmate-beige.vercel.app',
  ogImage: '/og-image.png',
  keywords: [
    '新手养猫',
    '养猫攻略',
    '猫咪养护',
    '养猫指南',
    '第一只猫',
    '猫咪日常',
    '养猫注意事项',
    '幼猫喂养',
    '猫咪适应期',
    '90天养猫'
  ],
  author: 'PetMate',
  twitter: '@petmate'
}

// 页面SEO配置
export const PAGE_SEO: Record<string, { title: string; description: string }> = {
  '/': {
    title: '宠伴 PetMate - 新手养猫前90天行动卡',
    description: '每天一张行动卡，告诉新手养猫人今天该做什么、不要做什么。91天完整计划，品种个性化适配，AI智能问答。'
  },
  '/dashboard': {
    title: '今日行动卡 - 宠伴 PetMate',
    description: '查看今天的养猫行动卡，了解该做什么、不该做什么、需要观察什么。'
  },
  '/breed-select': {
    title: '选择猫咪品种 - 宠伴 PetMate',
    description: '选择你的猫咪品种，获取个性化的养护建议和行动卡。'
  },
  '/ai-assist': {
    title: 'AI养猫助手 - 宠伴 PetMate',
    description: 'AI智能解答养猫问题，基于知识库提供专业建议。'
  },
  '/achievements': {
    title: '我的成就 - 宠伴 PetMate',
    description: '查看养猫里程碑成就，记录与猫咪的成长历程。'
  },
  '/health': {
    title: '猫咪健康档案 - 宠伴 PetMate',
    description: '记录猫咪体重、疫苗接种、就医情况，管理猫咪健康。'
  },
  '/diary': {
    title: '养猫日记 - 宠伴 PetMate',
    description: '记录养猫每一天，导出分享你的养猫故事。'
  }
}

// 生成页面Metadata
export function generatePageMetadata(path: string): Metadata {
  const pageSEO = PAGE_SEO[path] || PAGE_SEO['/']
  
  return {
    title: pageSEO.title,
    description: pageSEO.description,
    keywords: SITE_CONFIG.keywords,
    authors: [{ name: SITE_CONFIG.author }],
    creator: SITE_CONFIG.author,
    
    openGraph: {
      type: 'website',
      locale: 'zh_CN',
      url: SITE_CONFIG.url + path,
      siteName: SITE_CONFIG.name,
      title: pageSEO.title,
      description: pageSEO.description,
      images: [
        {
          url: SITE_CONFIG.ogImage,
          width: 1200,
          height: 630,
          alt: SITE_CONFIG.name
        }
      ]
    },
    
    twitter: {
      card: 'summary_large_image',
      title: pageSEO.title,
      description: pageSEO.description,
      images: [SITE_CONFIG.ogImage],
      creator: SITE_CONFIG.twitter
    },
    
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    },
    
    alternates: {
      canonical: SITE_CONFIG.url + path
    }
  }
}

// 结构化数据 (JSON-LD)
export function generateStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    url: SITE_CONFIG.url,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      description: '免费体验前3天，完整版¥29'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '128',
      reviewCount: '86'
    }
  }
}

// 生成站点地图数据
export function generateSitemap(): string {
  const pages = Object.keys(PAGE_SEO)
  const today = new Date().toISOString().split('T')[0]
  
  const urls = pages.map(page => `
  <url>
    <loc>${SITE_CONFIG.url}${page}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page === '/' ? 'daily' : 'weekly'}</changefreq>
    <priority>${page === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

// 生成robots.txt
export function generateRobots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${SITE_CONFIG.url}/sitemap.xml

# 禁止爬取API
Disallow: /api/
`
}