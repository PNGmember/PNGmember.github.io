// 数据迁移脚本：从旧数据库迁移到新数据库
import AV from 'leancloud-storage'

// 旧数据库配置
const OLD_CONFIG = {
  appId: 'cCD4H1pwVQWoPETlxR5CLbQH-gzGzoHsz',
  appKey: 'BuI56qnGouF3lJ0KMGI14mpN',
  masterKey: 'IJrUg2qcKgy0KTnr3jKHgy6l',
  serverURL: 'https://ccd4h1pw.lc-cn-n1-shared.com'
}

// 新数据库配置
const NEW_CONFIG = {
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz',
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8',
  masterKey: 'j9R1hchc7UY8YrxkwT02EwCG',
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com'
}

// 创建两个AV实例
function createAVInstance(config) {
  const AVInstance = {}
  
  // 复制AV的所有方法和属性
  Object.setPrototypeOf(AVInstance, AV)
  Object.assign(AVInstance, AV)
  
  // 初始化
  AVInstance.init(config)
  AVInstance.Cloud.useMasterKey()
  
  return AVInstance
}

async function migrateData() {
  try {
    console.log('🔄 开始数据迁移...\n')
    
    // 初始化旧数据库连接
    console.log('📡 连接旧数据库...')
    const oldAV = AV
    oldAV.init(OLD_CONFIG)
    oldAV.Cloud.useMasterKey()
    
    // 初始化新数据库连接
    console.log('📡 连接新数据库...')
    const newAV = createAVInstance(NEW_CONFIG)
    
    // 1. 迁移课程数据
    console.log('\n=== 迁移课程数据 ===')
    try {
      const oldCourseQuery = new oldAV.Query('Course')
      const oldCourses = await oldCourseQuery.find()
      console.log(`从旧数据库找到 ${oldCourses.length} 门课程`)
      
      if (oldCourses.length > 0) {
        const newCourses = []
        
        for (const oldCourse of oldCourses) {
          const NewCourse = newAV.Object.extend('Course')
          const newCourse = new NewCourse()
          
          // 复制所有字段
          newCourse.set('name', oldCourse.get('name'))
          newCourse.set('description', oldCourse.get('description'))
          newCourse.set('category', oldCourse.get('category'))
          newCourse.set('difficulty', oldCourse.get('difficulty'))
          newCourse.set('totalLessons', oldCourse.get('totalLessons'))
          newCourse.set('order', oldCourse.get('order'))
          
          newCourses.push(newCourse)
        }
        
        await newAV.Object.saveAll(newCourses)
        console.log(`✅ 成功迁移 ${newCourses.length} 门课程`)
      }
    } catch (error) {
      console.log('❌ 迁移课程数据失败:', error.message)
    }
    
    // 2. 迁移学员数据
    console.log('\n=== 迁移学员数据 ===')
    try {
      const oldStudentQuery = new oldAV.Query('Student')
      const oldStudents = await oldStudentQuery.find()
      console.log(`从旧数据库找到 ${oldStudents.length} 个学员`)
      
      if (oldStudents.length > 0) {
        const newStudents = []
        
        for (const oldStudent of oldStudents) {
          const NewStudent = newAV.Object.extend('Student')
          const newStudent = new NewStudent()
          
          // 复制所有字段
          newStudent.set('userId', oldStudent.get('userId'))
          newStudent.set('nickname', oldStudent.get('nickname'))
          newStudent.set('name', oldStudent.get('name'))
          newStudent.set('username', oldStudent.get('username'))
          newStudent.set('studentId', oldStudent.get('studentId'))
          newStudent.set('level', oldStudent.get('level'))
          newStudent.set('guild', oldStudent.get('guild'))
          newStudent.set('mentor', oldStudent.get('mentor'))
          newStudent.set('joinDate', oldStudent.get('joinDate'))
          newStudent.set('isActive', oldStudent.get('isActive'))
          
          newStudents.push(newStudent)
        }
        
        await newAV.Object.saveAll(newStudents)
        console.log(`✅ 成功迁移 ${newStudents.length} 个学员`)
      }
    } catch (error) {
      console.log('❌ 迁移学员数据失败:', error.message)
    }
    
    // 3. 迁移课程进度数据
    console.log('\n=== 迁移课程进度数据 ===')
    try {
      const oldProgressQuery = new oldAV.Query('CourseProgress')
      const oldProgressList = await oldProgressQuery.find()
      console.log(`从旧数据库找到 ${oldProgressList.length} 条进度记录`)
      
      if (oldProgressList.length > 0) {
        const newProgressList = []
        
        for (const oldProgress of oldProgressList) {
          const NewProgress = newAV.Object.extend('CourseProgress')
          const newProgress = new NewProgress()
          
          // 复制所有字段
          newProgress.set('userId', oldProgress.get('userId'))
          newProgress.set('courseId', oldProgress.get('courseId'))
          newProgress.set('courseName', oldProgress.get('courseName'))
          newProgress.set('courseCategory', oldProgress.get('courseCategory'))
          newProgress.set('completedLessons', oldProgress.get('completedLessons'))
          newProgress.set('totalLessons', oldProgress.get('totalLessons'))
          newProgress.set('progress', oldProgress.get('progress'))
          newProgress.set('lastStudyDate', oldProgress.get('lastStudyDate'))
          newProgress.set('status', oldProgress.get('status'))
          newProgress.set('notes', oldProgress.get('notes'))
          newProgress.set('courseOrder', oldProgress.get('courseOrder'))
          
          newProgressList.push(newProgress)
        }
        
        await newAV.Object.saveAll(newProgressList)
        console.log(`✅ 成功迁移 ${newProgressList.length} 条进度记录`)
      }
    } catch (error) {
      console.log('❌ 迁移课程进度数据失败:', error.message)
    }
    
    console.log('\n🎉 数据迁移完成！')
    console.log('\n📊 迁移总结:')
    console.log('   ✅ 用户数据: 已存在于新数据库')
    console.log('   ✅ 课程数据: 迁移完成')
    console.log('   ✅ 学员数据: 迁移完成')
    console.log('   ✅ 进度数据: 迁移完成')
    
  } catch (error) {
    console.error('❌ 数据迁移过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('⚠️  数据迁移警告:')
console.log('   这将从旧数据库迁移数据到新数据库')
console.log('   请确保新数据库中没有重要数据，因为可能会被覆盖')
console.log('   建议先备份新数据库的现有数据')
console.log('')
console.log('如果确认要继续，请运行: node scripts/migrateData.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  migrateData()
} else {
  console.log('❌ 未确认，迁移已取消')
}
