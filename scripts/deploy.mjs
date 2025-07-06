// GitHub Pages 部署脚本
import { execSync } from 'child_process'
import fs from 'fs'

console.log('🚀 开始部署紫夜公会成员信息管理平台到GitHub Pages...\n')

// 检查必要文件
const requiredFiles = [
  'package.json',
  'vite.config.ts',
  '.github/workflows/deploy.yml',
  'public/purple-night-logo.png'
]

console.log('=== 检查必要文件 ===')
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - 文件缺失！`)
  }
})

console.log('\n=== 构建项目 ===')
try {
  console.log('📦 安装依赖...')
  execSync('npm ci', { stdio: 'inherit' })
  
  console.log('🔨 构建项目...')
  execSync('npm run build', { stdio: 'inherit' })
  
  console.log('✅ 构建完成！')
} catch (error) {
  console.error('❌ 构建失败:', error.message)
  process.exit(1)
}

console.log('\n=== 部署说明 ===')
console.log('1. 确保你已经将代码推送到GitHub仓库')
console.log('2. 仓库地址: https://github.com/PNGinfo/pnginfo.github.io.git')
console.log('3. GitHub Actions会自动构建并部署到gh-pages分支')
console.log('4. 在GitHub仓库设置中启用GitHub Pages:')
console.log('   - 进入 Settings > Pages')
console.log('   - Source: Deploy from a branch')
console.log('   - Branch: gh-pages / (root)')
console.log('   - 点击Save')

console.log('\n=== Git命令示例 ===')
console.log('# 添加远程仓库（如果还没有）')
console.log('git remote add origin https://github.com/PNGinfo/pnginfo.github.io.git')
console.log('')
console.log('# 推送代码到main分支')
console.log('git add .')
console.log('git commit -m "部署紫夜公会成员信息管理平台"')
console.log('git push origin main')

console.log('\n=== 访问地址 ===')
console.log('🌐 部署完成后访问: https://pnginfo.github.io/')
console.log('⏱️  首次部署可能需要几分钟时间')

console.log('\n=== 项目特性 ===')
console.log('✨ 紫夜公会官方队徽')
console.log('🔐 安全的密码加密系统')
console.log('📚 课程进度管理')
console.log('👥 用户管理系统')
console.log('🌙 深色/浅色主题切换')
console.log('📱 响应式设计')

console.log('\n🎉 部署准备完成！请按照上述说明推送代码到GitHub。')
