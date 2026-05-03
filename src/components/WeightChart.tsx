'use client'

import { useState, useEffect, useRef } from 'react'
import { WeightRecord, getWeightRecords } from '@/lib/health-records'

interface WeightChartProps {
  catId: string
  days?: number
}

export function WeightChart({ catId, days = 30 }: WeightChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [records, setRecords] = useState<WeightRecord[]>([])

  useEffect(() => {
    const allRecords = getWeightRecords(catId)
      .filter(r => new Date(r.date) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    setRecords(allRecords)
  }, [catId, days])

  useEffect(() => {
    if (!canvasRef.current || records.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // 高清屏支持
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 40, left: 50 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom

    // 清除画布
    ctx.clearRect(0, 0, width, height)

    // 数据范围
    const weights = records.map(r => r.weight)
    const minWeight = Math.floor(Math.min(...weights) - 0.5)
    const maxWeight = Math.ceil(Math.max(...weights) + 0.5)

    // 绘制网格和Y轴
    ctx.strokeStyle = '#e5e7eb'
    ctx.fillStyle = '#6b7280'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'right'

    const ySteps = 5
    for (let i = 0; i <= ySteps; i++) {
      const y = padding.top + (chartHeight / ySteps) * i
      const weight = maxWeight - ((maxWeight - minWeight) / ySteps) * i
      
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      ctx.fillText(weight.toFixed(1), padding.left - 8, y + 4)
    }

    // 绘制折线
    if (records.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#f97316'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      records.forEach((record, i) => {
        const x = padding.left + (chartWidth / (records.length - 1)) * i
        const y = padding.top + chartHeight - ((record.weight - minWeight) / (maxWeight - minWeight)) * chartHeight

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()

      // 绘制数据点
      ctx.fillStyle = '#f97316'
      records.forEach((record, i) => {
        const x = padding.left + (chartWidth / (records.length - 1)) * i
        const y = padding.top + chartHeight - ((record.weight - minWeight) / (maxWeight - minWeight)) * chartHeight

        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    // X轴标签
    ctx.fillStyle = '#6b7280'
    ctx.textAlign = 'center'
    const xLabels = Math.min(records.length, 5)
    for (let i = 0; i < xLabels; i++) {
      const idx = Math.floor((records.length - 1) / (xLabels - 1) * i)
      const x = padding.left + (chartWidth / (records.length - 1)) * idx
      const date = new Date(records[idx].date)
      const label = `${date.getMonth() + 1}/${date.getDate()}`
      ctx.fillText(label, x, height - padding.bottom + 20)
    }

    // 理想范围区域
    const idealMin = 3.5
    const idealMax = 5.5
    if (idealMin >= minWeight && idealMax <= maxWeight) {
      const y1 = padding.top + chartHeight - ((idealMax - minWeight) / (maxWeight - minWeight)) * chartHeight
      const y2 = padding.top + chartHeight - ((idealMin - minWeight) / (maxWeight - minWeight)) * chartHeight
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.1)'
      ctx.fillRect(padding.left, y1, chartWidth, y2 - y1)
    }

  }, [records])

  if (records.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-xl">
        <p className="text-gray-500">暂无体重数据</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="w-full h-48"
        style={{ display: 'block' }}
      />
      {records.length > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-200" />
          <span className="text-xs text-gray-500">理想范围</span>
        </div>
      )}
    </div>
  )
}

// 体重统计卡片
interface WeightStatsProps {
  records: WeightRecord[]
}

export function WeightStats({ records }: WeightStatsProps) {
  if (records.length === 0) return null

  const latest = records[records.length - 1]
  const first = records[0]
  const change = latest.weight - first.weight
  const avg = records.reduce((sum, r) => sum + r.weight, 0) / records.length
  const max = Math.max(...records.map(r => r.weight))
  const min = Math.min(...records.map(r => r.weight))

  return (
    <div className="grid grid-cols-4 gap-2">
      <div className="text-center p-2 bg-orange-50 rounded-lg">
        <p className="text-xs text-gray-500">当前</p>
        <p className="text-lg font-bold text-orange-600">{latest.weight}</p>
        <p className="text-xs text-gray-400">{latest.unit}</p>
      </div>
      <div className="text-center p-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-gray-500">变化</p>
        <p className={`text-lg font-bold ${change >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
          {change >= 0 ? '+' : ''}{change.toFixed(2)}
        </p>
        <p className="text-xs text-gray-400">{latest.unit}</p>
      </div>
      <div className="text-center p-2 bg-purple-50 rounded-lg">
        <p className="text-xs text-gray-500">平均</p>
        <p className="text-lg font-bold text-purple-600">{avg.toFixed(2)}</p>
        <p className="text-xs text-gray-400">{latest.unit}</p>
      </div>
      <div className="text-center p-2 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-500">范围</p>
        <p className="text-lg font-bold text-gray-600">{min.toFixed(1)}-{max.toFixed(1)}</p>
        <p className="text-xs text-gray-400">{latest.unit}</p>
      </div>
    </div>
  )
}