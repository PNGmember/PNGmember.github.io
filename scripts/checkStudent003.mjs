// 检查学员003的等级计算
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

async function checkStudent003() {
  try {
    console.log('检查学员003的等级计算...')
    
    // 查询学员003
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('username', 'student003')
    const user003 = await userQuery.first()
    
    if (!user003) {
      console.log('未找到学员003')
      return
    }
    
    console.log(`\n学员003信息:`)
    console.log(`  User ID: ${user003.id}`)
    console.log(`  用户名: ${user003.get('username')}`)
    console.log(`  昵称: ${user003.get('nickname')}`)
    
    // 查找对应的Student记录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', user003.id)
    const studentRecord = await studentQuery.first()
    
    if (!studentRecord) {
      console.log('未找到对应的Student记录')
      return
    }
    
    console.log(`  Student ID: ${studentRecord.id}`)
    
    // 查询课程进度
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', studentRecord.id)
    const progressList = await progressQuery.find()
    
    console.log(`\n学员003的课程进度 (${progressList.length} 门):`)
    
    const progressData = []
    progressList.forEach(progress => {
      const data = {
        courseName: progress.get('courseName'),
        courseCategory: progress.get('courseCategory'),
        status: progress.get('status'),
        progress: progress.get('progress')
      }
      progressData.push(data)
      console.log(`  ${data.courseName}:`)
      console.log(`    类别: ${data.courseCategory}`)
      console.log(`    状态: ${data.status}`)
      console.log(`    进度: ${data.progress}%`)
    })
    
    // 手动计算等级
    console.log(`\n等级计算分析:`)
    const completedCourses = progressData.filter(p => p.status === 'completed')
    console.log(`  已完成课程: ${completedCourses.length} 门`)
    
    const completedByCategory = {
      '入门课程': completedCourses.filter(p => p.courseCategory === '入门课程').length,
      '标准技能一阶课程': completedCourses.filter(p => p.courseCategory === '标准技能一阶课程').length,
      '标准技能二阶课程': completedCourses.filter(p => p.courseCategory === '标准技能二阶课程').length,
      '团队训练': completedCourses.filter(p => p.courseCategory === '团队训练').length,
      '进阶课程': completedCourses.filter(p => p.courseCategory === '进阶课程').length
    }
    
    console.log(`  按类别统计:`)
    Object.entries(completedByCategory).forEach(([category, count]) => {
      console.log(`    ${category}: ${count} 门`)
    })
    
    // 判断等级
    let calculatedLevel = '未新训'
    if (completedByCategory['进阶课程'] === 6) {
      calculatedLevel = '紫夜尖兵'
    } else if (completedByCategory['团队训练'] === 5) {
      calculatedLevel = '新训准考'
    } else if (completedByCategory['标准技能二阶课程'] === 5) {
      calculatedLevel = '新训三期'
    } else if (completedByCategory['标准技能一阶课程'] === 6) {
      calculatedLevel = '新训二期'
    } else if (completedByCategory['入门课程'] === 7) {
      calculatedLevel = '新训一期'
    } else if (completedByCategory['入门课程'] > 0) {
      calculatedLevel = '新训初期'
    }
    
    console.log(`\n计算结果:`)
    console.log(`  应该的等级: ${calculatedLevel}`)
    console.log(`  入门课程完成情况: ${completedByCategory['入门课程']}/7`)
    
    console.log('\n检查完成！')
    
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkStudent003()
