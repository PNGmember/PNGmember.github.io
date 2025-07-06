// 清理无效的Student记录脚本
import AV from 'leancloud-storage'

// 初始化LeanCloud
AV.init({
  appId: 'cCD4H1pwVQWoPETlxR5CLbQH-gzGzoHsz',
  appKey: 'BuI56qnGouF3lJ0KMGI14mpN',
  masterKey: 'IJrUg2qcKgy0KTnr3jKHgy6l',
  serverURL: 'https://ccd4h1pw.lc-cn-n1-shared.com'
})

// 使用MasterKey进行管理操作
AV.Cloud.useMasterKey()

async function cleanInvalidStudents() {
  try {
    console.log('查找无效的Student记录...')
    
    // 查询所有Student记录
    const studentQuery = new AV.Query('Student')
    const students = await studentQuery.find()
    
    console.log(`找到 ${students.length} 个Student记录`)
    
    // 找出没有userId的记录
    const invalidStudents = students.filter(student => !student.get('userId'))
    
    console.log(`找到 ${invalidStudents.length} 个无效记录:`)
    
    for (const student of invalidStudents) {
      console.log(`  ${student.id}: ${student.get('nickname') || student.get('name')} (userId: ${student.get('userId')})`)
    }
    
    if (invalidStudents.length > 0) {
      console.log('\n是否要删除这些无效记录？(y/n)')
      // 在实际环境中，这里应该有用户确认
      // 为了安全起见，我们先只显示，不自动删除
      console.log('为了安全起见，请手动确认后再删除这些记录')
      
      // 如果要删除，取消注释下面的代码：
      /*
      for (const student of invalidStudents) {
        await student.destroy()
        console.log(`已删除: ${student.get('nickname') || student.get('name')}`)
      }
      console.log('清理完成')
      */
    } else {
      console.log('没有找到无效记录')
    }
    
  } catch (error) {
    console.error('清理失败:', error)
  }
}

cleanInvalidStudents()
