import AV from '../config/leancloud'
import type { User, Course, CourseProgress, TrainingReport, MemberLevel, StudentUser } from '../config/leancloud'

// 密码加密工具函数
class PasswordUtils {
  // 简单的密码哈希函数（使用SHA-256）
  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password + 'purplenight_salt') // 添加盐值
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  // 验证密码
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password)
    return hashedInput === hashedPassword
  }
}

export class LeanCloudService {
  // 生成课程编号的辅助函数
  static getCourseNumber(order: number): string {
    if (order >= 1 && order <= 7) {
      return `1.${order}`
    } else if (order >= 8 && order <= 13) {
      return `2.${order - 7}`
    } else if (order >= 14 && order <= 18) {
      return `3.${order - 13}`
    } else if (order >= 19 && order <= 23) {
      return `4.${order - 18}`
    } else if (order >= 24 && order <= 29) {
      return `5.${order - 23}`
    }
    return order.toString()
  }

  // 用户认证相关
  static async login(username: string, password: string): Promise<User | StudentUser> {
    try {
      // 首先尝试管理员登录（通过_User表）
      try {
        const user = await AV.User.logIn(username, password)
        const userRole = user.get('role')
        const userGuild = user.get('guild')

        // 检查是否为管理员账户
        if ((userRole === 'admin' || userRole === 'guild_admin' || userRole === 'super_admin' || userRole === 'instructor') && userGuild === 'purplenight') {
          return {
            id: user.id,
            username: user.get('username'),
            email: user.get('email'),
            nickname: user.get('nickname') || user.get('username'),
            joinDate: user.get('createdAt'),
            isActive: user.get('isActive') !== false,
            role: userRole,
            guild: userGuild,
            permissions: user.get('permissions') || []
          }
        }

        // 检查是否为学生账户（有_User记录的学生）
        if (userRole === 'student' && userGuild === 'purplenight') {
          // 额外检查Student表中的isActive状态
          try {
            const studentQuery = new AV.Query('Student')
            studentQuery.equalTo('userId', user.id)
            const studentRecord = await studentQuery.first()

            if (studentRecord) {
              const studentIsActive = studentRecord.get('isActive')
              if (studentIsActive === false) {
                await AV.User.logOut()
                throw new Error('账户已被停用，请联系管理员')
              }

              // 使用Student表中的信息
              return {
                id: user.id,
                username: user.get('username'),
                email: studentRecord.get('email') || user.get('email'),
                nickname: studentRecord.get('nickname') || user.get('nickname') || user.get('username'),
                joinDate: user.get('createdAt'),
                isActive: studentIsActive !== false,
                role: 'student',
                level: studentRecord.get('level') || '未新训',
                guild: userGuild,
                mentor: user.get('mentor')
              }
            } else {
              // 如果没有Student记录，使用_User表的信息
              return {
                id: user.id,
                username: user.get('username'),
                email: user.get('email'),
                nickname: user.get('nickname') || user.get('username'),
                joinDate: user.get('createdAt'),
                isActive: user.get('isActive') !== false,
                role: 'student',
                level: user.get('level') || '未新训',
                guild: userGuild,
                mentor: user.get('mentor')
              }
            }
          } catch (error) {
            if (error.message === '账户已被停用，请联系管理员') {
              throw error
            }
            // 如果查询Student表失败，使用_User表的信息
            return {
              id: user.id,
              username: user.get('username'),
              email: user.get('email'),
              nickname: user.get('nickname') || user.get('username'),
              joinDate: user.get('createdAt'),
              isActive: user.get('isActive') !== false,
              role: 'student',
              level: user.get('level') || '未新训',
              guild: userGuild,
              mentor: user.get('mentor')
            }
          }
        }

        // 不是紫夜公会成员，登出
        await AV.User.logOut()
        throw new Error('此账户不属于紫夜公会')

      } catch (userLoginError) {
        // _User登录失败，尝试Student表登录
        console.log('_User登录失败，尝试Student表登录')

        // 查询Student表进行登录验证
        const studentQuery = new AV.Query('Student')
        studentQuery.equalTo('username', username)
        studentQuery.equalTo('guild', 'purplenight')
        const studentRecord = await studentQuery.first()

        if (!studentRecord) {
          throw new Error('用户不存在')
        }

        // 检查密码（加密验证）
        const storedPassword = studentRecord.get('password')
        const isPasswordValid = await PasswordUtils.verifyPassword(password, storedPassword)
        if (!isPasswordValid) {
          throw new Error('密码错误')
        }

        // 检查账户状态
        const studentIsActive = studentRecord.get('isActive')
        if (studentIsActive === false) {
          throw new Error('账户已被停用，请联系管理员')
        }

        // 返回学员信息
        const studentUser = {
          id: studentRecord.id, // 使用Student表的ID
          username: studentRecord.get('username'),
          email: studentRecord.get('email') || `${studentRecord.get('qqNumber')}@qq.com`,
          nickname: studentRecord.get('nickname'),
          joinDate: studentRecord.get('joinDate') || studentRecord.get('createdAt'),
          isActive: studentIsActive !== false,
          role: 'student' as const,
          level: studentRecord.get('level') || '未新训',
          guild: studentRecord.get('guild'),
          mentor: studentRecord.get('mentor'),
          qqNumber: studentRecord.get('qqNumber')
        }

        // 保存Student用户信息到localStorage
        localStorage.setItem('currentStudentUser', JSON.stringify(studentUser))

        return studentUser
      }
    } catch (error) {
      throw new Error('登录失败，请检查用户名和密码')
    }
  }

