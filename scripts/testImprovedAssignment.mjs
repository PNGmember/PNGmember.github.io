// 测试改进后的课程分配功能
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

// 模拟getBatchUserAssignedCourses方法
async function getBatchUserAssignedCourses(userIds) {
  try {
    // 批量查询Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.containedIn('userId', userIds)
    const studentRecords = await studentQuery.find()
    
    // 创建User ID到Student ID的映射
    const userToStudentMap = new Map()
    studentRecords.forEach(student => {
      userToStudentMap.set(student.get('userId'), student.id)
    })
    
    // 批量查询所有进度记录
    const studentIds = Array.from(userToStudentMap.values())
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.containedIn('userId', studentIds)
    progressQuery.select(['userId', 'courseId'])
    const progressList = await progressQuery.find()
    
    // 按Student ID分组
    const studentCourseMap = new Map()
    progressList.forEach(progress => {
      const studentId = progress.get('userId')
      const courseId = progress.get('courseId')
      
      if (!studentCourseMap.has(studentId)) {
        studentCourseMap.set(studentId, [])
      }
      studentCourseMap.get(studentId).push(courseId)
    })
    
    // 转换为User ID映射
    const result = new Map()
    userToStudentMap.forEach((studentId, userId) => {
      result.set(userId, studentCourseMap.get(studentId) || [])
    })
    
    return result
  } catch (error) {
    console.warn('批量获取用户已分配课程失败:', error)
    return new Map()
  }
}

async function testImprovedAssignment() {
  try {
    console.log('测试改进后的课程分配功能...')
    
    // 1. 获取所有学员
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    console.log(`\n找到 ${students.length} 名学员:`)
    students.forEach(student => {
      console.log(`  ${student.get('nickname')} (@${student.get('username')}): ${student.id}`)
    })
    
    // 2. 获取所有课程
    const courseQuery = new AV.Query('Course')
    courseQuery.ascending('order')
    const courses = await courseQuery.find()
    
    console.log(`\n找到 ${courses.length} 门课程`)
    
    // 3. 获取所有学员的已分配课程
    const userIds = students.map(s => s.id)
    const assignedCoursesMap = await getBatchUserAssignedCourses(userIds)
    
    console.log(`\n各学员已分配课程情况:`)
    students.forEach(student => {
      const userId = student.id
      const assignedCourses = assignedCoursesMap.get(userId) || []
      console.log(`  ${student.get('nickname')}: ${assignedCourses.length} 门课程`)
    })
    
    // 4. 模拟选择学员002和004进行分配
    const selectedStudents = students.filter(s => 
      ['student002', 'student004'].includes(s.get('username'))
    )
    const selectedUserIds = selectedStudents.map(s => s.id)
    
    console.log(`\n选择的学员:`)
    selectedStudents.forEach(student => {
      const assignedCourses = assignedCoursesMap.get(student.id) || []
      console.log(`  ${student.get('nickname')}: 已分配 ${assignedCourses.length} 门课程`)
    })
    
    // 5. 分析课程分配状态
    console.log(`\n课程分配状态分析:`)
    courses.slice(0, 10).forEach(course => { // 只分析前10门课程
      const assignedCount = selectedUserIds.filter(userId => 
        assignedCoursesMap.get(userId)?.includes(course.id)
      ).length
      
      const isFullyAssigned = assignedCount === selectedUserIds.length && selectedUserIds.length > 0
      const isPartiallyAssigned = assignedCount > 0 && assignedCount < selectedUserIds.length
      
      let status = '可分配'
      if (isFullyAssigned) {
        status = '已全部分配'
      } else if (isPartiallyAssigned) {
        status = `部分已分配 (${assignedCount}/${selectedUserIds.length})`
      }
      
      console.log(`  ${getCourseNumber(course.get('order'))} ${course.get('name')}: ${status}`)
    })
    
    // 6. 计算可分配的课程数量
    const availableCourses = courses.filter(course => {
      const assignedCount = selectedUserIds.filter(userId => 
        assignedCoursesMap.get(userId)?.includes(course.id)
      ).length
      return assignedCount < selectedUserIds.length || selectedUserIds.length === 0
    })
    
    console.log(`\n可分配课程统计:`)
    console.log(`  总课程数: ${courses.length}`)
    console.log(`  可分配课程数: ${availableCourses.length}`)
    console.log(`  已全部分配课程数: ${courses.length - availableCourses.length}`)
    
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

testImprovedAssignment()
