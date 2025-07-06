// 测试进度管理修复
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

// 复制getCourseNumber函数
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

async function testProgressFix() {
  try {
    console.log('测试进度管理修复...')
    
    // 模拟修复后的getAllCourseProgress逻辑
    const query = new AV.Query('CourseProgress')
    query.include('course')
    const results = await query.find()

    // 获取所有唯一的用户ID（这些是Student表的ID）
    const studentIds = [...new Set(results.map(p => p.get('userId')))]
    
    // 批量查询Student信息
    const userMap = new Map()
    
    try {
      const studentQuery = new AV.Query('Student')
      studentQuery.containedIn('objectId', studentIds)
      const students = await studentQuery.find()
      
      students.forEach(student => {
        userMap.set(student.id, {
          nickname: student.get('nickname') || student.get('name'),
          username: student.get('username') || student.get('studentId'),
          realUserId: student.get('userId') // 真实的_User表ID
        })
      })
    } catch (error) {
      console.warn('无法查询Student表:', error)
    }

    console.log(`\n找到 ${results.length} 条进度记录:`)
    
    const processedResults = results.map(progress => {
      const studentId = progress.get('userId')
      const userInfo = userMap.get(studentId)
      const course = progress.get('course')
      
      return {
        id: progress.id,
        userId: userInfo?.realUserId || studentId,
        userName: userInfo ? (userInfo.nickname || userInfo.username) : `用户${studentId.slice(-6)}`,
        courseId: progress.get('courseId'),
        courseName: course ? course.get('name') : progress.get('courseName') || '',
        courseCategory: course ? course.get('category') : progress.get('courseCategory') || '',
        courseOrder: course ? course.get('order') : (progress.get('courseOrder') || 1)
      }
    })
    
    processedResults.forEach(progress => {
      const courseNumber = getCourseNumber(progress.courseOrder)
      console.log(`\n进度记录:`)
      console.log(`  学员: ${progress.userName}`)
      console.log(`  课程: ${courseNumber} ${progress.courseName}`)
      console.log(`  类别: ${progress.courseCategory}`)
      console.log(`  原始order: ${progress.courseOrder}`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testProgressFix()
