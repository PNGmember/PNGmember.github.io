// 测试课程分配功能
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

// 模拟修复后的batchAssignCourses方法
async function batchAssignCourses(userIds, courseIds) {
  try {
    // 获取课程信息
    const courseQuery = new AV.Query('Course')
    courseQuery.containedIn('objectId', courseIds)
    const courses = await courseQuery.find()
    
    // 批量查询Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.containedIn('userId', userIds)
    const studentRecords = await studentQuery.find()
    
    // 创建User ID到Student ID的映射
    const userToStudentMap = new Map()
    studentRecords.forEach(student => {
      userToStudentMap.set(student.get('userId'), student.id)
    })
    
    const progressObjects = []
    
    for (const userId of userIds) {
      const studentId = userToStudentMap.get(userId)
      if (!studentId) {
        console.warn(`未找到用户 ${userId} 对应的Student记录，跳过`)
        continue
      }
      
      for (const course of courses) {
        // 检查是否已经分配过
        const existingQuery = new AV.Query('CourseProgress')
        existingQuery.equalTo('userId', studentId)
        existingQuery.equalTo('courseId', course.id)
        const existing = await existingQuery.first()
        
        if (!existing) {
          const progress = new AV.Object('CourseProgress')
          progress.set('userId', studentId) // 使用Student ID
          progress.set('courseId', course.id)
          progress.set('courseName', course.get('name'))
          progress.set('courseCategory', course.get('category'))
          progress.set('completedLessons', 0)
          progress.set('totalLessons', course.get('totalLessons'))
          progress.set('progress', 0)
          progress.set('lastStudyDate', new Date())
          progress.set('status', 'not_started')
          progress.set('notes', '')
          progress.set('courseOrder', course.get('order'))
          
          progressObjects.push(progress)
        }
      }
    }
    
    if (progressObjects.length > 0) {
      await AV.Object.saveAll(progressObjects)
    }
    
    return progressObjects.length
  } catch (error) {
    throw new Error('批量分配课程失败')
  }
}

async function testCourseAssignment() {
  try {
    console.log('测试课程分配功能...')
    
    // 获取学员002和003的User ID
    const userQuery = new AV.Query(AV.User)
    userQuery.containedIn('username', ['student002', 'student003'])
    const users = await userQuery.find()
    
    const userIds = users.map(u => u.id)
    console.log(`\n选择的学员:`)
    users.forEach(u => {
      console.log(`  ${u.get('nickname')} (@${u.get('username')}): ${u.id}`)
    })
    
    // 获取前5门课程的ID
    const courseQuery = new AV.Query('Course')
    courseQuery.ascending('order')
    courseQuery.limit(5)
    const courses = await courseQuery.find()
    
    const courseIds = courses.map(c => c.id)
    console.log(`\n选择的课程:`)
    courses.forEach(c => {
      console.log(`  ${c.get('order')}. ${c.get('name')}: ${c.id}`)
    })
    
    // 执行批量分配
    console.log(`\n开始分配课程...`)
    const assignedCount = await batchAssignCourses(userIds, courseIds)
    console.log(`✅ 成功分配了 ${assignedCount} 条课程进度记录`)
    
    // 验证分配结果
    console.log(`\n验证分配结果:`)
    for (const user of users) {
      console.log(`\n${user.get('nickname')}的课程:`)
      
      // 查找对应的Student记录
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', user.id)
      const student = await studentQuery.first()
      
      if (student) {
        // 查询分配的课程
        const progressQuery = new AV.Query('CourseProgress')
        progressQuery.equalTo('userId', student.id)
        const progressList = await progressQuery.find()
        
        progressList.forEach(progress => {
          const order = progress.get('courseOrder')
          const courseNumber = getCourseNumber(order)
          console.log(`  ${courseNumber} ${progress.get('courseName')} - ${progress.get('status')}`)
        })
      }
    }
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 生成课程编号的辅助函数
function getCourseNumber(order) {
  if (order >= 1 && order <= 7) {
    return `1.${order}`
  } else if (order >= 8 && order <= 13) {
    return `2.${order - 7}`
  } else if (order >= 14 && order <= 18) {
    return `3.${order - 13}`
  } else if (order >= 19 && order <= 23) {
    return `4.${order - 18}`
  } else if (order >= 24 && order <= 29) {
    return `5.${order - 23}`
  }
  return order.toString()
}

testCourseAssignment()
