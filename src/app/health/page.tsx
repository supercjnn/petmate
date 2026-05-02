'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  getHealthRecords, 
  addHealthRecord, 
  getWeightTrend,
  getPendingVaccines,
  updateVaccineStatus,
  formatDate,
  HealthRecord,
  CatHealth
} from '@/lib/health'

type RecordType = 'weight' | 'vaccine' | 'checkup' | 'illness'

const TYPE_LABELS: Record<RecordType, { label: string; emoji: string; color: string }> = {
  weight: { label: '体重', emoji: '⚖️', color: 'bg-blue-100 text-blue-700' },
  vaccine: { label: '疫苗', emoji: '💉', color: 'bg-green-100 text-green-700' },
  checkup: { label: '体检', emoji: '🏥', color: 'bg-purple-100 text-purple-700' },
  illness: { label: '就医', emoji: '🩺', color: 'bg-red-100 text-red-700' }
}

export default function HealthPage() {
  const [health, setHealth] = useState<CatHealth | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [newRecord, setNewRecord] = useState({
    type: 'weight' as RecordType,
    date: new Date().toISOString().split('T')[0],
    value: '',
    description: '',
    vetName: '',
    notes: ''
  })

  useEffect(() => {
    const userId = localStorage.getItem('petmate_user_id') || 'default'
    setHealth(getHealthRecords(userId))
  }, [])

  const handleAddRecord = () => {
    const userId = localStorage.getItem('petmate_user_id') || 'default'
    
    addHealthRecord(userId, {
      type: newRecord.type,
      date: newRecord.date,
      value: newRecord.type === 'weight' ? parseFloat(newRecord.value) : undefined,
      description: newRecord.description,
      vetName: newRecord.vetName || undefined,
      notes: newRecord.notes || undefined
    })
    
    setHealth(getHealthRecords(userId))
    setShowAdd(false)
    setNewRecord({
      type: 'weight',
      date: new Date().toISOString().split('T')[0],
      value: '',
      description: '',
      vetName: '',
      notes: ''
    })
  }

  const handleVaccineDone = (vaccineId: string) => {
    const userId = localStorage.getItem('petmate_user_id') || 'default'
    updateVaccineStatus(userId, vaccineId, 'done', new Date().toISOString())
    setHealth(getHealthRecords(userId))
  }

  if (!health) return null

  const weightTrend = getWeightTrend(health.catId)
  const pendingVaccines = getPendingVaccines(health.catId)

  return (
    <div className="min-h-screen pb-20">
      {/* 头部 */}
      <header className="bg-white sticky top-0 z-10 px-4 py-3 flex items-center gap-3 border-b">
        <Link href="/dashboard" className="text-gray-500">←</Link>
        <h1 className="font-semibold">健康档案</h1>
      </header>

      {/* 体重概览 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-3">体重记录</h2>
        
        {weightTrend.latest ? (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{weightTrend.latest}<span className="text-sm font-normal ml-1">kg</span></div>
              <div className="text-sm text-gray-500 mt-1">
                {weightTrend.trend === 'up' && `↑ 增重 ${weightTrend.change}kg`}
                {weightTrend.trend === 'down' && `↓ 减重 ${weightTrend.change}kg`}
                {weightTrend.trend === 'stable' && '体重稳定'}
              </div>
            </div>
            
            {/* 简单趋势图 */}
            {health.weightHistory.length > 0 && (
              <div className="text-right">
                <div className="text-xs text-gray-400">最近{health.weightHistory.length}次记录</div>
                <div className="mt-2 flex items-end gap-1 h-12">
                  {health.weightHistory.slice(-5).map((w, i) => {
                    const height = Math.max(20, (w.weight / (weightTrend.latest || 1)) * 40)
                    return (
                      <div 
                        key={i}
                        className="w-4 bg-petmate-primary rounded-t"
                        style={{ height: `${height}px` }}
                        title={`${formatDate(w.date)}: ${w.weight}kg`}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-400">暂无体重记录</p>
        )}
      </section>

      {/* 待办疫苗 */}
      {pendingVaccines.length > 0 && (
        <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
          <h2 className="font-medium mb-3">待接种</h2>
          
          <div className="space-y-2">
            {pendingVaccines.map(vaccine => (
              <div key={vaccine.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="text-sm font-medium">{vaccine.name}</div>
                  {vaccine.dueDate && (
                    <div className="text-xs text-gray-500">预计：{formatDate(vaccine.dueDate)}</div>
                  )}
                </div>
                <button
                  onClick={() => handleVaccineDone(vaccine.id)}
                  className="text-xs bg-petmate-primary text-white px-3 py-1 rounded-full"
                >
                  已接种
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 健康记录 */}
      <section className="bg-white rounded-xl p-5 shadow-sm mx-4 mt-4">
        <h2 className="font-medium mb-3">健康记录</h2>
        
        {health.records.length > 0 ? (
          <div className="space-y-3">
            {health.records.slice(0, 10).map(record => (
              <div key={record.id} className="border-b pb-3 last:border-0 last:pb-0">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-1 rounded text-xs ${TYPE_LABELS[record.type].color}`}>
                    {TYPE_LABELS[record.type].emoji} {TYPE_LABELS[record.type].label}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{record.description}</span>
                      <span className="text-xs text-gray-400">{formatDate(record.date)}</span>
                    </div>
                    {record.type === 'weight' && record.value && (
                      <div className="text-sm text-petmate-primary mt-1">{record.value} kg</div>
                    )}
                    {record.vetName && (
                      <div className="text-xs text-gray-500 mt-1">{record.vetName}</div>
                    )}
                    {record.notes && (
                      <div className="text-xs text-gray-500 mt-1">{record.notes}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400">暂无记录</p>
        )}
      </section>

      {/* 添加记录按钮 */}
      <button
        onClick={() => setShowAdd(true)}
        className="fixed right-6 bottom-20 w-14 h-14 bg-petmate-primary text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
      >
        +
      </button>

      {/* 添加记录弹窗 */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-6 animate-slide-up">
            <h3 className="font-semibold mb-4">添加记录</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-500 mb-2 block">类型</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['weight', 'vaccine', 'checkup', 'illness'] as RecordType[]).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewRecord({ ...newRecord, type })}
                      className={`p-2 rounded-lg text-center text-sm ${
                        newRecord.type === type
                          ? `${TYPE_LABELS[type].color} border-2`
                          : 'bg-gray-100'
                      }`}
                    >
                      {TYPE_LABELS[type].emoji}
                      <div className="text-xs mt-1">{TYPE_LABELS[type].label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">日期</label>
                <input
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              {newRecord.type === 'weight' && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">体重 (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecord.value}
                    onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })}
                    placeholder="例如：3.5"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">描述</label>
                <input
                  type="text"
                  value={newRecord.description}
                  onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
                  placeholder={newRecord.type === 'weight' ? '例如：体重记录' : '例如：猫三联第一针'}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
              
              {newRecord.type !== 'weight' && (
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">医院/医生（可选）</label>
                  <input
                    type="text"
                    value={newRecord.vetName}
                    onChange={(e) => setNewRecord({ ...newRecord, vetName: e.target.value })}
                    placeholder="例如：XX宠物医院"
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">备注（可选）</label>
                <textarea
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                  placeholder="其他需要记录的内容"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  rows={2}
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 border rounded-lg text-sm"
              >
                取消
              </button>
              <button
                onClick={handleAddRecord}
                className="flex-1 py-2 bg-petmate-primary text-white rounded-lg text-sm"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}