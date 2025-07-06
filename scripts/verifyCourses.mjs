// 验证课程数据脚本
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

async function verifyCourses() {
  try {
    console.log('正在验证课程数据...')
    
    const query = new AV.Query('Course')
    query.ascending('order')
    const courses = await query.find()
    
    console.log(`\n总共找到 ${courses.length} 门课程:\n`)
    
    let currentCategory = ''
    courses.forEach((course, index) => {
      const category = course.get('category')
      const name = course.get('name')
      const order = course.get('order')
      
      if (category !== currentCategory) {
        currentCategory = category
        console.log(`\n${category}:`)
      }
      
      console.log(`  ${order}. ${name}`)
    })
    
    // 按类别统计
    const categoryStats = {}
    courses.forEach(course => {
      const category = course.get('category')
      if (!categoryStats[category]) {
        categoryStats[category] = 0
      }
      categoryStats[category]++
    })
    
    console.log('\n\n课程统计:')
    Object.entries(categoryStats).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} 门`)
    })
    
    console.log('\n验证完成！')
    
  } catch (error) {
    console.error('验证失败:', error)
  }
}

verifyCourses()
