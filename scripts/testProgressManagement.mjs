// 测试进度管理数据脚本
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'cCD4H1pwVQWoPETlxR5CLbQH-gzGzoHsz',
  appKey: 'BuI56qnGouF3lJ0KMGI14mpN',
  masterKey: 'IJrUg2qcKgy0KTnr3jKHgy6l',
  serverURL: 'https://ccd4h1pw.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

// 模拟LeanCloudService的getAllCourseProgress方法
async function getAllCourseProgress() {
  try {
    const query = new AV.Query('CourseProgress')
    query.include('course')
    const results = await query.find()

    // 获取所有唯一的用户ID（这些是_User表的ID）
    const userIds = [...new Set(results.map(p => p.get('userId')))]

    // 批量查询Student信息
    const userMap = new Map()

    try {
      const studentQuery = new AV.Query('Student')
      studentQuery.containedIn('userId', userIds) // 使用userId字段而不是objectId
      const students = await studentQuery.find()

      students.forEach(student => {
        const userId = student.get('userId')
        userMap.set(userId, {
          nickname: student.get('nickname') || student.get('name'),
          username: student.get('username') || student.get('studentId'),
          realUserId: userId // 真实的_User表ID
        })
      })
    } catch (error) {
      console.warn('无法查询Student表:', error)
    }

    return results.map(progress => {
      const userId = progress.get('userId')
      const userInfo = userMap.get(userId)
      const course = progress.get('course')

      return {
        id: progress.id,
        userId: userId, // 直接使用_User表的ID
        userName: userInfo ? (userInfo.nickname || userInfo.username) : `用户${userId.slice(-6)}`,
        courseId: progress.get('courseId'),
        courseName: course ? course.get('name') : progress.get('courseName') || '',
        courseCategory: course ? course.get('category') : progress.get('courseCategory') || '',
        completedLessons: progress.get('completedLessons'),
        totalLessons: course ? course.get('totalLessons') : progress.get('totalLessons'),
        progress: progress.get('progress'),
        lastStudyDate: progress.get('lastStudyDate'),
        status: progress.get('status'),
        notes: progress.get('notes'),
        courseOrder: course ? course.get('order') : (progress.get('courseOrder') || 1)
      }
    })
  } catch (error) {
    throw new Error('获取进度数据失败')
  }
}

async function testProgressManagement() {
  try {
    console.log('测试进度管理数据获取...')
    
    const progressData = await getAllCourseProgress()
    
    console.log(`\n获取到 ${progressData.length} 条进度记录:`)
    
    progressData.forEach(progress => {
      console.log(`\n进度记录:`)
      console.log(`  ID: ${progress.id}`)
      console.log(`  用户ID: ${progress.userId}`)
      console.log(`  用户名: ${progress.userName}`)
      console.log(`  课程: ${progress.courseName}`)
      console.log(`  状态: ${progress.status}`)
      console.log(`  进度: ${progress.progress}%`)
    })
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testProgressManagement()
