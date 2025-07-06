// 测试新用户导入功能
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

async function createNewTestMember() {
  try {
    console.log('🔄 创建新的测试Member...\n')
    
    // 创建一个全新的测试Member
    const Member = AV.Object.extend('Member')
    const member = new Member()
    
    const timestamp = Date.now()
    const nickname = `新测试学员${timestamp}`
    const qqNumber = `${timestamp}`.slice(-9) // 取时间戳后9位作为QQ号
    
    member.set('nickname', nickname)
    member.set('qqNumber', qqNumber)
    member.set('guild', 'purplenight')
    member.set('stage', '新训')
    member.set('status', '正常')
    
    await member.save()
    
    console.log(`✅ 创建测试Member成功:`)
    console.log(`   昵称: ${nickname}`)
    console.log(`   QQ号: ${qqNumber}`)
    console.log(`   guild: purplenight`)
    console.log(`   stage: 新训`)
    console.log(`   status: 正常`)
    
    return { nickname, qqNumber }
    
  } catch (error) {
    console.error('❌ 创建测试Member失败:', error)
    throw error
  }
}

// 模拟前端的导入方法
async function testSingleImport(targetNickname) {
  try {
    console.log(`\n🔄 测试导入单个用户: ${targetNickname}...\n`)
    
    // 查询特定的Member记录
    const memberQuery = new AV.Query('Member')
    memberQuery.equalTo('nickname', targetNickname)
    memberQuery.equalTo('guild', 'purplenight')
    memberQuery.notEqualTo('stage', '紫夜')
    memberQuery.equalTo('status', '正常')
    const member = await memberQuery.first()
    
    if (!member) {
      console.log('❌ 未找到符合条件的Member记录')
      return
    }
    
    const nickname = member.get('nickname')
    const qqNumber = member.get('qqNumber')
    
    console.log(`找到Member记录: ${nickname} (QQ: ${qqNumber})`)
    
    // 检查Student表中是否已存在
    const existingStudentQuery = new AV.Query('Student')
    existingStudentQuery.equalTo('nickname', nickname)
    const existingStudent = await existingStudentQuery.first()
    
    if (existingStudent) {
      console.log(`⚠️  学员 ${nickname} 已存在，跳过导入`)
      return
    }
    
    // 创建_User记录
    let savedUser
    try {
      const user = new AV.User()
      user.set('username', nickname)
      user.set('nickname', nickname)
      user.set('email', `${qqNumber}@qq.com`)
      user.set('password', qqNumber.toString())
      user.set('role', 'student')
      user.set('guild', 'purplenight')
      user.set('isActive', true)
      
      savedUser = await user.signUp()
      console.log(`✅ 创建User记录成功: ${savedUser.id}`)
      
    } catch (userError) {
      if (userError.code === 202 || 
          userError.message.includes('already taken') || 
          userError.message.includes('已经被占用') ||
          userError.message.includes('already exists')) {
        console.log(`⚠️  用户 ${nickname} 已存在（用户名或邮箱重复），跳过导入`)
        return
      }
      throw userError
    }
    
    // 创建Student记录
    const Student = AV.Object.extend('Student')
    const student = new Student()
    
    student.set('userId', savedUser.id)
    student.set('nickname', nickname)
    student.set('username', nickname)
    student.set('level', '未新训')
    student.set('guild', 'purplenight')
    student.set('joinDate', new Date())
    student.set('isActive', true)
    
    await student.save()
    console.log(`✅ 创建Student记录成功: ${student.id}`)
    
    // 登出
    await AV.User.logOut()
    
    console.log(`🎉 成功导入学员: ${nickname}`)
    
  } catch (error) {
    console.error(`❌ 导入失败:`, error.message)
    
    try {
      await AV.User.logOut()
    } catch (logoutError) {
      console.warn('登出失败:', logoutError)
    }
  }
}

async function runTest() {
  try {
    // 1. 创建新的测试Member
    const { nickname } = await createNewTestMember()
    
    // 2. 测试导入这个新Member
    await testSingleImport(nickname)
    
    console.log('\n🎉 测试完成！')
    console.log('\n💡 提示:')
    console.log('   - 现在可以在管理界面测试"导入学员"按钮')
    console.log('   - 新创建的测试用户应该能够成功导入')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

runTest()
