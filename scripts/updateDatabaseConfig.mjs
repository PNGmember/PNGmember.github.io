// 批量更新数据库配置脚本
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 新的配置信息
const NEW_CONFIG = {
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
}

// 旧的配置信息
const OLD_CONFIG = {
  appId: 'cCD4H1pwVQWoPETlxR5CLbQH-gzGzoHsz',
  appKey: 'BuI56qnGouF3lJ0KMGI14mpN',
  masterKey: 'IJrUg2qcKgy0KTnr3jKHgy6l',
  serverURL: 'https://ccd4h1pw.lc-cn-n1-shared.com'
}

function updateConfigInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8')
    let updated = false

    // 替换 appId
    if (content.includes(OLD_CONFIG.appId)) {
      content = content.replace(new RegExp(OLD_CONFIG.appId, 'g'), NEW_CONFIG.appId)
      updated = true
    }

    // 替换 appKey
    if (content.includes(OLD_CONFIG.appKey)) {
      content = content.replace(new RegExp(OLD_CONFIG.appKey, 'g'), NEW_CONFIG.appKey)
      updated = true
    }

    // 替换 masterKey
    if (content.includes(OLD_CONFIG.masterKey)) {
      content = content.replace(new RegExp(OLD_CONFIG.masterKey, 'g'), NEW_CONFIG.masterKey)
      updated = true
    }

    // 替换 serverURL
    if (content.includes(OLD_CONFIG.serverURL)) {
      content = content.replace(new RegExp(OLD_CONFIG.serverURL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), NEW_CONFIG.serverURL)
      updated = true
    }

    if (updated) {
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`✅ 已更新: ${path.basename(filePath)}`)
      return true
    } else {
      console.log(`⏭️  跳过: ${path.basename(filePath)} (无需更新)`)
      return false
    }
  } catch (error) {
    console.error(`❌ 更新失败: ${path.basename(filePath)} - ${error.message}`)
    return false
  }
}

function updateAllScripts() {
  console.log('开始更新数据库配置...\n')
  
  const scriptsDir = __dirname
  const files = fs.readdirSync(scriptsDir)
  
  let updatedCount = 0
  let totalCount = 0

  files.forEach(file => {
    if (file.endsWith('.mjs') && file !== 'updateDatabaseConfig.mjs') {
      const filePath = path.join(scriptsDir, file)
      totalCount++
      if (updateConfigInFile(filePath)) {
        updatedCount++
      }
    }
  })

  console.log(`\n📊 更新完成:`)
  console.log(`   总文件数: ${totalCount}`)
  console.log(`   已更新: ${updatedCount}`)
  console.log(`   跳过: ${totalCount - updatedCount}`)
}

updateAllScripts()
