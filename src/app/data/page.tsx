'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconArrowLeft, IconDownload, IconUpload, IconTrash, IconInfo, IconCheck, IconAlertCircle } from '@/components/icons'
import { FadeIn, SlideIn, CountUp } from '@/components/animations'
import {
  exportAllData,
  importAllData,
  downloadData,
  readDataFromFile,
  clearAllData,
  getStorageStats,
  ExportData
} from '@/lib/data-export'

export default function DataPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState(getStorageStats())
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported: { cats: number; notes: number; achievements: number }
  } | null>(null)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  // 导出数据
  const handleExport = () => {
    setLoading(true)
    try {
      const data = exportAllData()
      downloadData(data, 'petmate_backup')
      
      // 显示成功提示
      setImportResult({
        success: true,
        message: '数据已导出',
        imported: { cats: data.cats.length, notes: data.notes.length, achievements: data.achievements.length }
      })
      
      setTimeout(() => setImportResult(null), 3000)
    } catch (error) {
      setImportResult({
        success: false,
        message: '导出失败',
        imported: { cats: 0, notes: 0, achievements: 0 }
      })
    }
    setLoading(false)
  }

  // 导入数据
  const handleImport = async (file: File) => {
    setLoading(true)
    try {
      const data = await readDataFromFile(file)
      const result = importAllData(data)
      setImportResult(result)
      
      if (result.success) {
        // 刷新统计
        setStats(getStorageStats())
        setTimeout(() => {
          setImportResult(null)
          router.refresh()
        }, 3000)
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: error instanceof Error ? error.message : '导入失败',
        imported: { cats: 0, notes: 0, achievements: 0 }
      })
    }
    setLoading(false)
  }

  // 清除数据
  const handleClear = () => {
    clearAllData()
    setShowClearConfirm(false)
    setStats(getStorageStats())
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">数据管理</h1>
          <div className="w-8" />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* 提示信息 */}
        {importResult && (
          <SlideIn direction="down">
            <Card className={`${
              importResult.success 
                ? 'bg-green-50 border border-green-100' 
                : 'bg-red-50 border border-red-100'
            }`}>
              <div className="flex items-center gap-3">
                {importResult.success 
                  ? <IconCheck className="w-5 h-5 text-green-500" />
                  : <IconAlertCircle className="w-5 h-5 text-red-500" />
                }
                <div>
                  <p className={`font-medium ${
                    importResult.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {importResult.message}
                  </p>
                  {importResult.success && (
                    <p className="text-sm text-green-600">
                      导入 {importResult.imported.cats} 只猫咪、{importResult.imported.notes} 条笔记
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </SlideIn>
        )}

        {/* 存储统计 */}
        <FadeIn>
          <Card>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <IconInfo className="w-5 h-5 text-blue-500" />
              数据统计
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-orange-500">{stats.totalKeys}</p>
                <p className="text-sm text-gray-500">数据类型</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-purple-500">{stats.totalSize}</p>
                <p className="text-sm text-gray-500">总大小</p>
              </div>
            </div>

            {Object.keys(stats.breakdown).length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-500 mb-2">数据分布</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.breakdown).map(([key, size]) => (
                    <Badge key={key} variant="info" size="sm">
                      {key}: {(size / 1024).toFixed(1)} KB
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </FadeIn>

        {/* 导出功能 */}
        <FadeIn delay={50}>
          <Card>
            <h3 className="font-bold mb-2">导出数据</h3>
            <p className="text-sm text-gray-500 mb-4">
              将所有数据导出为JSON文件，可用于备份或迁移到其他设备
            </p>
            
            <Button onClick={handleExport} disabled={loading} fullWidth>
              <IconDownload className="w-4 h-4 mr-2" />
              {loading ? '导出中...' : '导出全部数据'}
            </Button>
          </Card>
        </FadeIn>

        {/* 导入功能 */}
        <FadeIn delay={100}>
          <Card>
            <h3 className="font-bold mb-2">导入数据</h3>
            <p className="text-sm text-gray-500 mb-4">
              从JSON文件恢复数据，会覆盖现有数据
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleImport(file)
              }}
            />
            
            <Button 
              variant="secondary" 
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              fullWidth
            >
              <IconUpload className="w-4 h-4 mr-2" />
              {loading ? '导入中...' : '选择文件导入'}
            </Button>
          </Card>
        </FadeIn>

        {/* 清除数据 */}
        <FadeIn delay={150}>
          <Card className="border border-red-100">
            <h3 className="font-bold mb-2 text-red-600">清除数据</h3>
            <p className="text-sm text-gray-500 mb-4">
              删除所有本地存储的数据，此操作不可恢复
            </p>
            
            <Button 
              variant="danger" 
              onClick={() => setShowClearConfirm(true)}
              fullWidth
            >
              <IconTrash className="w-4 h-4 mr-2" />
              清除所有数据
            </Button>
          </Card>
        </FadeIn>

        {/* 使用说明 */}
        <FadeIn delay={200}>
          <Card className="bg-blue-50 border border-blue-100">
            <h4 className="font-medium text-blue-700 mb-2">使用说明</h4>
            <ul className="text-sm text-blue-600 space-y-1">
              <li>· 导出的JSON文件包含猫咪档案、健康记录、笔记等全部数据</li>
              <li>· 导入会覆盖现有数据，建议先导出备份</li>
              <li>· 数据仅存储在本地浏览器，清除后无法恢复</li>
              <li>· 建议定期导出备份以防数据丢失</li>
            </ul>
          </Card>
        </FadeIn>
      </div>

      {/* 清除确认弹窗 */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <SlideIn direction="up">
            <Card className="w-full max-w-sm">
              <div className="text-center mb-4">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-100 flex items-center justify-center">
                  <IconTrash className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="font-bold text-lg">确认清除数据？</h3>
                <p className="text-gray-500 text-sm mt-2">
                  此操作将删除所有猫咪档案、健康记录、笔记等数据，且无法恢复
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShowClearConfirm(false)} fullWidth>
                  取消
                </Button>
                <Button variant="danger" onClick={handleClear} fullWidth>
                  确认清除
                </Button>
              </div>
            </Card>
          </SlideIn>
        </div>
      )}
    </div>
  )
}