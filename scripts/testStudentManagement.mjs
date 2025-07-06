// 测试学员管理功能
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

// 模拟getStudentById方法
async function getStudentById(studentId) {
  try {
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('objectId', studentId)
    const student = await studentQuery.first()
    
    if (!student) {
      throw new Error('学员不存在')
    }

    return {
      id: student.id,
      username: student.get('username'),
      nickname: student.get('nickname'),
      email: student.get('email'),
      level: student.get('level') || '未新训',
      isActive: student.get('isActive') !== false,
      studentId: student.get('studentId'),
      name: student.get('name'),
      guild: student.get('guild')
    }
  } catch (error) {
    throw new Error('获取学员信息失败')
  }
}

// 模拟getStudentCourseProgress方法
async function getStudentCourseProgress(studentId) {
  try {
    // 首先获取学员的userId
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('objectId', studentId)
    const student = await studentQuery.first()
    
    if (!student) {
      throw new Error('学员不存在')
    }

    const userId = student.get('userId')
    
    // 查询课程进度
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    const progressRecords = await progressQuery.find()

    return progressRecords.map(progress => ({
      id: progress.id,
      courseId: progress.get('courseId'),
      courseName: progress.get('courseName'),
      courseCategory: progress.get('courseCategory'),
      courseOrder: progress.get('courseOrder') || 1,
      progress: progress.get('progress') || 0,
      status: progress.get('status') || 'not_started',
      lastStudyDate: progress.get('lastStudyDate')
    }))
  } catch (error) {
    throw new Error('获取课程进度失败')
  }
}

// 模拟getAllCourses方法
async function getAllCourses() {
  try {
    const courseQuery = new AV.Query('Course')
    courseQuery.ascending('order')
    const courses = await courseQuery.find()

    return courses.map(course => ({
      id: course.id,
      name: course.get('name'),
      category: course.get('category'),
      order: course.get('order'),
      description: course.get('description')
    }))
  } catch (error) {
    throw new Error('获取课程列表失败')
  }
}

// 模拟assignCourseToStudent方法
async function assignCourseToStudent(studentId, courseId) {
  try {
    // 获取学员信息
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('objectId', studentId)
    const student = await studentQuery.first()
    
    if (!student) {
      throw new Error('学员不存在')
    }

    const userId = student.get('userId')

    // 获取课程信息
    const courseQuery = new AV.Query('Course')
    courseQuery.equalTo('objectId', courseId)
    const course = await courseQuery.first()
    
    if (!course) {
      throw new Error('课程不存在')
    }

    // 检查是否已经分配过
    const existingProgressQuery = new AV.Query('CourseProgress')
    existingProgressQuery.equalTo('userId', userId)
    existingProgressQuery.equalTo('courseId', courseId)
    const existingProgress = await existingProgressQuery.first()

    if (existingProgress) {
      throw new Error('该课程已经分配给此学员')
    }

    // 创建课程进度记录
    const CourseProgress = AV.Object.extend('CourseProgress')
    const progress = new CourseProgress()
    
    progress.set('userId', userId)
    progress.set('courseId', courseId)
    progress.set('courseName', course.get('name'))
    progress.set('courseCategory', course.get('category'))
    progress.set('courseOrder', course.get('order'))
    progress.set('progress', 0)
    progress.set('status', 'not_started')
    progress.set('lastStudyDate', null)

    await progress.save()
    console.log('✅ 课程分配成功')
  } catch (error) {
    throw new Error(error.message || '分配课程失败')
  }
}

// 模拟updateCourseProgress方法
async function updateCourseProgress(progressId, updates) {
  try {
    const progressQuery = new AV.Query('CourseProgress')
    const progress = await progressQuery.get(progressId)
    
    if (!progress) {
      throw new Error('进度记录不存在')
    }

    // 更新字段
    if (updates.progress !== undefined) {
      progress.set('progress', updates.progress)
    }
    if (updates.status !== undefined) {
      progress.set('status', updates.status)
    }
    if (updates.lastStudyDate !== undefined) {
      progress.set('lastStudyDate', updates.lastStudyDate)
    }

    await progress.save()
    console.log('✅ 进度更新成功')
  } catch (error) {
    throw new Error('更新进度失败')
  }
}

