// 测试基于角色的路由控制
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制login方法
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
        }
      } catch (error) {
        if (error.message === '账户已被停用，请联系管理员') {
          throw error
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

// 模拟路由权限检查
function checkRouteAccess(userRole, route) {
  const studentRoutes = ['/', '/progress', '/training-report']
  const adminRoutes = ['/admin', '/admin/users', '/admin/courses', '/admin/assignment', '/admin/progress', '/admin/statistics']
  
  if (studentRoutes.includes(route)) {
    if (userRole === 'student') {
      return { allowed: true, redirect: null }
    } else if (['admin', 'instructor', 'guild_admin', 'super_admin'].includes(userRole)) {
      return { allowed: false, redirect: '/admin' }
    } else {
      return { allowed: false, redirect: '/login' }
    }
  }
  
  if (adminRoutes.includes(route)) {
    if (['admin', 'instructor', 'guild_admin', 'super_admin'].includes(userRole)) {
      return { allowed: true, redirect: null }
    } else if (userRole === 'student') {
      return { allowed: false, redirect: '/' }
    } else {
      return { allowed: false, redirect: '/login' }
    }
  }
  
  return { allowed: false, redirect: '/login' }
}

async function testRoleBasedRouting() {
  try {
    console.log('测试基于角色的路由控制...')
    
    // 测试账户列表
    const testAccounts = [
      { username: 'admin', password: 'admin123', expectedRole: 'guild_admin', description: '管理员账户' },
      { username: 'student001', password: 'password123', expectedRole: 'student', description: '学员账户' }
    ]
    
    // 测试路由列表
    const testRoutes = [
      '/',
      '/progress', 
      '/training-report',
      '/admin',
      '/admin/users',
      '/admin/courses'
    ]
    
    for (const account of testAccounts) {
      console.log(`\n=== 测试 ${account.description} ===`)
      
      try {
        // 登录
        const user = await login(account.username, account.password)
        console.log(`✅ 登录成功: ${user.nickname} (${user.role})`)
        
        // 测试各个路由的访问权限
        console.log(`\n路由访问权限测试:`)
        for (const route of testRoutes) {
          const access = checkRouteAccess(user.role, route)
          
          if (access.allowed) {
            console.log(`  ✅ ${route} - 允许访问`)
          } else {
            console.log(`  ❌ ${route} - 拒绝访问，重定向到: ${access.redirect}`)
          }
        }
        
        // 登出
        await AV.User.logOut()
        console.log(`✅ 已登出`)
        
      } catch (error) {
        console.log(`❌ 登录失败: ${error.message}`)
      }
    }
    
    console.log('\n=== 路由权限规则总结 ===')
    console.log('学员账户:')
    console.log('  ✅ 可访问: /, /progress, /training-report')
    console.log('  ❌ 禁止访问: /admin/* (重定向到 /admin)')
    console.log('')
    console.log('管理员账户:')
    console.log('  ✅ 可访问: /admin/*')
    console.log('  ❌ 禁止访问: /, /progress, /training-report (重定向到 /)')
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testRoleBasedRouting()
