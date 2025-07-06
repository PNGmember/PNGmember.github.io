// 测试修复后的getAllUsers方法
import AV from 'leancloud-storage'

// 初始化LeanCloud（模拟前端环境，不使用MasterKey）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 复制修复后的getAllUsers方法
async function getAllUsers() {
  try {
    // 前端环境下，我们使用Student表来获取学生用户信息
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const students = await studentQuery.find()

    return students.map(student => ({
      id: student.get('userId'), // 返回_User表的ID，不是Student表的ID
      username: student.get('username') || student.get('studentId'),
      email: student.get('email') || '',
      nickname: student.get('nickname') || student.get('name'),
      joinDate: student.get('createdAt'),
      isActive: student.get('isActive') !== false,
      role: 'student',
      permissions: [],
      // 额外的学员信息
      studentId: student.get('studentId'),
      level: student.get('level')
    }))
  } catch (error) {
    console.error('获取用户列表失败:', error)
    // 如果Student表不存在，返回空数组
    return []
  }
}

// 复制getBatchUserAssignedCourses方法
async function getBatchUserAssignedCourses(userIds) {
  try {
    console.log('开始执行getBatchUserAssignedCourses...')
    console.log('输入的userIds:', userIds)
    
    // 批量查询Student记录
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
    })
    
    // 批量查询所有进度记录
    const studentIds = Array.from(userToStudentMap.values())
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.containedIn('userId', studentIds)
    progressQuery.select(['userId', 'courseId'])
    const progressList = await progressQuery.find()
    
    console.log(`找到 ${progressList.length} 条进度记录`)
    
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
      const courses = studentCourseMap.get(studentId) || []
      result.set(userId, courses)
    })
    
    return result
  } catch (error) {
    console.error('getBatchUserAssignedCourses失败:', error)
    return new Map()
  }
}

async function testFixedGetAllUsers() {
  try {
    console.log('测试修复后的getAllUsers方法...')
    
    // 测试getAllUsers方法
    console.log('\n1. 测试getAllUsers方法:')
    const users = await getAllUsers()
    
    console.log(`找到 ${users.length} 名学员:`)
    users.forEach(user => {
      console.log(`  ${user.nickname} (@${user.username}): User ID = ${user.id}`)
    })
    
    // 测试getBatchUserAssignedCourses方法
    console.log('\n2. 测试getBatchUserAssignedCourses方法:')
    const userIds = users.map(u => u.id)
    const assignedCoursesMap = await getBatchUserAssignedCourses(userIds)
    
    console.log('\n3. 最终结果:')
    users.forEach(user => {
      const assignedCourses = assignedCoursesMap.get(user.id) || []
      console.log(`  ${user.nickname}: ${assignedCourses.length} 门课程`)
    })
    
    console.log('\n测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testFixedGetAllUsers()