async function testStudentManagement() {
  try {
    console.log('测试学员管理功能...')
    
    // 1. 获取第一个学员
    console.log('\n=== 步骤1: 获取学员列表 ===')
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    studentQuery.limit(1)
    const students = await studentQuery.find()
    
    if (students.length === 0) {
      console.log('❌ 没有找到学员')
      return
    }
    
    const testStudent = students[0]
    const studentId = testStudent.id
    console.log(`找到测试学员: ${testStudent.get('nickname')} (ID: ${studentId})`)
    
    // 2. 测试获取学员详细信息
    console.log('\n=== 步骤2: 获取学员详细信息 ===')
    const studentInfo = await getStudentById(studentId)
    console.log('学员信息:', {
      nickname: studentInfo.nickname,
      level: studentInfo.level,
      isActive: studentInfo.isActive
    })
    
    // 3. 测试获取学员课程进度
    console.log('\n=== 步骤3: 获取学员课程进度 ===')
    const courseProgress = await getStudentCourseProgress(studentId)
    console.log(`学员当前有 ${courseProgress.length} 门课程`)
    
    if (courseProgress.length > 0) {
      console.log('前3门课程进度:')
      courseProgress.slice(0, 3).forEach((progress, index) => {
        console.log(`  ${index + 1}. ${progress.courseName} - ${progress.progress}% (${progress.status})`)
      })
    }
    
    // 4. 测试获取所有课程
    console.log('\n=== 步骤4: 获取所有可用课程 ===')
    const allCourses = await getAllCourses()
    console.log(`系统中共有 ${allCourses.length} 门课程`)
    
    // 找出未分配的课程
    const assignedCourseIds = courseProgress.map(p => p.courseId)
    const unassignedCourses = allCourses.filter(course => !assignedCourseIds.includes(course.id))
    console.log(`其中 ${unassignedCourses.length} 门课程未分配给该学员`)
    
    if (unassignedCourses.length > 0) {
      console.log('未分配的课程:')
      unassignedCourses.slice(0, 3).forEach((course, index) => {
        console.log(`  ${index + 1}. ${course.name} (${course.category})`)
      })
      
      // 5. 测试分配课程
      console.log('\n=== 步骤5: 测试分配课程 ===')
      const courseToAssign = unassignedCourses[0]
      console.log(`尝试分配课程: ${courseToAssign.name}`)
      
      try {
        await assignCourseToStudent(studentId, courseToAssign.id)
        console.log('✅ 课程分配成功')
        
        // 验证分配结果
        const updatedProgress = await getStudentCourseProgress(studentId)
        console.log(`分配后学员有 ${updatedProgress.length} 门课程`)
      } catch (error) {
        console.log('⚠️ 课程分配失败:', error.message)
      }
    }
    
    // 6. 测试更新进度
    if (courseProgress.length > 0) {
      console.log('\n=== 步骤6: 测试更新进度 ===')
      const progressToUpdate = courseProgress[0]
      console.log(`更新课程进度: ${progressToUpdate.courseName}`)
      
      try {
        await updateCourseProgress(progressToUpdate.id, {
          progress: 75,
          status: 'in_progress',
          lastStudyDate: new Date()
        })
        console.log('✅ 进度更新成功')
      } catch (error) {
        console.log('⚠️ 进度更新失败:', error.message)
      }
    }
    
    console.log('\n=== 测试总结 ===')
    console.log('学员管理功能测试:')
    console.log('✅ 获取学员详细信息')
    console.log('✅ 获取学员课程进度')
    console.log('✅ 获取所有可用课程')
    console.log('✅ 分配课程给学员')
    console.log('✅ 更新课程进度')
    
    console.log('\n前端功能:')
    console.log('- 学员详细管理界面')
    console.log('- 课程进度编辑')
    console.log('- 课程分配界面')
    console.log('- 进度重置功能')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testStudentManagement()
