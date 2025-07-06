// 初始化LeanCloud数据脚本
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

// 紫夜公会课程数据
const courses = [
  // 一、入门课程
  { name: 'CQB基础理论知识', description: '近距离作战基础理论', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 1 },
  { name: '强弱手位讲解和死亡漏斗的判定', description: '战术位置和危险区域识别', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 2 },
  { name: '进门前后的站位及动作', description: '进入房间的标准动作', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 3 },
  { name: '枪口指向与责任区间', description: '武器指向和责任区域划分', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 4 },
  { name: '各种进门方式和基础灯语', description: '不同进入方式和基础手势', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 5 },
  { name: '威胁点的识别与分级', description: '威胁评估和优先级判断', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 6 },
  { name: '经典模型的讲解与应对方式', description: '经典战术模型分析', totalLessons: 1, category: '入门课程', difficulty: 'beginner', order: 7 },

  // 二、标准技能一阶课程
  { name: '队伍1-6号位功能和内外环讲解', description: '团队位置分工和环形防御', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 8 },
  { name: '基础队伍行进队形', description: '团队移动阵型', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 9 },
  { name: '后卫的架设时间点和站位', description: '后卫职责和定位', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 10 },
  { name: '交替掩护剥离战术（地狱火）', description: '高级掩护战术', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 11 },
  { name: '区域进攻理论', description: '区域控制和进攻策略', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 12 },
  { name: '任意图背板打法及思路讲解', description: '地图适应性战术', totalLessons: 1, category: '标准技能一阶课程', difficulty: 'intermediate', order: 13 },

  // 三、标准技能二阶课程
  { name: '第三威胁以及辅助进攻思路', description: '多重威胁处理', totalLessons: 1, category: '标准技能二阶课程', difficulty: 'intermediate', order: 14 },
  { name: '应激反应控制意识', description: '压力下的反应控制', totalLessons: 1, category: '标准技能二阶课程', difficulty: 'intermediate', order: 15 },
  { name: '行进阶段的判断与指令了解', description: '移动中的决策和指挥', totalLessons: 1, category: '标准技能二阶课程', difficulty: 'intermediate', order: 16 },
  { name: '双人配合和态势感知', description: '二人小组协作', totalLessons: 1, category: '标准技能二阶课程', difficulty: 'intermediate', order: 17 },
  { name: 'OODA循环的应用', description: '观察-定向-决策-行动循环', totalLessons: 1, category: '标准技能二阶课程', difficulty: 'intermediate', order: 18 },

  // 四、团队训练
  { name: '汇报指令术语精简练习', description: '标准化通讯训练', totalLessons: 1, category: '团队训练', difficulty: 'intermediate', order: 19 },
  { name: '房间进攻理论和扇形部署', description: '室内作战部署', totalLessons: 1, category: '团队训练', difficulty: 'intermediate', order: 20 },
  { name: '队形与突发状况应对方式', description: '应急反应训练', totalLessons: 1, category: '团队训练', difficulty: 'intermediate', order: 21 },
  { name: '枪线管理', description: '火力协调管理', totalLessons: 1, category: '团队训练', difficulty: 'intermediate', order: 22 },
  { name: '队友感知', description: '团队协作意识', totalLessons: 1, category: '团队训练', difficulty: 'intermediate', order: 23 },

  // 五、进阶课程
  { name: '防守反击的意识练习', description: '防御转攻击战术', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 24 },
  { name: '交战时道具补充以及后置位补位意识', description: '战斗中的补给和支援', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 25 },
  { name: '全静默灯语动作讲解和练习', description: '无声通讯系统', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 26 },
  { name: '单兵素质与动态突入', description: '个人技能和动态战术', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 27 },
  { name: '地图推进理论', description: '地图控制策略', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 28 },
  { name: '全静默2-4人配合练习', description: '小队无声协作', totalLessons: 1, category: '进阶课程', difficulty: 'advanced', order: 29 }
]

