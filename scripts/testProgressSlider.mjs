// 测试进度滑动条功能
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

async function testProgressSlider() {
  try {
    console.log('测试进度滑动条功能...')
    
    // 查询现有的进度记录
    const progressQuery = new AV.Query('CourseProgress')
    const progressList = await progressQuery.find()
    
    console.log(`\n找到 ${progressList.length} 条进度记录:`)
    
    // 更新一些进度记录来测试不同的百分比
    const testUpdates = [
      { progress: 25, status: 'in_progress' },
      { progress: 75, status: 'in_progress' },
      { progress: 100, status: 'completed' }
    ]
    
    for (let i = 0; i < Math.min(progressList.length, testUpdates.length); i++) {
      const progress = progressList[i]
      const update = testUpdates[i]
      
      console.log(`\n更新进度记录 ${i + 1}:`)
      console.log(`  课程: ${progress.get('courseName')}`)
      console.log(`  原进度: ${progress.get('progress')}%`)
      console.log(`  新进度: ${update.progress}%`)
      console.log(`  新状态: ${update.status}`)
      
      // 更新进度
      progress.set('progress', update.progress)
      progress.set('status', update.status)
      progress.set('lastStudyDate', new Date())
      
      await progress.save()
      console.log(`  ✅ 更新成功`)
    }
    
    // 验证更新结果
    console.log('\n\n验证更新结果:')
    const updatedQuery = new AV.Query('CourseProgress')
    const updatedList = await updatedQuery.find()
    
    updatedList.forEach((progress, index) => {
      const progressValue = progress.get('progress')
      const status = progress.get('status')
      const courseName = progress.get('courseName')
      
      console.log(`\n进度记录 ${index + 1}:`)
      console.log(`  课程: ${courseName}`)
      console.log(`  进度: ${progressValue}%`)
      console.log(`  状态: ${status}`)
      
      // 验证进度条颜色逻辑
      let color = 'yellow'
      if (progressValue === 100) {
        color = 'green'
      } else if (progressValue >= 50) {
        color = 'blue'
      }
      console.log(`  进度条颜色: ${color}`)
    })
    
    console.log('\n测试完成！现在可以在前端测试滑动条功能了。')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testProgressSlider()
