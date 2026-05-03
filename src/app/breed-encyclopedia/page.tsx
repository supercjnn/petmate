'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppLayout } from '@/components/layout'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconCat, IconHeart, IconArrowRight } from '@/components/icons'
import { FadeIn, SlideIn } from '@/components/animations'
import { CAT_BREEDS, CatBreed, filterBreeds, getPopularBreeds } from '@/lib/cat-breeds'

export default function BreedSelectPage() {
  const [selectedBreed, setSelectedBreed] = useState<CatBreed | null>(null)
  const [filters, setFilters] = useState({
    size: '',
    coatLength: '',
    activityLevel: '',
    groomingNeeds: ''
  })

  const filteredBreeds = filters.size || filters.coatLength || filters.activityLevel || filters.groomingNeeds
    ? filterBreeds({
        size: filters.size as CatBreed['size'] || undefined,
        coatLength: filters.coatLength as CatBreed['coatLength'] || undefined,
        activityLevel: filters.activityLevel as CatBreed['activityLevel'] || undefined,
        groomingNeeds: filters.groomingNeeds as CatBreed['groomingNeeds'] || undefined
      })
    : getPopularBreeds(15)

  const activityLabels = { low: '安静', medium: '适中', high: '活泼' }
  const groomingLabels = { low: '易打理', medium: '需护理', high: '高维护' }
  const sizeLabels = { small: '小型', medium: '中型', large: '大型' }
  const coatLabels = { short: '短毛', medium: '中毛', long: '长毛' }

  return (
    <AppLayout title="品种百科">
      <FadeIn>
        {/* 头部 */}
        <div className="mb-6">
          <h1 className="text-xl font-bold mb-2">猫咪品种百科</h1>
          <p className="text-gray-500">了解不同品种的特点，选择适合你的猫咪</p>
        </div>

        {/* 筛选器 */}
        <Card className="mb-6">
          <p className="text-sm font-medium mb-3">快速筛选</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['size', 'coatLength', 'activityLevel', 'groomingNeeds'].map(filterKey => (
              <select
                key={filterKey}
                value={filters[filterKey as keyof typeof filters]}
                onChange={(e) => setFilters(prev => ({ ...prev, [filterKey]: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">
                  {filterKey === 'size' ? '体型' : filterKey === 'coatLength' ? '毛发' : filterKey === 'activityLevel' ? '活跃度' : '护理'}
                </option>
                {filterKey === 'size' && Object.entries(sizeLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
                {filterKey === 'coatLength' && Object.entries(coatLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
                {filterKey === 'activityLevel' && Object.entries(activityLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
                {filterKey === 'groomingNeeds' && Object.entries(groomingLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            ))}
          </div>
        </Card>

        {/* 品种列表 */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredBreeds.map((breed, i) => (
            <SlideIn key={breed.id} delay={i * 30}>
              <Card
                hover
                onClick={() => setSelectedBreed(breed)}
                className={selectedBreed?.id === breed.id ? 'ring-2 ring-orange-500' : ''}
              >
                <div className="flex items-start gap-4">
                  {/* 图标 */}
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-2xl">
                    🐱
                  </div>

                  {/* 信息 */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold">{breed.name}</h3>
                      <Badge size="sm">{sizeLabels[breed.size]}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mb-2">{breed.nameEn}</p>
                    
                    {/* 标签 */}
                    <div className="flex gap-2">
                      <Badge size="sm" variant="info">{activityLabels[breed.activityLevel]}</Badge>
                      <Badge size="sm" variant="default">{coatLabels[breed.coatLength]}</Badge>
                    </div>

                    {/* 热门度 */}
                    {breed.popularity >= 9 && (
                      <div className="flex items-center gap-1 mt-2 text-orange-500">
                        <IconHeart className="w-4 h-4" />
                        <span className="text-xs">热门品种</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </SlideIn>
          ))}
        </div>

        {/* 品种详情弹窗 */}
        {selectedBreed && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <SlideIn direction="up">
              <Card className="max-w-lg w-full max-h-[80vh] overflow-auto">
                {/* 关闭按钮 */}
                <button
                  onClick={() => setSelectedBreed(null)}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>

                {/* 头部 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-3xl">
                    🐱
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{selectedBreed.name}</h2>
                    <p className="text-gray-500">{selectedBreed.nameEn} · {selectedBreed.origin}</p>
                  </div>
                </div>

                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">体重范围</p>
                    <p className="font-medium">公: {selectedBreed.weightRange.male}</p>
                    <p className="font-medium">母: {selectedBreed.weightRange.female}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">寿命</p>
                    <p className="font-medium">{selectedBreed.lifespan}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">活跃度</p>
                    <p className="font-medium">{activityLabels[selectedBreed.activityLevel]}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">护理需求</p>
                    <p className="font-medium">{groomingLabels[selectedBreed.groomingNeeds]}</p>
                  </div>
                </div>

                {/* 性格 */}
                <div className="mb-4">
                  <h4 className="font-bold mb-2">性格特点</h4>
                  <div className="flex gap-2 mb-2">
                    {selectedBreed.personality.map(p => (
                      <Badge key={p} variant="info">{p}</Badge>
                    ))}
                  </div>
                  <p className="text-gray-600">{selectedBreed.temperament}</p>
                </div>

                {/* 健康关注 */}
                {selectedBreed.healthIssues.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 rounded-lg border border-red-100">
                    <h4 className="font-bold text-red-700 mb-2">⚠ 健康关注</h4>
                    <ul className="space-y-1">
                      {selectedBreed.healthIssues.map(issue => (
                        <li key={issue} className="text-sm text-red-600 flex items-center gap-2">
                          <span>•</span> {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 特殊护理 */}
                {selectedBreed.specialCare.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <h4 className="font-bold text-orange-700 mb-2">💡 特殊护理</h4>
                    <ul className="space-y-1">
                      {selectedBreed.specialCare.map(care => (
                        <li key={care} className="text-sm text-orange-600 flex items-center gap-2">
                          <span>•</span> {care}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 适合人群 */}
                <div className="mb-4">
                  <h4 className="font-bold mb-2">适合人群</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedBreed.suitableFor.map(s => (
                      <Badge key={s} variant="success">{s}</Badge>
                    ))}
                  </div>
                </div>

                {/* 不适合 */}
                {selectedBreed.notSuitableFor.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-bold mb-2">可能不适合</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedBreed.notSuitableFor.map(s => (
                        <Badge key={s} variant="warning">{s}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3 mt-4">
                  <Link href={`/ai-chat?q=${encodeURIComponent(selectedBreed.name + '养护指南')}`}>
                    <Button fullWidth>
                      AI咨询此品种
                      <IconArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </SlideIn>
          </div>
        )}

        {/* 统计 */}
        <Card className="mt-6 text-center bg-gradient-to-r from-orange-500 to-purple-500 text-white">
          <IconCat className="w-8 h-8 mx-auto mb-2" />
          <p className="font-bold">收录 {CAT_BREEDS.length} 种品种</p>
          <p className="text-sm opacity-80">持续更新中</p>
        </Card>
      </FadeIn>
    </AppLayout>
  )
}