async function initializeCourses(forceRecreate = false) {
  console.log('开始初始化课程数据...')

  try {
    // 检查是否已有课程数据
    const existingQuery = new AV.Query('Course')
    const existingCourses = await existingQuery.find()

    if (existingCourses.length > 0 && !forceRecreate) {
      console.log(`已存在 ${existingCourses.length} 门课程，跳过课程初始化`)
      return existingCourses
    }

    if (existingCourses.length > 0 && forceRecreate) {
      console.log(`删除现有的 ${existingCourses.length} 门课程...`)
      await AV.Object.destroyAll(existingCourses)
      console.log('现有课程已删除')
    }

    // 批量创建课程
    console.log(`创建 ${courses.length} 门新课程...`)
    const courseObjects = courses.map(courseData => {
      const course = new AV.Object('Course')
      Object.keys(courseData).forEach(key => {
        course.set(key, courseData[key])
      })
      return course
    })

    const savedCourses = await AV.Object.saveAll(courseObjects)
    console.log(`成功创建 ${savedCourses.length} 门课程`)
    return savedCourses

  } catch (error) {
    console.error('初始化课程失败:', error)
    throw error
  }
}

async function createSampleStudent() {
  console.log('创建示例学生用户...')

  try {
    // 检查是否已有示例学生
    const query = new AV.Query(AV.User)
    query.equalTo('username', 'student001')
    const existingUser = await query.first()

    if (existingUser) {
      console.log('示例学生已存在，跳过创建')
      // 同时创建Student表记录
      await createStudentRecord(existingUser)
      return existingUser
    }

    // 创建示例学生用户
    const user = new AV.User()
    user.setUsername('student001')
    user.setPassword('password123')
    user.setEmail('student001@purplenight.com')
    user.set('nickname', '紫夜学员001')
    user.set('role', 'student')
    user.set('guild', 'purplenight')
    user.set('level', '新训一期')
    user.set('mentor', '紫夜教官')
    user.set('isActive', true)

    const savedUser = await user.signUp()
    console.log('成功创建示例学生用户:', savedUser.get('username'))

    // 创建Student表记录
    await createStudentRecord(savedUser)

    return savedUser

  } catch (error) {
    console.error('创建示例学生失败:', error)
    throw error
  }
}

async function createStudentRecord(user) {
  try {
    // 检查Student表中是否已有记录
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', user.id)
    const existingStudent = await studentQuery.first()

    if (existingStudent) {
      console.log('Student表记录已存在')
      return existingStudent
    }

    // 创建Student表记录
    const student = new AV.Object('Student')
    student.set('userId', user.id)
    student.set('username', user.get('username'))
    student.set('email', user.get('email'))
    student.set('nickname', user.get('nickname'))
    student.set('name', user.get('nickname'))
    student.set('studentId', user.get('username'))
    student.set('role', 'student')
    student.set('guild', 'purplenight')
    student.set('level', user.get('level'))
    student.set('mentor', user.get('mentor'))
    student.set('isActive', true)

    const savedStudent = await student.save()
    console.log('成功创建Student表记录')
    return savedStudent

  } catch (error) {
    if (error.code === 101) {
      console.log('Student表不存在，将创建新表')
      // 重试创建
      const student = new AV.Object('Student')
      student.set('userId', user.id)
      student.set('username', user.get('username'))
      student.set('email', user.get('email'))
      student.set('nickname', user.get('nickname'))
      student.set('name', user.get('nickname'))
      student.set('studentId', user.get('username'))
      student.set('role', 'student')
      student.set('guild', 'purplenight')
      student.set('level', user.get('level'))
      student.set('mentor', user.get('mentor'))
      student.set('isActive', true)

      const savedStudent = await student.save()
      console.log('成功创建Student表和记录')
      return savedStudent
    } else {
      console.error('创建Student表记录失败:', error)
      throw error
    }
  }
}

