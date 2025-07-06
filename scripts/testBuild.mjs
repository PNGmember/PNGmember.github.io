// 测试构建配置
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

function testBuild() {
  console.log('🔨 测试构建配置...\n')
  
  try {
    // 清理之前的构建
    console.log('🧹 清理之前的构建...')
    if (fs.existsSync('dist')) {
      fs.rmSync('dist', { recursive: true, force: true })
      console.log('✅ 清理完成')
    }
    
    // 设置生产环境
    process.env.NODE_ENV = 'production'
    
    // 执行构建
    console.log('🔨 开始构建...')
    execSync('npm run build', { stdio: 'inherit' })
    console.log('✅ 构建完成')
    
    // 检查构建结果
    console.log('\n📁 检查构建结果...')
    
    const distPath = 'dist'
    if (!fs.existsSync(distPath)) {
      console.log('❌ dist目录不存在')
      return false
    }
    
    // 检查关键文件
    const requiredFiles = [
      'index.html',
      'purple-night-logo.png'
    ]
    
    let allFilesExist = true
    
    requiredFiles.forEach(file => {
      const filePath = path.join(distPath, file)
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath)
        console.log(`✅ ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
      } else {
        console.log(`❌ ${file} (缺失)`)
        allFilesExist = false
      }
    })
    
    // 检查assets目录
    const assetsPath = path.join(distPath, 'assets')
    if (fs.existsSync(assetsPath)) {
      const assetFiles = fs.readdirSync(assetsPath)
      console.log(`✅ assets目录 (${assetFiles.length} 个文件)`)
      
      // 列出主要资源文件
      assetFiles.forEach(file => {
        if (file.endsWith('.js') || file.endsWith('.css')) {
          const filePath = path.join(assetsPath, file)
          const stats = fs.statSync(filePath)
          console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`)
        }
      })
    } else {
      console.log('❌ assets目录不存在')
      allFilesExist = false
    }
    
    // 检查index.html内容
    console.log('\n📄 检查index.html...')
    const indexPath = path.join(distPath, 'index.html')
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf8')
      
      // 检查base路径
      if (indexContent.includes('/PNGinfo/')) {
        console.log('✅ base路径配置正确')
      } else {
        console.log('⚠️  base路径可能有问题')
      }
      
      // 检查资源引用
      const scriptMatch = indexContent.match(/src="([^"]+)"/g)
      const linkMatch = indexContent.match(/href="([^"]+)"/g)
      
      if (scriptMatch) {
        console.log('✅ 脚本引用:')
        scriptMatch.forEach(match => console.log(`   ${match}`))
      }
      
      if (linkMatch) {
        console.log('✅ 样式引用:')
        linkMatch.forEach(match => console.log(`   ${match}`))
      }
    }
    
    console.log('\n🌐 部署预览...')
    console.log('构建完成后，文件将部署到:')
    console.log('📍 https://purplenightgame.github.io/PNGinfo/')
    
    if (allFilesExist) {
      console.log('\n🎉 构建测试通过！')
      console.log('💡 提示: 现在可以提交并推送代码触发自动部署')
      return true
    } else {
      console.log('\n❌ 构建测试失败，请检查配置')
      return false
    }
    
  } catch (error) {
    console.error('❌ 构建失败:', error.message)
    return false
  }
}

// 运行测试
const success = testBuild()
process.exit(success ? 0 : 1)
