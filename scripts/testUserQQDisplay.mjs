// 测试用户QQ号显示功能
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

// 模拟LeanCloudService.getAllUsers方法
async function testGetAllUsers() {
  try {
    console.log('🔄 测试getAllUsers方法...\n')
    
    // 前端环境下，我们使用Student表来获取学生用户信息
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const students = await studentQuery.find()

    console.log(`找到 ${students.length} 个学员记录`)

    const users = students.map(student => {
      const userId = student.get('userId')
      const qqNumber = student.get('qqNumber')
      const email = student.get('email') || (qqNumber ? `${qqNumber}@qq.com` : '')

      return {
        id: userId || student.id,
        username: student.get('username') || student.get('studentId'),
        email: email,
        nickname: student.get('nickname') || student.get('name'),
        joinDate: student.get('createdAt'),
        isActive: student.get('isActive') !== false,
        role: 'student',
        permissions: [],
        studentId: student.get('studentId'),
        level: student.get('level') || '未新训',
        qqNumber: qqNumber
      }
    })

    console.log('\n📋 用户列表（前5个）:')
    users.slice(0, 5).forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.nickname}`)
      console.log(`     ID: ${user.id}`)
      console.log(`     用户名: ${user.username}`)
      console.log(`     邮箱: ${user.email}`)
      console.log(`     QQ号: ${user.qqNumber || '无'}`)
      console.log(`     等级: ${user.level}`)
      console.log('')
    })

    // 测试编辑用户时的QQ号提取逻辑
    console.log('🔍 测试QQ号提取逻辑:')
    users.slice(0, 3).forEach((user, index) => {
      let qq = ''
      if (user.qqNumber) {
        qq = user.qqNumber
      } else if (user.email && user.email.includes('@qq.com')) {
        qq = user.email.replace('@qq.com', '')
      } else {
        qq = user.email || ''
      }
      
      console.log(`  ${index + 1}. ${user.nickname}: 提取的QQ号 = "${qq}"`)
    })

    return users
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
    return []
  }
}

async function runTest() {
  console.log('🧪 开始测试用户QQ号显示功能\n')
  
  const users = await testGetAllUsers()
  
  console.log('\n📊 测试结果:')
  console.log(`   总用户数: ${users.length}`)
  console.log(`   有QQ号的用户: ${users.filter(u => u.qqNumber).length}`)
  console.log(`   有邮箱的用户: ${users.filter(u => u.email).length}`)
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 现在用户管理页面应该能正确显示QQ号')
  console.log('   - 编辑用户时QQ号字段应该有值')
  console.log('   - 可以在管理界面验证修复效果')
}

runTest()
