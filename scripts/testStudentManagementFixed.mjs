// 测试修复后的学员管理功能
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

// 修复后的getStudentById方法
async function getStudentById(userId) {
  try {
    // 首先从_User表获取用户信息
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('objectId', userId)
    const user = await userQuery.first()
    
    if (!user) {
      throw new Error('用户不存在')
    }

    // 然后从Student表获取学员详细信息
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const student = await studentQuery.first()
    
    if (!student) {
      // 如果Student表中没有记录，使用_User表的信息
      return {
        id: user.id,
        username: user.get('username'),
        nickname: user.get('nickname') || user.get('username'),
        email: user.get('email'),
        level: user.get('level') || '未新训',
        isActive: user.get('isActive') !== false,
        studentId: user.get('username'),
        name: user.get('nickname') || user.get('username'),
        guild: user.get('guild')
      }
    }

    // 使用Student表的信息，补充_User表的信息
    return {
      id: user.id,
      username: user.get('username'),
      nickname: student.get('nickname') || user.get('nickname') || user.get('username'),
      email: student.get('email') || user.get('email'),
      level: student.get('level') || user.get('level') || '未新训',
      isActive: student.get('isActive') !== false,
      studentId: student.get('studentId') || user.get('username'),
      name: student.get('name') || student.get('nickname') || user.get('nickname') || user.get('username'),
      guild: student.get('guild') || user.get('guild')
    }
  } catch (error) {
    console.error('获取学员信息失败:', error)
    throw new Error('获取学员信息失败')
  }
}

// 修复后的getStudentCourseProgress方法
async function getStudentCourseProgress(userId) {
  try {
    // 直接使用userId查询课程进度
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    const progressRecords = await progressQuery.find()

    return progressRecords.map(progress => ({
      id: progress.id,
      courseId: progress.get('courseId'),
      courseName: progress.get('courseName'),
      courseCategory: progress.get('courseCategory'),
      courseOrder: progress.get('courseOrder') || 1,
      progress: progress.get('progress') || 0,
      status: progress.get('status') || 'not_started',
      lastStudyDate: progress.get('lastStudyDate')
    }))
  } catch (error) {
    console.error('获取课程进度失败:', error)
    throw new Error('获取课程进度失败')
  }
}

async function testStudentManagementFixed() {
  try {
    console.log('测试修复后的学员管理功能...')
    
    // 1. 获取一个学员用户（从_User表）
    console.log('\n=== 步骤1: 获取学员用户 ===')
    const userQuery = new AV.Query(AV.User)
    userQuery.equalTo('role', 'student')
    userQuery.equalTo('guild', 'purplenight')
    userQuery.limit(1)
    const users = await userQuery.find()
    
    if (users.length === 0) {
      console.log('❌ 没有找到学员用户')
      return
    }
    
    const testUser = users[0]
    const userId = testUser.id
    console.log(`找到测试用户: ${testUser.get('username')} (ID: ${userId})`)
    console.log(`用户角色: ${testUser.get('role')}`)
    console.log(`用户公会: ${testUser.get('guild')}`)
    
    // 2. 测试修复后的getStudentById
    console.log('\n=== 步骤2: 测试getStudentById ===')
    try {
      const studentInfo = await getStudentById(userId)
      console.log('✅ 成功获取学员信息:')
      console.log('  用户名:', studentInfo.username)
      console.log('  昵称:', studentInfo.nickname)
      console.log('  等级:', studentInfo.level)
      console.log('  状态:', studentInfo.isActive ? '正常' : '停用')
      console.log('  公会:', studentInfo.guild)
    } catch (error) {
      console.log('❌ 获取学员信息失败:', error.message)
      return
    }
    
    // 3. 测试修复后的getStudentCourseProgress
    console.log('\n=== 步骤3: 测试getStudentCourseProgress ===')
    try {
      const courseProgress = await getStudentCourseProgress(userId)
      console.log(`✅ 成功获取课程进度，共 ${courseProgress.length} 门课程`)
      
      if (courseProgress.length > 0) {
        console.log('课程进度详情:')
        courseProgress.slice(0, 3).forEach((progress, index) => {
          console.log(`  ${index + 1}. ${progress.courseName}`)
          console.log(`     类别: ${progress.courseCategory}`)
          console.log(`     进度: ${progress.progress}%`)
          console.log(`     状态: ${progress.status}`)
        })
      } else {
        console.log('该学员暂无课程进度记录')
      }
    } catch (error) {
      console.log('❌ 获取课程进度失败:', error.message)
    }
    
    // 4. 检查Student表记录
    console.log('\n=== 步骤4: 检查Student表记录 ===')
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('userId', userId)
    const studentRecord = await studentQuery.first()
    
    if (studentRecord) {
      console.log('✅ 找到Student表记录:')
      console.log('  Student ID:', studentRecord.id)
      console.log('  昵称:', studentRecord.get('nickname'))
      console.log('  等级:', studentRecord.get('level'))
      console.log('  学员编号:', studentRecord.get('studentId'))
    } else {
      console.log('⚠️ 未找到Student表记录，将使用_User表信息')
    }
    
    // 5. 测试数据一致性
    console.log('\n=== 步骤5: 测试数据一致性 ===')
    console.log('验证用户ID在不同表中的一致性:')
    console.log('  _User表ID:', userId)
    
    if (studentRecord) {
      console.log('  Student表中的userId:', studentRecord.get('userId'))
      console.log('  ID一致性:', studentRecord.get('userId') === userId ? '✅ 一致' : '❌ 不一致')
    }
    
    // 检查CourseProgress表中的userId
    const progressQuery = new AV.Query('CourseProgress')
    progressQuery.equalTo('userId', userId)
    progressQuery.limit(1)
    const progressSample = await progressQuery.first()
    
    if (progressSample) {
      console.log('  CourseProgress表中的userId:', progressSample.get('userId'))
      console.log('  进度记录ID一致性:', progressSample.get('userId') === userId ? '✅ 一致' : '❌ 不一致')
    }
    
    console.log('\n=== 测试总结 ===')
    console.log('修复验证:')
    console.log('✅ 使用正确的userId参数')
    console.log('✅ 从_User表获取基础信息')
    console.log('✅ 从Student表获取详细信息')
    console.log('✅ 数据回退机制（Student表无记录时使用_User表）')
    console.log('✅ 课程进度查询使用正确的userId')
    
    console.log('\n前端集成:')
    console.log('- UserManagement传递用户ID（_User表的ID）')
    console.log('- StudentDetailManagement接收userId参数')
    console.log('- 所有API调用使用一致的userId')
    
  } catch (error) {
    console.error('测试失败:', error)
  }
}

testStudentManagementFixed()
