'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import zh from '@/locales/zh.json'
import en from '@/locales/en.json'

type Locale = 'zh' | 'en'
type Translations = typeof zh

const translations: Record<Locale, Translations> = { zh, en }

interface I18nContextType {
  locale: Locale
  t: Translations
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | null>(null)

// 获取浏览器语言
function getBrowserLocale(): Locale {
  if (typeof window === 'undefined') return 'zh'
  
  const lang = navigator.language.toLowerCase()
  return lang.startsWith('zh') ? 'zh' : 'en'
}

// 获取存储的语言
function getStoredLocale(): Locale | null {
  if (typeof window === 'undefined') return null
  
  const stored = localStorage.getItem('locale')
  if (stored === 'zh' || stored === 'en') return stored
  return null
}

// 存储语言
function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('locale', locale)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('zh')
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    const storedLocale = getStoredLocale()
    const browserLocale = getBrowserLocale()
    setLocaleState(storedLocale || browserLocale)
    setMounted(true)
  }, [])
  
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setStoredLocale(newLocale)
    document.documentElement.lang = newLocale
  }
  
  if (!mounted) {
    return (
      <I18nContext.Provider value={{ locale, t: translations.zh, setLocale }}>
        {children}
      </I18nContext.Provider>
    )
  }
  
  return (
    <I18nContext.Provider value={{ locale, t: translations[locale], setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider')
  }
  return context
}

// 简化的翻译函数，支持插值
export function useTranslation() {
  const { t, locale } = useI18n()
  
  const translate = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.')
    let value: any = t
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return key // 找不到返回key
      }
    }
    
    if (typeof value !== 'string') return key
    
    // 插值替换
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) => str.replace(new RegExp(`{{${k}}}`, 'g'), String(v)),
        value
      )
    }
    
    return value
  }
  
  return { t: translate, locale }
}

// 语言切换组件
export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n()
  
  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      className="bg-transparent border border-gray-300 rounded px-2 py-1 text-sm"
    >
      <option value="zh">简体中文</option>
      <option value="en">English</option>
    </select>
  )
}