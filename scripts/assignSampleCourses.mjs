// 为学员分配示例课程
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

async function assignSampleCourses() {
  try {
    console.log('🔄 为学员分配示例课程...\n')
    
    // 1. 获取学员001
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', '紫夜学员001')
    const student001 = await userQuery.first()
    
    if (!student001) {
      console.log('❌ 未找到学员001')
      return
    }
    
    console.log(`找到学员001: ${student001.get('nickname')} (ID: ${student001.id})`)
    
    // 2. 获取入门课程
    const courseQuery = new AV.Query('Course')
    courseQuery.equalTo('category', '入门课程')
    courseQuery.ascending('order')
    const beginnerCourses = await courseQuery.find()
    
    console.log(`找到 ${beginnerCourses.length} 门入门课程`)
    
    // 3. 为学员001分配前3门入门课程
    const coursesToAssign = beginnerCourses.slice(0, 3)
    const progressRecords = []
    
    for (const course of coursesToAssign) {
      const CourseProgress = AV.Object.extend('CourseProgress')
      const progress = new CourseProgress()
      
      progress.set('userId', student001.id)
      progress.set('courseId', course.id)
      progress.set('courseName', course.get('name'))
      progress.set('courseCategory', course.get('category'))
      progress.set('completedLessons', 0)
      progress.set('totalLessons', course.get('totalLessons'))
      progress.set('progress', 0)
      progress.set('lastStudyDate', new Date())
      progress.set('status', 'not_started')
      progress.set('courseOrder', course.get('order'))
      
      progressRecords.push(progress)
    }
    
    await AV.Object.saveAll(progressRecords)
    console.log(`✅ 成功为学员001分配 ${progressRecords.length} 门课程`)
    
    // 4. 为学员002分配第一门课程并设置一些进度
    const userQuery2 = new AV.Query(AV.User)
    userQuery2.equalTo('username', '紫夜学员002')
    const student002 = await userQuery2.first()
    
    if (student002) {
      const firstCourse = beginnerCourses[0]
      const CourseProgress = AV.Object.extend('CourseProgress')
      const progress = new CourseProgress()
      
      progress.set('userId', student002.id)
      progress.set('courseId', firstCourse.id)
      progress.set('courseName', firstCourse.get('name'))
      progress.set('courseCategory', firstCourse.get('category'))
      progress.set('completedLessons', 0)
      progress.set('totalLessons', firstCourse.get('totalLessons'))
      progress.set('progress', 50) // 设置50%进度
      progress.set('lastStudyDate', new Date())
      progress.set('status', 'in_progress')
      progress.set('courseOrder', firstCourse.get('order'))
      
      await progress.save()
      console.log(`✅ 成功为学员002分配课程并设置50%进度`)
    }
    
    // 5. 为学员003分配第一门课程并设置为已完成
    const userQuery3 = new AV.Query(AV.User)
    userQuery3.equalTo('username', '紫夜学员003')
    const student003 = await userQuery3.first()
    
    if (student003) {
      const firstCourse = beginnerCourses[0]
      const CourseProgress = AV.Object.extend('CourseProgress')
      const progress = new CourseProgress()
      
      progress.set('userId', student003.id)
      progress.set('courseId', firstCourse.id)
      progress.set('courseName', firstCourse.get('name'))
      progress.set('courseCategory', firstCourse.get('category'))
      progress.set('completedLessons', 1)
      progress.set('totalLessons', firstCourse.get('totalLessons'))
      progress.set('progress', 100) // 设置100%进度
      progress.set('lastStudyDate', new Date())
      progress.set('status', 'completed')
      progress.set('courseOrder', firstCourse.get('order'))
      
      await progress.save()
      console.log(`✅ 成功为学员003分配课程并设置为已完成`)
    }
    
    console.log('\n🎉 示例课程分配完成！')
    console.log('\n📊 分配总结:')
    console.log('   ✅ 学员001: 3门入门课程 (未开始)')
    console.log('   ✅ 学员002: 1门课程 (进行中 50%)')
    console.log('   ✅ 学员003: 1门课程 (已完成 100%)')
    
    console.log('\n💡 现在可以测试:')
    console.log('   - 学员登录查看课程进度')
    console.log('   - 管理员查看进度管理')
    console.log('   - 课程分配功能')
    
  } catch (error) {
    console.error('❌ 分配过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('📚 将为学员分配示例课程:')
console.log('   - 学员001: 3门入门课程 (未开始状态)')
console.log('   - 学员002: 1门课程 (50%进度)')
console.log('   - 学员003: 1门课程 (100%完成)')
console.log('')
console.log('如果确认要继续，请运行: node scripts/assignSampleCourses.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  assignSampleCourses()
} else {
  console.log('❌ 未确认，分配已取消')
}
