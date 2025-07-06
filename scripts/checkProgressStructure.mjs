// 检查CourseProgress表结构
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

async function checkProgressStructure() {
  try {
    console.log('检查CourseProgress表结构...')
    
    // 查询CourseProgress
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.include('course')
    const progressList = await progressQuery.find()
    
    console.log(`\n找到 ${progressList.length} 条进度记录:`)
    
    for (const progress of progressList) {
      console.log(`\n进度记录 ${progress.id}:`)
      console.log(`  userId: ${progress.get('userId')}`)
      console.log(`  courseId: ${progress.get('courseId')}`)
      console.log(`  courseName: ${progress.get('courseName')}`)
      console.log(`  courseCategory: ${progress.get('courseCategory')}`)
      console.log(`  courseOrder: ${progress.get('courseOrder')}`)
      console.log(`  status: ${progress.get('status')}`)
      
      // 检查course关联
      const course = progress.get('course')
      if (course) {
        console.log(`  关联课程: ${course.get('name')} (order: ${course.get('order')})`)
      } else {
        console.log(`  关联课程: 无`)
      }
      
      // 尝试查找对应的Student记录
      try {
        const studentQuery = new AV.Query('Student')
        const student = await studentQuery.get(progress.get('userId'))
        console.log(`  对应Student: ${student.get('nickname')} (真实userId: ${student.get('userId')})`)
      } catch (error) {
        console.log(`  Student查询失败: ${error.message}`)
        
        // 尝试作为_User ID查询
        try {
          const userQuery = new AV.Query(AV.User)
          const user = await userQuery.get(progress.get('userId'))
          console.log(`  对应_User: ${user.get('nickname')} (@${user.get('username')})`)
        } catch (userError) {
          console.log(`  _User查询也失败: ${userError.message}`)
        }
      }
    }
    
    // 查询Course表
    console.log('\n\n检查Course表:')
    const courseQuery = new AV.Query('Course')
    courseQuery.ascending('order')
    const courses = await courseQuery.find()
    
    console.log(`找到 ${courses.length} 门课程:`)
    courses.forEach(course => {
      console.log(`  ${course.id}: ${course.get('order')}. ${course.get('name')} (${course.get('category')})`)
    })
    
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkProgressStructure()
