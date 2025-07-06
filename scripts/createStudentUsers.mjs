// 创建学员用户和Student记录
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

// 测试学员数据
const studentsData = [
  {
    username: '紫夜学员001',
    nickname: '紫夜学员001',
    qq: '123456789',
    password: 'student123',
    level: '未新训'
  },
  {
    username: '紫夜学员002',
    nickname: '紫夜学员002',
    qq: '987654321',
    password: 'student123',
    level: '未新训'
  },
  {
    username: '紫夜学员003',
    nickname: '紫夜学员003',
    qq: '555666777',
    password: 'student123',
    level: '未新训'
  }
]

async function createStudentUsers() {
  try {
    console.log('🔄 创建学员用户和Student记录...\n')
    
    const createdUsers = []
    const createdStudents = []
    
    for (const studentData of studentsData) {
      try {
        console.log(`创建学员: ${studentData.nickname}`)
        
        // 1. 创建_User记录
        const user = new AV.User()
        user.set('username', studentData.username)
        user.set('nickname', studentData.nickname)
        user.set('email', `${studentData.qq}@qq.com`)
        user.set('password', studentData.password)
        user.set('role', 'student')
        user.set('guild', 'purplenight')
        user.set('isActive', true)
        
        const savedUser = await user.signUp()
        createdUsers.push(savedUser)
        console.log(`  ✅ 用户创建成功: ${savedUser.id}`)
        
        // 2. 创建Student记录
        const Student = AV.Object.extend('Student')
        const student = new Student()
        
        student.set('userId', savedUser.id)
        student.set('nickname', studentData.nickname)
        student.set('username', studentData.username)
        student.set('level', studentData.level)
        student.set('guild', 'purplenight')
        student.set('joinDate', new Date())
        student.set('isActive', true)
        
        const savedStudent = await student.save()
        createdStudents.push(savedStudent)
        console.log(`  ✅ 学员记录创建成功: ${savedStudent.id}`)
        
        // 登出当前用户，准备创建下一个
        await AV.User.logOut()
        
      } catch (error) {
        console.log(`  ❌ 创建学员 ${studentData.nickname} 失败:`, error.message)
      }
    }
    
    console.log('\n🎉 学员创建完成！')
    console.log('\n📊 创建总结:')
    console.log(`   ✅ 用户账户: ${createdUsers.length} 个`)
    console.log(`   ✅ 学员记录: ${createdStudents.length} 个`)
    
    if (createdUsers.length > 0) {
      console.log('\n👥 创建的学员账户:')
      createdUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.get('nickname')} (用户名: ${user.get('username')})`)
        console.log(`      密码: student123`)
        console.log(`      QQ: ${user.get('email').replace('@qq.com', '')}`)
      })
    }
    
    console.log('\n💡 提示:')
    console.log('   - 学员可以使用用户名和密码登录')
    console.log('   - 默认密码都是: student123')
    console.log('   - 学员可以在登录后修改密码')
    
  } catch (error) {
    console.error('❌ 创建过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('📝 将创建以下测试学员账户:')
studentsData.forEach((student, index) => {
  console.log(`   ${index + 1}. ${student.nickname} (QQ: ${student.qq})`)
})
console.log('')
console.log('如果确认要继续，请运行: node scripts/createStudentUsers.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  createStudentUsers()
} else {
  console.log('❌ 未确认，创建已取消')
}
