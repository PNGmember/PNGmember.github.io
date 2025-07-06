// 检查部署状态脚本
import fs from 'fs'
import path from 'path'

console.log('🔍 检查 GitHub Pages 部署准备状态...\n')

// 检查必要文件
const requiredFiles = [
  { path: 'package.json', description: '项目配置文件' },
  { path: 'vite.config.ts', description: 'Vite 构建配置' },
  { path: '.github/workflows/deploy.yml', description: 'GitHub Actions 工作流' },
  { path: 'public/purple-night-logo.png', description: '紫夜队徽' },
  { path: 'dist/index.html', description: '构建输出文件' },
  { path: 'dist/purple-night-logo.png', description: '构建后的队徽' },
  { path: 'DEPLOYMENT.md', description: '部署指南' }
]

console.log('=== 📁 文件检查 ===')
let allFilesExist = true

requiredFiles.forEach(file => {
  if (fs.existsSync(file.path)) {
    const stats = fs.statSync(file.path)
    const size = stats.isFile() ? `(${(stats.size / 1024).toFixed(2)} KB)` : '(目录)'
    console.log(`✅ ${file.description}: ${file.path} ${size}`)
  } else {
    console.log(`❌ ${file.description}: ${file.path} - 文件缺失！`)
    allFilesExist = false
  }
})

console.log('\n=== 🔧 配置检查 ===')

// 检查 package.json
if (fs.existsSync('package.json')) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  console.log(`✅ 项目名称: ${packageJson.name}`)
  console.log(`✅ 版本: ${packageJson.version}`)
  console.log(`✅ 构建脚本: ${packageJson.scripts.build}`)
} else {
  console.log('❌ package.json 不存在')
}

// 检查 GitHub Actions 工作流
if (fs.existsSync('.github/workflows/deploy.yml')) {
  const workflow = fs.readFileSync('.github/workflows/deploy.yml', 'utf8')
  const hasCorrectBranch = workflow.includes('gh-pages')
  const hasNodeSetup = workflow.includes('setup-node')
  const hasBuild = workflow.includes('npm run build')
  
  console.log(`${hasCorrectBranch ? '✅' : '❌'} GitHub Actions 部署到 gh-pages 分支`)
  console.log(`${hasNodeSetup ? '✅' : '❌'} Node.js 环境配置`)
  console.log(`${hasBuild ? '✅' : '❌'} 构建步骤配置`)
} else {
  console.log('❌ GitHub Actions 工作流不存在')
}

// 检查构建输出
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist')
  console.log(`✅ 构建输出目录存在，包含 ${distFiles.length} 个文件`)
  
  const hasIndex = distFiles.includes('index.html')
  const hasAssets = distFiles.some(file => file.startsWith('assets') || file.includes('.js') || file.includes('.css'))
  const hasLogo = distFiles.includes('purple-night-logo.png')
  
  console.log(`${hasIndex ? '✅' : '❌'} index.html 文件`)
  console.log(`${hasAssets ? '✅' : '❌'} 静态资源文件`)
  console.log(`${hasLogo ? '✅' : '❌'} 紫夜队徽文件`)
} else {
  console.log('❌ 构建输出目录不存在，请运行 npm run build')
}

console.log('\n=== 🚀 部署指令 ===')
console.log('如果所有检查都通过，请执行以下命令部署：')
console.log('')
console.log('# 1. 添加远程仓库（如果还没有）')
console.log('git remote add origin https://github.com/PNGinfo/pnginfo.github.io.git')
console.log('')
console.log('# 2. 添加所有文件')
console.log('git add .')
console.log('')
console.log('# 3. 提交更改')
console.log('git commit -m "部署紫夜公会成员信息管理平台"')
console.log('')
console.log('# 4. 推送到GitHub')
console.log('git push origin main')
console.log('')
console.log('# 5. 在GitHub仓库设置中启用Pages')
console.log('# 访问: https://github.com/PNGinfo/pnginfo.github.io/settings/pages')
console.log('# 选择: Deploy from a branch > gh-pages > / (root)')

console.log('\n=== 🌐 访问地址 ===')
console.log('部署完成后访问:')
console.log('🏠 主站: https://pnginfo.github.io/')
console.log('🧪 Logo测试: https://pnginfo.github.io/test-logo.html')

console.log('\n=== 📊 项目统计 ===')
if (fs.existsSync('src')) {
  const countFiles = (dir, ext) => {
    let count = 0
    const files = fs.readdirSync(dir, { withFileTypes: true })
    for (const file of files) {
      if (file.isDirectory()) {
        count += countFiles(path.join(dir, file.name), ext)
      } else if (file.name.endsWith(ext)) {
        count++
      }
    }
    return count
  }
  
  const tsxFiles = countFiles('src', '.tsx')
  const tsFiles = countFiles('src', '.ts')
  
  console.log(`📄 TypeScript 组件: ${tsxFiles} 个`)
  console.log(`📄 TypeScript 文件: ${tsFiles} 个`)
}

if (allFilesExist) {
  console.log('\n🎉 所有检查通过！项目已准备好部署到 GitHub Pages。')
} else {
  console.log('\n⚠️  存在缺失文件，请先解决这些问题再进行部署。')
}

console.log('\n💡 提示: 首次部署可能需要 5-10 分钟才能访问。')
