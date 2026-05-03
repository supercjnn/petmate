/**
 * PetMate 设计系统
 * 统一的颜色、字体、间距和组件规范
 */

// ============ 颜色系统 ============

export const colors = {
  // 主色 - 温暖的橙色（猫咪主题）
  primary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',  // 主色
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },

  // 辅色 - 紫色（神秘/优雅）
  secondary: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },

  // 语义色
  success: '#22c55e',
  warning: '#eab308',
  error: '#ef4444',
  info: '#3b82f6',

  // 灰度
  gray: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
  },

  // 背景
  background: {
    light: '#ffffff',
    dark: '#0a0a0a',
    card: '#ffffff',
    muted: '#f5f5f5',
  },

  // 文字
  text: {
    primary: '#18181b',
    secondary: '#52525b',
    muted: '#a1a1aa',
    inverse: '#ffffff',
  },
}

// ============ 字体系统 ============

export const typography = {
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"SF Mono", Monaco, "Cascadia Code", monospace',
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem',    // 48px
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

// ============ 间距系统 ============

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}

// ============ 圆角系统 ============

export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  base: '0.25rem', // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
}

// ============ 阴影系统 ============

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  card: '0 2px 8px rgba(0, 0, 0, 0.08)',
  floating: '0 8px 30px rgba(0, 0, 0, 0.12)',
}

// ============ 动效系统 ============

export const transitions = {
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    // 自定义缓动
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smoothIn: 'cubic-bezier(0.4, 0, 1, 1)',
    smoothOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },

  // 常用组合
  default: '300ms ease',
  fast: '150ms ease-out',
  slow: '500ms ease-in-out',
  bounce: '300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
}

// ============ 断点系统 ============

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
}

// ============ Z-Index系统 ============

export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 999,
}

// ============ 组件尺寸 ============

export const componentSize = {
  button: {
    sm: { height: '32px', padding: '8px 16px', fontSize: '14px' },
    md: { height: '40px', padding: '10px 20px', fontSize: '16px' },
    lg: { height: '48px', padding: '12px 24px', fontSize: '18px' },
  },

  input: {
    sm: { height: '32px', padding: '6px 12px', fontSize: '14px' },
    md: { height: '40px', padding: '8px 16px', fontSize: '16px' },
    lg: { height: '48px', padding: '10px 20px', fontSize: '18px' },
  },

  card: {
    sm: { padding: '12px', borderRadius: '8px' },
    md: { padding: '16px', borderRadius: '12px' },
    lg: { padding: '24px', borderRadius: '16px' },
  },
}

// 导出CSS变量生成函数
export function generateCSSVariables() {
  return `
:root {
  /* Colors */
  --color-primary: ${colors.primary[500]};
  --color-primary-light: ${colors.primary[300]};
  --color-primary-dark: ${colors.primary[700]};
  --color-secondary: ${colors.secondary[500]};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};
  --color-info: ${colors.info};
  
  /* Background */
  --bg-primary: ${colors.background.light};
  --bg-secondary: ${colors.background.muted};
  --bg-card: ${colors.background.card};
  
  /* Text */
  --text-primary: ${colors.text.primary};
  --text-secondary: ${colors.text.secondary};
  --text-muted: ${colors.text.muted};
  
  /* Typography */
  --font-sans: ${typography.fontFamily.sans};
  --font-mono: ${typography.fontFamily.mono};
  
  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-card: ${shadows.card};
  
  /* Border Radius */
  --radius-sm: ${borderRadius.sm};
  --radius-md: ${borderRadius.md};
  --radius-lg: ${borderRadius.lg};
  --radius-xl: ${borderRadius.xl};
  
  /* Transitions */
  --transition-fast: ${transitions.fast};
  --transition-normal: ${transitions.default};
}
  `
}