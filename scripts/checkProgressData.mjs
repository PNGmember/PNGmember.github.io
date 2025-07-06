// 检查CourseProgress数据脚本
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

async function checkProgressData() {
  try {
    console.log('检查CourseProgress数据...')
    
    // 查询CourseProgress
    const progressQuery = new AV.Query('CourseProgress')
    const progressList = await progressQuery.find()
    
    console.log(`\n找到 ${progressList.length} 条进度记录:`)
    
    for (const progress of progressList) {
      const userId = progress.get('userId')
      const courseName = progress.get('courseName')
      const status = progress.get('status')
      
      console.log(`\n进度记录: ${courseName}`)
      console.log(`  用户ID: ${userId}`)
      console.log(`  状态: ${status}`)
      
      // 尝试查找对应的用户
      try {
        const userQuery = new AV.Query(AV.User)
        const user = await userQuery.get(userId)
        console.log(`  用户信息: ${user.get('nickname') || user.get('username')} (${user.get('email')})`)
      } catch (error) {
        console.log(`  _User表中未找到用户: ${error.message}`)
        
        // 尝试从Student表查找
        try {
          const studentQuery = new AV.Query('Student')
          studentQuery.equalTo('userId', userId)
          const student = await studentQuery.first()
          if (student) {
            console.log(`  Student表中找到: ${student.get('nickname') || student.get('name')}`)
          } else {
            console.log(`  Student表中也未找到用户`)
          }
        } catch (studentError) {
          console.log(`  Student表查询失败: ${studentError.message}`)
        }
      }
    }
    
    // 查询所有用户
    console.log('\n\n检查用户表...')
    try {
      const userQuery = new AV.Query(AV.User)
      const users = await userQuery.find()
      console.log(`_User表中有 ${users.length} 个用户:`)
      users.forEach(user => {
        console.log(`  ${user.id}: ${user.get('nickname') || user.get('username')} (${user.get('email')})`)
      })
    } catch (error) {
      console.log('无法查询_User表:', error.message)
    }
    
    try {
      const studentQuery = new AV.Query('Student')
      const students = await studentQuery.find()
      console.log(`\nStudent表中有 ${students.length} 个学生:`)
      students.forEach(student => {
        console.log(`  ${student.id}: ${student.get('nickname') || student.get('name')} (userId: ${student.get('userId')})`)
      })
    } catch (error) {
      console.log('无法查询Student表:', error.message)
    }
    
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkProgressData()
