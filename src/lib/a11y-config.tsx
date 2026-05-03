/**
 * 全局无障碍配置
 */

import { type ReactNode } from 'react'
import { SkipLink } from '@/components/a11y'

interface A11yProviderProps {
  children: ReactNode
}

export function A11yProvider({ children }: A11yProviderProps) {
  return (
    <>
      {/* 跳转链接 */}
      <SkipLink />

      {/* 主内容区域 */}
      <div id="main-content" role="main">
        {children}
      </div>
    </>
  )
}

// 无障碍样式（注入全局CSS）
export const a11yStyles = `
  /* 屏幕阅读器专用 */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .sr-only:focus {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }

  /* 焦点样式增强 */
  *:focus-visible {
    outline: 2px solid #f97316;
    outline-offset: 2px;
  }

  /* 高对比度模式 */
  @media (prefers-contrast: more) {
    .bg-orange-500 {
      background-color: #000 !important;
      color: #fff !important;
    }
    .border-gray-200 {
      border-color: #fff !important;
    }
  }

  /* 减少动效 */
  @media (prefers-reduced-motion: reduce) {
    .animate-spin,
    .animate-pulse,
    .animate-bounce,
    .transition-all,
    .transition-opacity,
    .transition-transform {
      animation: none !important;
      transition: none !important;
    }
  }

  /* 安全区域 */
  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
`