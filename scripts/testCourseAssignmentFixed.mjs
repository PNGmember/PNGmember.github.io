// 测试修复后的课程分配功能
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

// 模拟getUserCourseProgress方法
async function getUserCourseProgress(userId) {
  try {
    // 直接使用_User ID查询CourseProgress
    const query = new AV.Query('CourseProgress')
    query.equalTo('userId', userId)
    query.include('course')
    const results = await query.find()

    return results.map(progress => {
      const course = progress.get('course')
      return {
        id: progress.id,
        userId: userId, // 返回原始的_User ID，保持接口一致性
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
    throw new Error('获取学习进度失败')
  }
}

async function testCourseAssignment() {
  try {
    console.log('测试课程分配功能...')
    
    // 测试用户ID（紫夜学员001）
    const testUserId = '6869eff7b9570274dfa2b41e'
    
    console.log(`\n1. 查询用户 ${testUserId} 的课程进度:`)
    const userProgress = await getUserCourseProgress(testUserId)
    
    console.log(`找到 ${userProgress.length} 门课程:`)
    userProgress.forEach(progress => {
      console.log(`  - ${progress.courseName} (${progress.courseId}) - 状态: ${progress.status}`)
    })
    
    console.log('\n2. 查询所有CourseProgress记录:')
    const allProgressQuery = new AV.Query('CourseProgress')
    const allProgress = await allProgressQuery.find()
    
    console.log(`总共有 ${allProgress.length} 条进度记录:`)
    allProgress.forEach(progress => {
      console.log(`  - 用户ID: ${progress.get('userId')} | 课程: ${progress.get('courseName')} | 状态: ${progress.get('status')}`)
    })
    
    console.log('\n3. 检查数据一致性:')
    const userProgressIds = userProgress.map(p => p.userId)
    const allProgressUserIds = allProgress.map(p => p.get('userId'))
    
    console.log('用户进度查询返回的用户ID:', userProgressIds)
    console.log('所有进度记录中的用户ID:', [...new Set(allProgressUserIds)])
    
    // 检查是否有匹配
    const hasMatch = allProgressUserIds.includes(testUserId)
    console.log(`测试用户ID ${testUserId} 在CourseProgress表中是否存在: ${hasMatch}`)
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testCourseAssignment()
