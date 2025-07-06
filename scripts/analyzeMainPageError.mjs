// 分析主页面错误
import https from 'https'

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = ''
      response.on('data', chunk => data += chunk)
      response.on('end', () => {
        resolve({
          status: response.statusCode,
          headers: response.headers,
          data: data
        })
      })
    })
    
    request.on('error', reject)
    request.setTimeout(15000, () => {
      request.destroy()
      reject(new Error('Request timeout'))
    })
  })
}

async function analyzeMainPageError() {
  console.log('🔍 分析主页面错误...\n')
  
  const baseUrl = 'https://purplenightgame.github.io/PNGinfo'
  
  try {
    console.log('=== 📄 获取主页HTML ===')
    const htmlResult = await fetchUrl(`${baseUrl}/`)
    
    if (htmlResult.status !== 200) {
      console.log(`❌ 主页访问失败: ${htmlResult.status}`)
      return
    }
    
    console.log('✅ 主页HTML获取成功')
    const html = htmlResult.data
    
    // 解析资源文件
    console.log('\n=== 📦 解析资源文件 ===')
    const scriptMatches = html.match(/src="([^"]+\.js[^"]*)"/g) || []
    const cssMatches = html.match(/href="([^"]+\.css[^"]*)"/g) || []
    
    console.log(`发现 ${scriptMatches.length} 个JavaScript文件:`)
    const jsFiles = []
    for (const match of scriptMatches) {
      const src = match.match(/src="([^"]+)"/)[1]
      jsFiles.push(src)
      console.log(`  📄 ${src}`)
    }
    
    console.log(`\n发现 ${cssMatches.length} 个CSS文件:`)
    const cssFiles = []
    for (const match of cssMatches) {
      const href = match.match(/href="([^"]+)"/)[1]
      cssFiles.push(href)
      console.log(`  🎨 ${href}`)
    }
    
    // 检查每个资源文件
    console.log('\n=== 🔗 检查资源文件可访问性 ===')
    
    for (const jsFile of jsFiles) {
      try {
        const fullUrl = jsFile.startsWith('http') ? jsFile : `${baseUrl}${jsFile}`
        const result = await fetchUrl(fullUrl)
        
        if (result.status === 200) {
          console.log(`✅ ${jsFile} (${(result.data.length / 1024).toFixed(2)} KB)`)
          
          // 检查JavaScript内容的基本结构
          const jsContent = result.data
          if (jsContent.includes('React')) {
            console.log(`   🔍 包含React代码`)
          }
          if (jsContent.includes('LeanCloud') || jsContent.includes('leancloud')) {
            console.log(`   🔍 包含LeanCloud代码`)
          }
          if (jsContent.includes('error') || jsContent.includes('Error')) {
            console.log(`   ⚠️  可能包含错误处理代码`)
          }
          
        } else {
          console.log(`❌ ${jsFile} (状态: ${result.status})`)
        }
      } catch (error) {
        console.log(`❌ ${jsFile} (错误: ${error.message})`)
      }
    }
    
    for (const cssFile of cssFiles) {
      try {
        const fullUrl = cssFile.startsWith('http') ? cssFile : `${baseUrl}${cssFile}`
        const result = await fetchUrl(fullUrl)
        
        if (result.status === 200) {
          console.log(`✅ ${cssFile} (${(result.data.length / 1024).toFixed(2)} KB)`)
        } else {
          console.log(`❌ ${cssFile} (状态: ${result.status})`)
        }
      } catch (error) {
        console.log(`❌ ${cssFile} (错误: ${error.message})`)
      }
    }
    
    // 分析HTML结构
    console.log('\n=== 🏗️ HTML结构分析 ===')
    console.log(`- 文档类型: ${html.includes('<!doctype html>') ? '✅ HTML5' : '❌ 非标准'}`)
    console.log(`- 字符编码: ${html.includes('charset="UTF-8"') ? '✅ UTF-8' : '❌ 未指定或非UTF-8'}`)
    console.log(`- 视口设置: ${html.includes('viewport') ? '✅ 已设置' : '❌ 未设置'}`)
    console.log(`- React根元素: ${html.includes('<div id="root">') ? '✅ 存在' : '❌ 缺失'}`)
    console.log(`- 标题设置: ${html.includes('<title>') ? '✅ 已设置' : '❌ 未设置'}`)
    
    // 检查可能的问题
    console.log('\n=== 🚨 可能的问题分析 ===')
    
    if (!html.includes('<div id="root">')) {
      console.log('❌ 严重问题: React根元素缺失')
    }
    
    if (jsFiles.length === 0) {
      console.log('❌ 严重问题: 没有JavaScript文件')
    }
    
    if (html.includes('fonts.googleapis.com') || html.includes('fonts.gstatic.com')) {
      console.log('⚠️  警告: 仍然包含Google Fonts引用，可能导致加载延迟')
    }
    
    // 检查简化测试页面
    console.log('\n=== 🧪 检查简化测试页面 ===')
    try {
      const simpleResult = await fetchUrl(`${baseUrl}/simple-test.html`)
      if (simpleResult.status === 200) {
        console.log('✅ simple-test.html 可以访问')
        console.log(`   链接: ${baseUrl}/simple-test.html`)
      } else {
        console.log(`❌ simple-test.html 访问失败: ${simpleResult.status}`)
      }
    } catch (error) {
      console.log(`❌ simple-test.html 访问错误: ${error.message}`)
    }
    
    console.log('\n=== 💡 建议的调试步骤 ===')
    console.log('1. 访问简化测试页面进行基础功能验证')
    console.log(`   ${baseUrl}/simple-test.html`)
    console.log('2. 在浏览器中打开主页并查看控制台错误')
    console.log(`   ${baseUrl}/`)
    console.log('3. 检查Network标签页中失败的请求')
    console.log('4. 如果JavaScript文件正常加载，问题可能在代码执行阶段')
    console.log('5. 检查是否有LeanCloud连接问题')
    
  } catch (error) {
    console.log(`❌ 分析失败: ${error.message}`)
  }
}

analyzeMainPageError()
