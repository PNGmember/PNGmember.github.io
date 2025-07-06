// 验证字体修复是否成功
import fs from 'fs'
import https from 'https'

function checkUrl(url) {
  return new Promise((resolve) => {
    const request = https.get(url, (response) => {
      let data = ''
      response.on('data', chunk => data += chunk)
      response.on('end', () => {
        resolve({
          url,
          status: response.statusCode,
          success: response.statusCode === 200,
          data: data
        })
      })
    })
    
    request.on('error', () => {
      resolve({
        url,
        status: 'ERROR',
        success: false,
        data: ''
      })
    })
    
    request.setTimeout(10000, () => {
      request.destroy()
      resolve({
        url,
        status: 'TIMEOUT',
        success: false,
        data: ''
      })
    })
  })
}

async function verifyFontFix() {
  console.log('🔧 验证字体修复是否成功...\n')
  
  console.log('=== 📁 本地文件检查 ===')
  
  // 检查本地CSS文件
  if (fs.existsSync('src/index.css')) {
    const cssContent = fs.readFileSync('src/index.css', 'utf8')
    
    // 检查是否还有Google Fonts引用
    const hasGoogleFonts = cssContent.includes('fonts.googleapis.com') || cssContent.includes('fonts.gstatic.com')
    if (hasGoogleFonts) {
      console.log('❌ CSS文件仍包含Google Fonts引用')
      const lines = cssContent.split('\n')
      lines.forEach((line, index) => {
        if (line.includes('fonts.google') || line.includes('fonts.gstatic')) {
          console.log(`   第${index + 1}行: ${line.trim()}`)
        }
      })
    } else {
      console.log('✅ CSS文件已移除Google Fonts引用')
    }
    
    // 检查字体设置
    const fontFamilyMatch = cssContent.match(/font-family:\s*([^;]+);/)
    if (fontFamilyMatch) {
      console.log(`✅ 当前字体设置: ${fontFamilyMatch[1].trim()}`)
    }
  }
  
  // 检查构建后的文件
  if (fs.existsSync('dist/assets')) {
    const assetFiles = fs.readdirSync('dist/assets')
    const cssFiles = assetFiles.filter(file => file.endsWith('.css'))
    
    if (cssFiles.length > 0) {
      console.log(`✅ 找到构建后的CSS文件: ${cssFiles.join(', ')}`)
      
      // 检查构建后的CSS是否包含Google Fonts
      cssFiles.forEach(cssFile => {
        const cssPath = `dist/assets/${cssFile}`
        const cssContent = fs.readFileSync(cssPath, 'utf8')
        const hasGoogleFonts = cssContent.includes('fonts.googleapis.com') || cssContent.includes('fonts.gstatic.com')
        
        if (hasGoogleFonts) {
          console.log(`❌ 构建后的${cssFile}仍包含Google Fonts引用`)
        } else {
          console.log(`✅ 构建后的${cssFile}已移除Google Fonts引用`)
        }
      })
    }
  }
  
  console.log('\n=== 🌐 在线验证 ===')
  
  const baseUrl = 'https://purplenightgame.github.io/PNGinfo'
  
  // 检查主页是否可以正常加载
  console.log('检查主页加载状态...')
  const mainPageResult = await checkUrl(`${baseUrl}/`)
  
  if (mainPageResult.success) {
    console.log('✅ 主页可以正常访问')
    
    // 检查HTML内容是否包含Google Fonts引用
    const hasGoogleFontsInHTML = mainPageResult.data.includes('fonts.googleapis.com') || 
                                  mainPageResult.data.includes('fonts.gstatic.com')
    
    if (hasGoogleFontsInHTML) {
      console.log('❌ 部署的HTML仍包含Google Fonts引用')
    } else {
      console.log('✅ 部署的HTML已移除Google Fonts引用')
    }
    
    // 检查是否有React根元素
    if (mainPageResult.data.includes('<div id="root">')) {
      console.log('✅ React根元素存在')
    } else {
      console.log('❌ React根元素缺失')
    }
    
  } else {
    console.log(`❌ 主页无法访问 (状态: ${mainPageResult.status})`)
  }
  
  console.log('\n=== 🎯 测试建议 ===')
  console.log('请在浏览器中访问以下链接进行测试:')
  console.log(`🏠 主页: ${baseUrl}/`)
  console.log(`🔐 登录页: ${baseUrl}/login`)
  console.log(`⚙️  管理后台: ${baseUrl}/admin`)
  
  console.log('\n=== 🔍 浏览器测试步骤 ===')
  console.log('1. 打开浏览器开发者工具 (F12)')
  console.log('2. 访问网站主页')
  console.log('3. 检查Console标签页是否有错误')
  console.log('4. 检查Network标签页是否有失败的请求')
  console.log('5. 确认页面内容正常显示')
  
  console.log('\n=== 📱 移动端测试 ===')
  console.log('在手机浏览器中测试响应式设计')
  
  console.log('\n=== 🔐 功能测试 ===')
  console.log('测试登录功能:')
  console.log('- 管理员: 用户名 admin + 管理员密码')
  console.log('- 学员: 昵称 + QQ号密码')
  
  console.log('\n🎉 字体修复验证完成！')
  console.log('💡 如果网站仍有问题，请检查浏览器控制台的错误信息')
}

verifyFontFix()
