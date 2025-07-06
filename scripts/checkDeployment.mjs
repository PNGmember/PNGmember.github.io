// 检查GitHub Pages部署配置
import fs from 'fs'
import { execSync } from 'child_process'

function checkDeploymentConfig() {
  console.log('🚀 检查GitHub Pages部署配置...\n')
  
  let allChecksPass = true
  
  console.log('=== 📁 文件检查 ===')
  
  // 检查关键文件
  const requiredFiles = [
    { path: 'package.json', description: 'Package配置文件' },
    { path: 'vite.config.ts', description: 'Vite配置文件' },
    { path: '.github/workflows/deploy.yml', description: 'GitHub Actions工作流' },
    { path: 'public/purple-night-logo.png', description: '紫夜队徽' },
    { path: 'DEPLOYMENT.md', description: '部署指南' }
  ]
  
  requiredFiles.forEach(file => {
    if (fs.existsSync(file.path)) {
      console.log(`✅ ${file.description}: ${file.path}`)
    } else {
      console.log(`❌ ${file.description}: ${file.path} (缺失)`)
      allChecksPass = false
    }
  })
  
  console.log('\n=== ⚙️ 配置检查 ===')
  
  // 检查package.json配置
  if (fs.existsSync('package.json')) {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    
    // 检查部署脚本
    if (packageJson.scripts && packageJson.scripts.deploy) {
      console.log(`✅ 部署脚本: ${packageJson.scripts.deploy}`)
    } else {
      console.log('❌ 缺少部署脚本')
      allChecksPass = false
    }
    
    // 检查gh-pages依赖
    if (packageJson.devDependencies && packageJson.devDependencies['gh-pages']) {
      console.log(`✅ gh-pages依赖: ${packageJson.devDependencies['gh-pages']}`)
    } else {
      console.log('❌ 缺少gh-pages依赖')
      allChecksPass = false
    }
  }
  
  // 检查Vite配置
  if (fs.existsSync('vite.config.ts')) {
    const viteConfig = fs.readFileSync('vite.config.ts', 'utf8')
    if (viteConfig.includes("base: '/PNGinfo/'")) {
      console.log('✅ Vite base路径配置正确')
    } else {
      console.log('❌ Vite base路径配置错误')
      allChecksPass = false
    }
  }
  
  console.log('\n=== 🔗 Git配置检查 ===')
  
  try {
    // 检查Git仓库
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    console.log(`✅ Git远程仓库: ${remoteUrl}`)
    
    if (remoteUrl.includes('PurpleNightGame/PNGinfo')) {
      console.log('✅ 仓库地址正确')
    } else {
      console.log('⚠️  仓库地址可能不正确')
    }
    
    // 检查当前分支
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    console.log(`✅ 当前分支: ${currentBranch}`)
    
    // 检查是否有未提交的更改
    try {
      execSync('git diff --exit-code', { stdio: 'pipe' })
      execSync('git diff --cached --exit-code', { stdio: 'pipe' })
      console.log('✅ 没有未提交的更改')
    } catch {
      console.log('⚠️  有未提交的更改')
    }
    
  } catch (error) {
    console.log('❌ Git配置检查失败:', error.message)
    allChecksPass = false
  }
  
  console.log('\n=== 🌐 部署信息 ===')
  console.log('📍 GitHub仓库: https://github.com/PurpleNightGame/PNGinfo')
  console.log('⚙️  仓库设置: https://github.com/PurpleNightGame/PNGinfo/settings/pages')
  console.log('🔄 Actions状态: https://github.com/PurpleNightGame/PNGinfo/actions')
  console.log('🌍 部署地址: https://purplenightgame.github.io/PNGinfo/')
  
  console.log('\n=== 📋 部署步骤 ===')
  console.log('1. 提交所有更改: git add . && git commit -m "部署更新"')
  console.log('2. 推送到GitHub: git push origin main')
  console.log('3. 在GitHub仓库设置中启用Pages (选择GitHub Actions)')
  console.log('4. 等待自动部署完成')
  console.log('5. 访问部署地址验证')
  
  console.log('\n=== 🧪 测试链接 ===')
  console.log('🏠 主页: https://purplenightgame.github.io/PNGinfo/')
  console.log('🔐 登录: https://purplenightgame.github.io/PNGinfo/login')
  console.log('⚙️  管理: https://purplenightgame.github.io/PNGinfo/admin')
  
  if (allChecksPass) {
    console.log('\n🎉 所有检查通过！准备部署到GitHub Pages')
  } else {
    console.log('\n⚠️  发现问题，请修复后再部署')
  }
  
  return allChecksPass
}

// 运行检查
const success = checkDeploymentConfig()
process.exit(success ? 0 : 1)
