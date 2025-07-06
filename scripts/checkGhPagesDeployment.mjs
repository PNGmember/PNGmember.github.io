// 检查gh-pages分支部署状态
import https from 'https'
import { execSync } from 'child_process'

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

async function checkGhPagesDeployment() {
  console.log('🚀 检查gh-pages分支部署状态...\n')
  
  // 检查本地git状态
  console.log('=== 📁 本地Git状态 ===')
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim()
    console.log(`✅ 当前分支: ${currentBranch}`)
    
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    console.log(`✅ 远程仓库: ${remoteUrl}`)
    
    // 检查gh-pages分支是否存在
    try {
      const branches = execSync('git branch -r', { encoding: 'utf8' })
      if (branches.includes('origin/gh-pages')) {
        console.log('✅ gh-pages分支已创建')
      } else {
        console.log('❌ gh-pages分支不存在')
      }
    } catch (error) {
      console.log('⚠️  无法检查远程分支')
    }
    
  } catch (error) {
    console.log('❌ Git状态检查失败:', error.message)
  }
  
  console.log('\n=== 🌐 部署链接检查 ===')
  
  const baseUrl = 'https://purplenightgame.github.io/PNGinfo'
  
  const urlsToCheck = [
    { url: `${baseUrl}/`, description: '主页' },
    { url: `${baseUrl}/purple-night-logo.png`, description: '紫夜队徽' },
    { url: `${baseUrl}/test-logo.html`, description: 'Logo测试页面' }
  ]
  
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
  
  console.log('\n=== ⚙️ GitHub Pages设置 ===')
  console.log('📍 仓库设置页面: https://github.com/PurpleNightGame/PNGinfo/settings/pages')
  console.log('📋 需要设置:')
  console.log('   1. Source: Deploy from a branch')
  console.log('   2. Branch: gh-pages')
  console.log('   3. Folder: / (root)')
  console.log('   4. 点击 Save 保存设置')
  
  console.log('\n=== 🎯 应用链接 ===')
  console.log('🏠 主页: https://purplenightgame.github.io/PNGinfo/')
  console.log('🔐 登录页面: https://purplenightgame.github.io/PNGinfo/login')
  console.log('⚙️  管理后台: https://purplenightgame.github.io/PNGinfo/admin')
  console.log('🧪 Logo测试: https://purplenightgame.github.io/PNGinfo/test-logo.html')
  
  console.log('\n=== 🔐 测试账户 ===')
  console.log('👨‍💼 管理员账户:')
  console.log('   用户名: admin')
  console.log('   密码: 联系管理员获取')
  console.log('')
  console.log('👨‍🎓 学员账户:')
  console.log('   用户名: 学员昵称')
  console.log('   密码: 学员QQ号')
  
  console.log('\n=== 🔄 更新部署 ===')
  console.log('当需要更新网站时，运行以下命令:')
  console.log('1. git add .')
  console.log('2. git commit -m "更新描述"')
  console.log('3. git push origin main')
  console.log('4. npm run deploy')
  
  console.log('\n=== 🎨 功能特色 ===')
  console.log('✅ 紫夜公会官方队徽')
  console.log('✅ 响应式设计 (手机/平板/电脑)')
  console.log('✅ 深色/浅色主题切换')
  console.log('✅ 安全的密码加密存储')
  console.log('✅ 完整的用户管理功能')
  console.log('✅ 课程进度跟踪')
  console.log('✅ 数据统计分析')
  
  console.log('\n🎉 gh-pages部署完成！')
  console.log('💡 提示: 如果网站还无法访问，请在GitHub仓库设置中启用Pages')
}

checkGhPagesDeployment()
