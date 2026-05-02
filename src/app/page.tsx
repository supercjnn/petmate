import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-8 text-center">
        <div className="text-4xl mb-4">🐱</div>
        <h1 className="text-xl font-bold mb-2">新手养猫前90天</h1>
        <h2 className="text-lg mb-4">每天到底该做什么？</h2>
        <p className="text-sm mb-4">宠伴 · 宠护90天</p>
        <p className="text-sm mb-6">
          每天一张行动卡，告诉你：今天该做什么、不要做什么、哪些信号要警惕。
        </p>
        
        {/* Value Props */}
        <div className="flex justify-center gap-3 mb-6">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">少焦虑</span>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">少踩坑</span>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">少花冤枉钱</span>
        </div>
        
        {/* CTA */}
        <Link href="/onboarding" className="btn-primary">
          立即生成我的行动卡
        </Link>
      </section>

      {/* Pain Points */}
      <section className="py-6">
        <h3 className="text-lg font-semibold mb-4 text-center">为什么新手养猫容易焦虑？</h3>
        <div className="space-y-3">
          {[
            ['看大量攻略，不知道该听谁的', '给你明确的每天行动顺序'],
            ['猫咪躲起来，不知道是否正常', '告诉你当前状态是否需要担心'],
            ['不知道什么时候该就医', '风险分级，明确升级条件'],
            ['买了一堆用品，发现一半用不上', '分阶段采购清单'],
          ].map(([p, s], i) => (
            <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-red-600 mb-1">❌ {p}</p>
              <p className="text-sm text-green-600">✅ {s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Example Card */}
      <section className="py-6">
        <h3 className="text-lg font-semibold mb-4 text-center">每日行动卡示例</h3>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="flex items-center gap-2 mb-3">
            <span className="stage-badge bg-petmate-primary/10 text-petmate-primary">适应期</span>
            <span className="text-sm text-gray-500">Day 1</span>
          </div>
          <h4 className="font-semibold mb-2">先别急着亲近它</h4>
          <p className="text-sm text-gray-600 mb-4">让猫咪确认环境安全</p>
          
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">今天该做：</p>
            {['固定食物水源位置', '给猫一个躲藏空间', '远距离观察'].map((a, i) => (
              <p key={i} className="text-sm flex items-center gap-2">
                <span className="text-green-500">✓</span> {a}
              </p>
            ))}
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-red-600 mb-2">今天不要做：</p>
            {['不要强行抱出来', '不要洗澡', '不要频繁叫它'].map((a, i) => (
              <p key={i} className="text-sm flex items-center gap-2">
                <span className="text-red-500">✗</span> {a}
              </p>
            ))}
          </div>
          
          <div className="bg-yellow-50 rounded p-3 text-sm">
            ⚠️ 如果超过48小时不进食，建议联系兽医
          </div>
        </div>
      </section>

      {/* 90 Days */}
      <section className="py-6">
        <h3 className="text-lg font-semibold mb-4 text-center">90天陪伴计划</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            ['接猫准备期', 'Day 0'],
            ['适应期', 'Day 1-3'],
            ['信任建立期', 'Day 4-14'],
            ['行为塑造期', 'Day 15-30'],
            ['稳定护理期', 'Day 31-60'],
            ['长期优化期', 'Day 61-90'],
          ].map(([name, days], i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-xs text-gray-500">{days}</p>
              <p className="font-medium text-sm">{name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-6">
        <h3 className="text-lg font-semibold mb-4 text-center">解锁完整90天</h3>
        <div className="bg-white rounded-xl p-5 shadow-md">
          <div className="flex justify-between mb-4">
            <div>
              <p className="font-semibold">免费版</p>
              <p className="text-xs text-gray-500">体验前3天</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">完整版</p>
              <p className="text-sm text-petmate-primary">¥29</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 完整90天行动卡
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span> 个性化风险判断
            </p>
            <p className="flex items-center gap-2">
              <span className="text-green-500">✓</span> AI问答支持
            </p>
          </div>
        </div>
      </section>

        {/* Final CTA */}
      <section className="py-8 text-center">
        <Link href="/login" className="btn-primary">
          开始生成我的行动卡
        </Link>
        <p className="text-xs text-gray-500 mt-4">
          本产品仅用于养宠日常决策辅助，不能替代兽医诊断
        </p>
      </section>
    </div>
  )
}