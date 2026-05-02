'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Question {
  id: string
  content: string
  author: string
  dayNumber: number
  createdAt: string
  answers: number
  helpful: number
}

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'questions' | 'my'>('questions')

  // 模拟数据
  const mockQuestions: Question[] = [
    {
      id: 'q1',
      content: '猫咪到家第二天不吃东西怎么办？',
      author: '新手铲屎官',
      dayNumber: 2,
      createdAt: '2小时前',
      answers: 5,
      helpful: 12
    },
    {
      id: 'q2',
      content: '布偶猫多大可以洗澡？',
      author: '布偶控',
      dayNumber: 15,
      createdAt: '5小时前',
      answers: 3,
      helpful: 8
    }
  ]

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-gradient-to-r from-petmate-primary to-petmate-secondary text-white sticky top-0 z-10 px-4 py-6">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard" className="text-white/80">←</Link>
          <h1 className="font-semibold text-lg">社区问答</h1>
        </div>
        <p className="text-sm text-white/80">
          新手互助，有问必答
        </p>
      </header>

      {/* Tab切换 */}
      <div className="bg-white border-b sticky top-[100px] z-10">
        <div className="flex">
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'questions' 
                ? 'text-petmate-primary border-b-2 border-petmate-primary' 
                : 'text-gray-500'
            }`}
          >
            🗨️ 问答广场
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={`flex-1 py-3 text-center text-sm font-medium ${
              activeTab === 'my' 
                ? 'text-petmate-primary border-b-2 border-petmate-primary' 
                : 'text-gray-500'
            }`}
          >
            📝 我的提问
          </button>
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {/* 开发中提示 */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 text-center">
          <div className="text-4xl mb-3">🚧</div>
          <h3 className="font-semibold mb-2">功能开发中</h3>
          <p className="text-sm text-gray-500">
            社区问答功能正在紧张开发中，敬请期待！
          </p>
          <p className="text-xs text-gray-400 mt-2">
            目前可以先使用AI助手解答你的问题
          </p>
          <Link 
            href="/ai-assist"
            className="inline-block mt-4 px-6 py-2 bg-petmate-primary text-white rounded-full text-sm"
          >
            去问AI助手
          </Link>
        </div>

        {/* 预览卡片 */}
        {activeTab === 'questions' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400">预览效果：</p>
            {mockQuestions.map(q => (
              <div key={q.id} className="bg-white rounded-xl p-4 shadow-sm opacity-60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-petmate-light flex items-center justify-center text-sm">
                    👤
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{q.author}</span>
                      <span className="text-xs text-gray-400">Day {q.dayNumber}</span>
                    </div>
                    <p className="text-sm">{q.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>{q.createdAt}</span>
                      <span>💬 {q.answers}回答</span>
                      <span>👍 {q.helpful}有用</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'my' && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500">还没有提问</p>
            <p className="text-sm text-gray-400 mt-2">功能上线后可在此查看你的提问</p>
          </div>
        )}
      </div>

      {/* 发布按钮（预留） */}
      <button
        disabled
        className="fixed right-6 bottom-20 w-14 h-14 bg-gray-300 text-white rounded-full shadow-lg flex items-center justify-center text-2xl cursor-not-allowed"
        title="功能开发中"
      >
        +
      </button>

      {/* 底部说明 */}
      <div className="text-center text-xs text-gray-400 mt-8 px-4">
        <p>社区问答功能即将上线</p>
        <p className="mt-1">让新手养猫不再孤单</p>
      </div>
    </div>
  )
}