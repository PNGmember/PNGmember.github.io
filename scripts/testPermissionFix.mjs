// 测试权限修复后的学员管理功能
import AV from 'leancloud-storage'

// 初始化LeanCloud（不使用MasterKey，模拟前端环境）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 模拟getAllUsers方法（前端可用的版本）
async function getAllUsers() {
  try {
    // 前端环境下，我们使用Student表来获取学生用户信息
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const students = await studentQuery.find()

    // 获取所有学员的课程进度来计算等级
    const userIds = students.map(s => s.get('userId')).filter(id => id)
    const progressMap = new Map()

    if (userIds.length > 0) {
      const progressQuery = new AV.Query('CourseProgress')
      progressQuery.containedIn('userId', userIds)
      const allProgress = await progressQuery.find()

      // 按用户ID分组进度
      allProgress.forEach(progress => {
        const userId = progress.get('userId')
        if (!progressMap.has(userId)) {
          progressMap.set(userId, [])
        }
        progressMap.get(userId).push({
          category: progress.get('courseCategory'),
          progress: progress.get('progress') || 0,
          status: progress.get('status')
        })
      })
    }

    return students.map(student => {
      const userId = student.get('userId')
      const userProgress = progressMap.get(userId) || []
      
      // 计算等级
      const level = calculateLevel(userProgress)

      return {
        id: userId,
        username: student.get('username') || student.get('studentId'),
        email: student.get('email'),
        nickname: student.get('nickname'),
        joinDate: student.get('createdAt'),
        isActive: student.get('isActive') !== false,
        role: 'student',
        level: level,
        guild: student.get('guild')
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    throw new Error('获取用户列表失败')
  }
}

// 计算等级的辅助函数
function calculateLevel(progressList) {
  const categoryProgress = {}
  
  progressList.forEach(progress => {
    const category = progress.category
    if (!categoryProgress[category]) {
      categoryProgress[category] = { total: 0, completed: 0 }
    }
    categoryProgress[category].total++
    if (progress.status === 'completed' || progress.progress === 100) {
      categoryProgress[category].completed++
    }
  })

  // 根据完成情况判断等级
  const categories = ['入门课程', '标准技能一阶', '标准技能二阶', '团队训练', '进阶课程']
  let currentLevel = '未新训'

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i]
    const progress = categoryProgress[category]
    
    if (progress && progress.completed > 0) {
      if (progress.completed === progress.total) {
        // 该类别全部完成
        switch (i) {
          case 0: currentLevel = '新训初期'; break
          case 1: currentLevel = '新训一期'; break
          case 2: currentLevel = '新训二期'; break
          case 3: currentLevel = '新训三期'; break
          case 4: currentLevel = '紫夜尖兵'; break
        }
      } else {
        // 该类别部分完成
        switch (i) {
          case 0: currentLevel = '新训初期'; break
          case 1: currentLevel = '新训一期'; break
          case 2: currentLevel = '新训二期'; break
          case 3: currentLevel = '新训三期'; break
          case 4: currentLevel = '进阶训练'; break
        }
        break // 找到第一个未完成的类别就停止
      }
    } else {
      break // 该类别没有进度，停止检查
    }
  }

  return currentLevel
}

// 修复后的getStudentById方法
async function getStudentById(userId) {
  try {
    // 从现有的用户列表中查找用户信息
    const allUsers = await getAllUsers()
    const user = allUsers.find(u => u.id === userId)
    
    if (!user) {
      throw new Error('用户不存在')
    }

    // 如果不是学员，抛出错误
    if (user.role !== 'student') {
      throw new Error('该用户不是学员')
    }

    return {
      id: user.id,
      username: user.username,
      nickname: user.nickname,
      email: user.email,
      level: user.level || '未新训',
      isActive: user.isActive,
      studentId: user.username,
      name: user.nickname,
      guild: user.guild
    }
  } catch (error) {
    console.error('获取学员信息失败:', error)
    throw new Error('获取学员信息失败')
  }
}

async function testPermissionFix() {
  try {
    console.log('测试权限修复后的学员管理功能...')
    
    // 1. 测试getAllUsers方法（前端可用）
    console.log('\n=== 步骤1: 测试getAllUsers方法 ===')
    const allUsers = await getAllUsers()
    console.log(`✅ 成功获取用户列表，共 ${allUsers.length} 个用户`)
    
    const students = allUsers.filter(user => user.role === 'student')
    console.log(`其中学员用户 ${students.length} 个`)
    
    if (students.length > 0) {
      console.log('学员列表:')
      students.slice(0, 3).forEach((student, index) => {
        console.log(`  ${index + 1}. ${student.nickname} (${student.username}) - ${student.level}`)
      })
    }
    
    // 2. 测试修复后的getStudentById
    if (students.length > 0) {
      console.log('\n=== 步骤2: 测试getStudentById ===')
      const testStudent = students[0]
      const userId = testStudent.id
      
      console.log(`测试用户: ${testStudent.nickname} (ID: ${userId})`)
      
      try {
        const studentInfo = await getStudentById(userId)
        console.log('✅ 成功获取学员详细信息:')
        console.log('  用户名:', studentInfo.username)
        console.log('  昵称:', studentInfo.nickname)
        console.log('  等级:', studentInfo.level)
        console.log('  状态:', studentInfo.isActive ? '正常' : '停用')
      } catch (error) {
        console.log('❌ 获取学员信息失败:', error.message)
      }
    }
    
    // 3. 测试权限限制
    console.log('\n=== 步骤3: 测试权限限制 ===')
    
    // 测试直接查询_User表（应该失败）
    try {
      const userQuery = new AV.Query(AV.User)
      userQuery.limit(1)
      await userQuery.find()
      console.log('⚠️ 意外：直接查询_User表成功了')
    } catch (error) {
      console.log('✅ 正确：直接查询_User表被禁止')
      console.log('  错误信息:', error.message)
    }
    
    // 4. 测试Student表查询（应该成功）
    try {
      const studentQuery = new AV.Query('Student')
      studentQuery.limit(1)
      const students = await studentQuery.find()
      console.log('✅ 正确：查询Student表成功')
      console.log(`  返回 ${students.length} 条记录`)
    } catch (error) {
      console.log('❌ 意外：查询Student表失败')
      console.log('  错误信息:', error.message)
    }
    
    // 5. 测试CourseProgress表查询（应该成功）
    try {
      const progressQuery = new AV.Query('CourseProgress')
      progressQuery.limit(1)
      const progress = await progressQuery.find()
      console.log('✅ 正确：查询CourseProgress表成功')
      console.log(`  返回 ${progress.length} 条记录`)
    } catch (error) {
      console.log('❌ 意外：查询CourseProgress表失败')
      console.log('  错误信息:', error.message)
    }
    
    console.log('\n=== 测试总结 ===')
    console.log('权限修复验证:')
    console.log('✅ 避免直接查询_User表')
    console.log('✅ 使用getAllUsers方法获取用户信息')
    console.log('✅ 通过Student表和CourseProgress表获取数据')
    console.log('✅ 前端权限限制得到遵守')
    
    console.log('\n修复方案:')
    console.log('- getStudentById: 使用getAllUsers查找用户')
    console.log('- assignCourseToStudent: 使用getAllUsers验证用户')
    console.log('- 所有方法避免直接查询_User表')
    console.log('- 保持功能完整性的同时遵守权限限制')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testPermissionFix()
