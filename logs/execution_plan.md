# PetMate MVP 执行计划

## 项目概述
- 产品: 宠伴 PetMate - 宠护90天：新手养猫决策系统
- 技术栈: Next.js + TypeScript + Tailwind CSS
- 目标: 可运行的最小可行产品

## 执行阶段

### Phase 2.1: 后端 API (已完成基础类型和引擎)
- [x] 类型定义 (src/lib/types.ts)
- [x] 决策引擎 (src/lib/engine.ts)
- [ ] API Routes:
  - /api/card - 获取每日行动卡
  - /api/risk - 风险判断
  - /api/onboarding - 用户引导

### Phase 2.2: 前端页面
- [ ] Landing Page (首页)
- [ ] Onboarding (用户引导)
- [ ] Dashboard (今日行动卡)
- [ ] Risk Check (异常判断)

### Phase 2.3: 状态管理
- [ ] 本地存储用户数据
- [ ] Cookie 管理

### Phase 3: 测试验证
- [ ] npm run build
- [ ] npm run dev
- [ ] 功能验证

## 技术假设
1. 不使用数据库，数据存储在本地 localStorage
2. AI 解释功能暂时返回静态内容，后续可接入 GLM API
3. 付费功能仅做 UI 展示，不做实际支付
