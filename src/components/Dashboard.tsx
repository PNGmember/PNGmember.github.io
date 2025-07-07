import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LeanCloudService } from '../services/leancloudService'
import {
  BookOpen,
  TrendingUp,
  Clock,
  Award,
  ChevronRight,
  Calendar,
  Star,
  Target,
  X
} from 'lucide-react'
import type { CourseProgress, MemberLevel } from '../config/leancloud'

export default function Dashboard() {
  const { user } = useAuth()
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [memberLevel, setMemberLevel] = useState<{ current: MemberLevel, next?: MemberLevel, progressToNext: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const progress = await LeanCloudService.getUserCourseProgress(user!.id)
      setCourseProgress(progress)

      // 获取学员的实际等级（包括手动设置的等级）
      const actualLevel = await LeanCloudService.getStudentActualLevel(user!.id)

      // 计算成员等级进度
      const levelInfo = LeanCloudService.getMemberLevelProgress(progress, actualLevel)
      setMemberLevel(levelInfo)
    } catch (error) {
      setError('加载数据失败')
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计算统计数据
  const stats = {
    totalCourses: courseProgress.length,
    completedCourses: courseProgress.filter(p => p.status === 'completed').length,
    inProgressCourses: courseProgress.filter(p => p.status === 'in_progress').length,
    averageProgress: courseProgress.length > 0
      ? Math.round(courseProgress.reduce((sum, p) => sum + p.progress, 0) / courseProgress.length)
      : 0
  }

  // 按课程类别统计
  const categoryStats = {
    '入门课程': courseProgress.filter(p => p.courseCategory === '入门课程' && p.status === 'completed').length,
    '标准技能一阶课程': courseProgress.filter(p => p.courseCategory === '标准技能一阶课程' && p.status === 'completed').length,
    '标准技能二阶课程': courseProgress.filter(p => p.courseCategory === '标准技能二阶课程' && p.status === 'completed').length,
    '团队训练': courseProgress.filter(p => p.courseCategory === '团队训练' && p.status === 'completed').length,
    '进阶课程': courseProgress.filter(p => p.courseCategory === '进阶课程' && p.status === 'completed').length
  }

  // 最近学习的课程
  const recentCourses = courseProgress
    .filter(p => p.lastStudyDate)
    .sort((a, b) => new Date(b.lastStudyDate).getTime() - new Date(a.lastStudyDate).getTime())
    .slice(0, 3)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">加载中...</span>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section with Level */}
      <div className="card-elevated bg-gradient-to-br from-purple-night-600 via-indigo-600 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-3">
                欢迎回来，{user?.nickname || user?.username}！
              </h1>
              <p className="text-white/80 text-lg">
                继续你的学习之旅，掌握新的技能
              </p>
            </div>
            {memberLevel && (
              <div className="text-right">
                <div className="flex items-center justify-end mb-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-3">
                    <Star className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold block">{memberLevel.current.level}</span>
                    <span className="text-white/80 text-sm">{memberLevel.current.description}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Level Progress */}
          {memberLevel && memberLevel.next && (
            <div className="mt-6 p-6 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Target className="w-6 h-6 mr-3" />
                  <h3 className="text-lg font-semibold">等级进度</h3>
                </div>
                <span className="text-white/80 text-sm">
                  下一等级：{memberLevel.next.level}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{memberLevel.current.level}</span>
                  <span>{memberLevel.next.level}</span>
                </div>
                <div className="progress-bar bg-white/20">
                  <div
                    className="progress-fill bg-gradient-to-r from-yellow-400 to-orange-400"
                    style={{ width: `${memberLevel.progressToNext}%` }}
                  ></div>
                </div>
                <div className="text-center mt-2 text-sm">
                  {memberLevel.progressToNext}% 完成
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-sm">
                  <span className="font-semibold">下一等级要求：</span>
                  {memberLevel.next.requirements.join('、')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-2xl shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400 dark:text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-interactive dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">总课程数</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="card-interactive dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">已完成</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="card-interactive dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">进行中</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.inProgressCourses}</p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">平均进度</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Category Progress */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">课程类别进度</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{categoryStats['入门课程']}/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">入门课程</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(categoryStats['入门课程'] / 7) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{categoryStats['标准技能一阶课程']}/6</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">标准技能一阶</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(categoryStats['标准技能一阶课程'] / 6) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{categoryStats['标准技能二阶课程']}/5</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">标准技能二阶</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-yellow-500 h-2 rounded-full"
                style={{ width: `${(categoryStats['标准技能二阶课程'] / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{categoryStats['团队训练']}/5</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">团队训练</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(categoryStats['团队训练'] / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">{categoryStats['进阶课程']}/6</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">进阶课程</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{ width: `${(categoryStats['进阶课程'] / 6) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Courses */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">最近学习</h2>
            <Link 
              to="/progress" 
              className="text-purple-night-600 hover:text-purple-night-700 dark:text-purple-night-400 dark:hover:text-purple-night-300 text-sm font-medium flex items-center"
            >
              查看全部
              <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          {recentCourses.length > 0 ? (
            <div className="space-y-3">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      <span className="text-purple-night-600 dark:text-purple-night-400 font-bold mr-2">
                        {LeanCloudService.getCourseNumber(course.courseOrder || 1)}
                      </span>
                      {course.courseName}
                    </h3>
                    <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(course.lastStudyDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{course.progress}%</div>
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                      <div 
                        className="bg-purple-night-600 dark:bg-purple-night-500 h-2 rounded-full" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>暂无学习记录</p>
              <p className="text-sm">开始你的第一门课程吧！</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速操作</h2>
          <div className="space-y-3">
            <Link 
              to="/progress" 
              className="flex items-center p-3 bg-purple-night-50 hover:bg-purple-night-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5 text-purple-night-600 dark:text-purple-night-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">查看课程进度</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">查看所有课程的学习进度</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-auto" />
            </Link>
            
            <Link 
              to="/training-report" 
              className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">新训考核报告</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">查看培训考核相关信息</div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-auto" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
