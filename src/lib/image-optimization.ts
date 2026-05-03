/**
 * 图片优化工具
 */

// 图片尺寸预设
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 320, height: 240 },
  medium: { width: 640, height: 480 },
  large: { width: 1024, height: 768 },
  hero: { width: 1920, height: 1080 },
  avatar: { width: 200, height: 200 },
} as const

// 图片格式
export type ImageSize = keyof typeof IMAGE_SIZES

/**
 * 生成图片srcSet
 */
export function generateSrcSet(basePath: string, sizes: ImageSize[] = ['small', 'medium', 'large']): string {
  return sizes
    .map(size => {
      const { width } = IMAGE_SIZES[size]
      return `${basePath}?w=${width} ${width}w`
    })
    .join(', ')
}

/**
 * 生成sizes属性
 */
export function generateSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

/**
 * 延迟加载图片
 */
export function lazyLoadImage(selector: string = 'img[data-src]'): void {
  if (typeof window === 'undefined') return
  
  const images = document.querySelectorAll<HTMLImageElement>(selector)
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        
        if (src) {
          img.src = src
          img.removeAttribute('data-src')
        }
        
        observer.unobserve(img)
      }
    })
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  })
  
  images.forEach(img => imageObserver.observe(img))
}

/**
 * 图片占位符 - 模糊效果
 */
export function getPlaceholderBlur(): string {
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2Y0ZjYiLz48L3N2Zz4='
}

/**
 * 获取优化的图片URL
 */
export function getOptimizedImageUrl(src: string, options: {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'jpeg' | 'png'
} = {}): string {
  const params = new URLSearchParams()
  
  if (options.width) params.set('w', options.width.toString())
  if (options.height) params.set('h', options.height.toString())
  if (options.quality) params.set('q', options.quality.toString())
  if (options.format) params.set('f', options.format)
  
  const queryString = params.toString()
  return queryString ? `${src}?${queryString}` : src
}