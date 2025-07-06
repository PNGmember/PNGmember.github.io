// 清理重复的CourseProgress数据
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

async function cleanDuplicateProgress() {
  try {
    console.log('清理重复的CourseProgress数据...')
    
    // 查询所有CourseProgress
    const query = new AV.Query('CourseProgress')
    const allProgress = await query.find()
    
    console.log(`找到 ${allProgress.length} 条进度记录`)
    
    // 按 userId + courseId 分组，找出重复项
    const progressMap = new Map()
    const duplicates = []
    
    allProgress.forEach(progress => {
      const userId = progress.get('userId')
      const courseId = progress.get('courseId')
      const key = `${userId}-${courseId}`
      
      if (progressMap.has(key)) {
        // 发现重复，保留较新的记录
        const existing = progressMap.get(key)
        const existingDate = existing.get('createdAt')
        const currentDate = progress.get('createdAt')
        
        if (currentDate > existingDate) {
          // 当前记录更新，删除旧记录
          duplicates.push(existing)
          progressMap.set(key, progress)
        } else {
          // 旧记录更新，删除当前记录
          duplicates.push(progress)
        }
      } else {
        progressMap.set(key, progress)
      }
    })
    
    if (duplicates.length > 0) {
      console.log(`发现 ${duplicates.length} 条重复记录，正在删除...`)
      await AV.Object.destroyAll(duplicates)
      console.log('重复记录已删除')
    } else {
      console.log('没有发现重复记录')
    }
    
    // 显示清理后的结果
    const finalQuery = new AV.Query('CourseProgress')
    const finalProgress = await finalQuery.find()
    console.log(`清理后剩余 ${finalProgress.length} 条进度记录`)
    
  } catch (error) {
    console.error('清理失败:', error)
  }
}

cleanDuplicateProgress()
