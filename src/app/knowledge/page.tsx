'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconCat, IconAlertCircle, IconCalendar, IconArrowRight } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { PROFESSIONAL_ARTICLES, Article, getArticlesByCategory, getEmergencyArticles } from '@/lib/articles'

export default function KnowledgePage() {
  const [selectedCategory, setSelectedCategory] = useState<Article['category'] | 'all'>('all')
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null)

  const categories = [
    { id: 'all', label: '全部', icon: '📚' },
    { id: 'kitten', label: '幼猫专区', icon: '🐱' },
    { id: 'adult', label: '成猫专区', icon: '🐈' },
    { id: 'senior', label: '老年猫专区', icon: '👴' },
    { id: 'emergency', label: '紧急处理', icon: '⚠️' },
    { id: 'disease', label: '疾病百科', icon: '🏥' },
    { id: 'care', label: '护理指南', icon: '💊' }
  ]

  const filteredArticles = selectedCategory === 'all'
    ? PROFESSIONAL_ARTICLES
    : getArticlesByCategory(selectedCategory)

  const emergencyArticles = getEmergencyArticles()

  return (
    <AppLayout title="知识库">
      <FadeIn>
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2">专业知识库</h1>
          <p className="text-gray-500">兽医审核的养猫知识，助你科学养猫</p>
        </div>

        {/* 紧急提醒 */}
        {emergencyArticles.length > 0 && (
          <SlideIn direction="up">
            <Card className="mb-6 bg-red-50 border border-red-200">
              <div className="flex items-center gap-3 mb-3">
                <IconAlertCircle className="w-6 h-6 text-red-500" />
                <h3 className="font-bold text-red-700">紧急情况识别</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {emergencyArticles.map(article => (
                  <button
                    key={article.id}
                    onClick={() => {
                      setExpandedArticle(article.id)
                      setSelectedCategory('emergency')
                    }}
                    className="p-3 bg-white rounded-lg text-left hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-red-600">{article.title}</p>
                    <p className="text-sm text-gray-500 mt-1">{article.summary}</p>
                  </button>
                ))}
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 分类标签 */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {categories.map(cat => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'primary' : 'outline'}
              onClick={() => setSelectedCategory(cat.id as Article['category'])}
            >
              {cat.icon} {cat.label}
            </Button>
          ))}
        </div>

        {/* 文章列表 */}
        <div className="space-y-4">
          {filteredArticles.map((article, i) => (
            <SlideIn key={article.id} delay={i * 30}>
              <Card className={expandedArticle === article.id ? 'ring-2 ring-orange-500' : ''}>
                <button
                  onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
                  className="w-full text-left"
                >
                  {/* 头部 */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge size="sm" variant={article.severity === 'critical' ? 'error' : 'default'}>
                          {article.severity === 'critical' ? '紧急' : '知识'}
                        </Badge>
                        <span className="text-sm text-gray-500">{article.category}</span>
                      </div>
                      <h3 className="font-bold">{article.title}</h3>
                    </div>
                    <IconArrowRight className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedArticle === article.id ? 'rotate-90' : ''
                    }`} />
                  </div>

                  {/* 摘要 */}
                  <p className="text-sm text-gray-600">{article.summary}</p>

                  {/* 标签 */}
                  <div className="flex gap-2 mt-3">
                    {article.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} size="sm" variant="info">{tag}</Badge>
                    ))}
                  </div>
                </button>

                {/* 展开内容 */}
                {expandedArticle === article.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="prose prose-sm max-w-none text-gray-700">
                      {article.content.split('\n').map((line, idx) => {
                        if (line.startsWith('##')) {
                          return <h3 key={idx} className="font-bold text-gray-900 mt-4 mb-2">{line.replace('## ', '')}</h3>
                        }
                        if (line.startsWith('###')) {
                          return <h4 key={idx} className="font-medium text-gray-800 mt-3 mb-1">{line.replace('### ', '')}</h4>
                        }
                        if (line.startsWith('- ') || line.startsWith('  - ')) {
                          return <li key={idx} className="ml-4">{line.replace(/^- |^\s+- /, '')}</li>
                        }
                        if (line.startsWith('|')) {
                          return null // 表格暂时跳过
                        }
                        if (line.match(/^\d\./)) {
                          return <li key={idx} className="ml-4 list-decimal">{line.replace(/^\d\.\s*/, '')}</li>
                        }
                        return <p key={idx} className="my-1">{line}</p>
                      })}
                    </div>

                    {/* 底部 */}
                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <span>更新时间：{article.updatedAt}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          // 跳转AI咨询
                          window.location.href = `/ai-chat?q=${encodeURIComponent(article.title)}`
                        }}
                      >
                        AI咨询此问题
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* 统计 */}
        <Card className="mt-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <IconCalendar className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">收录 {PROFESSIONAL_ARTICLES.length} 篇专业内容</p>
          <p className="text-sm opacity-80">持续更新中</p>
        </Card>
      </FadeIn>
    </AppLayout>
  )
}