// 创建测试学员脚本
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

const testStudents = [
  {
    username: 'student002',
    password: 'password123',
    email: 'student002@purplenight.com',
    nickname: '紫夜学员002',
    name: '学员002',
    studentId: 'PN002',
    level: '未新训',
    guild: 'purplenight'
  },
  {
    username: 'student003',
    password: 'password123',
    email: 'student003@purplenight.com',
    nickname: '紫夜学员003',
    name: '学员003',
    studentId: 'PN003',
    level: '新训初期',
    guild: 'purplenight'
  },
  {
    username: 'student004',
    password: 'password123',
    email: 'student004@purplenight.com',
    nickname: '紫夜学员004',
    name: '学员004',
    studentId: 'PN004',
    level: '新训一期',
    guild: 'purplenight'
  },
  {
    username: 'student005',
    password: 'password123',
    email: 'student005@purplenight.com',
    nickname: '紫夜学员005',
    name: '学员005',
    studentId: 'PN005',
    level: '新训二期',
    guild: 'purplenight'
  }
]

async function createTestStudents() {
  try {
    console.log('开始创建测试学员...')
    
    for (const studentData of testStudents) {
      try {
        // 检查用户是否已存在
        const existingUserQuery = new AV.Query(AV.User)
        existingUserQuery.equalTo('username', studentData.username)
        const existingUser = await existingUserQuery.first()
        
        let user
        if (existingUser) {
          console.log(`用户 ${studentData.username} 已存在，跳过创建`)
          user = existingUser
        } else {
          // 创建_User记录
          user = new AV.User()
          user.set('username', studentData.username)
          user.set('password', studentData.password)
          user.set('email', studentData.email)
          user.set('nickname', studentData.nickname)
          user.set('role', 'student')
          user.set('guild', studentData.guild)
          user.set('isActive', true)
          user.set('joinDate', new Date())
          
          await user.signUp()
          console.log(`创建用户 ${studentData.username} 成功`)
        }
        
        // 检查Student表记录是否已存在
        const existingStudentQuery = new AV.Query('Student')
        existingStudentQuery.equalTo('userId', user.id)
        const existingStudent = await existingStudentQuery.first()
        
        if (existingStudent) {
          console.log(`Student表记录 ${studentData.username} 已存在，跳过创建`)
        } else {
          // 创建Student表记录
          const student = new AV.Object('Student')
          student.set('userId', user.id)
          student.set('username', studentData.username)
          student.set('email', studentData.email)
          student.set('nickname', studentData.nickname)
          student.set('name', studentData.name)
          student.set('studentId', studentData.studentId)
          student.set('level', studentData.level)
          student.set('guild', studentData.guild)
          student.set('isActive', true)
          student.set('joinDate', new Date())
          
          await student.save()
          console.log(`创建Student表记录 ${studentData.username} 成功`)
        }
        
      } catch (error) {
        console.error(`创建学员 ${studentData.username} 失败:`, error.message)
      }
    }
    
    console.log('测试学员创建完成！')
    
    // 显示所有学员
    const studentQuery = new AV.Query('Student')
    studentQuery.equalTo('guild', 'purplenight')
    const students = await studentQuery.find()
    
    console.log(`\n当前共有 ${students.length} 名学员:`)
    students.forEach(student => {
      console.log(`  ${student.get('studentId')}: ${student.get('nickname')} (${student.get('level')})`)
    })
    
  } catch (error) {
    console.error('创建测试学员失败:', error)
  }
}

createTestStudents()
