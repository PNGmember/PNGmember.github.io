// 测试学员登录功能
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

// 模拟Student登录逻辑
async function testStudentLogin(username, password) {
  try {
    console.log(`🔄 测试学员登录: ${username}`)
    
    // 首先尝试_User登录（应该失败）
    try {
      const user = await AV.User.logIn(username, password)
      console.log('⚠️  意外：_User登录成功，这不应该发生')
      await AV.User.logOut()
      return false
    } catch (userLoginError) {
      console.log('✅ _User登录失败（预期行为）')
    }
    
    // 尝试Student表登录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('username', username)
    studentQuery.equalTo('guild', 'purplenight')
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      console.log('❌ Student记录不存在')
      return false
    }
    
    console.log(`找到Student记录: ${studentRecord.get('nickname')}`)
    console.log(`存储的密码: ${studentRecord.get('password')}`)
    console.log(`输入的密码: ${password}`)
    
    // 检查密码（明文比对）
    const storedPassword = studentRecord.get('password')
    if (storedPassword !== password) {
      console.log('❌ 密码错误')
      return false
    }
    
    console.log('✅ 密码验证成功')
    
    // 检查账户状态
    const studentIsActive = studentRecord.get('isActive')
    if (studentIsActive === false) {
      console.log('❌ 账户已被停用')
      return false
    }
    
    console.log('✅ 账户状态正常')
    
    // 构造返回的用户信息
    const studentUser = {
      id: studentRecord.id,
      username: studentRecord.get('username'),
      email: studentRecord.get('email') || `${studentRecord.get('qqNumber')}@qq.com`,
      nickname: studentRecord.get('nickname'),
      joinDate: studentRecord.get('joinDate') || studentRecord.get('createdAt'),
      isActive: studentIsActive !== false,
      role: 'student',
      level: studentRecord.get('level') || '未新训',
      guild: studentRecord.get('guild'),
      mentor: studentRecord.get('mentor'),
      qqNumber: studentRecord.get('qqNumber')
    }
    
    console.log('✅ 学员登录成功')
    console.log('📋 用户信息:')
    console.log(`   ID: ${studentUser.id}`)
    console.log(`   用户名: ${studentUser.username}`)
    console.log(`   昵称: ${studentUser.nickname}`)
    console.log(`   邮箱: ${studentUser.email}`)
    console.log(`   QQ号: ${studentUser.qqNumber}`)
    console.log(`   等级: ${studentUser.level}`)
    console.log(`   公会: ${studentUser.guild}`)
    
    return true
    
  } catch (error) {
    console.error('❌ 登录测试失败:', error)
    return false
  }
}

// 测试管理员登录
async function testAdminLogin(username, password) {
  try {
    console.log(`🔄 测试管理员登录: ${username}`)
    
    const user = await AV.User.logIn(username, password)
    const userRole = user.get('role')
    const userGuild = user.get('guild')
    
    console.log(`用户角色: ${userRole}`)
    console.log(`用户公会: ${userGuild}`)
    
    if ((userRole === 'admin' || userRole === 'guild_admin' || userRole === 'super_admin' || userRole === 'instructor') && userGuild === 'purplenight') {
      console.log('✅ 管理员登录成功')
      await AV.User.logOut()
      return true
    } else {
      console.log('❌ 不是紫夜公会管理员')
      await AV.User.logOut()
      return false
    }
    
  } catch (error) {
    console.error('❌ 管理员登录失败:', error)
    return false
  }
}

async function runTest() {
  console.log('🧪 开始测试登录功能\n')
  
  // 获取一些测试用户
  const studentQuery = new AV.Query('Student')
  studentQuery.equalTo('guild', 'purplenight')
  studentQuery.limit(3)
  const students = await studentQuery.find()
  
  if (students.length === 0) {
    console.log('❌ 没有找到Student记录，请先运行导入功能')
    return
  }
  
  console.log(`找到 ${students.length} 个学员记录\n`)
  
  // 测试学员登录
  for (let i = 0; i < Math.min(2, students.length); i++) {
    const student = students[i]
    const username = student.get('username')
    const password = student.get('password')
    
    console.log(`=== 测试学员 ${i + 1}: ${student.get('nickname')} ===`)
    const success = await testStudentLogin(username, password)
    console.log(`结果: ${success ? '成功' : '失败'}\n`)
  }
  
  // 测试错误密码
  if (students.length > 0) {
    const student = students[0]
    console.log(`=== 测试错误密码 ===`)
    const success = await testStudentLogin(student.get('username'), 'wrongpassword')
    console.log(`结果: ${success ? '成功（不应该）' : '失败（预期）'}\n`)
  }
  
  // 测试管理员登录（如果有的话）
  console.log(`=== 测试管理员登录 ===`)
  const adminSuccess = await testAdminLogin('舰长', 'admin123')
  console.log(`管理员登录结果: ${adminSuccess ? '成功' : '失败'}\n`)
  
  console.log('🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 学员现在可以使用昵称和QQ号登录')
  console.log('   - 管理员继续使用_User账户登录')
  console.log('   - 密码验证使用明文比对（仅限Student表）')
}

runTest()
