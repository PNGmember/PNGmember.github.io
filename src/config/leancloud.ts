import AV from 'leancloud-storage'

// LeanCloud 配置
const LEANCLOUD_CONFIG = {
  appId: 'zgIzsvGerDuX3SJmLsKDKs6k-gzGzoHsz', // AppID
  appKey: 'wyqlYopPy4q7z9rUo9SaWeY8', // AppKey
  serverURL: 'https://zgizsvge.lc-cn-n1-shared.com' // REST API 服务器地址
}

// 初始化 LeanCloud
try {
  AV.init({
    appId: LEANCLOUD_CONFIG.appId,
    appKey: LEANCLOUD_CONFIG.appKey,
    serverURL: LEANCLOUD_CONFIG.serverURL
  })
  console.log('LeanCloud 初始化成功')
} catch (error) {
  console.error('LeanCloud 初始化失败:', error)
}

export default AV

// 数据模型定义
export interface User {
  id: string
  username: string
  email: string
  nickname: string
  joinDate: Date
  isActive: boolean
  role: 'member' | 'admin' | 'guild_admin' | 'super_admin' | 'instructor' | 'student'
  permissions?: string[]
  guild?: string
  qqNumber?: string
  level?: string
}

export interface StudentUser {
  id: string
  username: string
  email: string
  nickname: string
  joinDate: Date
  isActive: boolean
  role: 'student'
  level: string
  guild: string
  mentor?: string
}

export interface Course {
  id: string
  name: string
  description: string
  totalLessons: number
  category: '入门课程' | '标准技能一阶课程' | '标准技能二阶课程' | '团队训练' | '进阶课程'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  order: number // 课程顺序
}

export interface CourseProgress {
  id: string
  userId: string
  courseId: string
  courseName: string
  courseCategory: string
  completedLessons: number
  totalLessons: number
  progress: number // 0-100
  lastStudyDate: Date
  status: 'not_started' | 'in_progress' | 'completed' | 'paused'
  notes?: string
  courseOrder?: number // 课程顺序，用于生成编号
}

export interface MemberLevel {
  level: '未新训' | '新训初期' | '新训一期' | '新训二期' | '新训三期' | '新训准考' | '正式队员' | '紫夜尖兵'
  description: string
  requirements: string[]
}

export interface TrainingReport {
  id: string
  userId: string
  reportType: 'monthly' | 'quarterly' | 'annual'
  period: string
  overallProgress: number
  completedCourses: number
  totalCourses: number
  studyHours: number
  achievements: string[]
  recommendations: string[]
  createdAt: Date
}
