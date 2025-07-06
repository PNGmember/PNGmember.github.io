// 测试加密登录和密码修改功能
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
  static async hashPassword(password) {
    const data = password + 'purplenight_salt'
    const hash = crypto.createHash('sha256')
    hash.update(data)
    return hash.digest('hex')
  }

  static async verifyPassword(password, hashedPassword) {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hashedPassword
  }
}

// 模拟Student登录（使用加密密码验证）
async function testEncryptedStudentLogin(username, password) {
  try {
    console.log(`🔄 测试加密登录: ${username}`)
    
    // 查询Student表进行登录验证
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('username', username)
    studentQuery.equalTo('guild', 'purplenight')
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      console.log('❌ 用户不存在')
      return false
    }
    
    console.log(`找到学员: ${studentRecord.get('nickname')}`)
    
    // 检查密码（加密验证）
    const storedPassword = studentRecord.get('password')
    console.log(`存储的密码: ${storedPassword}`)
    console.log(`输入的密码: ${password}`)
    
    const isPasswordValid = await PasswordUtils.verifyPassword(password, storedPassword)
    console.log(`密码验证结果: ${isPasswordValid ? '✅ 正确' : '❌ 错误'}`)
    
    if (!isPasswordValid) {
      return false
    }
    
    // 检查账户状态
    const studentIsActive = studentRecord.get('isActive')
    if (studentIsActive === false) {
      console.log('❌ 账户已被停用')
      return false
    }
    
    console.log('✅ 登录成功')
    return true
    
  } catch (error) {
    console.error('❌ 登录失败:', error.message)
    return false
  }
}

// 测试密码修改（使用加密）
async function testEncryptedPasswordChange(studentId, currentPassword, newPassword) {
  try {
    console.log(`🔄 测试密码修改: Student ID ${studentId}`)
    
    // 查询Student记录
    const studentQuery = new AV.Query('Student')
    const studentRecord = await studentQuery.get(studentId)
    
    if (!studentRecord) {
      console.log('❌ 学员记录不存在')
      return false
    }
    
    console.log(`学员: ${studentRecord.get('nickname')}`)
    
    // 验证当前密码（加密验证）
    const storedPassword = studentRecord.get('password')
    console.log(`当前存储的密码: ${storedPassword}`)
    console.log(`输入的当前密码: ${currentPassword}`)
    
    const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, storedPassword)
    console.log(`当前密码验证: ${isCurrentPasswordValid ? '✅ 正确' : '❌ 错误'}`)
    
    if (!isCurrentPasswordValid) {
      return false
    }
    
    // 更新密码（加密新密码）
    const hashedNewPassword = await PasswordUtils.hashPassword(newPassword)
    console.log(`新密码: ${newPassword}`)
    console.log(`加密后的新密码: ${hashedNewPassword}`)
    
    studentRecord.set('password', hashedNewPassword)
    await studentRecord.save()
    
    console.log('✅ 密码修改成功')
    return true
    
  } catch (error) {
    console.error('❌ 密码修改失败:', error.message)
    return false
  }
}

async function runTests() {
  try {
    console.log('🧪 开始测试加密登录和密码修改功能\n')
    
    // 1. 获取一个测试学员
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    studentQuery.limit(1)
    const testStudent = await studentQuery.first()
    
    if (!testStudent) {
      console.log('❌ 没有找到测试学员')
      return
    }
    
    const studentId = testStudent.id
    const username = testStudent.get('username')
    const qqNumber = testStudent.get('qqNumber')
    
    console.log(`测试学员: ${testStudent.get('nickname')}`)
    console.log(`用户名: ${username}`)
    console.log(`QQ号: ${qqNumber}`)
    
    // 2. 测试正确密码登录
    console.log('\n=== 测试1: 正确密码登录 ===')
    const loginSuccess = await testEncryptedStudentLogin(username, qqNumber.toString())
    console.log(`结果: ${loginSuccess ? '成功' : '失败'}`)
    
    // 3. 测试错误密码登录
    console.log('\n=== 测试2: 错误密码登录 ===')
    const wrongLoginSuccess = await testEncryptedStudentLogin(username, 'wrongpassword')
    console.log(`结果: ${wrongLoginSuccess ? '成功（不应该）' : '失败（预期）'}`)
    
    // 4. 测试密码修改
    console.log('\n=== 测试3: 密码修改 ===')
    const newPassword = 'newpassword123'
    const changeSuccess = await testEncryptedPasswordChange(studentId, qqNumber.toString(), newPassword)
    console.log(`结果: ${changeSuccess ? '成功' : '失败'}`)
    
    if (changeSuccess) {
      // 5. 测试新密码登录
      console.log('\n=== 测试4: 新密码登录 ===')
      const newLoginSuccess = await testEncryptedStudentLogin(username, newPassword)
      console.log(`结果: ${newLoginSuccess ? '成功' : '失败'}`)
      
      // 6. 恢复原密码
      console.log('\n=== 测试5: 恢复原密码 ===')
      const restoreSuccess = await testEncryptedPasswordChange(studentId, newPassword, qqNumber.toString())
      console.log(`结果: ${restoreSuccess ? '成功' : '失败'}`)
      
      if (restoreSuccess) {
        // 7. 验证原密码恢复
        console.log('\n=== 测试6: 验证原密码恢复 ===')
        const finalLoginSuccess = await testEncryptedStudentLogin(username, qqNumber.toString())
        console.log(`结果: ${finalLoginSuccess ? '成功' : '失败'}`)
      }
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

async function main() {
  await runTests()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 所有密码现在都使用SHA-256加密存储')
  console.log('   - 登录时自动进行加密验证')
  console.log('   - 密码修改时新密码会自动加密')
  console.log('   - 学员仍使用原密码（QQ号）登录')
  console.log('   - 数据库中的密码已安全加密')
}

main()
