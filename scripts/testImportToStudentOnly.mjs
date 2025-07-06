// 测试只导入到Student表的功能
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

// 测试导入功能（只导入到Student表）
async function testImportToStudentOnly() {
  try {
    console.log('🔄 测试导入到Student表功能...\n')
    
    // 模拟修改后的importStudentsFromMembers方法
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

        // 检查Student表中是否已存在相同昵称的记录
        const existingStudentQuery = new AV.Query('Student')
        existingStudentQuery.equalTo('nickname', nickname)
        const existingStudent = await existingStudentQuery.first()

        if (existingStudent) {
          errors.push(`学员 ${nickname} 已存在，跳过导入`)
          failedCount++
          continue
        }

        // 创建Student记录
        const Student = AV.Object.extend('Student')
        const student = new Student()
        
        student.set('nickname', nickname)
        student.set('username', nickname)
        student.set('qqNumber', qqNumber)
        student.set('password', qqNumber.toString()) // QQ号作为密码
        student.set('level', '未新训')
        student.set('guild', 'purplenight')
        student.set('joinDate', new Date())
        student.set('isActive', true)
        student.set('stage', member.get('stage')) // 保存原始stage信息
        student.set('memberStatus', member.get('status')) // 保存原始status信息

        await student.save()

        successCount++
        console.log(`✅ 成功导入学员: ${nickname} (QQ: ${qqNumber}, Stage: ${member.get('stage')})`)

      } catch (error) {
        failedCount++
        const nickname = member.get('nickname') || '未知用户'
        errors.push(`导入 ${nickname} 失败: ${error.message}`)
        console.error(`❌ 导入 ${nickname} 失败:`, error.message)
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

    // 验证导入结果
    console.log('\n🔍 验证导入结果:')
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const allStudents = await studentQuery.find()
    
    console.log(`Student表中共有 ${allStudents.length} 个紫夜公会学员:`)
    allStudents.forEach((student, index) => {
      console.log(`  ${index + 1}. ${student.get('nickname')} (QQ: ${student.get('qqNumber')}, Stage: ${student.get('stage')}, Level: ${student.get('level')})`)
    })
    
  } catch (error) {
    console.error('❌ 测试导入功能失败:', error)
  }
}

async function runTest() {
  console.log('🧪 开始测试只导入到Student表的功能\n')
  
  await testImportToStudentOnly()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 现在导入功能只会在Student表中创建记录')
  console.log('   - 不会创建_User账户，避免权限问题')
  console.log('   - 可以在管理界面测试"导入学员"按钮')
}

runTest()
