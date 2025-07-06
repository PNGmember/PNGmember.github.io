// 检查资源文件
import https from 'https'

function fetchUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      resolve({
        status: response.statusCode,
        headers: response.headers
      })
    })
    
    request.on('error', () => {
      resolve({ status: 'ERROR' })
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      resolve({ status: 'TIMEOUT' })
    })
  })
}

async function checkAssetFiles() {
  console.log('🔍 检查资源文件...\n')
  
  const baseUrl = 'https://purplenightgame.github.io/PNGinfo'
  
  // 从HTML中提取的文件名
  const expectedFiles = [
    '/assets/index-CU5myQN5.js',
    '/assets/index-i35BXFYH.css'
  ]
  
  // 可能的文件名（基于本地构建）
  const possibleFiles = [
    '/assets/index-CU5myQN5.js',
    '/assets/index-i35BXFYH.css',
    '/assets/index-CDs77GC-.js',
    '/assets/index-rO5H_Cl0.css',
    '/assets/index-935q8wpE.css',
    '/assets/index-DK9-88pV.js'
  ]
  
  console.log('=== 📋 预期的资源文件 ===')
  for (const file of expectedFiles) {
    const url = `${baseUrl}${file}`
    const result = await fetchUrl(url)
    const status = result.status === 200 ? '✅' : '❌'
    console.log(`${status} ${file} (状态: ${result.status})`)
  }
  
  console.log('\n=== 🔍 扫描可能的资源文件 ===')
  for (const file of possibleFiles) {
    const url = `${baseUrl}${file}`
    const result = await fetchUrl(url)
    if (result.status === 200) {
      console.log(`✅ 找到: ${file}`)
    }
  }
  
  console.log('\n=== 📁 检查assets目录 ===')
  // 尝试访问assets目录（可能会返回目录列表或404）
  const assetsResult = await fetchUrl(`${baseUrl}/assets/`)
  console.log(`Assets目录状态: ${assetsResult.status}`)
  
  console.log('\n=== 🔄 GitHub Pages部署状态 ===')
  console.log('可能的原因:')
  console.log('1. GitHub Pages部署延迟 (通常需要2-10分钟)')
  console.log('2. 缓存问题 (CDN缓存未更新)')
  console.log('3. 构建文件名不匹配')
  console.log('4. gh-pages分支推送失败')
  
  console.log('\n=== 💡 解决方案 ===')
  console.log('1. 等待几分钟后重试')
  console.log('2. 强制刷新浏览器 (Ctrl+F5)')
  console.log('3. 检查GitHub仓库的gh-pages分支')
  console.log('4. 重新部署: npm run deploy')
  
  console.log('\n=== 🌐 测试链接 ===')
  console.log(`主页: ${baseUrl}/`)
  console.log(`调试页面: ${baseUrl}/debug.html`)
  console.log(`简化测试: ${baseUrl}/simple-test.html`)
  console.log(`GitHub仓库: https://github.com/PurpleNightGame/PNGinfo`)
  console.log(`gh-pages分支: https://github.com/PurpleNightGame/PNGinfo/tree/gh-pages`)
}

checkAssetFiles()
