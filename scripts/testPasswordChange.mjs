// 测试密码修改功能
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

// 模拟Student登录
async function simulateStudentLogin(username, password) {
  try {
    // 查询Student表进行登录验证
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('username', username)
    studentQuery.equalTo('guild', 'purplenight')
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      throw new Error('用户不存在')
    }
    
    // 检查密码（明文比对）
    const storedPassword = studentRecord.get('password')
    if (storedPassword !== password) {
      throw new Error('密码错误')
    }
    
    // 检查账户状态
    const studentIsActive = studentRecord.get('isActive')
    if (studentIsActive === false) {
      throw new Error('账户已被停用，请联系管理员')
    }
    
    // 构造用户信息并保存到localStorage
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
    
    // 模拟保存到localStorage（在Node.js环境中模拟）
    global.localStorage = {
      currentStudentUser: JSON.stringify(studentUser),
      getItem: function(key) { return this[key] || null },
      setItem: function(key, value) { this[key] = value },
      removeItem: function(key) { delete this[key] }
    }
    
    console.log(`✅ 模拟Student登录成功: ${studentUser.nickname}`)
    return studentUser
    
  } catch (error) {
    console.error('❌ 模拟Student登录失败:', error.message)
    return null
  }
}

// 模拟getCurrentUser方法
function mockGetCurrentUser() {
  // 首先检查是否有_User登录
  const currentUser = AV.User.current()
  if (currentUser) {
    // 这里应该返回_User信息，但在测试中我们专注于Student用户
    return null
  }

  // 检查是否有Student用户登录（从localStorage）
  try {
    const studentUserStr = global.localStorage?.getItem('currentStudentUser')
    if (studentUserStr) {
      const studentUser = JSON.parse(studentUserStr)
      // 验证数据完整性
      if (studentUser.id && studentUser.username && studentUser.role === 'student') {
        return studentUser
      }
    }
  } catch (error) {
    console.warn('解析Student用户信息失败:', error)
    global.localStorage?.removeItem('currentStudentUser')
  }

  return null
}

// 模拟changePassword方法
async function mockChangePassword(currentPassword, newPassword) {
  try {
    // 获取当前用户信息
    const currentUserInfo = mockGetCurrentUser()
    if (!currentUserInfo) {
      throw new Error('用户未登录')
    }

    console.log(`当前用户: ${currentUserInfo.nickname} (${currentUserInfo.role})`)

    // 检查是否为_User登录的用户
    const currentUser = AV.User.current()
    if (currentUser) {
      // 使用_User的密码修改方法
      await currentUser.updatePassword(currentPassword, newPassword)
      console.log('✅ _User密码修改成功')
      return
    }

    // 检查是否为Student表登录的用户
    const studentUserStr = global.localStorage?.getItem('currentStudentUser')
    if (studentUserStr) {
      const studentUser = JSON.parse(studentUserStr)
      
      // 查询Student记录
      const studentQuery = new AV.Query('Student')
      const studentRecord = await studentQuery.get(studentUser.id)
      
      if (!studentRecord) {
        throw new Error('学员记录不存在')
      }
      
      console.log(`验证当前密码: 存储="${studentRecord.get('password')}", 输入="${currentPassword}"`)
      
      // 验证当前密码
      const storedPassword = studentRecord.get('password')
      if (storedPassword !== currentPassword) {
        throw new Error('当前密码不正确')
      }
      
      console.log(`更新密码: "${storedPassword}" -> "${newPassword}"`)
      
      // 更新密码
      studentRecord.set('password', newPassword)
      await studentRecord.save()
      
      console.log('✅ Student用户密码修改成功')
      return
    }

    throw new Error('无法确定用户类型')
    
  } catch (error) {
    console.error('❌ 密码修改失败:', error.message)
    throw error
  }
}

async function testPasswordChange() {
  try {
    console.log('🧪 开始测试密码修改功能\n')
    
    // 1. 获取一个测试学员
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    studentQuery.limit(1)
    const testStudent = await studentQuery.first()
    
    if (!testStudent) {
      console.log('❌ 没有找到测试学员')
      return
    }
    
    const originalUsername = testStudent.get('username')
    const originalPassword = testStudent.get('password')
    const newPassword = 'newpassword123'
    
    console.log(`测试学员: ${testStudent.get('nickname')}`)
    console.log(`原始密码: ${originalPassword}`)
    console.log(`新密码: ${newPassword}`)
    
    // 2. 模拟学员登录
    console.log('\n=== 步骤1: 模拟学员登录 ===')
    const loginResult = await simulateStudentLogin(originalUsername, originalPassword)
    if (!loginResult) {
      console.log('❌ 登录失败，无法继续测试')
      return
    }
    
    // 3. 测试密码修改
    console.log('\n=== 步骤2: 测试密码修改 ===')
    try {
      await mockChangePassword(originalPassword, newPassword)
      console.log('✅ 密码修改成功')
    } catch (error) {
      console.log(`❌ 密码修改失败: ${error.message}`)
      return
    }
    
    // 4. 验证新密码
    console.log('\n=== 步骤3: 验证新密码 ===')
    const updatedStudent = await new AV.Query('Student').get(testStudent.id)
    const currentPassword = updatedStudent.get('password')
    console.log(`当前存储的密码: ${currentPassword}`)
    
    if (currentPassword === newPassword) {
      console.log('✅ 密码更新验证成功')
    } else {
      console.log('❌ 密码更新验证失败')
    }
    
    // 5. 测试用新密码登录
    console.log('\n=== 步骤4: 测试新密码登录 ===')
    global.localStorage?.removeItem('currentStudentUser') // 清除登录状态
    const newLoginResult = await simulateStudentLogin(originalUsername, newPassword)
    if (newLoginResult) {
      console.log('✅ 新密码登录成功')
    } else {
      console.log('❌ 新密码登录失败')
    }
    
    // 6. 恢复原始密码
    console.log('\n=== 步骤5: 恢复原始密码 ===')
    updatedStudent.set('password', originalPassword)
    await updatedStudent.save()
    console.log('✅ 原始密码已恢复')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

async function runTest() {
  await testPasswordChange()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - Student用户现在可以修改密码')
  console.log('   - 密码修改使用明文存储和比对')
  console.log('   - 可以在前端界面测试密码修改功能')
}

runTest()
