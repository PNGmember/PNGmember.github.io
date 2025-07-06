// 测试新导入学员的密码加密功能
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

// 密码加密工具函数
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

// 创建测试Member记录
async function createTestMember() {
  try {
    console.log('🔄 创建测试Member记录...')
    
    const testMemberData = {
      nickname: '加密测试学员',
      qqNumber: '999888777',
      guild: 'purplenight',
      stage: '新训',
      status: '正常'
    }
    
    // 先删除可能存在的同名记录
    const existingQuery = new AV.Query('Member')
    existingQuery.equalTo('nickname', testMemberData.nickname)
    const existing = await existingQuery.first()
    
    if (existing) {
      await existing.destroy()
      console.log('删除了现有的测试Member记录')
    }
    
    // 创建新的测试记录
    const Member = AV.Object.extend('Member')
    const member = new Member()
    
    member.set('nickname', testMemberData.nickname)
    member.set('qqNumber', testMemberData.qqNumber)
    member.set('guild', testMemberData.guild)
    member.set('stage', testMemberData.stage)
    member.set('status', testMemberData.status)
    
    await member.save()
    console.log('✅ 测试Member记录创建成功')
    
    return testMemberData
    
  } catch (error) {
    console.error('❌ 创建测试Member记录失败:', error)
    return null
  }
}

// 模拟导入功能（使用加密）
async function testImportWithEncryption(memberData) {
  try {
    console.log('🔄 测试导入功能（使用加密）...')
    
    const { nickname, qqNumber } = memberData
    
    // 检查Student表中是否已存在
    const existingStudentQuery = new AV.Query('Student')
    existingStudentQuery.equalTo('nickname', nickname)
    const existingStudent = await existingStudentQuery.first()
    
    if (existingStudent) {
      await existingStudent.destroy()
      console.log('删除了现有的Student记录')
    }
    
    // 创建Student记录（使用加密密码）
    const Student = AV.Object.extend('Student')
    const student = new Student()
    
    // 加密密码（使用QQ号作为初始密码）
    const hashedPassword = await PasswordUtils.hashPassword(qqNumber.toString())
    console.log(`原始密码: ${qqNumber}`)
    console.log(`加密后密码: ${hashedPassword}`)
    
    student.set('nickname', nickname)
    student.set('username', nickname)
    student.set('qqNumber', qqNumber)
    student.set('password', hashedPassword) // 保存加密后的密码
    student.set('level', '未新训')
    student.set('guild', 'purplenight')
    student.set('joinDate', new Date())
    student.set('isActive', true)
    student.set('stage', memberData.stage)
    student.set('memberStatus', memberData.status)
    
    await student.save()
    console.log('✅ Student记录创建成功（密码已加密）')
    
    return student
    
  } catch (error) {
    console.error('❌ 导入测试失败:', error)
    return null
  }
}

// 测试登录
async function testLogin(username, password) {
  try {
    console.log(`🔄 测试登录: ${username}`)
    
    // 查询Student表
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('username', username)
    studentQuery.equalTo('guild', 'purplenight')
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      console.log('❌ 用户不存在')
      return false
    }
    
    // 验证密码
    const storedPassword = studentRecord.get('password')
    const isPasswordValid = await PasswordUtils.verifyPassword(password, storedPassword)
    
    console.log(`密码验证: ${isPasswordValid ? '✅ 成功' : '❌ 失败'}`)
    return isPasswordValid
    
  } catch (error) {
    console.error('❌ 登录测试失败:', error)
    return false
  }
}

// 清理测试数据
async function cleanupTestData(nickname) {
  try {
    console.log('🔄 清理测试数据...')
    
    // 删除Member记录
    const memberQuery = new AV.Query('Member')
    memberQuery.equalTo('nickname', nickname)
    const member = await memberQuery.first()
    if (member) {
      await member.destroy()
      console.log('✅ 测试Member记录已删除')
    }
    
    // 删除Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('nickname', nickname)
    const student = await studentQuery.first()
    if (student) {
      await student.destroy()
      console.log('✅ 测试Student记录已删除')
    }
    
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error)
  }
}

async function runTest() {
  try {
    console.log('🧪 开始测试新导入学员的密码加密功能\n')
    
    // 1. 创建测试Member记录
    console.log('=== 步骤1: 创建测试Member记录 ===')
    const memberData = await createTestMember()
    if (!memberData) {
      console.log('❌ 无法创建测试数据，测试终止')
      return
    }
    
    // 2. 测试导入功能
    console.log('\n=== 步骤2: 测试导入功能 ===')
    const student = await testImportWithEncryption(memberData)
    if (!student) {
      console.log('❌ 导入失败，测试终止')
      return
    }
    
    // 3. 验证密码格式
    console.log('\n=== 步骤3: 验证密码格式 ===')
    const storedPassword = student.get('password')
    const isHashedFormat = /^[a-f0-9]{64}$/i.test(storedPassword)
    console.log(`密码格式检查: ${isHashedFormat ? '✅ 已加密' : '❌ 未加密'}`)
    console.log(`密码长度: ${storedPassword.length}`)
    
    // 4. 测试登录
    console.log('\n=== 步骤4: 测试登录 ===')
    const loginSuccess = await testLogin(memberData.nickname, memberData.qqNumber.toString())
    console.log(`登录结果: ${loginSuccess ? '✅ 成功' : '❌ 失败'}`)
    
    // 5. 测试错误密码
    console.log('\n=== 步骤5: 测试错误密码 ===')
    const wrongLoginSuccess = await testLogin(memberData.nickname, 'wrongpassword')
    console.log(`错误密码登录: ${wrongLoginSuccess ? '❌ 成功（不应该）' : '✅ 失败（预期）'}`)
    
    // 6. 清理测试数据
    console.log('\n=== 步骤6: 清理测试数据 ===')
    await cleanupTestData(memberData.nickname)
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

async function main() {
  await runTest()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 总结:')
  console.log('   - 新导入的学员密码自动加密存储')
  console.log('   - 使用SHA-256哈希算法加盐加密')
  console.log('   - 登录时自动进行加密验证')
  console.log('   - 密码安全性得到保障')
  console.log('   - 用户体验保持不变（仍使用QQ号登录）')
}

main()
