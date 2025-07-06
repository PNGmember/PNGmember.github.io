// 清理测试数据脚本
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

async function cleanTestData() {
  try {
    console.log('🔄 清理测试数据...\n')
    
    // 1. 清理测试Member记录
    console.log('=== 清理测试Member记录 ===')
    const memberQuery = new AV.Query('Member')
    memberQuery.startsWith('nickname', '测试学员')
    const testMembers = await memberQuery.find()
    
    if (testMembers.length > 0) {
      await AV.Object.destroyAll(testMembers)
      console.log(`✅ 删除了 ${testMembers.length} 个测试Member记录`)
    } else {
      console.log('📝 没有找到测试Member记录')
    }
    
    // 2. 清理测试用户记录
    console.log('\n=== 清理测试用户记录 ===')
    const userQuery = new AV.Query(AV.User)
    userQuery.startsWith('username', '测试学员')
    const testUsers = await userQuery.find()
    
    if (testUsers.length > 0) {
      await AV.Object.destroyAll(testUsers)
      console.log(`✅ 删除了 ${testUsers.length} 个测试用户记录`)
    } else {
      console.log('📝 没有找到测试用户记录')
    }
    
    // 3. 清理测试Student记录
    console.log('\n=== 清理测试Student记录 ===')
    const studentQuery = new AV.Query('Student')
    studentQuery.startsWith('nickname', '测试学员')
    const testStudents = await studentQuery.find()
    
    if (testStudents.length > 0) {
      await AV.Object.destroyAll(testStudents)
      console.log(`✅ 删除了 ${testStudents.length} 个测试Student记录`)
    } else {
      console.log('📝 没有找到测试Student记录')
    }
    
    console.log('\n🎉 测试数据清理完成！')
    
  } catch (error) {
    console.error('❌ 清理测试数据失败:', error)
  }
}

// 询问用户确认
console.log('⚠️  测试数据清理警告:')
console.log('   这将删除所有以"测试学员"开头的记录')
console.log('   包括Member、User、Student表中的测试数据')
console.log('')
console.log('如果确认要继续，请运行: node scripts/cleanTestData.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  cleanTestData()
} else {
  console.log('❌ 未确认，清理已取消')
}
