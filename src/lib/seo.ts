import { Metadata, Viewport } from 'next'

// 基础SEO配置
export const SITE_CONFIG = {
  name: 'PetMate',
  url: 'https://petmate.cat',
  description: '新手养猫90天决策系统 - 科学的猫咪养育指南，帮助新手铲屎官轻松养猫',
  keywords: ['养猫', '新手养猫', '猫咪护理', '猫咪健康', '养猫指南', '铲屎官', 'PetMate'],
  author: 'PetMate Team',
  email: 'hello@petmate.cat',
  
  // 社交媒体
  social: {
    wechat: 'PetMateCat',
    weibo: '@PetMate养猫',
    xiaohongshu: 'PetMate养猫指南',
  },
  
  // 颜色主题
  theme: {
    primary: '#f97316',
    secondary: '#8b5cf6',
    background: '#ffffff',
  }
} as const

// 默认元数据
export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: `${SITE_CONFIG.name} - 新手养猫90天决策系统`,
    template: `%s | ${SITE_CONFIG.name}`
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [{ name: SITE_CONFIG.author }],
  creator: SITE_CONFIG.author,
  publisher: SITE_CONFIG.author,
  
  // 图标
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: `${SITE_CONFIG.name} - 新手养猫90天决策系统`,
    description: SITE_CONFIG.description,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.name,
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} - 新手养猫90天决策系统`,
    description: SITE_CONFIG.description,
    images: ['/og-image.png'],
    creator: '@PetMateCat',
  },
  
  // 机器人
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // 验证
  verification: {
    google: 'google-site-verification-code',
  },
  
  // 分类
  category: 'pets',
  classification: 'Pet Care App',
  
  // 其他
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

// 视口配置
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

// 页面专用元数据生成
export function generatePageMetadata(options: {
  title: string
  description?: string
  path?: string
  image?: string
}): Metadata {
  const { title, description, path = '', image } = options
  
  return {
    title,
    description: description || SITE_CONFIG.description,
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: description || SITE_CONFIG.description,
      url: `${SITE_CONFIG.url}${path}`,
      images: image ? [{ url: image, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description: description || SITE_CONFIG.description,
      images: image ? [image] : undefined,
    },
  }
}

// 结构化数据 - Organization
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    sameAs: [
      `https://weibo.com/${SITE_CONFIG.social.weibo}`,
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: SITE_CONFIG.email,
      contactType: 'customer service',
    },
  }
}

// 结构化数据 - WebApplication
export function getWebApplicationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    description: SITE_CONFIG.description,
    applicationCategory: 'PetApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }
}

// 结构化数据 - FAQ
export function getFAQSchema(faqs: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// 结构化数据 - HowTo
export function getHowToSchema(options: {
  name: string
  description: string
  steps: Array<{ name: string; text: string }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    step: options.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }
}

// 结构化数据 - Article
export function getArticleSchema(options: {
  title: string
  description: string
  publishedTime: string
  modifiedTime?: string
  author: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: options.title,
    description: options.description,
    datePublished: options.publishedTime,
    dateModified: options.modifiedTime || options.publishedTime,
    author: {
      '@type': 'Person',
      name: options.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_CONFIG.name,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_CONFIG.url}/logo.png`,
      },
    },
    image: options.image,
  }
}

// 生成sitemap URL条目
export function generateSitemapEntry(path: string, options: {
  lastModified?: Date
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
} = {}) {
  return {
    url: `${SITE_CONFIG.url}${path}`,
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency || 'weekly',
    priority: options.priority || 0.5,
  }
}