  // 通用注册方法（默认注册为学员）
  static async register(username: string, password: string, email: string, nickname: string): Promise<StudentUser> {
    return this.registerStudent(username, password, email, nickname)
  }

  static async registerStudent(username: string, password: string, email: string, nickname: string): Promise<StudentUser> {
    try {
      // 检查学员用户名是否已存在
      const query = new AV.Query('Student')
      query.equalTo('username', username)
      const existingStudent = await query.first()
      
      if (existingStudent) {
        throw new Error('用户名已存在')
      }
      
      // 创建新学员
      const student = new AV.Object('Student')
      student.set('username', username)
      student.set('password', password) // 注意：实际应用中应该对密码进行加密
      student.set('email', email)
      student.set('nickname', nickname)
      student.set('isActive', true)
      student.set('role', 'student')
      student.set('level', '未新训')
      student.set('guild', 'purplenight')
      
      const savedStudent = await student.save()
      
      return {
        id: savedStudent.id,
        username: username,
        email: email,
        nickname: nickname,
        joinDate: savedStudent.get('createdAt'),
        isActive: true,
        role: 'student',
        level: '未新训',
        guild: 'purplenight'
      }
    } catch (error) {
      throw new Error('注册失败: ' + (error instanceof Error ? error.message : '未知错误'))
    }
  }

  static async registerAdmin(username: string, password: string, email: string, nickname: string, role: 'admin' | 'guild_admin' | 'super_admin', permissions: string[]): Promise<User> {
    try {
      const user = new AV.User()
      user.setUsername(username)
      user.setPassword(password)
      user.setEmail(email)
      user.set('nickname', nickname)
      user.set('isActive', true)
      user.set('role', role)
      user.set('guild', 'purplenight')
      user.set('permissions', permissions)
      
      const savedUser = await user.signUp()
      return {
        id: savedUser.id,
        username: savedUser.get('username'),
        email: savedUser.get('email'),
        nickname: savedUser.get('nickname'),
        joinDate: savedUser.get('createdAt'),
        isActive: true,
        role: role,
        guild: 'purplenight',
        permissions
      }
    } catch (error) {
      throw new Error('注册失败，用户名可能已存在')
    }
  }

  static async logout(): Promise<void> {
    try {
      // 登出_User
      await AV.User.logOut()
    } catch (error) {
      console.error('_User登出失败:', error)
    }

    // 清理Student用户信息
    try {
      localStorage.removeItem('currentStudentUser')
    } catch (error) {
      console.error('清理Student用户信息失败:', error)
    }
  }

  // 修改密码
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      // 获取当前用户信息
      const currentUserInfo = this.getCurrentUser()
      if (!currentUserInfo) {
        throw new Error('用户未登录')
      }

      // 检查是否为_User登录的用户（管理员或有_User记录的学生）
      const currentUser = AV.User.current()
      if (currentUser) {
        // 使用_User的密码修改方法
        await (currentUser as any).updatePassword(currentPassword, newPassword)
        return
      }

      // 检查是否为Student表登录的用户
      const studentUserStr = localStorage.getItem('currentStudentUser')
      if (studentUserStr) {
        const studentUser = JSON.parse(studentUserStr)

        // 查询Student记录
        const studentQuery = new AV.Query('Student')
        const studentRecord = await studentQuery.get(studentUser.id)

        if (!studentRecord) {
          throw new Error('学员记录不存在')
        }

        // 验证当前密码（加密验证）
        const storedPassword = studentRecord.get('password')
        const isCurrentPasswordValid = await PasswordUtils.verifyPassword(currentPassword, storedPassword)
        if (!isCurrentPasswordValid) {
          throw new Error('当前密码不正确')
        }

        // 更新密码（加密新密码）
        const hashedNewPassword = await PasswordUtils.hashPassword(newPassword)
        studentRecord.set('password', hashedNewPassword)
        await studentRecord.save()

        // 更新localStorage中的用户信息（虽然密码不存储在localStorage中）
        console.log('Student用户密码修改成功')
        return
      }

