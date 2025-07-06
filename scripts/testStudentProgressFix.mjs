// 测试学员进度修复
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

// 模拟修复后的getUserCourseProgress方法
async function getUserCourseProgress(userId) {
  try {
    // 首先通过_User ID查找对应的Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      console.warn(`未找到用户 ${userId} 对应的Student记录`)
      return []
    }
    
    const studentId = studentRecord.id
    
    // 使用Student ID查询CourseProgress
    const query = new AV.Query('CourseProgress')
    query.equalTo('userId', studentId)
    query.include('course')
    const results = await query.find()

    return results.map(progress => {
      const course = progress.get('course')
      return {
        id: progress.id,
        userId: userId, // 返回原始的_User ID
        courseId: progress.get('courseId'),
        courseName: course ? course.get('name') : progress.get('courseName') || '',
        courseCategory: course ? course.get('category') : progress.get('courseCategory') || '',
        progress: progress.get('progress'),
        status: progress.get('status'),
        courseOrder: course ? course.get('order') : (progress.get('courseOrder') || 1)
      }
    })
  } catch (error) {
    throw new Error('获取学习进度失败')
  }
}

async function testStudentProgressFix() {
  try {
    console.log('测试学员进度修复...')
    
    // 查询所有学员
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    console.log(`\n找到 ${students.length} 名学员:`)
    
    for (const student of students) {
      const userId = student.id
      const username = student.get('username')
      const nickname = student.get('nickname')
      
      console.log(`\n测试学员: ${nickname} (@${username})`)
      console.log(`  User ID: ${userId}`)
      
      try {
        const progress = await getUserCourseProgress(userId)
        console.log(`  ✅ 查询成功，找到 ${progress.length} 门课程:`)
        
        progress.forEach(p => {
          const courseNumber = getCourseNumber(p.courseOrder)
          console.log(`    - ${courseNumber} ${p.courseName}: ${p.progress}% (${p.status})`)
        })
        
        if (progress.length === 0) {
          console.log(`    📝 该学员暂无分配的课程`)
        }
      } catch (error) {
        console.log(`  ❌ 查询失败: ${error.message}`)
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

testStudentProgressFix()
