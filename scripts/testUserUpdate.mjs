// 测试用户更新功能
import AV from 'leancloud-storage'

// 初始化LeanCloud（模拟前端环境，不使用MasterKey）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制修复后的updateUser方法
async function updateUser(userId, updates) {
  try {
    // 前端环境下，只更新Student表
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const student = await studentQuery.first()
    
    if (!student) {
      throw new Error('未找到对应的学员记录')
    }
    
    console.log(`找到Student记录: ${student.id}`)
    console.log(`当前信息:`)
    console.log(`  昵称: ${student.get('nickname')}`)
    console.log(`  邮箱: ${student.get('email')}`)
    console.log(`  状态: ${student.get('isActive')}`)
    
    // 更新Student表中的字段
    if (updates.email) {
      console.log(`更新邮箱: ${student.get('email')} -> ${updates.email}`)
      student.set('email', updates.email)
    }
    if (updates.nickname) {
      console.log(`更新昵称: ${student.get('nickname')} -> ${updates.nickname}`)
      student.set('nickname', updates.nickname)
    }
    if (updates.isActive !== undefined) {
      console.log(`更新状态: ${student.get('isActive')} -> ${updates.isActive}`)
      student.set('isActive', updates.isActive)
    }
    
    await student.save()
    console.log('✅ Student表更新成功')
    
    // 注意：role字段无法在前端环境中更新，需要后端管理员操作
    if (updates.role && updates.role !== 'student') {
      console.warn('⚠️ 角色更新需要后端管理员权限，当前更新已忽略role字段')
    }
  } catch (error) {
    throw new Error('更新用户失败: ' + error.message)
  }
}

async function testUserUpdate() {
  try {
    console.log('测试用户更新功能...')
    
    // 选择学员002进行测试
    const testUserId = '6869fcd6c02b652dbc0755d9' // 学员002的User ID
    
    console.log(`\n测试更新学员002 (User ID: ${testUserId})`)
    
    // 测试更新昵称和邮箱
    const updates = {
      nickname: '紫夜学员002-已更新',
      email: 'student002-updated@purplenight.com',
      isActive: true
    }
    
    console.log('\n开始更新...')
    await updateUser(testUserId, updates)
    
    // 验证更新结果
    console.log('\n验证更新结果...')
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', testUserId)
    const updatedStudent = await studentQuery.first()
    
    if (updatedStudent) {
      console.log('✅ 更新后的信息:')
      console.log(`  昵称: ${updatedStudent.get('nickname')}`)
      console.log(`  邮箱: ${updatedStudent.get('email')}`)
      console.log(`  状态: ${updatedStudent.get('isActive')}`)
    } else {
      console.log('❌ 未找到更新后的记录')
    }
    
    // 测试角色更新（应该被忽略）
    console.log('\n测试角色更新（应该被忽略）...')
    await updateUser(testUserId, {
      role: 'admin' // 这个应该被忽略
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testUserUpdate()
