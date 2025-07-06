// 检查入门课程的完整情况
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

async function checkBeginnerCourses() {
  try {
    console.log('检查入门课程的完整情况...')
    
    // 1. 查看所有入门课程
    console.log('\n=== 步骤1: 查看所有入门课程 ===')
    const courseQuery = new AV.Query('Course')
    courseQuery.equalTo('category', '入门课程')
    courseQuery.ascending('order')
    const beginnerCourses = await courseQuery.find()
    
    console.log(`系统中共有 ${beginnerCourses.length} 门入门课程:`)
    beginnerCourses.forEach((course, index) => {
      const order = course.get('order')
      const courseNumber = getCourseNumber(order)
      console.log(`  ${index + 1}. [${courseNumber}] ${course.get('name')}`)
      console.log(`     课程ID: ${course.id}`)
      console.log(`     顺序: ${order}`)
      console.log(`     描述: ${course.get('description') || '无'}`)
    })
    
    // 2. 查看学员001的所有进度记录
    console.log('\n=== 步骤2: 查看学员001的所有进度记录 ===')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', 'student001')
    const user001 = await userQuery.first()
    
    if (!user001) {
      console.log('❌ 未找到学员001')
      return
    }
    
    const userId = user001.id
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    progressQuery.ascending('courseOrder')
    const allProgress = await progressQuery.find()
    
    console.log(`学员001共有 ${allProgress.length} 条进度记录:`)
    allProgress.forEach((progress, index) => {
      const order = progress.get('courseOrder')
      const courseNumber = getCourseNumber(order)
      console.log(`  ${index + 1}. [${courseNumber}] ${progress.get('courseName')} (${progress.get('courseCategory')})`)
      console.log(`     进度: ${progress.get('progress')}%`)
      console.log(`     状态: ${progress.get('status')}`)
      console.log(`     课程ID: ${progress.get('courseId')}`)
    })
    
    // 3. 对比分析
    console.log('\n=== 步骤3: 对比分析 ===')
    const assignedCourseIds = allProgress.map(p => p.get('courseId'))
    const beginnerCourseIds = beginnerCourses.map(c => c.id)
    
    console.log('入门课程分配情况:')
    beginnerCourses.forEach(course => {
      const isAssigned = assignedCourseIds.includes(course.id)
      const order = course.get('order')
      const courseNumber = getCourseNumber(order)
      const status = isAssigned ? '✅ 已分配' : '❌ 未分配'
      console.log(`  [${courseNumber}] ${course.get('name')}: ${status}`)
    })
    
    const unassignedCourses = beginnerCourses.filter(course => 
      !assignedCourseIds.includes(course.id)
    )
    
    if (unassignedCourses.length > 0) {
      console.log(`\n未分配的入门课程 (${unassignedCourses.length}门):`)
      unassignedCourses.forEach(course => {
        const order = course.get('order')
        const courseNumber = getCourseNumber(order)
        console.log(`  [${courseNumber}] ${course.get('name')}`)
      })
    }
    
    // 4. 检查是否有重复或错误的进度记录
    console.log('\n=== 步骤4: 检查数据一致性 ===')
    
    // 检查是否有重复的课程分配
    const courseIdCounts = {}
    allProgress.forEach(progress => {
      const courseId = progress.get('courseId')
      courseIdCounts[courseId] = (courseIdCounts[courseId] || 0) + 1
    })
    
    const duplicates = Object.entries(courseIdCounts).filter(([id, count]) => count > 1)
    if (duplicates.length > 0) {
      console.log('⚠️ 发现重复的课程分配:')
      duplicates.forEach(([courseId, count]) => {
        console.log(`  课程ID ${courseId}: ${count} 条记录`)
      })
    } else {
      console.log('✅ 没有重复的课程分配')
    }
    
    // 检查课程ID是否有效
    console.log('\n检查课程ID有效性:')
    for (const progress of allProgress) {
      const courseId = progress.get('courseId')
      const courseQuery = new AV.Query('Course')
      const course = await courseQuery.get(courseId)
      
      if (course) {
        console.log(`✅ 课程ID ${courseId} 有效: ${course.get('name')}`)
      } else {
        console.log(`❌ 课程ID ${courseId} 无效或已删除`)
      }
    }
    
    // 5. 建议修复方案
    console.log('\n=== 步骤5: 修复建议 ===')
    
    if (unassignedCourses.length > 0) {
      console.log('需要为学员001分配以下入门课程:')
      unassignedCourses.forEach(course => {
        const order = course.get('order')
        const courseNumber = getCourseNumber(order)
        console.log(`  [${courseNumber}] ${course.get('name')} (ID: ${course.id})`)
      })
      
      console.log('\n可以使用以下方法分配课程:')
      console.log('1. 在前端学员管理界面中逐个分配')
      console.log('2. 运行批量分配脚本')
      console.log('3. 手动创建CourseProgress记录')
    }
    
    // 检查现有进度是否需要更新
    const needsUpdate = allProgress.filter(progress => {
      const progressValue = progress.get('progress')
      const status = progress.get('status')
      
      // 如果您说已经完成了，但显示为0%/not_started，则需要更新
      return progressValue === 0 && status === 'not_started'
    })
    
    if (needsUpdate.length > 0) {
      console.log('\n需要更新进度的课程:')
      needsUpdate.forEach(progress => {
        const order = progress.get('courseOrder')
        const courseNumber = getCourseNumber(order)
        console.log(`  [${courseNumber}] ${progress.get('courseName')} - 当前: 0% (not_started)`)
      })
      
      console.log('\n建议更新为:')
      console.log('- 进度: 100%')
      console.log('- 状态: completed')
      console.log('- 最后学习时间: 当前时间')
    }
    
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

checkBeginnerCourses()
