'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Badge, Spinner } from '@/components/ui'
import { IconCat, IconPlus, IconEdit, IconTrash, IconCalendar, IconHeart, IconBell, IconDownload, IconArrowLeft } from '@/components/icons'
import { FadeIn, SlideIn, CountUp } from '@/components/animations'
import {
  CatProfile,
  WeightRecord,
  VaccineRecord,
  DewormRecord,
  VetVisit,
  getAllCats,
  createCatProfile,
  deleteCat,
  addWeightRecord,
  getWeightRecords,
  getWeightTrend,
  addVaccineRecord,
  getVaccineRecords,
  getNextVaccineDue,
  addDewormRecord,
  getDewormRecords,
  addVetVisit,
  getVetVisits,
  calculateAge,
  getWeightStatus,
  getPendingAlerts,
  markAlertCompleted,
  exportHealthData
} from '@/lib/health-records'
import { WeightChart, WeightStats } from '@/components/WeightChart'

export default function HealthPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cats, setCats] = useState<CatProfile[]>([])
  const [selectedCat, setSelectedCat] = useState<CatProfile | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'weight' | 'vaccine' | 'deworm' | 'visits'>('overview')
  const [showAddCat, setShowAddCat] = useState(false)
  const [showAddWeight, setShowAddWeight] = useState(false)
  const [showAddVaccine, setShowAddVaccine] = useState(false)
  const [showAddDeworm, setShowAddDeworm] = useState(false)
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [alerts, setAlerts] = useState(getPendingAlerts())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allCats = getAllCats()
    setCats(allCats)
    if (allCats.length > 0 && !selectedCat) {
      setSelectedCat(allCats[0])
    }
    setAlerts(getPendingAlerts())
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  // 空状态
  if (cats.length === 0) {
    return (
      <div className="min-h-screen p-4">
        <FadeIn>
          <div className="max-w-md mx-auto pt-20">
            <div className="text-center mb-8">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center">
                <IconCat className="w-12 h-12 text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold mb-2">还没有猫咪档案</h1>
              <p className="text-gray-500">添加你的第一只猫咪，开始记录健康信息</p>
            </div>
            
            <Button onClick={() => setShowAddCat(true)} size="lg" fullWidth>
              <IconPlus className="w-5 h-5 mr-2" />
              添加猫咪
            </Button>
          </div>
        </FadeIn>
        
        {showAddCat && (
          <AddCatModal
            onClose={() => setShowAddCat(false)}
            onAdd={(cat) => {
              setCats([cat])
              setSelectedCat(cat)
              setShowAddCat(false)
            }}
          />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => router.push('/dashboard')} className="p-2 -ml-2">
            <IconArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold">健康档案</h1>
          <button onClick={() => setShowAddCat(true)} className="p-2 -mr-2">
            <IconPlus className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 提醒横幅 */}
      {alerts.length > 0 && (
        <SlideIn direction="down">
          <div className="px-4 py-2 bg-orange-50 border-b border-orange-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconBell className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-700">{alerts.length}个待处理提醒</span>
              </div>
              <button 
                onClick={() => setActiveTab('overview')}
                className="text-sm text-orange-600 font-medium"
              >
                查看
              </button>
            </div>
          </div>
        </SlideIn>
      )}

      {/* 猫咪选择器 */}
      <div className="px-4 py-3 bg-white">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {cats.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCat?.id === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.avatar && <span className="mr-1">{cat.avatar}</span>}
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setShowAddCat(true)}
            className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-all"
          >
            + 添加
          </button>
        </div>
      </div>

      {/* Tab栏 */}
      <div className="px-4 bg-white border-b">
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">
          {[
            { key: 'overview', label: '概览' },
            { key: 'weight', label: '体重' },
            { key: 'vaccine', label: '疫苗' },
            { key: 'deworm', label: '驱虫' },
            { key: 'visits', label: '就诊' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        {selectedCat && (
          <FadeIn key={selectedCat.id}>
            {activeTab === 'overview' && <OverviewTab cat={selectedCat} alerts={alerts} />}
            {activeTab === 'weight' && (
              <WeightTab 
                cat={selectedCat} 
                onAdd={() => setShowAddWeight(true)}
              />
            )}
            {activeTab === 'vaccine' && (
              <VaccineTab 
                cat={selectedCat} 
                onAdd={() => setShowAddVaccine(true)}
              />
            )}
            {activeTab === 'deworm' && (
              <DewormTab 
                cat={selectedCat} 
                onAdd={() => setShowAddDeworm(true)}
              />
            )}
            {activeTab === 'visits' && (
              <VisitsTab 
                cat={selectedCat} 
                onAdd={() => setShowAddVisit(true)}
              />
            )}
          </FadeIn>
        )}
      </div>

      {/* 弹窗 */}
      {showAddCat && (
        <AddCatModal
          onClose={() => setShowAddCat(false)}
          onAdd={(cat) => {
            setCats([...cats, cat])
            setShowAddCat(false)
          }}
        />
      )}

      {showAddWeight && selectedCat && (
        <AddWeightModal
          catId={selectedCat.id}
          onClose={() => setShowAddWeight(false)}
          onAdd={() => {
            setShowAddWeight(false)
            loadData()
          }}
        />
      )}

      {showAddVaccine && selectedCat && (
        <AddVaccineModal
          catId={selectedCat.id}
          onClose={() => setShowAddVaccine(false)}
          onAdd={() => {
            setShowAddVaccine(false)
            loadData()
          }}
        />
      )}

      {showAddDeworm && selectedCat && (
        <AddDewormModal
          catId={selectedCat.id}
          onClose={() => setShowAddDeworm(false)}
          onAdd={() => {
            setShowAddDeworm(false)
            loadData()
          }}
        />
      )}

      {showAddVisit && selectedCat && (
        <AddVisitModal
          catId={selectedCat.id}
          onClose={() => setShowAddVisit(false)}
          onAdd={() => {
            setShowAddVisit(false)
            loadData()
          }}
        />
      )}
    </div>
  )
}

// 概览Tab
function OverviewTab({ cat, alerts }: { cat: CatProfile; alerts: any[] }) {
  const weights = getWeightRecords(cat.id)
  const latestWeight = weights[weights.length - 1]
  const vaccines = getVaccineRecords(cat.id)
  const deworms = getDewormRecords(cat.id)
  const visits = getVetVisits(cat.id)

  const handleExport = () => {
    const data = exportHealthData(cat.id)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${cat.name}_健康档案_${new Date().toLocaleDateString('zh-CN')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* 基本信息卡片 */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-100 to-purple-100 flex items-center justify-center text-3xl">
            {cat.avatar || '🐱'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold">{cat.name}</h2>
              {cat.gender && (
                <Badge variant={cat.gender === 'male' ? 'info' : 'warning'} size="sm">
                  {cat.gender === 'male' ? '♂ 公' : '♀ 母'}
                </Badge>
              )}
              {cat.neutered && <Badge variant="success" size="sm">已绝育</Badge>}
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              {cat.breed && <p>品种：{cat.breed}</p>}
              {cat.birthDate && <p>年龄：{calculateAge(cat.birthDate)}</p>}
              {cat.color && <p>花色：{cat.color}</p>}
            </div>
          </div>
          <button onClick={handleExport} className="p-2 text-gray-400 hover:text-gray-600">
            <IconDownload className="w-5 h-5" />
          </button>
        </div>
      </Card>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconHeart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-500">体重记录</span>
          </div>
          <p className="text-2xl font-bold">
            {latestWeight ? `${latestWeight.weight} ${latestWeight.unit}` : '--'}
          </p>
          <p className="text-xs text-gray-400">{weights.length}条记录</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCalendar className="w-5 h-5 text-blue-500" />
            <span className="text-sm text-gray-500">疫苗记录</span>
          </div>
          <p className="text-2xl font-bold">{vaccines.length}</p>
          <p className="text-xs text-gray-400">次接种</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconCat className="w-5 h-5 text-green-500" />
            <span className="text-sm text-gray-500">驱虫记录</span>
          </div>
          <p className="text-2xl font-bold">{deworms.length}</p>
          <p className="text-xs text-gray-400">次驱虫</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconBell className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-gray-500">就诊记录</span>
          </div>
          <p className="text-2xl font-bold">{visits.length}</p>
          <p className="text-xs text-gray-400">次就诊</p>
        </Card>
      </div>

      {/* 待处理提醒 */}
      {alerts.filter(a => a.catId === cat.id).length > 0 && (
        <Card>
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <IconBell className="w-5 h-5 text-orange-500" />
            待处理提醒
          </h3>
          <div className="space-y-2">
            {alerts.filter(a => a.catId === cat.id).map(alert => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg ${
                  alert.priority === 'high' ? 'bg-red-50 border border-red-100' :
                  alert.priority === 'medium' ? 'bg-orange-50 border border-orange-100' :
                  'bg-gray-50 border border-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm text-gray-500">{alert.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      到期：{new Date(alert.dueDate).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      markAlertCompleted(alert.id)
                      window.location.reload()
                    }}
                    className="text-sm text-orange-600"
                  >
                    完成
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

// 体重Tab
function WeightTab({ cat, onAdd }: { cat: CatProfile; onAdd: () => void }) {
  const records = getWeightRecords(cat.id)
  const trend = getWeightTrend(cat.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">体重趋势</h3>
        <Button size="sm" onClick={onAdd}>
          <IconPlus className="w-4 h-4 mr-1" />
          记录
        </Button>
      </div>

      {records.length > 0 ? (
        <>
          <Card>
            <WeightChart catId={cat.id} days={90} />
          </Card>

          <Card>
            <WeightStats records={records} />
          </Card>

          <Card>
            <h4 className="font-medium mb-3">历史记录</h4>
            <div className="space-y-2">
              {records.slice().reverse().map(r => (
                <div key={r.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{r.weight} {r.unit}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(r.date).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  {r.notes && <p className="text-sm text-gray-400">{r.notes}</p>}
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500 mb-4">暂无体重记录</p>
          <Button onClick={onAdd}>添加第一条记录</Button>
        </Card>
      )}
    </div>
  )
}

// 疫苗Tab
function VaccineTab({ cat, onAdd }: { cat: CatProfile; onAdd: () => void }) {
  const records = getVaccineRecords(cat.id)
  const next = getNextVaccineDue(cat.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">疫苗接种</h3>
        <Button size="sm" onClick={onAdd}>
          <IconPlus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </div>

      {next && (
        <Card className="bg-orange-50 border border-orange-100">
          <p className="text-sm text-orange-600">下次接种</p>
          <p className="font-bold">{next.vaccineName || next.vaccineType}</p>
          <p className="text-sm text-gray-500">
            {new Date(next.nextDueDate!).toLocaleDateString('zh-CN')}
          </p>
        </Card>
      )}

      {records.length > 0 ? (
        <Card>
          <h4 className="font-medium mb-3">接种历史</h4>
          <div className="space-y-3">
            {records.slice().reverse().map(r => (
              <div key={r.id} className="py-2 border-b last:border-0">
                <div className="flex justify-between">
                  <p className="font-medium">{r.vaccineName || r.vaccineType}</p>
                  <Badge variant="success" size="sm">已接种</Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(r.date).toLocaleDateString('zh-CN')}
                  {r.clinic && ` · ${r.clinic}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500">暂无疫苗记录</p>
        </Card>
      )}
    </div>
  )
}

// 驱虫Tab
function DewormTab({ cat, onAdd }: { cat: CatProfile; onAdd: () => void }) {
  const records = getDewormRecords(cat.id)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">驱虫记录</h3>
        <Button size="sm" onClick={onAdd}>
          <IconPlus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </div>

      {records.length > 0 ? (
        <Card>
          <div className="space-y-3">
            {records.slice().reverse().map(r => (
              <div key={r.id} className="py-2 border-b last:border-0">
                <div className="flex justify-between">
                  <p className="font-medium">{r.product}</p>
                  <Badge variant="info" size="sm">
                    {r.type === 'internal' ? '体内' : r.type === 'external' ? '体外' : '内外同驱'}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(r.date).toLocaleDateString('zh-CN')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500">暂无驱虫记录</p>
        </Card>
      )}
    </div>
  )
}

// 就诊Tab
function VisitsTab({ cat, onAdd }: { cat: CatProfile; onAdd: () => void }) {
  const records = getVetVisits(cat.id)

  const typeLabels: Record<string, string> = {
    checkup: '体检',
    illness: '疾病',
    emergency: '急诊',
    vaccination: '疫苗',
    surgery: '手术',
    other: '其他'
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold">就诊记录</h3>
        <Button size="sm" onClick={onAdd}>
          <IconPlus className="w-4 h-4 mr-1" />
          添加
        </Button>
      </div>

      {records.length > 0 ? (
        <div className="space-y-3">
          {records.slice().reverse().map(r => (
            <Card key={r.id}>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={r.type === 'emergency' ? 'error' : 'info'} size="sm">
                  {typeLabels[r.type] || r.type}
                </Badge>
                <span className="text-sm text-gray-500">
                  {new Date(r.date).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <p className="font-medium">{r.clinic}</p>
              {r.diagnosis && (
                <p className="text-sm text-gray-600 mt-1">诊断：{r.diagnosis}</p>
              )}
              {r.cost && (
                <p className="text-sm text-orange-600 mt-1">费用：¥{r.cost}</p>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="text-center py-8">
          <p className="text-gray-500">暂无就诊记录</p>
        </Card>
      )}
    </div>
  )
}

// 添加猫咪弹窗
function AddCatModal({ 
  onClose, 
  onAdd 
}: { 
  onClose: () => void
  onAdd: (cat: CatProfile) => void 
}) {
  const [form, setForm] = useState({
    name: '',
    breed: '',
    gender: '' as 'male' | 'female' | '',
    birthDate: '',
    color: '',
    avatar: '🐱'
  })

  const avatars = ['🐱', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾', '🐈', '🐈‍⬛']

  const handleSubmit = () => {
    if (!form.name.trim()) return
    
    const cat = createCatProfile({
      name: form.name,
      breed: form.breed || undefined,
      gender: form.gender || undefined,
      birthDate: form.birthDate || undefined,
      color: form.color || undefined,
      avatar: form.avatar
    })
    
    onAdd(cat)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">添加猫咪</h2>
          
          <div className="space-y-4">
            {/* 头像选择 */}
            <div>
              <label className="block text-sm font-medium mb-2">选择头像</label>
              <div className="flex flex-wrap gap-2">
                {avatars.map(a => (
                  <button
                    key={a}
                    onClick={() => setForm({ ...form, avatar: a })}
                    className={`w-10 h-10 text-2xl rounded-lg ${
                      form.avatar === a ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-gray-100'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">名字 *</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="你的猫咪叫什么？"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">品种</label>
                <select
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">选择品种</option>
                  <option value="英国短毛猫">英国短毛猫</option>
                  <option value="美国短毛猫">美国短毛猫</option>
                  <option value="布偶猫">布偶猫</option>
                  <option value="暹罗猫">暹罗猫</option>
                  <option value="波斯猫">波斯猫</option>
                  <option value="中华田园猫">中华田园猫</option>
                  <option value="其他">其他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">性别</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                >
                  <option value="">选择</option>
                  <option value="male">公</option>
                  <option value="female">母</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">出生日期</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">花色</label>
                <input
                  value={form.color}
                  onChange={(e) => setForm({ ...form, color: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  placeholder="如：橘白"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth disabled={!form.name.trim()}>添加</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}

// 添加体重弹窗
function AddWeightModal({ 
  catId, 
  onClose, 
  onAdd 
}: { 
  catId: string
  onClose: () => void
  onAdd: () => void 
}) {
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'kg' | 'lb'>('kg')
  const [notes, setNotes] = useState('')

  const handleSubmit = () => {
    const w = parseFloat(weight)
    if (isNaN(w) || w <= 0) return
    
    addWeightRecord(catId, w, unit, notes || undefined)
    onAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">记录体重</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="flex-1 px-4 py-3 text-lg rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="体重"
                autoFocus
              />
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as any)}
                className="px-4 py-3 rounded-lg border border-gray-300"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>

            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              placeholder="备注（可选）"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth disabled={!weight}>保存</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}

// 添加疫苗弹窗
function AddVaccineModal({ 
  catId, 
  onClose, 
  onAdd 
}: { 
  catId: string
  onClose: () => void
  onAdd: () => void 
}) {
  const [form, setForm] = useState({
    vaccineType: 'FVRCP' as VaccineRecord['vaccineType'],
    vaccineName: '',
    date: new Date().toISOString().split('T')[0],
    nextDueDate: '',
    clinic: ''
  })

  const handleSubmit = () => {
    addVaccineRecord(catId, {
      vaccineType: form.vaccineType,
      vaccineName: form.vaccineName || undefined,
      date: new Date(form.date).toISOString(),
      nextDueDate: form.nextDueDate ? new Date(form.nextDueDate).toISOString() : undefined,
      clinic: form.clinic || undefined
    })
    onAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">添加疫苗记录</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">疫苗类型</label>
              <select
                value={form.vaccineType}
                onChange={(e) => setForm({ ...form, vaccineType: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              >
                <option value="FVRCP">猫三联(FVRCP)</option>
                <option value="Rabies">狂犬疫苗</option>
                <option value="FeLV">猫白血病疫苗</option>
                <option value="Other">其他</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">接种日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">下次接种日期</label>
              <input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>

            <input
              value={form.clinic}
              onChange={(e) => setForm({ ...form, clinic: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              placeholder="接种医院（可选）"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth>保存</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}

// 添加驱虫弹窗
function AddDewormModal({ 
  catId, 
  onClose, 
  onAdd 
}: { 
  catId: string
  onClose: () => void
  onAdd: () => void 
}) {
  const [form, setForm] = useState({
    product: '',
    type: 'combined' as DewormRecord['type'],
    date: new Date().toISOString().split('T')[0],
    nextDueDate: ''
  })

  const handleSubmit = () => {
    if (!form.product.trim()) return
    
    addDewormRecord(catId, {
      product: form.product,
      type: form.type,
      date: new Date(form.date).toISOString(),
      nextDueDate: form.nextDueDate ? new Date(form.nextDueDate).toISOString() : undefined
    })
    onAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">添加驱虫记录</h2>
          
          <div className="space-y-4">
            <input
              value={form.product}
              onChange={(e) => setForm({ ...form, product: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              placeholder="驱虫药名称"
            />

            <div>
              <label className="block text-sm font-medium mb-1">类型</label>
              <div className="flex gap-2">
                {[
                  { value: 'internal', label: '体内' },
                  { value: 'external', label: '体外' },
                  { value: 'combined', label: '内外同驱' }
                ].map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm({ ...form, type: t.value as any })}
                    className={`flex-1 py-2 rounded-lg text-sm ${
                      form.type === t.value ? 'bg-orange-500 text-white' : 'bg-gray-100'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth disabled={!form.product.trim()}>保存</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}

// 添加就诊弹窗
function AddVisitModal({ 
  catId, 
  onClose, 
  onAdd 
}: { 
  catId: string
  onClose: () => void
  onAdd: () => void 
}) {
  const [form, setForm] = useState({
    type: 'checkup' as VetVisit['type'],
    clinic: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    cost: ''
  })

  const handleSubmit = () => {
    if (!form.clinic.trim()) return
    
    addVetVisit(catId, {
      type: form.type,
      clinic: form.clinic,
      date: new Date(form.date).toISOString(),
      diagnosis: form.diagnosis || undefined,
      cost: form.cost ? parseFloat(form.cost) : undefined
    })
    onAdd()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <SlideIn direction="up">
        <Card className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl">
          <h2 className="text-lg font-bold mb-4">添加就诊记录</h2>
          
          <div className="space-y-4">
            <input
              value={form.clinic}
              onChange={(e) => setForm({ ...form, clinic: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              placeholder="医院名称"
            />

            <div>
              <label className="block text-sm font-medium mb-1">就诊类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300"
              >
                <option value="checkup">体检</option>
                <option value="illness">疾病</option>
                <option value="emergency">急诊</option>
                <option value="vaccination">疫苗</option>
                <option value="surgery">手术</option>
                <option value="other">其他</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">日期</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">费用</label>
                <input
                  type="number"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300"
                  placeholder="元"
                />
              </div>
            </div>

            <input
              value={form.diagnosis}
              onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-gray-300"
              placeholder="诊断/症状（可选）"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <Button variant="ghost" onClick={onClose} fullWidth>取消</Button>
            <Button onClick={handleSubmit} fullWidth disabled={!form.clinic.trim()}>保存</Button>
          </div>
        </Card>
      </SlideIn>
    </div>
  )
}