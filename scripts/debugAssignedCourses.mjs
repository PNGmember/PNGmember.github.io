// 调试已分配课程显示问题
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

async function debugAssignedCourses() {
  try {
    console.log('调试已分配课程显示问题...')
    
    // 1. 查询所有学员用户
    console.log('\n1. 查询学员用户:')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    console.log(`找到 ${students.length} 名学员:`)
    students.forEach(student => {
      console.log(`  ${student.id}: ${student.get('nickname')} (@${student.get('username')})`)
    })
    
    // 2. 查询Student表
    console.log('\n2. 查询Student表:')
    const studentTableQuery = new AV.Query('Student')
    const studentRecords = await studentTableQuery.find()
    
    console.log(`找到 ${studentRecords.length} 条Student记录:`)
    const userToStudentMap = new Map()
    studentRecords.forEach(record => {
      const userId = record.get('userId')
      const studentId = record.id
      userToStudentMap.set(userId, studentId)
      console.log(`  Student ID: ${studentId} -> User ID: ${userId} (${record.get('nickname')})`)
    })
    
    // 3. 查询CourseProgress表
    console.log('\n3. 查询CourseProgress表:')
    const progressQuery = new AV.Query('CourseProgress')
    const progressRecords = await progressQuery.find()
    
    console.log(`找到 ${progressRecords.length} 条进度记录:`)
    const studentCourseMap = new Map()
    progressRecords.forEach(progress => {
      const studentId = progress.get('userId')
      const courseId = progress.get('courseId')
      const courseName = progress.get('courseName')
      
      if (!studentCourseMap.has(studentId)) {
        studentCourseMap.set(studentId, [])
      }
      studentCourseMap.get(studentId).push({
        courseId,
        courseName
      })
      
      console.log(`  进度记录: Student ID ${studentId} -> 课程 ${courseName}`)
    })
    
    // 4. 测试getBatchUserAssignedCourses逻辑
    console.log('\n4. 测试getBatchUserAssignedCourses逻辑:')
    const userIds = students.map(s => s.id)
    
    // 模拟getBatchUserAssignedCourses方法
    const result = new Map()
    userToStudentMap.forEach((studentId, userId) => {
      const courses = studentCourseMap.get(studentId) || []
      result.set(userId, courses.map(c => c.courseId))
      console.log(`  User ${userId} -> Student ${studentId} -> ${courses.length} 门课程`)
      courses.forEach(course => {
        console.log(`    - ${course.courseName}`)
      })
    })
    
    // 5. 验证前端显示逻辑
    console.log('\n5. 前端显示验证:')
    students.forEach(student => {
      const userId = student.id
      const assignedCourses = result.get(userId) || []
      console.log(`  ${student.get('nickname')}: ${assignedCourses.length} 门课程`)
      
      if (assignedCourses.length === 0) {
        console.log(`    ⚠️  显示0门课程的原因分析:`)
        const studentId = userToStudentMap.get(userId)
        if (!studentId) {
          console.log(`      - 未找到对应的Student记录`)
        } else {
          const courses = studentCourseMap.get(studentId)
          if (!courses || courses.length === 0) {
            console.log(`      - Student记录存在但无CourseProgress记录`)
          } else {
            console.log(`      - 数据存在但映射逻辑有问题`)
          }
        }
      }
    })
    
    console.log('\n调试完成！')
    
  } catch (error) {
    console.error('调试失败:', error)
  }
}

debugAssignedCourses()
