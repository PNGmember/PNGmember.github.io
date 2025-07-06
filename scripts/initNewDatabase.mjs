// 初始化新数据库脚本
import AV from 'leancloud-storage'

// 初始化LeanCloud（使用新的配置）
AV.init({
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

// 课程数据
const coursesData = [
  // 入门课程 (1.1-1.6)
  { name: 'CQB基础理论知识', description: 'CQB基础理论知识学习', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 1 },
  { name: '基础射击训练', description: '基础射击技能训练', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 2 },
  { name: '基础战术移动', description: '基础战术移动技能', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 3 },
  { name: '装备认知与使用', description: '装备认知与基础使用', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 4 },
  { name: '团队协作基础', description: '团队协作基础知识', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 5 },
  { name: '安全规范与纪律', description: '安全规范与纪律要求', category: '入门课程', difficulty: 'beginner', totalLessons: 1, order: 6 },
  
  // 标准技能一阶课程 (2.1-2.6)
  { name: '进阶射击技术', description: '进阶射击技术训练', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 7 },
  { name: '战术掩护与突破', description: '战术掩护与突破技能', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 8 },
  { name: '小队战术配合', description: '小队战术配合训练', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 9 },
  { name: '地图分析与规划', description: '地图分析与战术规划', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 10 },
  { name: '通讯与指挥', description: '通讯与指挥技能', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 11 },
  { name: '特殊环境作战', description: '特殊环境作战技能', category: '标准技能一阶课程', difficulty: 'intermediate', totalLessons: 1, order: 12 },
  
  // 标准技能二阶课程 (3.1-3.6)
  { name: '高级射击技术', description: '高级射击技术与精准射击', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 13 },
  { name: '复杂战术执行', description: '复杂战术的执行与应变', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 14 },
  { name: '领导力与决策', description: '领导力培养与战术决策', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 15 },
  { name: '多队协同作战', description: '多队协同作战技能', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 16 },
  { name: '危机处理与应急', description: '危机处理与应急响应', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 17 },
  { name: '战术创新与优化', description: '战术创新与优化改进', category: '标准技能二阶课程', difficulty: 'advanced', totalLessons: 1, order: 18 },
  
  // 团队训练 (4.1-4.6)
  { name: '团队建设与磨合', description: '团队建设与成员磨合', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 19 },
  { name: '集体战术演练', description: '集体战术演练与配合', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 20 },
  { name: '角色分工与配合', description: '角色分工与团队配合', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 21 },
  { name: '压力测试与适应', description: '压力测试与环境适应', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 22 },
  { name: '团队沟通技巧', description: '团队沟通与协调技巧', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 23 },
  { name: '实战模拟演习', description: '实战模拟演习与总结', category: '团队训练', difficulty: 'intermediate', totalLessons: 1, order: 24 },
  
  // 进阶课程 (5.1-5.6)
  { name: '专业技能深化', description: '专业技能的深化训练', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 25 },
  { name: '战术理论研究', description: '战术理论研究与分析', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 26 },
  { name: '教学与传承', description: '教学技能与知识传承', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 27 },
  { name: '创新战术开发', description: '创新战术的开发与测试', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 28 },
  { name: '跨域协作能力', description: '跨域协作与综合能力', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 29 },
  { name: '精英素养培养', description: '精英素养与综合能力培养', category: '进阶课程', difficulty: 'advanced', totalLessons: 1, order: 30 }
]

async function initNewDatabase() {
  try {
    console.log('🔄 初始化新数据库...\n')
    
    // 1. 创建课程数据
    console.log('=== 创建课程数据 ===')
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
    console.log(`✅ 成功创建 ${courses.length} 门课程`)
    
    // 2. 创建示例学员数据
    console.log('\n=== 创建示例学员数据 ===')
    
    // 查找现有用户作为学员
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const studentUsers = await userQuery.find()
    
    if (studentUsers.length > 0) {
      const students = []
      
      for (const user of studentUsers) {
        const Student = AV.Object.extend('Student')
        const student = new Student()
        
        student.set('userId', user.id)
        student.set('nickname', user.get('nickname'))
        student.set('username', user.get('username'))
        student.set('level', '未新训')
        student.set('guild', 'purplenight')
        student.set('joinDate', new Date())
        student.set('isActive', true)
        
        students.push(student)
      }
      
      await AV.Object.saveAll(students)
      console.log(`✅ 成功创建 ${students.length} 个学员记录`)
    } else {
      console.log('⚠️  没有找到学员用户，跳过学员数据创建')
    }
    
    console.log('\n🎉 新数据库初始化完成！')
    console.log('\n📊 初始化总结:')
    console.log(`   ✅ 课程数据: ${courses.length} 门课程`)
    console.log(`   ✅ 学员数据: ${studentUsers.length} 个学员`)
    console.log('   ✅ 数据库结构: 已创建')
    
  } catch (error) {
    console.error('❌ 初始化过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('⚠️  数据库初始化警告:')
console.log('   这将在新数据库中创建基础数据')
console.log('   包括30门课程和学员记录')
console.log('   如果数据库中已有数据，可能会产生重复')
console.log('')
console.log('如果确认要继续，请运行: node scripts/initNewDatabase.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  initNewDatabase()
} else {
  console.log('❌ 未确认，初始化已取消')
}
