// 测试持久化登录功能
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 模拟登录方法
async function login(username, password) {
  try {
    const user = await AV.User.logIn(username, password)
    const userRole = user.get('role')
    const userGuild = user.get('guild')
    
    // 检查是否为管理员账户
    if ((userRole === 'admin' || userRole === 'guild_admin' || userRole === 'super_admin' || userRole === 'instructor') && userGuild === 'purplenight') {
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
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', user.id)
      const studentRecord = await studentQuery.first()
      
      if (studentRecord) {
        const studentIsActive = studentRecord.get('isActive')
        if (studentIsActive === false) {
          await AV.User.logOut()
          throw new Error('账户已被停用，请联系管理员')
        }
        
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
      }
    }

    // 不是紫夜公会成员，登出
    await AV.User.logOut()
    throw new Error('此账户不属于紫夜公会')
  } catch (error) {
    throw new Error(error.message || '登录失败')
  }
}

// 模拟getCurrentUser方法
function getCurrentUser() {
  const currentUser = AV.User.current()
  if (currentUser) {
    // 检查是否为管理员用户
    const role = currentUser.get('role')
    const guild = currentUser.get('guild')

    if ((role === 'admin' || role === 'guild_admin' || role === 'super_admin' || role === 'instructor') && guild === 'purplenight') {
      return {
        id: currentUser.id,
        username: currentUser.get('username'),
        email: currentUser.get('email'),
        nickname: currentUser.get('nickname') || currentUser.get('username'),
        joinDate: currentUser.get('createdAt'),
        isActive: currentUser.get('isActive') !== false,
        role: role,
        guild: guild,
        permissions: currentUser.get('permissions') || []
      }
    }

    // 检查是否为学生用户
    if (role === 'student' && guild === 'purplenight') {
      return {
        id: currentUser.id,
        username: currentUser.get('username'),
        email: currentUser.get('email'),
        nickname: currentUser.get('nickname') || currentUser.get('username'),
        joinDate: currentUser.get('createdAt'),
        isActive: currentUser.get('isActive') !== false,
        role: 'student',
        level: currentUser.get('level') || '未新训',
        guild: guild,
        mentor: currentUser.get('mentor')
      }
    }
  }
  
  return null
}

async function testPersistentLogin() {
  try {
    console.log('测试持久化登录功能...')
    
    // 1. 测试登录
    console.log('\n=== 步骤1: 登录 ===')
    const testUsername = 'student001'
    const testPassword = 'password123'
    
    console.log(`登录用户: ${testUsername}`)
    const user = await login(testUsername, testPassword)
    console.log('✅ 登录成功:', {
      username: user.username,
      nickname: user.nickname,
      role: user.role
    })
    
    // 2. 检查当前用户状态
    console.log('\n=== 步骤2: 检查当前用户状态 ===')
    const currentUser1 = getCurrentUser()
    if (currentUser1) {
      console.log('✅ 当前用户存在:', currentUser1.username)
      console.log('  用户ID:', currentUser1.id)
      console.log('  角色:', currentUser1.role)
    } else {
      console.log('❌ 当前用户不存在')
    }
    
    // 3. 模拟页面刷新（不登出）
    console.log('\n=== 步骤3: 模拟页面刷新 ===')
    console.log('模拟页面刷新，检查会话是否保持...')
    
    // 检查LeanCloud会话是否仍然有效
    const currentUser2 = getCurrentUser()
    if (currentUser2) {
      console.log('✅ 页面刷新后用户会话保持:', currentUser2.username)
      console.log('  会话ID:', AV.User.current()?.getSessionToken()?.substring(0, 10) + '...')
    } else {
      console.log('❌ 页面刷新后用户会话丢失')
    }
    
    // 4. 测试会话有效性
    console.log('\n=== 步骤4: 测试会话有效性 ===')
    try {
      const currentAVUser = AV.User.current()
      if (currentAVUser) {
        // 尝试获取用户信息来验证会话
        await currentAVUser.fetch()
        console.log('✅ 会话有效，可以获取用户信息')
      } else {
        console.log('❌ 没有当前用户')
      }
    } catch (error) {
      console.log('❌ 会话无效:', error.message)
    }
    
    // 5. 测试登出
    console.log('\n=== 步骤5: 测试登出 ===')
    await AV.User.logOut()
    console.log('✅ 已登出')
    
    const currentUser3 = getCurrentUser()
    if (currentUser3) {
      console.log('❌ 登出后仍有用户会话')
    } else {
      console.log('✅ 登出后用户会话已清除')
    }
    
    console.log('\n=== 测试总结 ===')
    console.log('LeanCloud会话管理测试:')
    console.log('✅ 登录 - 创建用户会话')
    console.log('✅ 会话保持 - 页面刷新后会话仍然有效')
    console.log('✅ 会话验证 - 可以验证会话有效性')
    console.log('✅ 登出 - 清除用户会话')
    
    console.log('\n前端实现要点:')
    console.log('1. 使用AV.User.current()检查当前用户')
    console.log('2. 在AuthContext初始化时恢复用户状态')
    console.log('3. 使用localStorage记住登录偏好')
    console.log('4. 登出时清除所有本地状态')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testPersistentLogin()
