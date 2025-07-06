// 测试等级计算功能
import AV from 'leancloud-storage'

// 初始化LeanCloud（模拟前端环境，不使用MasterKey）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制等级计算方法
function calculateMemberLevel(courseProgress) {
  const completedCourses = courseProgress.filter(p => p.status === 'completed')

  // 按课程类别统计完成情况
  const completedByCategory = {
    '入门课程': completedCourses.filter(p => p.courseCategory === '入门课程').length,
    '标准技能一阶课程': completedCourses.filter(p => p.courseCategory === '标准技能一阶课程').length,
    '标准技能二阶课程': completedCourses.filter(p => p.courseCategory === '标准技能二阶课程').length,
    '团队训练': completedCourses.filter(p => p.courseCategory === '团队训练').length,
    '进阶课程': completedCourses.filter(p => p.courseCategory === '进阶课程').length
  }

  // 总课程数量
  const totalByCategory = {
    '入门课程': 7,
    '标准技能一阶课程': 6,
    '标准技能二阶课程': 5,
    '团队训练': 5,
    '进阶课程': 6
  }

  // 判断等级
  if (completedByCategory['进阶课程'] === totalByCategory['进阶课程']) {
    return {
      level: '紫夜尖兵',
      description: '已完成所有进阶课程，成为紫夜公会的精英成员',
      requirements: ['完成所有进阶课程(6/6)']
    }
  } else if (completedByCategory['团队训练'] === totalByCategory['团队训练']) {
    return {
      level: '新训准考',
      description: '已完成团队训练，准备参加新训考核',
      requirements: ['完成所有团队训练课程(5/5)']
    }
  } else if (completedByCategory['标准技能二阶课程'] === totalByCategory['标准技能二阶课程']) {
    return {
      level: '新训三期',
      description: '已完成标准技能二阶课程',
      requirements: ['完成所有标准技能二阶课程(5/5)']
    }
  } else if (completedByCategory['标准技能一阶课程'] === totalByCategory['标准技能一阶课程']) {
    return {
      level: '新训二期',
      description: '已完成标准技能一阶课程',
      requirements: ['完成所有标准技能一阶课程(6/6)']
    }
  } else if (completedByCategory['入门课程'] === totalByCategory['入门课程']) {
    return {
      level: '新训一期',
      description: '已完成入门课程',
      requirements: ['完成所有入门课程(7/7)']
    }
  } else if (completedByCategory['入门课程'] > 0) {
    return {
      level: '新训初期',
      description: '已开始入门课程学习',
      requirements: [`已完成入门课程 ${completedByCategory['入门课程']}/7`]
    }
  } else {
    return {
      level: '未新训',
      description: '尚未开始任何课程',
      requirements: ['需要开始入门课程学习']
    }
  }
}

// 复制修改后的getAllUsers方法
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
        
        console.log(`找到 ${progressList.length} 条进度记录`)
        
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
              courseCategory: progress.get('courseCategory'),
              courseName: progress.get('courseName')
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
        id: userId,
        username: student.get('username') || student.get('studentId'),
        nickname: student.get('nickname') || student.get('name'),
        level: calculatedLevel,
        progressCount: userProgress.length,
        completedCount: userProgress.filter(p => p.status === 'completed').length
      }
    })
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return []
  }
}

async function testLevelCalculation() {
  try {
    console.log('测试等级计算功能...')
    
    const users = await getAllUsers()
    
    console.log(`\n找到 ${users.length} 名学员:`)
    users.forEach(user => {
      console.log(`\n${user.nickname} (@${user.username}):`)
      console.log(`  等级: ${user.level}`)
      console.log(`  总课程: ${user.progressCount} 门`)
      console.log(`  已完成: ${user.completedCount} 门`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testLevelCalculation()
