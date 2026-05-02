# 部署指南

## Vercel部署（推荐）

### 1. 安装Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录Vercel
```bash
vercel login
```

### 3. 部署
```bash
cd /Users/johnny/Dev/IDE/Fin/PetMate/petmate
vercel
```

### 4. 设置环境变量
在Vercel Dashboard中设置：
- `TENCENT_CODING_TOKEN` - 腾讯Coding API Token
- `BASE_URL` - https://api.lkeap.cloud.tencent.com/coding/v3
- `SUPABASE_URL` - Supabase项目URL（如使用）
- `SUPABASE_ANON_KEY` - Supabase匿名密钥（如使用）
- `WECHAT_PAY_MCH_ID` - 微信支付商户号（如使用）
- `WECHAT_PAY_API_KEY` - 微信支付API密钥（如使用）

### 5. 生产部署
```bash
vercel --prod
```

## 其他部署方式

### Docker部署
```bash
docker build -t petmate .
docker run -p 3000:3000 petmate
```

### 静态导出
```bash
npm run build
# 输出到 .next/standalone
```

## 环境变量清单

| 变量名 | 必需 | 说明 |
|--------|------|------|
| TENCENT_CODING_TOKEN | ✅ | 腾讯LLM API |
| BASE_URL | ✅ | API地址 |
| SUPABASE_URL | 可选 | 数据库URL |
| SUPABASE_ANON_KEY | 可选 | 数据库密钥 |
| WECHAT_PAY_MCH_ID | 可选 | 微信支付商户号 |
| WECHAT_PAY_API_KEY | 可选 | 微信支付密钥 |