// 为学员分配新的课程
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

async function assignNewCourses() {
  try {
    console.log('🔄 为学员分配新的课程...\n')
    
    // 1. 获取所有学员
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    console.log(`找到 ${students.length} 个学员`)
    
    // 2. 获取入门课程
    const courseQuery = new AV.Query('Course')
    courseQuery.equalTo('category', '入门课程')
    courseQuery.ascending('order')
    const beginnerCourses = await courseQuery.find()
    
    console.log(`找到 ${beginnerCourses.length} 门入门课程`)
    
    if (students.length === 0 || beginnerCourses.length === 0) {
      console.log('❌ 没有找到学员或课程，无法分配')
      return
    }
    
    // 3. 为每个学员分配课程
    for (let i = 0; i < students.length; i++) {
      const student = students[i]
      const studentName = student.get('nickname') || student.get('username')
      
      console.log(`\n为学员 ${studentName} 分配课程:`)
      
      let coursesToAssign = []
      let progressValue = 0
      let status = 'not_started'
      
      if (i === 0) {
        // 学员001: 分配前3门课程，未开始
        coursesToAssign = beginnerCourses.slice(0, 3)
        progressValue = 0
        status = 'not_started'
        console.log(`  分配前3门入门课程 (未开始)`)
      } else if (i === 1) {
        // 学员002: 分配第1门课程，50%进度
        coursesToAssign = [beginnerCourses[0]]
        progressValue = 50
        status = 'in_progress'
        console.log(`  分配第1门课程 (进行中 50%)`)
      } else if (i === 2) {
        // 学员003: 分配第1门课程，已完成
        coursesToAssign = [beginnerCourses[0]]
        progressValue = 100
        status = 'completed'
        console.log(`  分配第1门课程 (已完成 100%)`)
      }
      
      // 创建进度记录
      const progressRecords = []
      
      for (const course of coursesToAssign) {
        const CourseProgress = AV.Object.extend('CourseProgress')
        const progress = new CourseProgress()
        
        progress.set('userId', student.id)
        progress.set('courseId', course.id)
        progress.set('courseName', course.get('name'))
        progress.set('courseCategory', course.get('category'))
        progress.set('completedLessons', progressValue === 100 ? 1 : 0)
        progress.set('totalLessons', course.get('totalLessons'))
        progress.set('progress', progressValue)
        progress.set('lastStudyDate', new Date())
        progress.set('status', status)
        progress.set('courseOrder', course.get('order'))
        
        progressRecords.push(progress)
      }
      
      await AV.Object.saveAll(progressRecords)
      console.log(`  ✅ 成功分配 ${progressRecords.length} 门课程`)
    }
    
    console.log('\n🎉 课程分配完成！')
    console.log('\n📊 分配总结:')
    console.log('   ✅ 紫夜学员001: 3门入门课程 (未开始)')
    console.log('   ✅ 紫夜学员002: 1门课程 (进行中 50%)')
    console.log('   ✅ 紫夜学员003: 1门课程 (已完成 100%)')
    
    console.log('\n💡 现在可以测试:')
    console.log('   - 学员登录查看新的课程进度')
    console.log('   - 管理员查看进度管理')
    console.log('   - 课程编号显示 (1.1, 1.2, 1.3 等)')
    
  } catch (error) {
    console.error('❌ 分配过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('📚 将为学员分配新的课程:')
console.log('   - 学员001: 前3门入门课程 (未开始状态)')
console.log('   - 学员002: 第1门课程 (50%进度)')
console.log('   - 学员003: 第1门课程 (100%完成)')
console.log('')
console.log('如果确认要继续，请运行: node scripts/assignNewCourses.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  assignNewCourses()
} else {
  console.log('❌ 未确认，分配已取消')
}
