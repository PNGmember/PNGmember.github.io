// 检查学员001的实际进度数据
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

async function checkStudent001Progress() {
  try {
    console.log('检查学员001的进度数据...')
    
    // 1. 查找学员001的用户信息
    console.log('\n=== 步骤1: 查找学员001 ===')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', 'student001')
    const user001 = await userQuery.first()
    
    if (!user001) {
      console.log('❌ 未找到学员001')
      return
    }
    
    const userId = user001.id
    console.log(`找到学员001:`)
    console.log(`  User ID: ${userId}`)
    console.log(`  用户名: ${user001.get('username')}`)
    console.log(`  昵称: ${user001.get('nickname')}`)
    console.log(`  角色: ${user001.get('role')}`)
    console.log(`  公会: ${user001.get('guild')}`)
    
    // 2. 查找Student表记录
    console.log('\n=== 步骤2: 查找Student表记录 ===')
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const studentRecord = await studentQuery.first()
    
    if (studentRecord) {
      console.log(`找到Student记录:`)
      console.log(`  Student ID: ${studentRecord.id}`)
      console.log(`  昵称: ${studentRecord.get('nickname')}`)
      console.log(`  等级: ${studentRecord.get('level')}`)
      console.log(`  学员编号: ${studentRecord.get('studentId')}`)
      console.log(`  状态: ${studentRecord.get('isActive')}`)
    } else {
      console.log('⚠️ 未找到Student表记录')
    }
    
    // 3. 查找所有课程进度
    console.log('\n=== 步骤3: 查找课程进度 ===')
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    progressQuery.ascending('courseOrder')
    const progressRecords = await progressQuery.find()
    
    console.log(`找到 ${progressRecords.length} 条进度记录:`)
    
    if (progressRecords.length === 0) {
      console.log('❌ 没有找到任何课程进度记录')
      return
    }
    
    // 按类别分组显示
    const progressByCategory = {}
    progressRecords.forEach(progress => {
      const category = progress.get('courseCategory')
      if (!progressByCategory[category]) {
        progressByCategory[category] = []
      }
      progressByCategory[category].push({
        id: progress.id,
        courseName: progress.get('courseName'),
        courseOrder: progress.get('courseOrder'),
        progress: progress.get('progress'),
        status: progress.get('status'),
        lastStudyDate: progress.get('lastStudyDate'),
        createdAt: progress.get('createdAt'),
        updatedAt: progress.get('updatedAt')
      })
    })
    
    // 显示各类别的进度
    Object.keys(progressByCategory).forEach(category => {
      console.log(`\n${category}:`)
      progressByCategory[category].forEach((progress, index) => {
        const courseNumber = getCourseNumber(progress.courseOrder)
        const lastStudy = progress.lastStudyDate ? 
          new Date(progress.lastStudyDate).toLocaleString() : '从未学习'
        
        console.log(`  ${index + 1}. [${courseNumber}] ${progress.courseName}`)
        console.log(`     进度: ${progress.progress}%`)
        console.log(`     状态: ${progress.status}`)
        console.log(`     最后学习: ${lastStudy}`)
        console.log(`     创建时间: ${new Date(progress.createdAt).toLocaleString()}`)
        console.log(`     更新时间: ${new Date(progress.updatedAt).toLocaleString()}`)
        console.log(`     记录ID: ${progress.id}`)
      })
    })
    
    // 4. 检查入门课程的具体情况
    console.log('\n=== 步骤4: 入门课程详细检查 ===')
    const beginnerCourses = progressByCategory['入门课程'] || []
    
    if (beginnerCourses.length === 0) {
      console.log('❌ 没有找到入门课程进度')
    } else {
      console.log(`入门课程共 ${beginnerCourses.length} 门:`)
      
      beginnerCourses.forEach(course => {
        const courseNumber = getCourseNumber(course.courseOrder)
        console.log(`\n${courseNumber} - ${course.courseName}:`)
        console.log(`  进度值: ${course.progress} (类型: ${typeof course.progress})`)
        console.log(`  状态值: "${course.status}" (类型: ${typeof course.status})`)
        
        // 检查状态是否正确
        if (course.progress === 100 && course.status !== 'completed') {
          console.log(`  ⚠️ 数据不一致: 进度100%但状态不是completed`)
        }
        if (course.progress === 0 && course.status !== 'not_started') {
          console.log(`  ⚠️ 数据不一致: 进度0%但状态不是not_started`)
        }
      })
    }
    
    // 5. 检查前端显示逻辑
    console.log('\n=== 步骤5: 前端显示逻辑检查 ===')
    console.log('前端getStudentCourseProgress方法应该返回:')
    
    const frontendData = progressRecords.map(progress => ({
      id: progress.id,
      courseId: progress.get('courseId'),
      courseName: progress.get('courseName'),
      courseCategory: progress.get('courseCategory'),
      courseOrder: progress.get('courseOrder') || 1,
      progress: progress.get('progress') || 0,
      status: progress.get('status') || 'not_started',
      lastStudyDate: progress.get('lastStudyDate')
    }))
    
    frontendData.forEach(item => {
      const courseNumber = getCourseNumber(item.courseOrder)
      console.log(`${courseNumber} ${item.courseName}: ${item.progress}% (${item.status})`)
    })
    
    // 6. 总结问题
    console.log('\n=== 问题诊断 ===')
    
    const allCompleted = beginnerCourses.every(course => 
      course.progress === 100 || course.status === 'completed'
    )
    const allNotStarted = beginnerCourses.every(course => 
      course.progress === 0 || course.status === 'not_started'
    )
    
    if (allCompleted) {
      console.log('✅ 所有入门课程都已完成')
    } else if (allNotStarted) {
      console.log('❌ 所有入门课程都显示未开始 - 这可能是问题所在')
    } else {
      console.log('⚠️ 入门课程进度混合状态')
    }
    
    console.log('\n可能的问题:')
    console.log('1. 数据库中的进度值不正确')
    console.log('2. 前端显示逻辑有问题')
    console.log('3. 数据同步问题')
    console.log('4. 课程编号映射错误')
    
  } catch (error) {
    console.error('检查失败:', error)
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

checkStudent001Progress()
