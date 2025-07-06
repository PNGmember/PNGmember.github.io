// 创建新的课程数据
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

// 新的课程数据
const coursesData = [
  // 一、入门课程 (1.1-1.7)
  { name: 'CQB基础理论知识', description: 'CQB基础理论知识学习', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 1 },
  { name: '强弱手位讲解和死亡漏斗的判定', description: '强弱手位讲解和死亡漏斗的判定', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 2 },
  { name: '进门前后的站位及动作', description: '进门前后的站位及动作要领', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 3 },
  { name: '枪口指向与责任区间', description: '枪口指向与责任区间的划分', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 4 },
  { name: '各种进门方式和基础灯语', description: '各种进门方式和基础灯语学习', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 5 },
  { name: '威胁点的识别与分级', description: '威胁点的识别与分级方法', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 6 },
  { name: '经典模型的讲解与应对方式', description: '经典模型的讲解与应对方式', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 7 },
  
  // 二、标准技能一阶课程 (2.1-2.6)
  { name: '队伍1-6号位功能和内外环讲解', description: '队伍1-6号位功能和内外环讲解', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 8 },
  { name: '基础队伍行进队形', description: '基础队伍行进队形训练', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 9 },
  { name: '后卫的架设时间点和站位', description: '后卫的架设时间点和站位要求', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 10 },
  { name: '交替掩护剥离战术（地狱火）', description: '交替掩护剥离战术（地狱火）', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 11 },
  { name: '区域进攻理论', description: '区域进攻理论学习', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 12 },
  { name: '任意图背板打法及思路讲解', description: '任意图背板打法及思路讲解', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 13 },
  
  // 三、标准技能二阶课程 (3.1-3.5)
  { name: '第三威胁以及辅助进攻思路', description: '第三威胁以及辅助进攻思路', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 14 },
  { name: '应激反应控制意识', description: '应激反应控制意识培养', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 15 },
  { name: '行进阶段的判断与指令了解', description: '行进阶段的判断与指令了解', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 16 },
  { name: '双人配合和态势感知', description: '双人配合和态势感知训练', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 17 },
  { name: 'OODA循环的应用', description: 'OODA循环的应用方法', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 18 },
  
  // 四、团队训练 (4.1-4.5)
  { name: '汇报指令术语精简练习', description: '汇报指令术语精简练习', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 19 },
  { name: '房间进攻理论和扇形部署', description: '房间进攻理论和扇形部署', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 20 },
  { name: '队形与突发状况应对方式', description: '队形与突发状况应对方式', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 21 },
  { name: '枪线管理', description: '枪线管理技能训练', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 22 },
  { name: '队友感知', description: '队友感知能力培养', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 23 },
  
  // 五、进阶课程 (5.1-5.6)
  { name: '防守反击的意识练习', description: '防守反击的意识练习', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 24 },
  { name: '交战时道具补充以及后置位补位意识', description: '交战时道具补充以及后置位补位意识', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 25 },
  { name: '全静默灯语动作讲解和练习', description: '全静默灯语动作讲解和练习', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 26 },
  { name: '单兵素质与动态突入', description: '单兵素质与动态突入训练', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 27 },
  { name: '地图推进理论', description: '地图推进理论学习', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 28 },
  { name: '全静默2-4人配合练习', description: '全静默2-4人配合练习', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 29 }
]

async function createNewCourses() {
  try {
    console.log('🔄 创建新的课程数据...\n')
    
    // 1. 先删除现有的课程数据
    console.log('=== 删除现有课程数据 ===')
    const existingQuery = new AV.Query('Course')
    const existingCourses = await existingQuery.find()
    
    if (existingCourses.length > 0) {
      await AV.Object.destroyAll(existingCourses)
      console.log(`✅ 已删除 ${existingCourses.length} 门现有课程`)
    } else {
      console.log('📝 没有找到现有课程')
    }
    
    // 2. 创建新的课程数据
    console.log('\n=== 创建新课程数据 ===')
    const courses = []
    
    for (const courseData of coursesData) {
      const Course = AV.Object.extend('Course')
      const course = new Course()
      
      course.set('name', courseData.name)
      course.set('description', courseData.description)
      course.set('category', courseData.category)
      course.set('difficulty', courseData.difficulty)
      course.set('totalLessons', courseData.totalLessons)
      course.set('order', courseData.order)
      
      courses.push(course)
    }
    
    await AV.Object.saveAll(courses)
    console.log(`✅ 成功创建 ${courses.length} 门新课程`)
    
    // 3. 显示课程统计
    console.log('\n📊 课程统计:')
    const categories = {}
    coursesData.forEach(course => {
      if (!categories[course.category]) {
        categories[course.category] = 0
      }
      categories[course.category]++
    })
    
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} 门课程`)
    })
    
    // 4. 显示课程列表
    console.log('\n📚 课程列表:')
    let currentCategory = ''
    coursesData.forEach((course, index) => {
      if (course.category !== currentCategory) {
        currentCategory = course.category
        console.log(`\n${currentCategory}:`)
      }
      const courseNumber = `${Math.floor((course.order - 1) / 6) + 1}.${((course.order - 1) % 6) + 1}`
      console.log(`   ${courseNumber} ${course.name}`)
    })
    
    console.log('\n🎉 新课程数据创建完成！')
    console.log('\n💡 提示:')
    console.log('   - 总共29门课程')
    console.log('   - 入门课程: 7门 (1.1-1.7)')
    console.log('   - 标准技能一阶: 6门 (2.1-2.6)')
    console.log('   - 标准技能二阶: 5门 (3.1-3.5)')
    console.log('   - 团队训练: 5门 (4.1-4.5)')
    console.log('   - 进阶课程: 6门 (5.1-5.6)')
    
  } catch (error) {
    console.error('❌ 创建过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('⚠️  课程数据重建警告:')
console.log('   这将删除所有现有课程并创建新的课程数据')
console.log('   包括29门新课程（按照提供的课程信息）')
console.log('')
console.log('如果确认要继续，请运行: node scripts/createNewCourses.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  createNewCourses()
} else {
  console.log('❌ 未确认，创建已取消')
}
