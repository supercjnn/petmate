'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { generateAnalyticsReport, getEvents, TrackEvent } from '@/lib/tracking'
import { getActiveTests, getTestResults, ABTestConfig } from '@/lib/ab-test'

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [events, setEvents] = useState<TrackEvent[]>([])
  const [tests, setTests] = useState<ABTestConfig[]>([])

  useEffect(() => {
    // 加载分析数据
    const report = generateAnalyticsReport()
    setAnalytics(report)
    
    // 加载事件列表
    const recentEvents = getEvents(50)
    setEvents(recentEvents)
    
    // 加载A/B测试
    const activeTests = getActiveTests()
    setTests(activeTests)
  }, [])

  const exportData = () => {
    const data = {
      analytics,
      events,
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petmate-analytics-${new Date().toLocaleDateString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-gray-900 text-white sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="font-semibold text-lg">运营后台</h1>
          <button
            onClick={exportData}
            className="text-sm bg-gray-700 px-3 py-1 rounded"
          >
            导出数据
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-1">数据分析与运营管理</p>
      </header>

      {/* 数据概览 */}
      <section className="px-4 py-4">
        <h2 className="font-semibold mb-3">📊 数据概览</h2>
        
        {analytics ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-petmate-primary">{analytics.totalEvents}</div>
              <div className="text-sm text-gray-500">总事件数</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-500">{analytics.dailyActive.length}</div>
              <div className="text-sm text-gray-500">活跃天数</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-lg font-bold">{analytics.eventsByCategory.user || 0}</div>
              <div className="text-sm text-gray-500">用户行为</div>
            </div>
            
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <div className="text-lg font-bold">{analytics.eventsByCategory.conversion || 0}</div>
              <div className="text-sm text-gray-500">转化事件</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        )}
      </section>

      {/* 转化漏斗 */}
      {analytics?.conversionFunnel && (
        <section className="px-4 py-4">
          <h2 className="font-semibold mb-3">🎯 转化漏斗</h2>
          
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="space-y-3">
              {Object.entries(analytics.conversionFunnel).map(([name, count]) => (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{name}</span>
                  <span className="flex-1 h-8 bg-gray-200 rounded relative overflow-hidden">
                    <span 
                      className="absolute left-0 top-0 bottom-0 bg-petmate-primary"
                      style={{ width: `${Math.min(Number(count) / 10 * 100, 100)}%` }}
                    />
                  </span>
                  <span className="text-sm font-bold">{String(count)}</span>
                </div>
              ))}
              
              {Object.keys(analytics.conversionFunnel).length === 0 && (
                <div className="text-center text-gray-400 py-4">暂无转化数据</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* A/B测试 */}
      <section className="px-4 py-4">
        <h2 className="font-semibold mb-3">🧪 A/B测试</h2>
        
        <div className="space-y-3">
          {tests.map(test => (
            <div key={test.id} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{test.name}</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  {test.status}
                </span>
              </div>
              
              <div className="text-sm text-gray-500 mb-3">
                变体：{test.variants.map(v => v.name).join(' vs ')}
              </div>
              
              <div className="text-xs text-gray-400">
                指标：{test.metrics.join(', ')}
              </div>
            </div>
          ))}
          
          {tests.length === 0 && (
            <div className="bg-white rounded-xl p-4 shadow-sm text-center text-gray-400">
              暂无运行中的测试
            </div>
          )}
        </div>
      </section>

      {/* 事件列表 */}
      <section className="px-4 py-4">
        <h2 className="font-semibold mb-3">📝 最近事件（50条）</h2>
        
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left">时间</th>
                <th className="px-3 py-2 text-left">事件</th>
                <th className="px-3 py-2 text-left">类别</th>
              </tr>
            </thead>
            <tbody>
              {events.slice().reverse().slice(0, 20).map((event, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2 text-gray-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 font-medium">{event.name}</td>
                  <td className="px-3 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      event.category === 'conversion' ? 'bg-green-100 text-green-700' :
                      event.category === 'engagement' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {event.category}
                    </span>
                  </td>
                </tr>
              ))}
              
              {events.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-8 text-center text-gray-400">
                    暂无事件记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 功能预留提示 */}
      <div className="px-4 py-4">
        <div className="bg-yellow-50 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">⚠️</div>
          <p className="text-sm text-gray-600">此页面为运营后台预览版</p>
          <p className="text-xs text-gray-400 mt-1">完整功能需接入数据库和权限系统</p>
        </div>
      </div>

      {/* 底部导航 */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white px-4 py-3">
        <Link href="/dashboard" className="text-sm text-gray-400">
          ← 返回首页
        </Link>
      </div>
    </div>
  )
}