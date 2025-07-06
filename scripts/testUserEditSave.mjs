// 测试用户编辑和保存功能
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

// 测试用户更新功能
async function testUpdateUser() {
  try {
    console.log('🔄 测试用户更新功能...\n')
    
    // 1. 获取一个测试用户（使用第一个找到的学员）
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    studentQuery.limit(1)
    const testStudent = await studentQuery.first()

    if (!testStudent) {
      console.log('❌ 未找到任何学员记录')
      return
    }
    
    const userId = testStudent.id
    console.log(`找到测试用户: ${testStudent.get('nickname')} (ID: ${userId})`)
    console.log(`原始QQ号: ${testStudent.get('qqNumber')}`)
    console.log(`原始邮箱: ${testStudent.get('email')}`)
    
    // 2. 模拟更新用户信息（修改QQ号）
    const newQQ = '999888777'
    const newEmail = `${newQQ}@qq.com`
    
    console.log(`\n准备更新QQ号为: ${newQQ}`)
    
    // 模拟LeanCloudService.updateUser方法
    const studentToUpdate = await new AV.Query('Student').get(userId)
    
    // 更新字段
    studentToUpdate.set('email', newEmail)
    studentToUpdate.set('qqNumber', newQQ)
    studentToUpdate.set('nickname', testStudent.get('nickname') + '-已更新')
    
    await studentToUpdate.save()
    
    console.log('✅ 用户信息更新成功')
    
    // 3. 验证更新结果
    const updatedStudent = await new AV.Query('Student').get(userId)
    console.log('\n📋 更新后的用户信息:')
    console.log(`  昵称: ${updatedStudent.get('nickname')}`)
    console.log(`  QQ号: ${updatedStudent.get('qqNumber')}`)
    console.log(`  邮箱: ${updatedStudent.get('email')}`)
    
    // 4. 测试getAllUsers方法是否能正确返回更新后的信息
    console.log('\n🔍 测试getAllUsers方法:')
    const allStudentsQuery = new AV.Query('Student')
    allStudentsQuery.equalTo('guild', 'purplenight')
    const students = await allStudentsQuery.find()
    
    const testUser = students.find(s => s.id === userId)
    if (testUser) {
      const qqNumber = testUser.get('qqNumber')
      const email = testUser.get('email') || (qqNumber ? `${qqNumber}@qq.com` : '')
      
      console.log(`  模拟getAllUsers返回:`)
      console.log(`    昵称: ${testUser.get('nickname')}`)
      console.log(`    QQ号: ${qqNumber}`)
      console.log(`    邮箱: ${email}`)
      
      // 测试编辑时的QQ号提取逻辑
      let extractedQQ = ''
      if (qqNumber) {
        extractedQQ = qqNumber
      } else if (email && email.includes('@qq.com')) {
        extractedQQ = email.replace('@qq.com', '')
      } else {
        extractedQQ = email || ''
      }
      
      console.log(`    编辑时提取的QQ号: "${extractedQQ}"`)
    }
    
    // 5. 恢复原始数据
    console.log('\n🔄 恢复原始数据...')
    const originalQQ = testStudent.get('qqNumber')
    const originalEmail = testStudent.get('email')
    const originalNickname = testStudent.get('nickname')

    studentToUpdate.set('email', originalEmail)
    studentToUpdate.set('qqNumber', originalQQ)
    studentToUpdate.set('nickname', originalNickname)
    await studentToUpdate.save()
    console.log('✅ 原始数据已恢复')
    
  } catch (error) {
    console.error('❌ 测试失败:', error)
  }
}

async function runTest() {
  console.log('🧪 开始测试用户编辑和保存功能\n')
  
  await testUpdateUser()
  
  console.log('\n🎉 测试完成！')
  console.log('\n💡 提示:')
  console.log('   - 用户编辑功能应该能正确显示和保存QQ号')
  console.log('   - QQ号和邮箱字段会同步更新')
  console.log('   - 可以在管理界面验证编辑功能')
}

runTest()
