'use client'

import { useState, useEffect, useRef } from 'react'
import { Spinner } from '@/components/ui'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  placeholder?: string
  onLoad?: () => void
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholder = '/placeholder-cat.svg',
  onLoad,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* 占位图 */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {/* 实际图片 */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onLoad={() => {
            setIsLoaded(true)
            onLoad?.()
          }}
          loading="lazy"
        />
      )}
    </div>
  )
}

// 图片预加载工具
export function preloadImages(urls: string[]): Promise<void[]> {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve()
        img.onerror = reject
        img.src = url
      })
    })
  )
}

// 批量图片组件
interface ImageGalleryProps {
  images: { src: string; alt: string }[]
  className?: string
}

export function ImageGallery({ images, className = '' }: ImageGalleryProps) {
  return (
    <div className={`grid grid-cols-2 gap-4 ${className}`}>
      {images.map((img, i) => (
        <LazyImage
          key={i}
          src={img.src}
          alt={img.alt}
          className="rounded-lg aspect-square object-cover"
        />
      ))}
    </div>
  )
}