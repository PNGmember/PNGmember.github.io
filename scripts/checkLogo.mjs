// 检查logo文件部署情况
import fs from 'fs'
import path from 'path'

function checkLogoDeployment() {
  console.log('🔍 检查紫夜队徽部署情况...\n')
  
  // 检查原始文件
  const originalPath = 'PNG.png'
  const deployedPath = 'public/purple-night-logo.png'
  
  console.log('=== 文件检查 ===')
  
  // 检查原始文件
  if (fs.existsSync(originalPath)) {
    const originalStats = fs.statSync(originalPath)
    console.log(`✅ 原始文件存在: ${originalPath}`)
    console.log(`   大小: ${(originalStats.size / 1024).toFixed(2)} KB`)
    console.log(`   修改时间: ${originalStats.mtime.toLocaleString()}`)
  } else {
    console.log(`❌ 原始文件不存在: ${originalPath}`)
  }
  
  // 检查部署文件
  if (fs.existsSync(deployedPath)) {
    const deployedStats = fs.statSync(deployedPath)
    console.log(`✅ 部署文件存在: ${deployedPath}`)
    console.log(`   大小: ${(deployedStats.size / 1024).toFixed(2)} KB`)
    console.log(`   修改时间: ${deployedStats.mtime.toLocaleString()}`)
  } else {
    console.log(`❌ 部署文件不存在: ${deployedPath}`)
  }
  
  console.log('\n=== 使用位置检查 ===')
  
  // 检查各个文件中的logo引用
  const filesToCheck = [
    { path: 'index.html', description: 'HTML favicon' },
    { path: 'src/components/Login.tsx', description: '登录页面' },
    { path: 'src/components/Layout.tsx', description: '用户端导航栏' },
    { path: 'src/components/admin/AdminLayout.tsx', description: '管理端导航栏' }
  ]
  
  filesToCheck.forEach(file => {
    if (fs.existsSync(file.path)) {
      const content = fs.readFileSync(file.path, 'utf8')
      const hasLogoReference = content.includes('purple-night-logo.png')
      console.log(`${hasLogoReference ? '✅' : '❌'} ${file.description}: ${file.path}`)
      
      if (hasLogoReference) {
        // 提取logo相关的行
        const lines = content.split('\n')
        const logoLines = lines.filter(line => line.includes('purple-night-logo.png'))
        logoLines.forEach(line => {
          console.log(`     ${line.trim()}`)
        })
      }
    } else {
      console.log(`❌ 文件不存在: ${file.path}`)
    }
  })
  
  console.log('\n=== 部署建议 ===')
  console.log('1. 确保 public/purple-night-logo.png 文件存在')
  console.log('2. 启动开发服务器: npm run dev')
  console.log('3. 访问测试页面: http://localhost:5173/test-logo.html')
  console.log('4. 检查主应用中的logo显示效果')
  console.log('5. 构建生产版本: npm run build')
  
  console.log('\n=== 访问链接 ===')
  console.log('🏠 主应用: http://localhost:5173/')
  console.log('🧪 Logo测试页: http://localhost:5173/test-logo.html')
  console.log('🔐 登录页面: http://localhost:5173/login')
  console.log('⚙️  管理后台: http://localhost:5173/admin')
  
  console.log('\n🎉 紫夜队徽部署检查完成！')
}

checkLogoDeployment()
