// 测试用户管理功能
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

async function testUserManagement() {
  try {
    console.log('测试用户管理功能...')
    
    // 查询所有用户
    console.log('\n1. 查询所有用户:')
    const userQuery = new AV.Query(AV.User)
    const users = await userQuery.find()
    
    console.log(`找到 ${users.length} 个用户:`)
    users.forEach(user => {
      console.log(`  ${user.id}: ${user.get('nickname')} (@${user.get('username')}) - ${user.get('role')} - ${user.get('isActive') ? '活跃' : '停用'}`)
    })
    
    // 查询Student表
    console.log('\n2. 查询Student表:')
    const studentQuery = new AV.Query('Student')
    const students = await studentQuery.find()
    
    console.log(`找到 ${students.length} 个学生记录:`)
    students.forEach(student => {
      console.log(`  ${student.id}: ${student.get('nickname')} (${student.get('studentId')}) - ${student.get('level')} - userId: ${student.get('userId')}`)
    })
    
    // 测试用户角色统计
    console.log('\n3. 用户角色统计:')
    const roleStats = {}
    users.forEach(user => {
      const role = user.get('role')
      roleStats[role] = (roleStats[role] || 0) + 1
    })
    
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`  ${role}: ${count} 人`)
    })
    
    // 测试活跃用户统计
    console.log('\n4. 用户状态统计:')
    const activeUsers = users.filter(u => u.get('isActive')).length
    const inactiveUsers = users.filter(u => !u.get('isActive')).length
    console.log(`  活跃用户: ${activeUsers} 人`)
    console.log(`  停用用户: ${inactiveUsers} 人`)
    
    console.log('\n用户管理功能测试完成！')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testUserManagement()
