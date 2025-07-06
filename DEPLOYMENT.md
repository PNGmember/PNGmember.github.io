# 🚀 GitHub Pages 部署指南

## 📋 部署准备

### ✅ 已完成的配置

1. **项目构建配置**
   - ✅ Vite 配置已优化
   - ✅ TypeScript 配置已修复
   - ✅ 构建脚本已更新
   - ✅ 紫夜队徽已集成

2. **GitHub Actions 工作流**
   - ✅ 自动构建和部署配置
   - ✅ 部署到 gh-pages 分支
   - ✅ Node.js 18 环境

3. **项目特性**
   - ✅ 紫夜公会官方队徽
   - ✅ 密码加密安全系统
   - ✅ 响应式设计
   - ✅ 深色/浅色主题
   - ✅ 完整的用户管理系统

## 🔧 部署步骤

### 1. 推送代码到 GitHub

```bash
# 如果还没有添加远程仓库
git remote add origin https://github.com/PNGinfo/pnginfo.github.io.git

# 添加所有文件
git add .

# 提交更改
git commit -m "部署紫夜公会成员信息管理平台到GitHub Pages"

# 推送到main分支
git push origin main
```

### 2. 配置 GitHub Pages

1. 访问 GitHub 仓库: https://github.com/PNGinfo/pnginfo.github.io
2. 进入 **Settings** > **Pages**
3. 在 **Source** 部分选择:
   - **Deploy from a branch**
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. 点击 **Save**

### 3. 等待部署完成

- GitHub Actions 会自动构建项目
- 构建完成后会部署到 gh-pages 分支
- 首次部署可能需要 5-10 分钟

## 🌐 访问地址

部署完成后，网站将在以下地址可用：

- **主站**: https://pnginfo.github.io/
- **Logo测试页**: https://pnginfo.github.io/test-logo.html

## 📁 项目结构

```
紫夜公会成员信息管理平台/
├── public/
│   ├── purple-night-logo.png    # 紫夜队徽
│   └── test-logo.html           # Logo测试页面
├── src/
│   ├── components/              # React组件
│   ├── contexts/               # 上下文管理
│   ├── services/               # 服务层
│   └── config/                 # 配置文件
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions部署配置
└── dist/                       # 构建输出目录
```

## 🎯 功能特性

### 🔐 用户系统
- 学员登录（使用QQ号）
- 管理员登录
- 密码加密存储
- 记住登录状态

### 📚 课程管理
- 课程进度查询
- 课程分配管理
- 进度统计分析
- 培训报告

### 🎨 界面特性
- 紫夜公会官方队徽
- 响应式设计
- 深色/浅色主题切换
- 现代化UI设计

### 🛡️ 安全特性
- SHA-256密码加密
- 加盐哈希防护
- 角色权限控制
- 安全的API调用

## 🔄 更新部署

当需要更新网站时：

```bash
# 修改代码后
git add .
git commit -m "更新描述"
git push origin main
```

GitHub Actions 会自动重新构建和部署。

## 🐛 故障排除

### 构建失败
- 检查 GitHub Actions 日志
- 确保所有依赖都在 package.json 中
- 检查 TypeScript 错误

### 页面无法访问
- 确认 GitHub Pages 设置正确
- 检查 gh-pages 分支是否存在
- 等待 DNS 传播（可能需要几分钟）

### 功能异常
- 检查浏览器控制台错误
- 确认 LeanCloud 配置正确
- 检查网络连接

## 📞 技术支持

如遇到部署问题，请检查：

1. **GitHub Actions 状态**: 仓库的 Actions 标签页
2. **构建日志**: 查看详细的错误信息
3. **浏览器控制台**: 检查前端错误
4. **网络连接**: 确保可以访问 LeanCloud 服务

## 🎉 部署完成

恭喜！紫夜公会成员信息管理平台已成功部署到 GitHub Pages！

访问 https://pnginfo.github.io/ 开始使用。
