# 紫夜公会成员信息查询平台

一个专为紫夜公会成员设计的学习进度查询和管理平台。

## 功能特性

- 🔐 **用户认证** - 安全的登录/注册系统
- 📚 **课程进度查询** - 实时查看个人学习进度
- 📊 **学习统计** - 详细的学习数据分析
- 📱 **响应式设计** - 支持各种设备访问
- 🎯 **个性化体验** - 每个用户只能查看自己的信息
- 🎨 **品牌标识** - 使用紫夜公会官方队徽

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **数据库**: LeanCloud
- **部署**: GitHub Pages
- **图标**: Lucide React

## 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置LeanCloud

1. 在 LeanCloud 控制台创建应用
2. 修改 `src/config/leancloud.ts` 文件中的配置：

```typescript
const LEANCLOUD_CONFIG = {
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
}
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 部署到GitHub Pages

```bash
npm run deploy
```

## 数据模型

### 用户 (User)
- 用户名、邮箱、昵称
- 加入日期、激活状态

### 课程进度 (CourseProgress)
- 课程ID、用户ID
- 完成课时、总课时
- 学习进度百分比
- 最后学习日期、状态

### 培训报告 (TrainingReport)
- 报告类型、时间周期
- 整体进度、完成课程数
- 学习时长、成就、建议

## 项目结构

```
src/
├── components/          # React组件
│   ├── Login.tsx       # 登录页面
│   ├── Dashboard.tsx   # 仪表板
│   ├── CourseProgress.tsx # 课程进度
│   ├── TrainingReport.tsx # 培训报告
│   └── Layout.tsx      # 布局组件
├── contexts/           # React上下文
│   └── AuthContext.tsx # 认证上下文
├── services/           # 服务层
│   └── leancloudService.ts # LeanCloud服务
├── config/             # 配置文件
│   └── leancloud.ts    # LeanCloud配置
└── index.css          # 全局样式
```

## 部署说明

1. 推送代码到GitHub仓库
2. 在仓库设置中启用GitHub Pages
3. 选择GitHub Actions作为部署源
4. 代码推送到main分支时会自动部署

## 开发计划

- [x] 用户认证系统
- [x] 课程进度查询
- [x] 响应式界面设计
- [ ] 新训考核报告（开发中）
- [ ] 数据导出功能
- [ ] 移动端优化

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请联系紫夜公会管理员。
