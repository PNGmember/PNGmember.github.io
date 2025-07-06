// 检查GitHub Pages部署状态
import https from 'https'

function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        url,
        status: response.statusCode,
        success: response.statusCode === 200
      })
    })
    
    request.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        success: false
      })
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      resolve({
        url,
        status: 'TIMEOUT',
        success: false
      })
    })
  })
}

async function checkDeploymentStatus() {
  console.log('🌐 检查GitHub Pages部署状态...\n')
  
  const baseUrl = 'https://purplenightgame.github.io/PNGinfo'
  
  const urlsToCheck = [
    { url: `${baseUrl}/`, description: '主页' },
    { url: `${baseUrl}/purple-night-logo.png`, description: '紫夜队徽' },
    { url: `${baseUrl}/test-logo.html`, description: 'Logo测试页面' }
  ]
  
  console.log('=== 🔗 检查部署链接 ===')
  
  for (const { url, description } of urlsToCheck) {
    try {
      const result = await checkUrl(url)
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${description}: ${url}`)
      if (!result.success) {
        console.log(`   状态: ${result.status}`)
      }
    } catch (error) {
      console.log(`❌ ${description}: ${url}`)
      console.log(`   错误: ${error.message}`)
    }
  }
  
  console.log('\n=== 📋 部署信息 ===')
  console.log('📍 GitHub仓库: https://github.com/PurpleNightGame/PNGinfo')
  console.log('⚙️  仓库设置: https://github.com/PurpleNightGame/PNGinfo/settings/pages')
  console.log('🔄 Actions状态: https://github.com/PurpleNightGame/PNGinfo/actions')
  console.log('🌍 部署地址: https://purplenightgame.github.io/PNGinfo/')
  
  console.log('\n=== 🎯 主要功能页面 ===')
  console.log('🏠 主页: https://purplenightgame.github.io/PNGinfo/')
  console.log('🔐 登录页面: https://purplenightgame.github.io/PNGinfo/login')
  console.log('⚙️  管理后台: https://purplenightgame.github.io/PNGinfo/admin')
  
  console.log('\n=== 🧪 测试页面 ===')
  console.log('🎨 Logo测试: https://purplenightgame.github.io/PNGinfo/test-logo.html')
  
  console.log('\n=== 📱 移动端测试 ===')
  console.log('📱 在手机浏览器中访问上述链接测试响应式设计')
  
  console.log('\n=== 🔐 登录测试账户 ===')
  console.log('👨‍💼 管理员: 用户名 admin + 管理员密码')
  console.log('👨‍🎓 学员: 昵称 + QQ号密码')
  
  console.log('\n=== ⚡ 性能优化建议 ===')
  console.log('📦 当前构建大小: ~616KB (可考虑代码分割)')
  console.log('🚀 CDN加速: GitHub Pages自带CDN')
  console.log('📱 PWA支持: 可考虑添加Service Worker')
  
  console.log('\n=== 🛠️ 下一步操作 ===')
  console.log('1. 在GitHub仓库设置中启用Pages (选择GitHub Actions)')
  console.log('2. 等待自动部署完成 (约2-5分钟)')
  console.log('3. 访问部署地址验证功能')
  console.log('4. 测试登录和各项功能')
  console.log('5. 如有问题，检查Actions日志')
  
  console.log('\n🎉 部署配置完成！')
  console.log('💡 提示: 如果网站还无法访问，请等待GitHub Actions完成部署')
}

checkDeploymentStatus()
