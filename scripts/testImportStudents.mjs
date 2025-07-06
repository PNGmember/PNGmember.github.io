// 测试学员导入功能
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

// 创建测试Member数据
async function createTestMembers() {
  try {
    console.log('🔄 创建测试Member数据...\n')
    
    // 测试Member数据
    const testMembers = [
      {
        nickname: '测试学员001',
        qqNumber: '111111111',
        guild: 'purplenight',
        stage: '新训',
        status: '正常'
      },
      {
        nickname: '测试学员002',
        qqNumber: '222222222',
        guild: 'purplenight',
        stage: '一阶',
        status: '正常'
      },
      {
        nickname: '测试学员003',
        qqNumber: '333333333',
        guild: 'purplenight',
        stage: '紫夜', // 这个不会被导入（stage=紫夜）
        status: '正常'
      },
      {
        nickname: '测试学员004',
        qqNumber: '444444444',
        guild: 'purplenight',
        stage: '二阶',
        status: '暂停' // 这个不会被导入（status≠正常）
      },
      {
        nickname: '测试学员005',
        qqNumber: '555555555',
        guild: 'otherguild', // 这个不会被导入（guild≠purplenight）
        stage: '新训',
        status: '正常'
      }
    ]
    
    // 先删除现有的测试数据
    const existingQuery = new AV.Query('Member')
    existingQuery.startsWith('nickname', '测试学员')
    const existingMembers = await existingQuery.find()
    
    if (existingMembers.length > 0) {
      await AV.Object.destroyAll(existingMembers)
      console.log(`删除了 ${existingMembers.length} 个现有测试Member记录`)
    }
    
    // 创建新的测试数据
    const members = []
    for (const memberData of testMembers) {
      const Member = AV.Object.extend('Member')
      const member = new Member()
      
      member.set('nickname', memberData.nickname)
      member.set('qqNumber', memberData.qqNumber)
      member.set('guild', memberData.guild)
      member.set('stage', memberData.stage)
      member.set('status', memberData.status)
      
      members.push(member)
    }
    
    await AV.Object.saveAll(members)
    console.log(`✅ 成功创建 ${members.length} 个测试Member记录`)
    
    // 显示创建的数据
    console.log('\n📋 创建的测试数据:')
    testMembers.forEach((member, index) => {
      const shouldImport = member.guild === 'purplenight' && 
                          member.stage !== '紫夜' && 
                          member.status === '正常'
      console.log(`  ${index + 1}. ${member.nickname} (QQ: ${member.qqNumber})`)
      console.log(`     guild: ${member.guild}, stage: ${member.stage}, status: ${member.status}`)
      console.log(`     ${shouldImport ? '✅ 符合导入条件' : '❌ 不符合导入条件'}`)
    })
    
    console.log('\n💡 预期结果: 应该导入2个学员（测试学员001和测试学员002）')
    
  } catch (error) {
    console.error('❌ 创建测试数据失败:', error)
  }
}

// 测试导入功能
async function testImportFunction() {
  try {
    console.log('\n🔄 测试导入功能...\n')
    
    // 模拟LeanCloudService的importStudentsFromMembers方法
    const memberQuery = new AV.Query('Member')
    memberQuery.equalTo('guild', 'purplenight')
    memberQuery.notEqualTo('stage', '紫夜')
    memberQuery.equalTo('status', '正常')
    const members = await memberQuery.find()

    console.log(`找到 ${members.length} 个符合条件的成员`)

    let successCount = 0
    let failedCount = 0
    const errors = []

    for (const member of members) {
      try {
        const nickname = member.get('nickname')
        const qqNumber = member.get('qqNumber')

        if (!nickname || !qqNumber) {
          errors.push(`成员 ${nickname || '未知'} 缺少必要信息（昵称或QQ号）`)
          failedCount++
          continue
        }

        // 检查是否已存在相同用户名的用户
        const existingUserQuery = new AV.Query(AV.User)
        existingUserQuery.equalTo('username', nickname)
        const existingUser = await existingUserQuery.first()

        if (existingUser) {
          errors.push(`用户 ${nickname} 已存在，跳过导入`)
          failedCount++
          continue
        }

        // 创建_User记录
        const user = new AV.User()
        user.set('username', nickname)
        user.set('nickname', nickname)
        user.set('email', `${qqNumber}@qq.com`)
        user.set('password', qqNumber.toString())
        user.set('role', 'student')
        user.set('guild', 'purplenight')
        user.set('isActive', true)

        const savedUser = await user.signUp()

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

        // 登出当前用户
        await AV.User.logOut()

        successCount++
        console.log(`✅ 成功导入学员: ${nickname}`)

      } catch (error) {
        failedCount++
        const nickname = member.get('nickname') || '未知用户'
        errors.push(`导入 ${nickname} 失败: ${error.message}`)
        console.error(`❌ 导入 ${nickname} 失败:`, error.message)
        
        try {
          await AV.User.logOut()
        } catch (logoutError) {
          console.warn('登出失败:', logoutError)
        }
      }
    }

    console.log('\n📊 导入结果:')
    console.log(`   ✅ 成功: ${successCount}`)
    console.log(`   ❌ 失败: ${failedCount}`)
    
    if (errors.length > 0) {
      console.log('\n❌ 错误详情:')
      errors.forEach(error => {
        console.log(`   • ${error}`)
      })
    }
    
  } catch (error) {
    console.error('❌ 测试导入功能失败:', error)
  }
}

async function runTest() {
  console.log('🧪 开始测试学员导入功能\n')
  
  await createTestMembers()
  await testImportFunction()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 现在可以在管理界面测试"导入学员"按钮')
  console.log('   - 测试完成后可以删除测试数据')
}

runTest()
