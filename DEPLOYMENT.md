# 🚀 GitHub Pages 部署指南

## 📋 部署步骤

### 1. 推送代码到GitHub仓库

```bash
# 添加远程仓库（如果还没有添加）
git remote add origin https://github.com/PurpleNightGame/PNGinfo.git

# 添加所有文件
git add .

# 提交更改
git commit -m "feat: 部署紫夜公会成员信息管理平台"

# 推送到main分支
git push -u origin main
```

### 2. 启用GitHub Pages

1. 访问仓库设置页面：https://github.com/PurpleNightGame/PNGinfo/settings/pages
2. 在 "Source" 部分选择 "GitHub Actions"
3. 保存设置

### 3. 自动部署

- 每次推送到 `main` 分支时，GitHub Actions 会自动构建和部署
- 部署完成后，网站将在以下地址可用：
  - **主地址**: https://purplenightgame.github.io/PNGinfo/
  - **登录页面**: https://purplenightgame.github.io/PNGinfo/login
  - **管理后台**: https://purplenightgame.github.io/PNGinfo/admin

## 🔧 配置说明

### Vite 配置
- `base: '/PNGinfo/'` - 设置正确的基础路径
- `outDir: 'dist'` - 构建输出目录

### GitHub Actions 工作流
- 文件位置: `.github/workflows/deploy.yml`
- 触发条件: 推送到 `main` 分支
- 构建工具: Node.js 18 + npm
- 部署工具: peaceiris/actions-gh-pages@v3

## 📱 功能特性

### 🔐 用户认证
- 学员登录：使用用户名和QQ号密码
- 管理员登录：使用管理员账户
- 密码加密存储（SHA-256）
- 记住登录状态

### 📚 学员功能
- 查看个人课程进度
- 查看学习统计
- 修改个人密码
- 响应式界面设计

### ⚙️ 管理功能
- 用户管理（添加、编辑、删除学员）
- 课程管理（查看课程信息）
- 进度管理（分配课程、调整进度）
- 数据统计和分析

### 🎨 界面特色
- 现代化UI设计
- 深色/浅色主题切换
- 紫夜公会品牌标识
- 移动端适配

## 🗄️ 数据库配置

### LeanCloud 设置
- AppID: `zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz`
- AppKey: `wyqlYopPy4q7z9rUo9SaWeY8`
- Server: `https://zgizsvge.lc-cn-n1-shared.com`

### 数据表结构
- `_User`: 管理员账户
- `Student`: 学员信息
- `Course`: 课程信息
- `CourseProgress`: 学习进度
- `Member`: 成员基础信息

## 🔍 测试账户

### 管理员账户
- 用户名: `admin`
- 密码: 联系管理员获取

### 学员账户
- 用户名: 学员昵称
- 密码: 学员QQ号

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview

# 部署到GitHub Pages
npm run deploy
```

## 📞 技术支持

如有问题或建议，请联系紫夜公会技术团队。

---

**紫夜公会成员信息管理平台** - 专为紫夜公会成员设计的学习进度查询和管理系统
