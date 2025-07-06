// 测试修复后的学员导入功能
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

// 模拟前端的导入方法（不使用MasterKey权限）
async function importStudentsFromMembers() {
  try {
    // 1. 查询Member表中符合条件的记录
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

        // 检查Student表中是否已存在相同昵称的记录（避免重复导入）
        const existingStudentQuery = new AV.Query('Student')
        existingStudentQuery.equalTo('nickname', nickname)
        const existingStudent = await existingStudentQuery.first()

        if (existingStudent) {
          errors.push(`学员 ${nickname} 已存在，跳过导入`)
          failedCount++
          continue
        }

        // 2. 创建_User记录
        let savedUser
        try {
          const user = new AV.User()
          user.set('username', nickname)
          user.set('nickname', nickname)
          user.set('email', `${qqNumber}@qq.com`)
          user.set('password', qqNumber.toString()) // QQ号作为密码
          user.set('role', 'student')
          user.set('guild', 'purplenight')
          user.set('isActive', true)

          savedUser = await user.signUp()
        } catch (userError) {
          // 如果用户名已存在，跳过这个用户
          if (userError.code === 202 || userError.message.includes('already taken')) {
            errors.push(`用户名 ${nickname} 已存在，跳过导入`)
            failedCount++
            continue
          }
          // 其他错误重新抛出
          throw userError
        }

        // 3. 创建Student记录
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

        // 登出当前用户，准备创建下一个
        await AV.User.logOut()

        successCount++
        console.log(`✅ 成功导入学员: ${nickname}`)

      } catch (error) {
        failedCount++
        const nickname = member.get('nickname') || '未知用户'
        errors.push(`导入 ${nickname} 失败: ${error.message}`)
        console.error(`❌ 导入 ${nickname} 失败:`, error.message)
        
        // 确保登出，避免影响下一个用户创建
        try {
          await AV.User.logOut()
        } catch (logoutError) {
          console.warn('登出失败:', logoutError)
        }
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors: errors
    }

  } catch (error) {
    console.error('导入学员数据失败:', error)
    throw new Error('导入学员数据失败: ' + error.message)
  }
}

async function testImport() {
  try {
    console.log('🔄 测试修复后的导入功能...\n')
    
    const result = await importStudentsFromMembers()
    
    console.log('\n📊 导入结果:')
    console.log(`   ✅ 成功: ${result.success}`)
    console.log(`   ❌ 失败: ${result.failed}`)
    
    if (result.errors.length > 0) {
      console.log('\n❌ 错误详情:')
      result.errors.forEach(error => {
        console.log(`   • ${error}`)
      })
    }
    
    console.log('\n🎉 测试完成！')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

testImport()
