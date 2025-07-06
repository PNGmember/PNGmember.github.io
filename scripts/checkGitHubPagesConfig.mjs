// 检查GitHub Pages配置问题
import { execSync } from 'child_process'
import https from 'https'

function fetchUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      let data = ''
      response.on('data', chunk => data += chunk)
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          data: data
        })
      })
    })
    
    request.on('error', () => {
      resolve({ status: 'ERROR', data: '' })
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      resolve({ status: 'TIMEOUT', data: '' })
    })
  })
}

async function checkGitHubPagesConfig() {
  console.log('🔍 检查GitHub Pages配置问题...\n')
  
  try {
    // 获取仓库信息
    const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim()
    console.log(`📍 仓库URL: ${remoteUrl}`)
    
    // 解析仓库信息
    const match = remoteUrl.match(/github\.com[\/:]([^\/]+)\/([^\/\.]+)/)
    if (!match) {
      console.log('❌ 无法解析GitHub仓库信息')
      return
    }
    
    const [, username, repoName] = match
    console.log(`👤 用户名: ${username}`)
    console.log(`📦 仓库名: ${repoName}`)
    
    console.log('\n=== 📋 GitHub Pages类型分析 ===')
    
    const isUserRepo = repoName.toLowerCase() === `${username.toLowerCase()}.github.io`
    
    if (isUserRepo) {
      console.log('🏠 这是用户/组织页面仓库')
      console.log('✅ 应该直接从根路径访问')
      console.log(`🌐 预期URL: https://${username.toLowerCase()}.github.io/`)
      console.log('⚙️  建议配置: base: "/"')
    } else {
      console.log('📁 这是项目页面仓库')
      console.log('✅ 应该从子路径访问')
      console.log(`🌐 预期URL: https://${username.toLowerCase()}.github.io/${repoName}/`)
      console.log(`⚙️  建议配置: base: "/${repoName}/"`)
    }
    
    console.log('\n=== 🔧 当前配置检查 ===')
    
    // 检查当前Vite配置
    console.log('当前Vite配置:')
    console.log('- base: process.env.NODE_ENV === "production" ? "/PNGinfo/" : "/"')
    
    if (repoName !== 'PNGinfo') {
      console.log(`⚠️  配置不匹配！仓库名是 "${repoName}"，但配置使用 "/PNGinfo/"`)
    } else {
      console.log('✅ base路径配置与仓库名匹配')
    }
    
    console.log('\n=== 🌐 URL测试 ===')
    
    const testUrls = [
      `https://${username.toLowerCase()}.github.io/${repoName}/`,
      `https://${username.toLowerCase()}.github.io/`
    ]
    
    for (const url of testUrls) {
      try {
        const result = await fetchUrl(url)
        const status = result.status === 200 ? '✅' : '❌'
        console.log(`${status} ${url} (状态: ${result.status})`)
        
        if (result.status === 200 && result.data.includes('<div id="root">')) {
          console.log('   🎯 这个URL可以正常访问React应用')
        }
      } catch (error) {
        console.log(`❌ ${url} (错误: ${error.message})`)
      }
    }
    
    console.log('\n=== 💡 解决方案 ===')
    
    if (isUserRepo) {
      console.log('对于用户页面仓库，需要修改配置:')
      console.log('1. 修改 vite.config.ts:')
      console.log('   base: "/"')
      console.log('2. 重新构建和部署:')
      console.log('   npm run deploy')
    } else {
      if (repoName !== 'PNGinfo') {
        console.log(`对于项目页面仓库，需要修改配置:`)
        console.log('1. 修改 vite.config.ts:')
        console.log(`   base: process.env.NODE_ENV === 'production' ? '/${repoName}/' : '/'`)
        console.log('2. 重新构建和部署:')
        console.log('   npm run deploy')
      } else {
        console.log('配置看起来是正确的，可能是其他问题:')
        console.log('1. 检查GitHub Pages设置是否启用')
        console.log('2. 确认选择了正确的分支 (gh-pages)')
        console.log('3. 等待部署完成 (可能需要几分钟)')
        console.log('4. 检查浏览器控制台的JavaScript错误')
      }
    }
    
    console.log('\n=== 🛠️ 快速修复步骤 ===')
    console.log('1. 访问GitHub仓库设置:')
    console.log(`   https://github.com/${username}/${repoName}/settings/pages`)
    console.log('2. 确认设置:')
    console.log('   - Source: Deploy from a branch')
    console.log('   - Branch: gh-pages')
    console.log('   - Folder: / (root)')
    console.log('3. 如果配置需要修改，运行:')
    console.log('   npm run deploy')
    
    console.log('\n=== 🔍 调试建议 ===')
    console.log('如果网站仍然空白:')
    console.log('1. 打开浏览器开发者工具 (F12)')
    console.log('2. 查看Console标签页的错误信息')
    console.log('3. 查看Network标签页的失败请求')
    console.log('4. 确认JavaScript文件是否正确加载')
    
  } catch (error) {
    console.log(`❌ 检查失败: ${error.message}`)
  }
}

checkGitHubPagesConfig()
