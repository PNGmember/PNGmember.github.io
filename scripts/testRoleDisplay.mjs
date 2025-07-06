// 测试角色显示修复
import AV from 'leancloud-storage'

// 初始化LeanCloud（模拟前端环境，不使用MasterKey）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制getAllUsers方法
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
      try {
        // 批量查询Student记录
        const studentRecordsQuery = new AV.Query('Student')
        studentRecordsQuery.containedIn('userId', userIds)
        const studentRecords = await studentRecordsQuery.find()
        
        // 创建User ID到Student ID的映射
        const userToStudentMap = new Map()
        studentRecords.forEach(student => {
          userToStudentMap.set(student.get('userId'), student.id)
        })
        
        // 批量查询所有进度记录
        const studentIds = Array.from(userToStudentMap.values())
        const progressQuery = new AV.Query('CourseProgress')
        progressQuery.containedIn('userId', studentIds)
        const progressList = await progressQuery.find()
        
        // 按User ID分组进度记录
        progressList.forEach(progress => {
          const studentId = progress.get('userId')
          // 找到对应的User ID
          const userId = Array.from(userToStudentMap.entries())
            .find(([_, sId]) => sId === studentId)?.[0]
          
          if (userId) {
            if (!progressMap.has(userId)) {
              progressMap.set(userId, [])
            }
            progressMap.get(userId).push({
              status: progress.get('status'),
              courseCategory: progress.get('courseCategory')
            })
          }
        })
      } catch (error) {
        console.warn('获取课程进度失败:', error)
      }
    }

    return students.map(student => {
      const userId = student.get('userId')
      const userProgress = progressMap.get(userId) || []
      
      // 计算等级
      let calculatedLevel = '未新训'
      if (userProgress.length > 0) {
        const levelInfo = calculateMemberLevel(userProgress)
        calculatedLevel = levelInfo.level
      }

      return {
        id: userId, // 返回_User表的ID，不是Student表的ID
        username: student.get('username') || student.get('studentId'),
        email: student.get('email') || '',
        nickname: student.get('nickname') || student.get('name'),
        joinDate: student.get('createdAt'),
        isActive: student.get('isActive') !== false,
        role: 'student', // 硬编码为student
        permissions: [],
        // 额外的学员信息
        studentId: student.get('studentId'),
        level: calculatedLevel // 使用计算出的等级
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 如果Student表不存在，返回空数组
    return []
  }
}

// 简化的等级计算方法
function calculateMemberLevel(courseProgress) {
  const completedCourses = courseProgress.filter(p => p.status === 'completed')
  const completedByCategory = {
    '入门课程': completedCourses.filter(p => p.courseCategory === '入门课程').length,
  }
  
  if (completedByCategory['入门课程'] === 7) {
    return { level: '新训一期' }
  } else if (completedByCategory['入门课程'] > 0) {
    return { level: '新训初期' }
  } else {
    return { level: '未新训' }
  }
}

// 复制角色显示函数
function getRoleText(role) {
  switch (role) {
    case 'admin':
      return '管理员'
    case 'guild_admin':
      return '公会管理员'
    case 'super_admin':
      return '超级管理员'
    case 'instructor':
      return '教官'
    case 'student':
      return '学员'
    case 'member':
      return '成员'
    default:
      return '未知'
  }
}

function getRoleColor(role) {
  switch (role) {
    case 'admin':
    case 'guild_admin':
    case 'super_admin':
      return 'bg-red-100 text-red-800'
    case 'instructor':
      return 'bg-blue-100 text-blue-800'
    case 'student':
      return 'bg-green-100 text-green-800'
    case 'member':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

async function testRoleDisplay() {
  try {
    console.log('测试角色显示修复...')
    
    const users = await getAllUsers()
    
    console.log(`\n找到 ${users.length} 名用户:`)
    
    users.forEach(user => {
      const roleText = getRoleText(user.role)
      const roleColor = getRoleColor(user.role)
      
      console.log(`\n${user.nickname} (@${user.username}):`)
      console.log(`  角色: ${user.role} -> 显示为: ${roleText}`)
      console.log(`  样式: ${roleColor}`)
      console.log(`  等级: ${user.level}`)
      console.log(`  状态: ${user.isActive ? '激活' : '停用'}`)
    })
    
    // 统计各角色数量
    console.log(`\n角色统计:`)
    const roleStats = {}
    users.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1
    })
    
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`  ${getRoleText(role)}: ${count} 人`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testRoleDisplay()
