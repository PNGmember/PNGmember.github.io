// 测试账户停用功能
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制修复后的login方法
async function login(username, password) {
  try {
    const user = await AV.User.logIn(username, password)
    const userRole = user.get('role')
    const userGuild = user.get('guild')
    
    // 检查是否为管理员账户
    if ((userRole === 'guild_admin' || userRole === 'super_admin') && userGuild === 'purplenight') {
      return {
        id: user.id,
        username: user.get('username'),
        email: user.get('email'),
        nickname: user.get('nickname') || user.get('username'),
        joinDate: user.get('createdAt'),
        isActive: user.get('isActive') !== false,
        role: userRole,
        guild: userGuild,
        permissions: user.get('permissions') || []
      }
    }

    // 检查是否为学生账户
    if (userRole === 'student' && userGuild === 'purplenight') {
      // 额外检查Student表中的isActive状态
      try {
        const studentQuery = new AV.Query('Student')
        studentQuery.equalTo('userId', user.id)
        const studentRecord = await studentQuery.first()
        
        if (studentRecord) {
          const studentIsActive = studentRecord.get('isActive')
          if (studentIsActive === false) {
            await AV.User.logOut()
            throw new Error('账户已被停用，请联系管理员')
          }
          
          // 使用Student表中的信息
          return {
            id: user.id,
            username: user.get('username'),
            email: studentRecord.get('email') || user.get('email'),
            nickname: studentRecord.get('nickname') || user.get('nickname') || user.get('username'),
            joinDate: user.get('createdAt'),
            isActive: studentIsActive !== false,
            role: 'student',
            level: studentRecord.get('level') || '未新训',
            guild: userGuild
          }
        } else {
          // 如果没有Student记录，使用_User表的信息
          return {
            id: user.id,
            username: user.get('username'),
            email: user.get('email'),
            nickname: user.get('nickname') || user.get('username'),
            joinDate: user.get('createdAt'),
            isActive: user.get('isActive') !== false,
            role: 'student',
            level: user.get('level') || '未新训',
            guild: userGuild
          }
        }
      } catch (error) {
        if (error.message === '账户已被停用，请联系管理员') {
          throw error
        }
        // 如果查询Student表失败，使用_User表的信息
        return {
          id: user.id,
          username: user.get('username'),
          email: user.get('email'),
          nickname: user.get('nickname') || user.get('username'),
          joinDate: user.get('createdAt'),
          isActive: user.get('isActive') !== false,
          role: 'student',
          level: user.get('level') || '未新训',
          guild: userGuild
        }
      }
    }

    // 不是紫夜公会成员，登出
    await AV.User.logOut()
    throw new Error('此账户不属于紫夜公会')
  } catch (error) {
    throw new Error(error.message || '登录失败，请检查用户名和密码')
  }
}

// 复制updateUser方法
async function updateUser(userId, updates) {
  try {
    // 前端环境下，只更新Student表
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const student = await studentQuery.first()
    
    if (!student) {
      throw new Error('未找到对应的学员记录')
    }
    
    // 更新Student表中的字段
    if (updates.email) student.set('email', updates.email)
    if (updates.nickname) student.set('nickname', updates.nickname)
    if (updates.isActive !== undefined) student.set('isActive', updates.isActive)
    
    await student.save()
    
    // 注意：role字段无法在前端环境中更新，需要后端管理员操作
    if (updates.role && updates.role !== 'student') {
      console.warn('角色更新需要后端管理员权限，当前更新已忽略role字段')
    }
  } catch (error) {
    throw new Error('更新用户失败: ' + error.message)
  }
}

async function testAccountDeactivation() {
  try {
    console.log('测试账户停用功能...')
    
    const testUsername = 'student002'
    const testPassword = 'password123'
    const testUserId = '6869fcd6c02b652dbc0755d9'
    
    // 1. 首先确保账户是激活状态
    console.log('\n1. 激活账户...')
    await updateUser(testUserId, { isActive: true })
    console.log('✅ 账户已激活')
    
    // 2. 测试激活状态下的登录
    console.log('\n2. 测试激活状态下的登录...')
    try {
      const user = await login(testUsername, testPassword)
      console.log(`✅ 登录成功: ${user.nickname} (${user.username})`)
      console.log(`   状态: ${user.isActive ? '激活' : '停用'}`)
      await AV.User.logOut() // 登出
    } catch (error) {
      console.log(`❌ 登录失败: ${error.message}`)
    }
    
    // 3. 停用账户
    console.log('\n3. 停用账户...')
    await updateUser(testUserId, { isActive: false })
    console.log('✅ 账户已停用')
    
    // 4. 测试停用状态下的登录
    console.log('\n4. 测试停用状态下的登录...')
    try {
      const user = await login(testUsername, testPassword)
      console.log(`❌ 意外成功登录: ${user.nickname} (${user.username})`)
      console.log('   这不应该发生！停用功能可能有问题。')
      await AV.User.logOut()
    } catch (error) {
      if (error.message === '账户已被停用，请联系管理员') {
        console.log('✅ 正确阻止了停用账户的登录')
      } else {
        console.log(`❌ 登录失败，但错误信息不正确: ${error.message}`)
      }
    }
    
    // 5. 重新激活账户
    console.log('\n5. 重新激活账户...')
    await updateUser(testUserId, { isActive: true })
    console.log('✅ 账户已重新激活')
    
    // 6. 测试重新激活后的登录
    console.log('\n6. 测试重新激活后的登录...')
    try {
      const user = await login(testUsername, testPassword)
      console.log(`✅ 重新激活后登录成功: ${user.nickname} (${user.username})`)
      await AV.User.logOut()
    } catch (error) {
      console.log(`❌ 重新激活后登录失败: ${error.message}`)
    }
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testAccountDeactivation()
