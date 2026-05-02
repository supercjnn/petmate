# Zeabur 部署指南

## 方式一：通过 Zeabur Dashboard（推荐）

### 1. 登录 Zeabur
访问 https://zeabur.cn 并登录（支持 GitHub、微信等）

### 2. 创建新项目
- 点击「新建项目」
- 选择「从 Git 仓库导入」
- 授权 GitHub 并选择仓库（需要先将项目推送到 GitHub）

### 3. 配置部署
- 框架：自动检测为 Next.js
- 环境：Node.js 18+

### 4. 设置环境变量
在 Zeabur Dashboard 中添加：

```
TENCENT_CODING_TOKEN=你的token
BASE_URL=https://api.lkeap.cloud.tencent.com/coding/v3
```

### 5. 部署
点击「部署」，等待构建完成

---

## 方式二：通过 CLI 部署

### 1. 安装 Zeabur CLI
```bash
npm install -g @zeabur/cli
```

### 2. 登录
```bash
zeabur auth login
```

### 3. 部署
```bash
cd /Users/johnny/Dev/IDE/Fin/PetMate/petmate
zeabur deploy
```

---

## 方式三：推送到 GitHub（最简单）

### 1. 初始化 Git（如果还没有）
```bash
cd /Users/johnny/Dev/IDE/Fin/PetMate/petmate
git init
git add .
git commit -m "feat: PetMate v1.8.0"
```

### 2. 创建 GitHub 仓库
在 GitHub 创建新仓库 `petmate`

### 3. 推送
```bash
git remote add origin https://github.com/你的用户名/petmate.git
git push -u origin main
```

### 4. 在 Zeabur 导入
登录 Zeabur → 导入 GitHub 仓库 → 自动部署

---

## 项目配置

项目已包含以下配置：
- `next.config.ts` - Next.js 配置
- `package.json` - 依赖和脚本
- `zeabur.yaml` - Zeabur 配置

## 部署后

部署成功后，Zeabur 会提供：
- 默认域名：`xxx.zeabur.app`
- 可绑定自定义域名

---

## 注意事项

1. 确保 `.env` 文件已添加到 `.gitignore`
2. 环境变量需要在 Zeabur Dashboard 中手动配置
3. 构建命令：`npm run build`
4. 启动命令：`npm start`（Next.js 会自动处理）