      throw new Error('无法确定用户类型')

    } catch (error: any) {
      if (error.message === '当前密码不正确' || error.message === '用户未登录' || error.message === '学员记录不存在' || error.message === '无法确定用户类型') {
        throw error
      } else if (error.code === 210) {
        throw new Error('当前密码不正确')
      } else if (error.code === 125) {
        throw new Error('邮箱地址无效')
      } else {
        throw new Error('修改密码失败: ' + (error.message || '未知错误'))
      }
    }
  }

  static getCurrentUser(): User | StudentUser | null {
    // 首先检查是否有_User登录
    const currentUser = AV.User.current()
    if (currentUser) {
      // 检查是否为管理员用户
      const role = currentUser.get('role')
      const guild = currentUser.get('guild')

      if ((role === 'admin' || role === 'guild_admin' || role === 'super_admin' || role === 'instructor') && guild === 'purplenight') {
        return {
          id: currentUser.id,
          username: currentUser.get('username'),
          email: currentUser.get('email'),
          nickname: currentUser.get('nickname') || currentUser.get('username'),
          joinDate: currentUser.get('createdAt'),
          isActive: currentUser.get('isActive') !== false,
          role: role,
          guild: guild,
          permissions: currentUser.get('permissions') || []
        }
      }

      // 检查是否为学生用户（有_User记录的学生）
      if (role === 'student' && guild === 'purplenight') {
        return {
          id: currentUser.id,
          username: currentUser.get('username'),
          email: currentUser.get('email'),
          nickname: currentUser.get('nickname') || currentUser.get('username'),
          joinDate: currentUser.get('createdAt'),
          isActive: currentUser.get('isActive') !== false,
          role: 'student',
          level: currentUser.get('level') || '未新训',
          guild: guild,
          mentor: currentUser.get('mentor')
        }
      }
    }

    // 检查是否有Student用户登录（从localStorage）
    try {
      const studentUserStr = localStorage.getItem('currentStudentUser')
      if (studentUserStr) {
        const studentUser = JSON.parse(studentUserStr)
        // 验证数据完整性
        if (studentUser.id && studentUser.username && studentUser.role === 'student') {
          return studentUser
        }
      }
    } catch (error) {
      console.warn('解析Student用户信息失败:', error)
      localStorage.removeItem('currentStudentUser')
    }

    // 没有登录用户
    return null
  }
  
  // 检查当前用户是否为管理员
  static isAdmin(): boolean {
    const currentUser = this.getCurrentUser()
    if (!currentUser) return false

    return ['guild_admin', 'super_admin', 'admin'].includes(currentUser.role)
  }

  // 获取单个学员的详细信息（通过用户ID）
  static async getStudentById(userId: string): Promise<any> {
    try {
      // 从现有的用户列表中查找用户信息
      const allUsers = await this.getAllUsers()
      const user = allUsers.find(u => u.id === userId)

      if (!user) {
        throw new Error('用户不存在')
      }

      // 如果不是学员，抛出错误
      if (user.role !== 'student') {
        throw new Error('该用户不是学员')
      }

      return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        email: user.email,
        level: user.level || '未新训',
        isActive: user.isActive,
        studentId: user.username,
        name: user.nickname,
        guild: user.guild
      }
    } catch (error) {
      console.error('获取学员信息失败:', error)
      throw new Error('获取学员信息失败')
    }
  }

  // 获取学员的课程进度（通过用户ID）
  static async getStudentCourseProgress(userId: string): Promise<any[]> {
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

  // 为学员分配课程（通过用户ID）
  static async assignCourseToStudent(userId: string, courseId: string): Promise<void> {
    try {
      // 验证用户存在且为学员
      const allUsers = await this.getAllUsers()
      const user = allUsers.find(u => u.id === userId)

      if (!user) {
        throw new Error('用户不存在')
      }

      if (user.role !== 'student') {
        throw new Error('该用户不是学员')
      }

      // 获取课程信息
      const courseQuery = new AV.Query('Course')
      courseQuery.equalTo('objectId', courseId)
      const course = await courseQuery.first()

      if (!course) {
        throw new Error('课程不存在')
      }

      // 检查是否已经分配过
      const existingProgressQuery = new AV.Query('CourseProgress')
      existingProgressQuery.equalTo('userId', userId)
      existingProgressQuery.equalTo('courseId', courseId)
      const existingProgress = await existingProgressQuery.first()

      if (existingProgress) {
        throw new Error('该课程已经分配给此学员')
      }

      // 创建课程进度记录
      const CourseProgress = AV.Object.extend('CourseProgress')
      const progress = new CourseProgress()

      progress.set('userId', userId)
      progress.set('courseId', courseId)
      progress.set('courseName', course.get('name'))
      progress.set('courseCategory', course.get('category'))
      progress.set('courseOrder', course.get('order'))
      progress.set('progress', 0)
      progress.set('status', 'not_started')
      progress.set('lastStudyDate', null)

      await progress.save()
    } catch (error) {
      console.error('分配课程失败:', error)
      throw new Error(error.message || '分配课程失败')
    }
  }

  // 获取所有课程
  static async getAllCourses(): Promise<any[]> {
    try {
      const courseQuery = new AV.Query('Course')
      courseQuery.ascending('order')
      const courses = await courseQuery.find()

      return courses.map(course => ({
        id: course.id,
        name: course.get('name'),
        category: course.get('category'),
        order: course.get('order'),
        description: course.get('description')
      }))
    } catch (error) {
      throw new Error('获取课程列表失败')
    }
  }
  
  // 获取所有学员
  static async getAllStudents(): Promise<StudentUser[]> {
    try {
      const query = new AV.Query('Student')
      query.equalTo('guild', 'purplenight')
      const results = await query.find()
      
      return results.map(student => ({
        id: student.id,
        username: student.get('username'),
        email: student.get('email'),
        nickname: student.get('nickname') || student.get('username'),
        joinDate: student.get('createdAt'),
        isActive: student.get('isActive') !== false,
        role: 'student',
        level: student.get('level') || '未新训',
        guild: student.get('guild') || 'purplenight',
        mentor: student.get('mentor')
      }))
    } catch (error) {
      throw new Error('获取学员列表失败')
    }
  }

  // 课程相关
  static async getCourses(): Promise<Course[]> {
    try {
      const query = new AV.Query('Course')
      query.ascending('order')
      const results = await query.find()

      return results.map(course => ({
        id: course.id,
        name: course.get('name'),
        description: course.get('description'),
        totalLessons: course.get('totalLessons'),
        category: course.get('category'),
        difficulty: course.get('difficulty'),
        createdAt: course.get('createdAt'),
        order: course.get('order')
      }))
    } catch (error) {
      throw new Error('获取课程列表失败')
    }
  }

  // 课程进度相关
  static async getUserCourseProgress(userId: string): Promise<CourseProgress[]> {
    try {
      // 直接使用_User ID查询CourseProgress
      const query = new AV.Query('CourseProgress')
      query.equalTo('userId', userId)
      query.include('course')
      const results = await query.find()

      return results.map(progress => {
        const course = progress.get('course')
        return {
          id: progress.id,
          userId: userId, // 返回原始的_User ID，保持接口一致性
          courseId: progress.get('courseId'),
          courseName: course ? course.get('name') : progress.get('courseName') || '',
          courseCategory: course ? course.get('category') : progress.get('courseCategory') || '',
          completedLessons: progress.get('completedLessons'),
          totalLessons: course ? course.get('totalLessons') : progress.get('totalLessons'),
          progress: progress.get('progress'),
          lastStudyDate: progress.get('lastStudyDate'),
          status: progress.get('status'),
          notes: progress.get('notes'),
          courseOrder: course ? course.get('order') : (progress.get('courseOrder') || 1)
        }
      })
    } catch (error) {
      throw new Error('获取学习进度失败')
    }
  }

  static async updateCourseProgress(progressId: string, updates: Partial<CourseProgress>): Promise<void> {
    const maxRetries = 3
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const query = new AV.Query('CourseProgress')
        const progress = await query.get(progressId)

        Object.keys(updates).forEach(key => {
          if (updates[key as keyof CourseProgress] !== undefined) {
            progress.set(key, updates[key as keyof CourseProgress])
          }
        })

        await progress.save()
        return // 成功则直接返回
      } catch (error: any) {
        lastError = error

        // 如果是429错误且不是最后一次尝试，等待后重试
        if ((error.code === 429 || error.status === 429) && attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000 // 指数退避：2s, 4s, 8s
          console.warn(`请求限流，${delay/1000}秒后重试 (尝试 ${attempt}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        // 其他错误或最后一次尝试失败，直接抛出
        break
      }
    }

    // 处理最终的错误
    if (lastError.code === 429 || lastError.status === 429) {
      throw new Error('请求过于频繁，请稍后再试')
    } else if (lastError.code === 101) {
      throw new Error('找不到指定的进度记录')
    } else if (lastError.code === 403) {
      throw new Error('没有权限更新此记录')
    } else {
      console.error('更新学习进度失败:', lastError)
      throw new Error(`更新学习进度失败: ${lastError.message || '未知错误'}`)
    }
  }

  // 培训报告相关
  static async getUserTrainingReports(userId: string): Promise<TrainingReport[]> {
    try {
      const query = new AV.Query('TrainingReport')
      query.equalTo('userId', userId)
      query.descending('createdAt')
      const results = await query.find()
      
      return results.map(report => ({
        id: report.id,
        userId: report.get('userId'),
        reportType: report.get('reportType'),
        period: report.get('period'),
        overallProgress: report.get('overallProgress'),
        completedCourses: report.get('completedCourses'),
        totalCourses: report.get('totalCourses'),
        studyHours: report.get('studyHours'),
        achievements: report.get('achievements') || [],
        recommendations: report.get('recommendations') || [],
        createdAt: report.get('createdAt')
      }))
    } catch (error) {
      throw new Error('获取培训报告失败')
    }
  }

  // 等级计算相关
  static calculateMemberLevel(courseProgress: CourseProgress[]): MemberLevel {
    const completedCourses = courseProgress.filter(p => p.status === 'completed')

    // 按课程类别统计完成情况
    const completedByCategory = {
      '入门课程': completedCourses.filter(p => p.courseCategory === '入门课程').length,
      '标准技能一阶课程': completedCourses.filter(p => p.courseCategory === '标准技能一阶课程').length,
      '标准技能二阶课程': completedCourses.filter(p => p.courseCategory === '标准技能二阶课程').length,
      '团队训练': completedCourses.filter(p => p.courseCategory === '团队训练').length,
      '进阶课程': completedCourses.filter(p => p.courseCategory === '进阶课程').length
    }

    // 总课程数量
    const totalByCategory = {
      '入门课程': 7,
      '标准技能一阶课程': 6,
      '标准技能二阶课程': 5,
      '团队训练': 5,
      '进阶课程': 6
    }

    // 判断等级
    if (completedByCategory['进阶课程'] === totalByCategory['进阶课程']) {
      return {
        level: '紫夜尖兵',
        description: '已完成所有进阶课程，成为紫夜公会的精英成员',
        requirements: ['完成所有进阶课程(6/6)']
      }
    } else if (completedByCategory['团队训练'] === totalByCategory['团队训练']) {
      return {
        level: '新训准考',
        description: '已完成团队训练，准备参加新训考核',
        requirements: ['完成所有团队训练课程(5/5)']
      }
    } else if (completedByCategory['标准技能二阶课程'] === totalByCategory['标准技能二阶课程']) {
      return {
        level: '新训三期',
        description: '已完成标准技能二阶课程',
        requirements: ['完成所有标准技能二阶课程(5/5)']
      }
    } else if (completedByCategory['标准技能一阶课程'] === totalByCategory['标准技能一阶课程']) {
      return {
        level: '新训二期',
        description: '已完成标准技能一阶课程',
        requirements: ['完成所有标准技能一阶课程(6/6)']
      }
    } else if (completedByCategory['入门课程'] === totalByCategory['入门课程']) {
      return {
        level: '新训一期',
        description: '已完成入门课程',
        requirements: ['完成所有入门课程(7/7)']
      }
    } else if (completedByCategory['入门课程'] > 0) {
      return {
        level: '新训初期',
        description: '已开始入门课程学习',
        requirements: [`已完成入门课程 ${completedByCategory['入门课程']}/7`]
      }
    } else {
      return {
        level: '未新训',
        description: '尚未开始任何课程',
        requirements: ['需要开始入门课程学习']
      }
    }
  }

  static getMemberLevelProgress(courseProgress: CourseProgress[]): { current: MemberLevel, next?: MemberLevel, progressToNext: number } {
    const current = this.calculateMemberLevel(courseProgress)
    const completedCourses = courseProgress.filter(p => p.status === 'completed')

    const completedByCategory = {
      '入门课程': completedCourses.filter(p => p.courseCategory === '入门课程').length,
      '标准技能一阶课程': completedCourses.filter(p => p.courseCategory === '标准技能一阶课程').length,
      '标准技能二阶课程': completedCourses.filter(p => p.courseCategory === '标准技能二阶课程').length,
      '团队训练': completedCourses.filter(p => p.courseCategory === '团队训练').length,
      '进阶课程': completedCourses.filter(p => p.courseCategory === '进阶课程').length
    }

    let next: MemberLevel | undefined
    let progressToNext = 0

    switch (current.level) {
      case '未新训':
        next = { level: '新训初期', description: '开始入门课程学习', requirements: ['完成第一节入门课程'] }
        progressToNext = 0
        break
      case '新训初期':
        next = { level: '新训一期', description: '完成入门课程', requirements: ['完成所有入门课程(7/7)'] }
        progressToNext = Math.round((completedByCategory['入门课程'] / 7) * 100)
        break
      case '新训一期':
        next = { level: '新训二期', description: '完成标准技能一阶课程', requirements: ['完成所有标准技能一阶课程(6/6)'] }
        progressToNext = Math.round((completedByCategory['标准技能一阶课程'] / 6) * 100)
        break
      case '新训二期':
        next = { level: '新训三期', description: '完成标准技能二阶课程', requirements: ['完成所有标准技能二阶课程(5/5)'] }
        progressToNext = Math.round((completedByCategory['标准技能二阶课程'] / 5) * 100)
        break
      case '新训三期':
        next = { level: '新训准考', description: '完成团队训练', requirements: ['完成所有团队训练课程(5/5)'] }
        progressToNext = Math.round((completedByCategory['团队训练'] / 5) * 100)
        break
      case '新训准考':
        next = { level: '正式队员', description: '通过新训考核', requirements: ['通过新训考核'] }
        progressToNext = 0 // 需要考核，无法用课程进度计算
        break
      case '正式队员':
        next = { level: '紫夜尖兵', description: '完成进阶课程', requirements: ['完成所有进阶课程(6/6)'] }
        progressToNext = Math.round((completedByCategory['进阶课程'] / 6) * 100)
        break
      case '紫夜尖兵':
        // 已达到最高等级
        progressToNext = 100
        break
    }

    return { current, next, progressToNext }
  }

  // 管理员功能
  static async getAllUsers(): Promise<User[]> {
    try {
      // 前端环境下，我们使用Student表来获取学生用户信息
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('guild', 'purplenight')
      const students = await studentQuery.find()

      // 获取所有学员的课程进度来计算等级
      const studentIds = students.map(s => s.id) // 使用Student表的ID
      const progressMap = new Map()

      if (studentIds.length > 0) {
        try {
          // 使用Student ID查询CourseProgress
          const progressQuery = new AV.Query('CourseProgress')
          progressQuery.containedIn('userId', studentIds)
          const progressList = await progressQuery.find()

          // 按Student ID分组进度记录
          progressList.forEach(progress => {
            const userId = progress.get('userId')

            if (userId && studentIds.includes(userId)) {
              if (!progressMap.has(userId)) {
                progressMap.set(userId, [])
              }
              progressMap.get(userId).push({
                status: progress.get('status'),
                courseCategory: progress.get('courseCategory')
              })
            }
          })
        } catch (error) {
          console.warn('获取课程进度失败:', error)
        }
      }

      return students.map(student => {
        const studentId = student.id // 使用Student表的ID
        const userProgress = progressMap.get(studentId) || []

        // 根据课程进度计算等级
        let calculatedLevel = '未新训'
        if (userProgress.length > 0) {
          const levelInfo = this.calculateMemberLevel(userProgress)
          calculatedLevel = levelInfo.level
        }

        // 构造email（优先使用Student表的qqNumber）
        const qqNumber = student.get('qqNumber')
        const email = student.get('email') || (qqNumber ? `${qqNumber}@qq.com` : '')

        return {
          id: student.id, // 使用Student表的ID作为用户ID
          username: student.get('username') || student.get('studentId'),
          email: email,
          nickname: student.get('nickname') || student.get('name'),
          joinDate: student.get('createdAt'),
          isActive: student.get('isActive') !== false,
          role: 'student' as const,
          permissions: [],
          // 额外的学员信息
          studentId: student.get('studentId'),
          level: calculatedLevel, // 使用基于课程进度计算出的等级
          qqNumber: qqNumber // 添加QQ号字段
        }
      })
    } catch (error) {
      console.error('获取用户列表失败:', error)
      // 如果Student表不存在，返回空数组
      return []
    }
  }

  static async getAllCourseProgress(): Promise<(CourseProgress & { userName: string })[]> {
    try {
      const query = new AV.Query('CourseProgress')
      query.include('course')
      const results = await query.find()

      // 获取所有用户信息（使用与getAllUsers相同的逻辑）
      const allUsers = await this.getAllUsers()
      const userMap = new Map()

      // 创建用户ID到用户信息的映射
      allUsers.forEach(user => {
        userMap.set(user.id, {
          nickname: user.nickname,
          username: user.username,
          studentId: (user as any).studentId // 临时类型断言
        })
      })

      console.log(`找到 ${allUsers.length} 个用户记录`)

      // 获取所有唯一的用户ID
      const userIds = [...new Set(results.map(p => p.get('userId')))]
      console.log('CourseProgress中的用户ID:', userIds.length)
      console.log('未找到用户记录的ID:', userIds.filter(id => !userMap.has(id)))

      return results.map(progress => {
        const userId = progress.get('userId')
        const userInfo = userMap.get(userId)
        const course = progress.get('course')

        // 改进用户名显示逻辑
        let userName = '未知用户'
        if (userInfo) {
          // 优先显示昵称，其次用户名，最后学员ID
          userName = userInfo.nickname || userInfo.username || userInfo.studentId || '未知用户'
        } else {
          // 如果找不到用户记录，显示更友好的信息
          userName = `未知用户 (${userId ? userId.slice(0, 8) : 'N/A'}...)`
        }

        return {
          id: progress.id,
          userId: userId, // 直接使用_User表的ID
          userName: userName,
          courseId: progress.get('courseId'),
          courseName: course ? course.get('name') : progress.get('courseName') || '',
          courseCategory: course ? course.get('category') : progress.get('courseCategory') || '',
          completedLessons: progress.get('completedLessons'),
          totalLessons: course ? course.get('totalLessons') : progress.get('totalLessons'),
          progress: progress.get('progress'),
          lastStudyDate: progress.get('lastStudyDate'),
          status: progress.get('status'),
          notes: progress.get('notes'),
          courseOrder: course ? course.get('order') : (progress.get('courseOrder') || 1)
        }
      })
    } catch (error) {
      throw new Error('获取进度数据失败')
    }
  }

  static async updateUserRole(userId: string, role: 'member' | 'admin' | 'instructor', permissions: string[]): Promise<void> {
    try {
      const query = new AV.Query(AV.User)
      const user = await query.get(userId)
      user.set('role', role)
      user.set('permissions', permissions)
      await user.save()
    } catch (error) {
      throw new Error('更新用户角色失败')
    }
  }

  static async updateUser(userId: string, updates: {
    email?: string
    nickname?: string
    role?: User['role']
    isActive?: boolean
  }): Promise<void> {
    try {
      // 前端环境下，只更新Student表
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', userId)
      const student = await studentQuery.first()

      if (!student) {
        throw new Error('未找到对应的学员记录')
      }

      // 更新Student表中的字段
      if (updates.email) {
        student.set('email', updates.email)
        // 如果email是QQ邮箱格式，同时更新qqNumber字段
        if (updates.email.includes('@qq.com')) {
          const qqNumber = updates.email.replace('@qq.com', '')
          student.set('qqNumber', qqNumber)
        }
      }
      if (updates.nickname) student.set('nickname', updates.nickname)
      if (updates.isActive !== undefined) student.set('isActive', updates.isActive)

      await student.save()

      // 注意：role字段无法在前端环境中更新，需要后端管理员操作
      if (updates.role && updates.role !== 'student') {
        console.warn('角色更新需要后端管理员权限，当前更新已忽略role字段')
      }
    } catch (error) {
      throw new Error('更新用户失败: ' + error.message)
    }
  }

  static async createUser(userData: {
    username: string
    email: string
    nickname: string
    role: User['role']
    isActive: boolean
    password: string
  }): Promise<User> {
    try {
      // 创建_User记录
      const user = new AV.User()
      user.set('username', userData.username)
      user.set('password', userData.password)
      user.set('email', userData.email)
      user.set('nickname', userData.nickname)
      user.set('role', userData.role)
      user.set('isActive', userData.isActive)
      user.set('joinDate', new Date())
      user.set('guild', 'purplenight')

      await user.signUp()

      // 如果是学员，同时创建Student表记录
      if (userData.role === 'student') {
        try {
          const student = new AV.Object('Student')
          student.set('userId', user.id)
          student.set('username', userData.username)
          student.set('email', userData.email)
          student.set('nickname', userData.nickname)
          student.set('name', userData.nickname)
          student.set('studentId', `PN${Date.now().toString().slice(-6)}`) // 生成学员ID
          student.set('level', '未新训')
          student.set('guild', 'purplenight')
          student.set('isActive', userData.isActive)
          student.set('joinDate', new Date())

          await student.save()
        } catch (error) {
          console.warn('创建Student表记录失败:', error)
        }
      }

      return {
        id: user.id,
        username: user.get('username'),
        email: user.get('email'),
        nickname: user.get('nickname'),
        role: user.get('role'),
        isActive: user.get('isActive'),
        joinDate: user.get('joinDate'),
        permissions: user.get('permissions') || [],
        guild: user.get('guild')
      }
    } catch (error) {
      throw new Error('创建用户失败: ' + error.message)
    }
  }

  static async createCourse(courseData: Omit<Course, 'id' | 'createdAt'>): Promise<Course> {
    try {
      const course = new AV.Object('Course')
      Object.keys(courseData).forEach(key => {
        course.set(key, courseData[key as keyof typeof courseData])
      })

      const savedCourse = await course.save()
      return {
        id: savedCourse.id,
        name: savedCourse.get('name'),
        description: savedCourse.get('description'),
        totalLessons: savedCourse.get('totalLessons'),
        category: savedCourse.get('category'),
        difficulty: savedCourse.get('difficulty'),
        order: savedCourse.get('order'),
        createdAt: savedCourse.get('createdAt')
      }
    } catch (error) {
      throw new Error('创建课程失败')
    }
  }

  // 课程分配相关
  static async assignCourseToUser(userId: string, courseId: string, courseName: string, courseCategory: string, totalLessons: number, courseOrder: number): Promise<CourseProgress> {
    try {
      // 首先通过_User ID查找对应的Student记录
      const studentQuery = new AV.Query('Student')
      studentQuery.equalTo('userId', userId)
      const studentRecord = await studentQuery.first()

      if (!studentRecord) {
        throw new Error('未找到对应的学员记录')
      }

      // 检查是否已经分配过该课程（使用_User ID检查）
      const existingQuery = new AV.Query('CourseProgress')
      existingQuery.equalTo('userId', userId) // 直接使用_User ID
      existingQuery.equalTo('courseId', courseId)
      const existing = await existingQuery.first()

      if (existing) {
        throw new Error('该学员已经分配了此课程')
      }

      const progress = new AV.Object('CourseProgress')
      progress.set('userId', userId) // 直接使用_User ID，保持一致性
      progress.set('courseId', courseId)
      progress.set('courseName', courseName)
      progress.set('courseCategory', courseCategory)
      progress.set('completedLessons', 0)
      progress.set('totalLessons', totalLessons)
      progress.set('progress', 0)
      progress.set('lastStudyDate', new Date())
      progress.set('status', 'not_started')
      progress.set('notes', '')
      progress.set('courseOrder', courseOrder)

      const savedProgress = await progress.save()
      return {
        id: savedProgress.id,
        userId: savedProgress.get('userId'),
        courseId: savedProgress.get('courseId'),
        courseName: savedProgress.get('courseName'),
        courseCategory: savedProgress.get('courseCategory'),
        completedLessons: savedProgress.get('completedLessons'),
        totalLessons: savedProgress.get('totalLessons'),
        progress: savedProgress.get('progress'),
        lastStudyDate: savedProgress.get('lastStudyDate'),
        status: savedProgress.get('status'),
        notes: savedProgress.get('notes'),
        courseOrder: savedProgress.get('courseOrder')
      }
    } catch (error) {
      throw new Error(error.message || '分配课程失败')
    }
  }

  static async batchAssignCourses(userIds: string[], courseIds: string[]): Promise<void> {
    try {
      // 获取课程信息
      const courseQuery = new AV.Query('Course')
      courseQuery.containedIn('objectId', courseIds)
      const courses = await courseQuery.find()

      const progressObjects = []

      for (const userId of userIds) {

        for (const course of courses) {
          // 检查是否已经分配过
          const existingQuery = new AV.Query('CourseProgress')
          existingQuery.equalTo('userId', userId) // 使用User ID而不是Student ID
          existingQuery.equalTo('courseId', course.id)
          const existing = await existingQuery.first()

          if (!existing) {
            const progress = new AV.Object('CourseProgress')
            progress.set('userId', userId)
            progress.set('courseId', course.id)
            progress.set('courseName', course.get('name'))
            progress.set('courseCategory', course.get('category'))
            progress.set('courseOrder', course.get('order'))
            progress.set('progress', 0)
            progress.set('status', 'not_started')
            progress.set('lastStudyDate', null)

            progressObjects.push(progress)
          }
        }
      }

      if (progressObjects.length > 0) {
        await AV.Object.saveAll(progressObjects)
      }
    } catch (error) {
      console.error('批量分配课程失败:', error)
      throw new Error(error.message || '批量分配课程失败')
    }
  }



  static async deleteCourseProgress(progressId: string): Promise<void> {
    try {
      const query = new AV.Query('CourseProgress')
      const progress = await query.get(progressId)
      await progress.destroy()
    } catch (error) {
      throw new Error('删除课程进度失败')
    }
  }

  // 获取用户已分配的课程ID列表
  static async getUserAssignedCourseIds(userId: string): Promise<string[]> {
    try {
      // 直接查询已分配的课程
      const progressQuery = new AV.Query('CourseProgress')
      progressQuery.equalTo('userId', userId) // 直接使用_User ID
      progressQuery.select('courseId')
      const progressList = await progressQuery.find()

      return progressList.map(p => p.get('courseId'))
    } catch (error) {
      console.warn('获取用户已分配课程失败:', error)
      return []
    }
  }

  // 批量获取多个用户的已分配课程
  static async getBatchUserAssignedCourses(userIds: string[]): Promise<Map<string, string[]>> {
    try {
      // 直接批量查询所有进度记录
      const progressQuery = new AV.Query('CourseProgress')
      progressQuery.containedIn('userId', userIds) // 直接使用_User ID
      progressQuery.select(['userId', 'courseId'])
      const progressList = await progressQuery.find()

      // 按User ID分组
      const userCourseMap = new Map()
      progressList.forEach(progress => {
        const userId = progress.get('userId')
        const courseId = progress.get('courseId')

        if (!userCourseMap.has(userId)) {
          userCourseMap.set(userId, [])
        }
        userCourseMap.get(userId).push(courseId)
      })

      // 确保所有用户都有记录（即使是空数组）
      const result = new Map()
      userIds.forEach(userId => {
        result.set(userId, userCourseMap.get(userId) || [])
      })

      return result
    } catch (error) {
      console.warn('批量获取用户已分配课程失败:', error)
      return new Map()
    }
  }

  // 一键导入学员数据
  static async importStudentsFromMembers(): Promise<{ success: number, failed: number, errors: string[] }> {
    try {
      // 1. 查询Member表中符合条件的记录
      const memberQuery = new AV.Query('Member')
      memberQuery.equalTo('guild', 'purplenight')
      memberQuery.notEqualTo('stage', '紫夜')
      memberQuery.equalTo('status', '正常')
      const members = await memberQuery.find()

      console.log(`找到 ${members.length} 个符合条件的成员`)

      let successCount = 0
      let failedCount = 0
      const errors: string[] = []

      for (const member of members) {
        try {
          const nickname = member.get('nickname')
          const qqNumber = member.get('qqNumber')

          if (!nickname || !qqNumber) {
            errors.push(`成员 ${nickname || '未知'} 缺少必要信息（昵称或QQ号）`)
            failedCount++
            continue
          }

          // 检查Student表中是否已存在相同昵称的记录（避免重复导入）
          const existingStudentQuery = new AV.Query('Student')
          existingStudentQuery.equalTo('nickname', nickname)
          const existingStudent = await existingStudentQuery.first()

          if (existingStudent) {
            errors.push(`学员 ${nickname} 已存在，跳过导入`)
            failedCount++
            continue
          }

          // 创建Student记录
          const Student = AV.Object.extend('Student')
          const student = new Student()

          // 加密密码（使用QQ号作为初始密码）
          const hashedPassword = await PasswordUtils.hashPassword(qqNumber.toString())

          student.set('nickname', nickname)
          student.set('username', nickname)
          student.set('qqNumber', qqNumber)
          student.set('password', hashedPassword) // 保存加密后的密码
          student.set('level', '未新训')
          student.set('guild', 'purplenight')
          student.set('joinDate', new Date())
          student.set('isActive', true)
          student.set('stage', member.get('stage')) // 保存原始stage信息
          student.set('memberStatus', member.get('status')) // 保存原始status信息

          await student.save()

          successCount++
          console.log(`成功导入学员: ${nickname}`)

        } catch (error) {
          failedCount++
          const nickname = member.get('nickname') || '未知用户'
          errors.push(`导入 ${nickname} 失败: ${error.message}`)
          console.error(`导入 ${nickname} 失败:`, error)
        }
      }

      return {
        success: successCount,
        failed: failedCount,
        errors: errors
      }

    } catch (error) {
      console.error('导入学员数据失败:', error)
      throw new Error('导入学员数据失败: ' + error.message)
    }
  }

  static async getStatistics(): Promise<{
    totalUsers: number
    activeUsers: number
    totalCourses: number
    usersByLevel: Record<string, number>
    courseCompletionRate: number
    recentActivity: number
  }> {
    try {
      // 使用Student表查询用户统计（避免_User表权限问题）
      let allUsers: any[] = []
      let activeUsers: any[] = []
      let usersByLevel: Record<string, number> = {
        '未新训': 0,
        '新训初期': 0,
        '新训一期': 0,
        '新训二期': 0,
        '新训三期': 0,
        '新训准考': 0,
        '正式队员': 0,
        '紫夜尖兵': 0
      }

      try {
        const studentQuery = new AV.Query('Student')
        studentQuery.equalTo('guild', 'purplenight')
        allUsers = await studentQuery.find()

        activeUsers = allUsers.filter(user => user.get('isActive') !== false)

        // 按等级统计用户
        allUsers.forEach(user => {
          const level = user.get('level') || '未新训'
          if (usersByLevel.hasOwnProperty(level)) {
            usersByLevel[level]++
          }
        })
      } catch (error) {
        console.warn('无法查询Student表，使用默认统计数据')
        // 如果Student表不存在，使用基于CourseProgress的统计
      }

      // 查询课程统计
      let totalCourses = 0
      try {
        const courseQuery = new AV.Query('Course')
        const allCourses = await courseQuery.find()
        totalCourses = allCourses.length
      } catch (error) {
        console.warn('无法查询Course表')
      }

      // 查询进度统计
      let courseCompletionRate = 0
      let recentActivity = 0
      try {
        const progressQuery = new AV.Query('CourseProgress')
        const allProgress = await progressQuery.find()

        const completedProgress = allProgress.filter(p => p.get('status') === 'completed')
        courseCompletionRate = allProgress.length > 0
          ? Math.round((completedProgress.length / allProgress.length) * 100)
          : 0

        // 计算最近活动（最近7天的学习记录）
        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

        const recentActivityQuery = new AV.Query('CourseProgress')
        recentActivityQuery.greaterThan('lastStudyDate', oneWeekAgo)
        recentActivity = await recentActivityQuery.count()

        // 如果没有Student表数据，从CourseProgress推断用户数
        if (allUsers.length === 0) {
          const uniqueUserIds = new Set(allProgress.map(p => p.get('userId')))
          allUsers = Array.from(uniqueUserIds).map(id => ({ id }))
          activeUsers = allUsers // 假设所有有进度的用户都是活跃的
        }
      } catch (error) {
        console.warn('无法查询CourseProgress表')
      }

      return {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        totalCourses,
        usersByLevel,
        courseCompletionRate,
        recentActivity
      }
    } catch (error) {
      console.error('获取统计数据失败:', error)
      throw new Error('获取统计数据失败')
    }
  }
}
