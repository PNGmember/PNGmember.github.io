// 将现有的明文密码迁移为加密密码
import AV from 'leancloud-storage'
import crypto from 'crypto'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

// 密码加密工具函数（与前端保持一致）
class PasswordUtils {
  // 简单的密码哈希函数（使用SHA-256）
  static async hashPassword(password) {
    const data = password + 'purplenight_salt' // 添加盐值
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('hex')
  }

  // 验证密码
  static async verifyPassword(password, hashedPassword) {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hashedPassword
  }
}

async function migratePasswords() {
  try {
    console.log('🔄 开始迁移Student表中的密码...\n')
    
    // 1. 查询所有Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const students = await studentQuery.find()
    
    console.log(`找到 ${students.length} 个学员记录`)
    
    if (students.length === 0) {
      console.log('没有需要迁移的记录')
      return
    }
    
    let migratedCount = 0
    let skippedCount = 0
    let errorCount = 0
    const errors = []
    
    for (const student of students) {
      try {
        const nickname = student.get('nickname')
        const currentPassword = student.get('password')
        
        if (!currentPassword) {
          console.log(`⚠️  学员 ${nickname} 没有密码，跳过`)
          skippedCount++
          continue
        }
        
        // 检查密码是否已经是加密格式（64位十六进制字符串）
        const isAlreadyHashed = /^[a-f0-9]{64}$/i.test(currentPassword)
        
        if (isAlreadyHashed) {
          console.log(`✅ 学员 ${nickname} 密码已加密，跳过`)
          skippedCount++
          continue
        }
        
        console.log(`🔄 迁移学员 ${nickname} 的密码...`)
        console.log(`   原密码: ${currentPassword}`)
        
        // 加密密码
        const hashedPassword = await PasswordUtils.hashPassword(currentPassword)
        console.log(`   新密码: ${hashedPassword}`)
        
        // 更新记录
        student.set('password', hashedPassword)
        await student.save()
        
        migratedCount++
        console.log(`✅ 学员 ${nickname} 密码迁移成功`)
        
      } catch (error) {
        errorCount++
        const nickname = student.get('nickname') || '未知学员'
        const errorMsg = `迁移 ${nickname} 失败: ${error.message}`
        errors.push(errorMsg)
        console.error(`❌ ${errorMsg}`)
      }
    }
    
    console.log('\n📊 迁移结果:')
    console.log(`   ✅ 成功迁移: ${migratedCount}`)
    console.log(`   ⚠️  跳过: ${skippedCount}`)
    console.log(`   ❌ 失败: ${errorCount}`)
    
    if (errors.length > 0) {
      console.log('\n❌ 错误详情:')
      errors.forEach(error => {
        console.log(`   • ${error}`)
      })
    }
    
    // 验证迁移结果
    console.log('\n🔍 验证迁移结果...')
    await verifyMigration()
    
  } catch (error) {
    console.error('❌ 迁移过程中发生错误:', error)
  }
}

async function verifyMigration() {
  try {
    // 随机选择几个学员进行验证
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    studentQuery.limit(3)
    const students = await studentQuery.find()
    
    console.log('验证前3个学员的密码格式:')
    
    for (const student of students) {
      const nickname = student.get('nickname')
      const password = student.get('password')
      const qqNumber = student.get('qqNumber')
      
      // 检查密码格式
      const isHashedFormat = /^[a-f0-9]{64}$/i.test(password)
      console.log(`   ${nickname}: ${isHashedFormat ? '✅ 已加密' : '❌ 未加密'} (长度: ${password?.length || 0})`)
      
      // 如果有QQ号，验证密码是否正确
      if (qqNumber && isHashedFormat) {
        try {
          const isValid = await PasswordUtils.verifyPassword(qqNumber.toString(), password)
          console.log(`     密码验证: ${isValid ? '✅ 正确' : '❌ 错误'}`)
        } catch (error) {
          console.log(`     密码验证失败: ${error.message}`)
        }
      }
    }
    
  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error)
  }
}

async function runMigration() {
  console.log('🧪 开始密码加密迁移\n')
  
  console.log('⚠️  重要提示:')
  console.log('   - 此操作将把所有明文密码转换为加密格式')
  console.log('   - 迁移后，学员仍使用原密码登录（通常是QQ号）')
  console.log('   - 但密码在数据库中将以加密形式存储')
  console.log('   - 此操作不可逆，请确保备份重要数据')
  console.log('')
  
  await migratePasswords()
  
  console.log('\n🎉 密码迁移完成！')
  console.log('\n💡 提示:')
  console.log('   - 现在所有密码都以加密形式存储')
  console.log('   - 学员登录时使用原密码（QQ号）')
  console.log('   - 系统会自动验证加密密码')
  console.log('   - 新导入的学员密码也会自动加密')
}

// 询问用户确认
console.log('⚠️  密码迁移警告:')
console.log('   这将把所有Student表中的明文密码转换为加密格式')
console.log('   此操作不可逆，请确保已备份重要数据')
console.log('')
console.log('如果确认要继续，请运行: node scripts/migratePasswordsToEncrypted.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  runMigration()
} else {
  console.log('❌ 未确认，迁移已取消')
}
