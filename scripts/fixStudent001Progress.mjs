// 修复学员001的入门课程进度
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

async function fixStudent001Progress() {
  try {
    console.log('修复学员001的入门课程进度...')
    
    // 1. 获取学员001的用户ID
    console.log('\n=== 步骤1: 获取学员001信息 ===')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', 'student001')
    const user001 = await userQuery.first()
    
    if (!user001) {
      console.log('❌ 未找到学员001')
      return
    }
    
    const userId = user001.id
    console.log(`找到学员001: ${user001.get('nickname')} (ID: ${userId})`)
    
    // 2. 获取所有入门课程
    console.log('\n=== 步骤2: 获取所有入门课程 ===')
    const courseQuery = new AV.Query('Course')
    courseQuery.equalTo('category', '入门课程')
    courseQuery.ascending('order')
    const beginnerCourses = await courseQuery.find()
    
    console.log(`找到 ${beginnerCourses.length} 门入门课程`)
    
    // 3. 获取现有的进度记录
    console.log('\n=== 步骤3: 获取现有进度记录 ===')
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    const existingProgress = await progressQuery.find()
    
    const assignedCourseIds = existingProgress.map(p => p.get('courseId'))
    console.log(`现有进度记录: ${existingProgress.length} 条`)
    
    // 4. 分配未分配的课程
    console.log('\n=== 步骤4: 分配未分配的课程 ===')
    const unassignedCourses = beginnerCourses.filter(course => 
      !assignedCourseIds.includes(course.id)
    )
    
    console.log(`需要分配 ${unassignedCourses.length} 门课程`)
    
    for (const course of unassignedCourses) {
      try {
        const CourseProgress = AV.Object.extend('CourseProgress')
        const progress = new CourseProgress()
        
        progress.set('userId', userId)
        progress.set('courseId', course.id)
        progress.set('courseName', course.get('name'))
        progress.set('courseCategory', course.get('category'))
        progress.set('courseOrder', course.get('order'))
        progress.set('progress', 100)  // 设置为已完成
        progress.set('status', 'completed')  // 设置为已完成状态
        progress.set('lastStudyDate', new Date())  // 设置最后学习时间
        
        await progress.save()
        
        const courseNumber = getCourseNumber(course.get('order'))
        console.log(`✅ 已分配并完成: [${courseNumber}] ${course.get('name')}`)
        
      } catch (error) {
        console.log(`❌ 分配失败: ${course.get('name')} - ${error.message}`)
      }
    }
    
    // 5. 更新现有进度记录为已完成
    console.log('\n=== 步骤5: 更新现有进度记录 ===')
    
    for (const progress of existingProgress) {
      try {
        // 检查是否是入门课程
        const courseCategory = progress.get('courseCategory')
        if (courseCategory === '入门课程') {
          progress.set('progress', 100)
          progress.set('status', 'completed')
          progress.set('lastStudyDate', new Date())
          
          await progress.save()
          
          const courseNumber = getCourseNumber(progress.get('courseOrder'))
          console.log(`✅ 已更新: [${courseNumber}] ${progress.get('courseName')} -> 100% (completed)`)
        }
      } catch (error) {
        console.log(`❌ 更新失败: ${progress.get('courseName')} - ${error.message}`)
      }
    }
    
    // 6. 验证修复结果
    console.log('\n=== 步骤6: 验证修复结果 ===')
    
    // 重新查询进度记录
    const updatedProgressQuery = new AV.Query('CourseProgress')
    updatedProgressQuery.equalTo('userId', userId)
    updatedProgressQuery.equalTo('courseCategory', '入门课程')
    updatedProgressQuery.ascending('courseOrder')
    const updatedProgress = await updatedProgressQuery.find()
    
    console.log(`修复后的入门课程进度 (${updatedProgress.length}门):`)
    updatedProgress.forEach((progress, index) => {
      const courseNumber = getCourseNumber(progress.get('courseOrder'))
      const progressValue = progress.get('progress')
      const status = progress.get('status')
      const lastStudy = progress.get('lastStudyDate') ? 
        new Date(progress.get('lastStudyDate')).toLocaleString() : '从未学习'
      
      console.log(`  ${index + 1}. [${courseNumber}] ${progress.get('courseName')}`)
      console.log(`     进度: ${progressValue}% | 状态: ${status} | 最后学习: ${lastStudy}`)
    })
    
    // 7. 检查等级计算
    console.log('\n=== 步骤7: 检查等级计算 ===')
    
    const allCompletedCount = updatedProgress.filter(p => 
      p.get('progress') === 100 || p.get('status') === 'completed'
    ).length
    
    console.log(`已完成的入门课程: ${allCompletedCount}/${beginnerCourses.length}`)
    
    if (allCompletedCount === beginnerCourses.length) {
      console.log('✅ 所有入门课程已完成，学员应该达到"新训一期"等级')
      
      // 更新Student表中的等级
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', userId)
      const studentRecord = await studentQuery.first()
      
      if (studentRecord) {
        studentRecord.set('level', '新训一期')
        await studentRecord.save()
        console.log('✅ 已更新Student表中的等级为"新训一期"')
      }
    } else {
      console.log('⚠️ 还有未完成的入门课程')
    }
    
    console.log('\n=== 修复完成 ===')
    console.log('修复内容:')
    console.log(`- 分配了 ${unassignedCourses.length} 门未分配的入门课程`)
    console.log(`- 更新了 ${existingProgress.length} 条现有进度记录`)
    console.log('- 所有入门课程进度设置为100%，状态为completed')
    console.log('- 更新了最后学习时间')
    console.log('- 更新了学员等级')
    
  } catch (error) {
    console.error('修复失败:', error)
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

fixStudent001Progress()
