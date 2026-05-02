'use client'

import Link from 'next/link'

interface NavItem {
  href: string
  label: string
  emoji: string
  desc: string
  color: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/profile', label: '个人设置', emoji: '👤', desc: '完善信息', color: 'bg-purple-100' },
  { href: '/achievements', label: '成就', emoji: '🏆', desc: '里程碑徽章', color: 'bg-yellow-100' },
  { href: '/notes', label: '笔记', emoji: '📝', desc: '观察记录', color: 'bg-blue-100' },
  { href: '/health', label: '健康档案', emoji: '❤️', desc: '体重/疫苗', color: 'bg-red-100' },
  { href: '/share', label: '分享', emoji: '📤', desc: '导出记录', color: 'bg-green-100' },
]

interface QuickNavProps {
  compact?: boolean
}

export default function QuickNav({ compact = false }: QuickNavProps) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto py-2 px-1 scrollbar-hide">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 px-3 py-2 rounded-full whitespace-nowrap ${item.color}`}
          >
            <span>{item.emoji}</span>
            <span className="text-sm">{item.label}</span>
          </Link>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="flex flex-col items-center gap-1 p-2"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
            <span className="text-lg">{item.emoji}</span>
          </div>
          <span className="text-xs text-gray-600">{item.label}</span>
        </Link>
      ))}
    </div>
  )
}