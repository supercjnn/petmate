/**
 * Landing Page v2.0
 * 优化转化率的设计
 */

import Link from 'next/link'
import { Button, Card, Badge } from '@/components/ui'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-secondary-50">
      {/* 导航栏 */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🐱</span>
            <span className="font-bold text-lg">宠伴</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              登录
            </Link>
            <Link href="/onboarding">
              <Button size="sm">立即开始</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center">
            {/* 标题 */}
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm mb-6">
              <span>✨</span>
              <span>已帮助 10,000+ 新手铲屎官</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              新手养猫前90天
              <br />
              <span className="text-primary-600">每天到底该做什么？</span>
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              每天一张行动卡，告诉你今天该做什么、不要做什么、哪些信号要警惕。
              <br />
              <span className="text-primary-600 font-medium">少焦虑、少踩坑、少花冤枉钱</span>
            </p>

            {/* CTA按钮 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding">
                <Button size="lg" className="shadow-lg hover:shadow-xl">
                  立即生成我的行动卡
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="ghost" size="lg">
                  了解更多
                </Button>
              </Link>
            </div>

            {/* 信任标识 */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                免费体验前3天
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                无需绑定支付
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                数据本地存储
              </span>
            </div>
          </div>
        </div>

        {/* 装饰元素 */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200/30 rounded-full blur-3xl" />
      </section>

      {/* 痛点区域 */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            为什么新手养猫容易焦虑？
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                pain: '看大量攻略，不知道该听谁的',
                solution: '给你明确的每天行动顺序',
                icon: '😵'
              },
              {
                pain: '猫咪躲起来，不知道是否正常',
                solution: '告诉你当前状态是否需要担心',
                icon: '🙈'
              },
              {
                pain: '不知道什么时候该就医',
                solution: '风险分级，明确升级条件',
                icon: '🏥'
              },
              {
                pain: '买了一堆用品，发现一半用不上',
                solution: '分阶段采购清单，按需购买',
                icon: '🛒'
              }
            ].map((item, i) => (
              <Card key={i} hover className="group">
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <div className="flex-1">
                    <p className="text-gray-600 mb-2 flex items-center gap-2">
                      <span className="text-red-400">✗</span>
                      {item.pain}
                    </p>
                    <p className="text-primary-600 font-medium flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {item.solution}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 示例卡片 */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            每日行动卡示例
          </h2>
          <p className="text-center text-gray-500 mb-12">
            一张卡片，三个部分：该做、不做、警惕
          </p>

          <div className="max-w-lg mx-auto">
            <Card className="border-2 border-primary-100">
              {/* 卡片头部 */}
              <div className="flex items-center justify-between mb-4">
                <Badge variant="default">适应期</Badge>
                <span className="text-sm text-gray-500">Day 1</span>
              </div>

              {/* 标题 */}
              <h3 className="text-xl font-bold mb-2">先别急着亲近它</h3>
              <p className="text-gray-600 mb-6">让猫咪确认环境安全，建立初步信任</p>

              {/* 该做 */}
              <div className="mb-4">
                <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  <span>✓</span> 今天该做
                </p>
                <div className="space-y-2">
                  {['固定食物水源位置', '给猫一个躲藏空间', '远距离观察行为'].map((action, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
                      <div className="w-5 h-5 border-2 border-green-300 rounded" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 不做 */}
              <div className="mb-4">
                <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                  <span>✗</span> 今天不要做
                </p>
                <div className="space-y-2">
                  {['不要强行抱出来', '不要洗澡', '不要频繁叫它'].map((action, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg">
                      <span className="text-red-400">✗</span>
                      <span className="text-sm text-gray-700">{action}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 警惕 */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm font-medium text-yellow-800 mb-1">⚠️ 需要警惕</p>
                <p className="text-sm text-yellow-700">
                  如果超过48小时不进食，建议联系兽医
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 90天计划 */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">
            90天陪伴计划
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                stage: '适应期',
                days: 'Day 0-3',
                focus: '建立安全感',
                color: 'primary',
                tasks: ['准备用品', '环境布置', '初步接触']
              },
              {
                stage: '信任建立期',
                days: 'Day 4-14',
                focus: '建立亲密关系',
                color: 'secondary',
                tasks: ['互动游戏', '抚摸训练', '名字训练']
              },
              {
                stage: '行为塑造期',
                days: 'Day 15-30',
                focus: '养成好习惯',
                color: 'info',
                tasks: ['猫砂盆训练', '抓板使用', '作息调整']
              },
              {
                stage: '稳定护理期',
                days: 'Day 31-60',
                focus: '日常护理',
                color: 'success',
                tasks: ['疫苗计划', '驱虫计划', '毛发护理']
              },
              {
                stage: '长期优化期',
                days: 'Day 61-90',
                focus: '优化生活',
                color: 'warning',
                tasks: ['饮食优化', '环境丰富', '行为调优']
              },
              {
                stage: '毕业',
                days: 'Day 90+',
                focus: '成为资深铲屎官',
                color: 'default',
                tasks: ['持续关怀', '定期体检', '享受陪伴']
              }
            ].map((phase, i) => (
              <Card key={i} hover>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={phase.color as any}>{phase.stage}</Badge>
                  <span className="text-xs text-gray-400">{phase.days}</span>
                </div>
                <h3 className="font-semibold mb-2">{phase.focus}</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-gray-400 rounded-full" />
                      {task}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 定价 */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            解锁完整90天
          </h2>
          <p className="text-center text-gray-500 mb-12">
            前3天免费体验，满意再付费
          </p>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary-200 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs px-3 py-1 rounded-bl-lg">
                推荐
              </div>

              <div className="p-6">
                <div className="flex items-end justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">完整版</h3>
                    <p className="text-gray-500 text-sm">解锁全部90天内容</p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold text-primary-600">¥29</span>
                    <span className="text-gray-400 text-sm">/永久</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {[
                    '完整90天行动卡',
                    '个性化风险判断',
                    'AI问答支持',
                    '品种适配建议',
                    '健康档案记录',
                    '成就系统',
                    '终身免费更新'
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/onboarding">
                  <Button fullWidth size="lg">
                    立即开始体验
                  </Button>
                </Link>

                <p className="text-xs text-center text-gray-400 mt-4">
                  先体验前3天，满意再付费解锁
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 最终CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            开始你的90天养猫之旅
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            每天10分钟，90天后成为自信的铲屎官
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="bg-white text-primary-600 hover:bg-primary-50 shadow-xl">
              免费生成我的行动卡
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm">
          <p className="mb-4">
            本产品仅用于养宠日常决策辅助，不能替代兽医诊断
          </p>
          <p>
            © 2026 宠伴 PetMate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