async function createSampleProgress(student, courses) {
  console.log('创建示例学习进度...')

  try {
    // 尝试检查是否已有进度数据，如果表不存在则跳过检查
    try {
      const existingQuery = new AV.Query('CourseProgress')
      existingQuery.equalTo('userId', student.id)
      const existingProgress = await existingQuery.find()

      if (existingProgress.length > 0) {
        console.log(`学生已有 ${existingProgress.length} 条进度记录，跳过创建`)
        return existingProgress
      }
    } catch (error) {
      if (error.code === 101) {
        console.log('CourseProgress表不存在，将创建新表和数据')
      } else {
        throw error
      }
    }
    
    // 为前几门课程创建进度记录
    const progressData = []
    
    // 入门课程 - 已完成
    for (let i = 0; i < 7 && i < courses.length; i++) {
      const course = courses[i]
      progressData.push({
        userId: student.id,
        courseId: course.id,
        courseName: course.get('name'),
        courseCategory: course.get('category'),
        completedLessons: 1,
        totalLessons: 1,
        progress: 100,
        lastStudyDate: new Date(Date.now() - (7 - i) * 24 * 60 * 60 * 1000), // 过去7天内
        status: 'completed',
        notes: '学习完成，掌握良好',
        courseOrder: course.get('order')
      })
    }

    // 标准技能一阶课程 - 部分完成
    for (let i = 7; i < 10 && i < courses.length; i++) {
      const course = courses[i]
      const isCompleted = i < 9
      progressData.push({
        userId: student.id,
        courseId: course.id,
        courseName: course.get('name'),
        courseCategory: course.get('category'),
        completedLessons: isCompleted ? 1 : 0,
        totalLessons: 1,
        progress: isCompleted ? 100 : 0,
        lastStudyDate: isCompleted ? new Date(Date.now() - (10 - i) * 24 * 60 * 60 * 1000) : new Date(),
        status: isCompleted ? 'completed' : 'in_progress',
        notes: isCompleted ? '学习完成' : '正在学习中',
        courseOrder: course.get('order')
      })
    }
    
    // 批量创建进度记录
    const progressObjects = progressData.map(data => {
      const progress = new AV.Object('CourseProgress')
      Object.keys(data).forEach(key => {
        progress.set(key, data[key])
      })
      return progress
    })
    
    const savedProgress = await AV.Object.saveAll(progressObjects)
    console.log(`成功创建 ${savedProgress.length} 条学习进度记录`)
    return savedProgress
    
  } catch (error) {
    console.error('创建示例进度失败:', error)
    throw error
  }
}

async function createAdminUser() {
  console.log('创建管理员用户...')

  try {
    // 检查是否已有管理员
    const query = new AV.Query(AV.User)
    query.equalTo('username', 'admin')
    const existingAdmin = await query.first()

    if (existingAdmin) {
      console.log('管理员已存在，跳过创建')
      return existingAdmin
    }

    // 创建管理员用户
    const admin = new AV.User()
    admin.setUsername('admin')
    admin.setPassword('admin123')
    admin.setEmail('admin@purplenight.com')
    admin.set('nickname', '紫夜管理员')
    admin.set('role', 'guild_admin')
    admin.set('guild', 'purplenight')
    admin.set('isActive', true)
    admin.set('permissions', ['user_management', 'course_management', 'progress_management', 'statistics'])

    const savedAdmin = await admin.signUp()
    console.log('成功创建管理员用户:', savedAdmin.get('username'))
    return savedAdmin

  } catch (error) {
    console.error('创建管理员失败:', error)
    throw error
  }
}

async function main() {
  try {
    console.log('开始初始化LeanCloud数据...')

    // 1. 强制重新创建课程数据（删除旧的，创建新的）
    const courses = await initializeCourses(true)

    // 2. 创建管理员用户
    await createAdminUser()

    // 3. 创建示例学生
    const student = await createSampleStudent()

    // 4. 创建示例学习进度
    await createSampleProgress(student, courses)

    console.log('LeanCloud数据初始化完成！')
    console.log('可以使用以下账号登录测试:')
    console.log('学生账号 - 用户名: student001, 密码: password123')
    console.log('管理员账号 - 用户名: admin, 密码: admin123')

  } catch (error) {
    console.error('初始化失败:', error)
    process.exit(1)
  }
}

// 运行初始化
main()
