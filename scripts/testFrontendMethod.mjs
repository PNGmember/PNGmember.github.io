// 测试前端getBatchUserAssignedCourses方法
import AV from 'leancloud-storage'

// 初始化LeanCloud（模拟前端环境，不使用MasterKey）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 不使用MasterKey，模拟前端环境

// 复制前端的getBatchUserAssignedCourses方法
async function getBatchUserAssignedCourses(userIds) {
  try {
    console.log('开始执行getBatchUserAssignedCourses...')
    console.log('输入的userIds:', userIds)
    
    // 批量查询Student记录
    console.log('1. 查询Student记录...')
    const studentQuery = new AV.Query('Student')
    studentQuery.containedIn('userId', userIds)
    const studentRecords = await studentQuery.find()
    
    console.log(`找到 ${studentRecords.length} 条Student记录`)
    
    // 创建User ID到Student ID的映射
    const userToStudentMap = new Map()
    studentRecords.forEach(student => {
      const userId = student.get('userId')
      const studentId = student.id
      userToStudentMap.set(userId, studentId)
      console.log(`  映射: User ${userId} -> Student ${studentId}`)
    })
    
    // 批量查询所有进度记录
    console.log('2. 查询CourseProgress记录...')
    const studentIds = Array.from(userToStudentMap.values())
    console.log('Student IDs:', studentIds)
    
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.containedIn('userId', studentIds)
    progressQuery.select(['userId', 'courseId'])
    const progressList = await progressQuery.find()
    
    console.log(`找到 ${progressList.length} 条进度记录`)
    
    // 按Student ID分组
    console.log('3. 按Student ID分组...')
    const studentCourseMap = new Map()
    progressList.forEach(progress => {
      const studentId = progress.get('userId')
      const courseId = progress.get('courseId')
      
      if (!studentCourseMap.has(studentId)) {
        studentCourseMap.set(studentId, [])
      }
      studentCourseMap.get(studentId).push(courseId)
      console.log(`  Student ${studentId} -> 课程 ${courseId}`)
    })
    
    // 转换为User ID映射
    console.log('4. 转换为User ID映射...')
    const result = new Map()
    userToStudentMap.forEach((studentId, userId) => {
      const courses = studentCourseMap.get(studentId) || []
      result.set(userId, courses)
      console.log(`  最终结果: User ${userId} -> ${courses.length} 门课程`)
    })
    
    return result
  } catch (error) {
    console.error('getBatchUserAssignedCourses失败:', error)
    return new Map()
  }
}

async function testFrontendMethod() {
  try {
    console.log('测试前端getBatchUserAssignedCourses方法...')
    
    // 获取学员用户ID
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    const userIds = students.map(s => s.id)
    console.log('\n学员用户IDs:', userIds)
    
    // 测试getBatchUserAssignedCourses方法
    console.log('\n开始测试getBatchUserAssignedCourses方法:')
    const result = await getBatchUserAssignedCourses(userIds)
    
    console.log('\n最终结果:')
    students.forEach(student => {
      const userId = student.id
      const assignedCourses = result.get(userId) || []
      console.log(`  ${student.get('nickname')}: ${assignedCourses.length} 门课程`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testFrontendMethod()
