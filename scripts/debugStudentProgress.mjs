// 调试学员进度显示问题
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

async function debugStudentProgress() {
  try {
    console.log('调试学员进度显示问题...')
    
    // 1. 查询所有学员用户
    console.log('\n1. 查询学员用户:')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    const students = await userQuery.find()
    
    console.log(`找到 ${students.length} 名学员:`)
    students.forEach(student => {
      console.log(`  ${student.id}: ${student.get('nickname')} (@${student.get('username')})`)
    })
    
    // 2. 查询Student表
    console.log('\n2. 查询Student表:')
    const studentTableQuery = new AV.Query('Student')
    const studentRecords = await studentTableQuery.find()
    
    console.log(`找到 ${studentRecords.length} 条Student记录:`)
    studentRecords.forEach(record => {
      console.log(`  Student ID: ${record.id}`)
      console.log(`  对应_User ID: ${record.get('userId')}`)
      console.log(`  姓名: ${record.get('nickname')}`)
      console.log(`  ---`)
    })
    
    // 3. 查询CourseProgress表
    console.log('\n3. 查询CourseProgress表:')
    const progressQuery = new AV.Query('CourseProgress')
    const progressRecords = await progressQuery.find()
    
    console.log(`找到 ${progressRecords.length} 条进度记录:`)
    progressRecords.forEach(progress => {
      console.log(`  进度ID: ${progress.id}`)
      console.log(`  userId字段: ${progress.get('userId')}`)
      console.log(`  课程: ${progress.get('courseName')}`)
      console.log(`  进度: ${progress.get('progress')}%`)
      console.log(`  ---`)
    })
    
    // 4. 测试学员登录时的查询逻辑
    console.log('\n4. 测试学员查询逻辑:')
    
    for (const student of students) {
      const studentUserId = student.id
      console.log(`\n测试学员: ${student.get('nickname')} (User ID: ${studentUserId})`)
      
      // 方法1: 直接用User ID查询 (当前的错误方法)
      const directQuery = new AV.Query('CourseProgress')
      directQuery.equalTo('userId', studentUserId)
      const directResults = await directQuery.find()
      console.log(`  直接查询结果: ${directResults.length} 条记录`)
      
      // 方法2: 先查Student表，再查CourseProgress (正确方法)
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', studentUserId)
      const studentRecord = await studentQuery.first()
      
      if (studentRecord) {
        const studentTableId = studentRecord.id
        console.log(`  对应Student表ID: ${studentTableId}`)
        
        const correctQuery = new AV.Query('CourseProgress')
        correctQuery.equalTo('userId', studentTableId)
        const correctResults = await correctQuery.find()
        console.log(`  正确查询结果: ${correctResults.length} 条记录`)
        
        correctResults.forEach(progress => {
          console.log(`    - ${progress.get('courseName')}: ${progress.get('progress')}%`)
        })
      } else {
        console.log(`  未找到对应的Student表记录`)
      }
    }
    
    console.log('\n调试完成！')
    
  } catch (error) {
    console.error('调试失败:', error)
  }
}

debugStudentProgress()
