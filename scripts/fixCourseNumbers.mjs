// 修正课程编号显示
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

// 课程编号映射
const courseNumberMapping = {
  // 入门课程 (1.1-1.7)
  1: '1.1', 2: '1.2', 3: '1.3', 4: '1.4', 5: '1.5', 6: '1.6', 7: '1.7',
  // 标准技能一阶课程 (2.1-2.6)
  8: '2.1', 9: '2.2', 10: '2.3', 11: '2.4', 12: '2.5', 13: '2.6',
  // 标准技能二阶课程 (3.1-3.5)
  14: '3.1', 15: '3.2', 16: '3.3', 17: '3.4', 18: '3.5',
  // 团队训练 (4.1-4.5)
  19: '4.1', 20: '4.2', 21: '4.3', 22: '4.4', 23: '4.5',
  // 进阶课程 (5.1-5.6)
  24: '5.1', 25: '5.2', 26: '5.3', 27: '5.4', 28: '5.5', 29: '5.6'
}

async function displayCourses() {
  try {
    console.log('📚 查看当前课程数据...\n')
    
    // 查询所有课程
    const courseQuery = new AV.Query('Course')
    courseQuery.ascending('order')
    const courses = await courseQuery.find()
    
    console.log(`找到 ${courses.length} 门课程:\n`)
    
    // 按类别分组显示
    const categories = {
      '入门课程': [],
      '标准技能一阶课程': [],
      '标准技能二阶课程': [],
      '团队训练': [],
      '进阶课程': []
    }
    
    courses.forEach(course => {
      const category = course.get('category')
      const order = course.get('order')
      const name = course.get('name')
      const courseNumber = courseNumberMapping[order] || `${order}`
      
      if (categories[category]) {
        categories[category].push({ number: courseNumber, name: name })
      }
    })
    
    // 显示每个类别的课程
    Object.entries(categories).forEach(([category, courseList]) => {
      if (courseList.length > 0) {
        console.log(`${category}:`)
        courseList.forEach(course => {
          console.log(`   ${course.number} ${course.name}`)
        })
        console.log('')
      }
    })
    
    console.log('📊 课程统计:')
    Object.entries(categories).forEach(([category, courseList]) => {
      if (courseList.length > 0) {
        console.log(`   ${category}: ${courseList.length} 门课程`)
      }
    })
    
    console.log('\n✅ 课程数据显示完成！')
    
  } catch (error) {
    console.error('❌ 查看过程中发生错误:', error)
  }
}

displayCourses()
