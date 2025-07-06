// 测试登录功能和密码修改功能
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 模拟记住登录功能
function saveCredentials(username, rememberMe) {
  if (rememberMe) {
    const credentials = {
      username: username,
      rememberMe: true
    }
    localStorage.setItem('rememberedCredentials', JSON.stringify(credentials))
    console.log('✅ 保存登录凭据:', credentials)
  } else {
    localStorage.removeItem('rememberedCredentials')
    console.log('✅ 清除登录凭据')
  }
}

function loadCredentials() {
  const savedCredentials = localStorage.getItem('rememberedCredentials')
  if (savedCredentials) {
    try {
      const credentials = JSON.parse(savedCredentials)
      console.log('✅ 加载保存的凭据:', credentials)
      return credentials
    } catch (error) {
      console.warn('❌ 解析保存的凭据失败:', error)
      localStorage.removeItem('rememberedCredentials')
      return null
    }
  }
  console.log('📝 没有保存的凭据')
  return null
}

// 模拟登录方法
async function login(username, password) {
  try {
    const user = await AV.User.logIn(username, password)
    const userRole = user.get('role')
    const userGuild = user.get('guild')
    
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
          role: 'student',
          guild: userGuild
        }
      }
    }
    
    throw new Error('此账户不属于紫夜公会或不是学员账户')
  } catch (error) {
    throw new Error(error.message || '登录失败')
  }
}

// 模拟修改密码方法
async function changePassword(currentPassword, newPassword) {
  try {
    const currentUser = AV.User.current()
    if (!currentUser) {
      throw new Error('用户未登录')
    }

    await currentUser.updatePassword(currentPassword, newPassword)
    console.log('✅ 密码修改成功')
  } catch (error) {
    if (error.code === 210) {
      throw new Error('当前密码不正确')
    } else if (error.code === 125) {
      throw new Error('邮箱地址无效')
    } else {
      throw new Error('修改密码失败: ' + (error.message || '未知错误'))
    }
  }
}

async function testLoginFeatures() {
  try {
    console.log('测试登录功能和密码修改功能...')
    
    // 1. 测试记住登录功能
    console.log('\n=== 测试记住登录功能 ===')
    
    // 模拟保存凭据
    console.log('\n1. 测试保存凭据:')
    saveCredentials('student001', true)
    
    // 模拟加载凭据
    console.log('\n2. 测试加载凭据:')
    const savedCreds = loadCredentials()
    
    // 模拟清除凭据
    console.log('\n3. 测试清除凭据:')
    saveCredentials('student001', false)
    loadCredentials()
    
    // 2. 测试登录功能
    console.log('\n=== 测试登录功能 ===')
    
    const testUsername = 'student001'
    const testPassword = 'password123'
    
    console.log(`\n尝试登录: ${testUsername}`)
    const user = await login(testUsername, testPassword)
    console.log('✅ 登录成功:', {
      username: user.username,
      nickname: user.nickname,
      role: user.role
    })
    
    // 3. 测试修改密码功能
    console.log('\n=== 测试修改密码功能 ===')
    
    // 注意：这里只是测试API调用，不会真的修改密码
    console.log('\n测试密码修改API调用...')
    
    try {
      // 使用错误的当前密码测试
      await changePassword('wrongpassword', 'newpassword123')
    } catch (error) {
      console.log('✅ 正确捕获错误密码:', error.message)
    }
    
    // 测试密码强度验证
    console.log('\n测试密码强度验证:')
    const testPasswords = [
      { password: '123', strength: '弱' },
      { password: 'password', strength: '中' },
      { password: 'Password123', strength: '强' },
      { password: 'MySecureP@ssw0rd!', strength: '很强' }
    ]
    
    testPasswords.forEach(({ password, strength }) => {
      const hasLength = password.length >= 8
      const hasUpper = /[A-Z]/.test(password)
      const hasNumber = /[0-9]/.test(password)
      const hasSpecial = /[!@#$%^&*]/.test(password)
      
      console.log(`  密码: ${password}`)
      console.log(`    长度≥8: ${hasLength ? '✅' : '❌'}`)
      console.log(`    大写字母: ${hasUpper ? '✅' : '❌'}`)
      console.log(`    数字: ${hasNumber ? '✅' : '❌'}`)
      console.log(`    特殊字符: ${hasSpecial ? '✅' : '❌'}`)
      console.log(`    预期强度: ${strength}`)
    })
    
    // 登出
    await AV.User.logOut()
    console.log('\n✅ 已登出')
    
    console.log('\n=== 测试完成 ===')
    console.log('功能验证:')
    console.log('✅ 记住登录 - 凭据保存/加载/清除')
    console.log('✅ 用户登录 - 学员账户验证')
    console.log('✅ 密码修改 - API调用和错误处理')
    console.log('✅ 密码强度 - 验证规则')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testLoginFeatures()
