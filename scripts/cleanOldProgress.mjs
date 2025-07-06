// 清理旧的课程进度数据
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

async function cleanOldProgress() {
  try {
    console.log('🔄 清理旧的课程进度数据...\n')
    
    // 查询所有课程进度记录
    const progressQuery = new AV.Query('CourseProgress')
    const progressList = await progressQuery.find()
    
    if (progressList.length > 0) {
      console.log(`找到 ${progressList.length} 条旧的进度记录`)
      
      // 删除所有旧的进度记录
      await AV.Object.destroyAll(progressList)
      console.log(`✅ 已删除 ${progressList.length} 条旧的进度记录`)
    } else {
      console.log('📝 没有找到旧的进度记录')
    }
    
    console.log('\n🎉 清理完成！')
    console.log('\n💡 提示:')
    console.log('   - 旧的课程进度数据已清理')
    console.log('   - 现在可以重新为学员分配新的课程')
    console.log('   - 使用管理员界面为学员分配课程')
    
  } catch (error) {
    console.error('❌ 清理过程中发生错误:', error)
  }
}

// 询问用户确认
console.log('⚠️  进度数据清理警告:')
console.log('   这将删除所有现有的课程进度记录')
console.log('   因为课程ID已经改变，旧的进度记录无效')
console.log('')
console.log('如果确认要继续，请运行: node scripts/cleanOldProgress.mjs --confirm')

// 检查确认参数
if (process.argv.includes('--confirm')) {
  cleanOldProgress()
} else {
  console.log('❌ 未确认，清理已取消')
}
