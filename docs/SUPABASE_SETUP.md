# Supabase 设置指南

PetMate 使用 Supabase 作为数据持久化层。按照以下步骤配置 Supabase 项目。

## 第一步：创建 Supabase 项目

1. 访问 https://supabase.com 并登录（可使用 GitHub 账号）
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: petmate（或你喜欢的名称）
   - **Database Password**: 设置一个强密码并保存好
   - **Region**: 选择离用户最近的区域（推荐 Singapore 或 Tokyo）
4. 等待项目初始化完成（约 2 分钟）

## 第二步：获取 API 密钥

1. 进入项目后，点击左侧菜单 **Settings** (齿轮图标)
2. 点击 **API** 选项
3. 记录以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`（公开密钥）

## 第三步：配置环境变量

在项目根目录创建 `.env.local` 文件（如果不存在）：

```bash
# Supabase 配置
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here

# 已有配置（保持不变）
GLM_API_KEY=your-glm-api-key
BASE_URL=https://api.lkeap.cloud.tencent.com/coding/v3
TENCENT_CODING_TOKEN=your-token

NEXT_PUBLIC_APP_NAME=宠伴 PetMate
NEXT_PUBLIC_APP_VERSION=1.0.0-mvp
```

## 第四步：创建数据库表

1. 在 Supabase 控制台，点击左侧 **SQL Editor**
2. 点击 **New Query**
3. 复制 `docs/supabase_schema.sql` 的全部内容并粘贴
4. 点击 **Run** 执行 SQL

这将创建：
- `users` 表 - 用户数据
- `notes` 表 - 笔记数据
- `daily_records` 表 - 每日记录
- `payments` 表 - 支付记录
- 索引和 RLS 安全策略

## 第五步：禁用 RLS（可选，用于测试）

如果遇到权限问题，可以临时禁用 RLS：

```sql
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
```

生产环境建议保持 RLS 启用，并配置正确的认证策略。

## 第六步：验证配置

重启开发服务器后，检查控制台输出：

```bash
npm run dev
```

如果配置正确，API 会自动使用 Supabase 作为数据存储。如果配置缺失，会自动降级到内存存储。

## 数据迁移策略

当前实现支持双模式运行：
- **Supabase 优先**：如果配置了环境变量，使用 Supabase 持久化
- **内存降级**：如果没有配置或连接失败，自动使用内存存储

这意味着：
1. 开发阶段可以不配置 Supabase，使用内存存储快速开发
2. 生产环境配置 Supabase 后自动切换到持久化存储
3. 数据不会自动迁移，需要手动处理历史数据

## Vercel 部署配置

在 Vercel 项目设置中添加环境变量：

1. 进入项目 **Settings** → **Environment Variables**
2. 添加：
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. 重新部署项目

## 故障排除

### 连接失败
- 检查 URL 格式是否正确（包含 https://）
- 确认 anon key 没有多余的空格或换行
- 检查 Supabase 项目是否暂停（免费版闲置会暂停）

### 权限错误
- 确认已执行完整的 SQL schema
- 检查 RLS 策略是否正确配置
- 临时禁用 RLS 进行测试

### 数据不持久
- 确认环境变量在生产环境已设置
- 检查 Supabase 控制台的 Table Editor 确认数据
- 查看浏览器 Network 面板确认 API 调用

## 参考链接

- [Supabase 文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security 指南](https://supabase.com/docs/guides/auth/row-level-security)