// 测试新数据库连接
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

async function testDatabaseConnection() {
  try {
    console.log('🔄 测试新数据库连接...\n')
    
    // 测试1: 基本连接测试
    console.log('=== 测试1: 基本连接测试 ===')
    try {
      const testQuery = new AV.Query('_User')
      testQuery.limit(1)
      await testQuery.find()
      console.log('✅ 数据库连接成功')
    } catch (error) {
      console.log('❌ 数据库连接失败:', error.message)
      return
    }
    
    // 测试2: 查询用户表
    console.log('\n=== 测试2: 查询用户表 ===')
    try {
      const userQuery = new AV.Query(AV.User)
      const users = await userQuery.find()
      console.log(`✅ 找到 ${users.length} 个用户`)
      
      if (users.length > 0) {
        console.log('用户列表:')
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.get('nickname') || user.get('username')} (${user.get('role') || 'unknown'})`)
        })
      }
    } catch (error) {
      console.log('❌ 查询用户表失败:', error.message)
    }
    
    // 测试3: 查询课程表
    console.log('\n=== 测试3: 查询课程表 ===')
    try {
      const courseQuery = new AV.Query('Course')
      const courses = await courseQuery.find()
      console.log(`✅ 找到 ${courses.length} 门课程`)
      
      if (courses.length > 0) {
        console.log('课程列表:')
        courses.slice(0, 5).forEach((course, index) => {
          console.log(`  ${index + 1}. ${course.get('name')} (${course.get('category')})`)
        })
        if (courses.length > 5) {
          console.log(`  ... 还有 ${courses.length - 5} 门课程`)
        }
      }
    } catch (error) {
      console.log('❌ 查询课程表失败:', error.message)
    }
    
    // 测试4: 查询学员表
    console.log('\n=== 测试4: 查询学员表 ===')
    try {
      const studentQuery = new AV.Query('Student')
      const students = await studentQuery.find()
      console.log(`✅ 找到 ${students.length} 个学员记录`)
      
      if (students.length > 0) {
        console.log('学员列表:')
        students.forEach((student, index) => {
          console.log(`  ${index + 1}. ${student.get('nickname') || student.get('name')} (userId: ${student.get('userId') || 'undefined'})`)
        })
      }
    } catch (error) {
      console.log('❌ 查询学员表失败:', error.message)
    }
    
    // 测试5: 查询课程进度表
    console.log('\n=== 测试5: 查询课程进度表 ===')
    try {
      const progressQuery = new AV.Query('CourseProgress')
      const progressList = await progressQuery.find()
      console.log(`✅ 找到 ${progressList.length} 条进度记录`)
      
      if (progressList.length > 0) {
        console.log('进度记录示例:')
        progressList.slice(0, 3).forEach((progress, index) => {
          console.log(`  ${index + 1}. 用户: ${progress.get('userId')} | 课程: ${progress.get('courseName')} | 进度: ${progress.get('progress')}%`)
        })
        if (progressList.length > 3) {
          console.log(`  ... 还有 ${progressList.length - 3} 条记录`)
        }
      }
    } catch (error) {
      console.log('❌ 查询课程进度表失败:', error.message)
    }
    
    // 测试6: 写入测试（创建一个测试记录）
    console.log('\n=== 测试6: 写入测试 ===')
    try {
      const TestObject = AV.Object.extend('DatabaseTest')
      const testObj = new TestObject()
      testObj.set('message', '数据库连接测试')
      testObj.set('timestamp', new Date())
      testObj.set('config', 'new_database')
      
      await testObj.save()
      console.log('✅ 写入测试成功')
      
      // 立即删除测试记录
      await testObj.destroy()
      console.log('✅ 清理测试记录成功')
    } catch (error) {
      console.log('❌ 写入测试失败:', error.message)
    }
    
    console.log('\n🎉 数据库连接测试完成！')
    console.log('\n📋 配置信息:')
    console.log(`   AppID: zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz`)
    console.log(`   AppKey: wyqlYopPy4q7z9rUo9SaWeY8`)
    console.log(`   MasterKey: j9R1hchc7UY8YrxkwT02EwCG`)
    console.log(`   服务器: https://zgizsvge.lc-cn-n1-shared.com`)
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testDatabaseConnection()
