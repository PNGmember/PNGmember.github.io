import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { LeanCloudService } from '../services/leancloudService'
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  PauseCircle,
  Calendar,
  TrendingUp,
  Search,
  Filter
} from 'lucide-react'
import type { CourseProgress } from '../config/leancloud'

export default function CourseProgress() {
  const { user } = useAuth()
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [filteredProgress, setFilteredProgress] = useState<CourseProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (user) {
      loadCourseProgress()
    }
  }, [user])

  useEffect(() => {
    filterCourses()
  }, [courseProgress, searchTerm, statusFilter])

  const loadCourseProgress = async () => {
    try {
      setLoading(true)
      const progress = await LeanCloudService.getUserCourseProgress(user!.id)
      setCourseProgress(progress)
    } catch (error) {
      setError('加载课程进度失败')
      console.error('Failed to load course progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCourses = () => {
    let filtered = courseProgress

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(course => course.status === statusFilter)
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.courseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.courseCategory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.notes?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredProgress(filtered)
  }

  const getStatusIcon = (status: string, progress: number) => {
    // 根据进度百分比动态判断图标
    if (progress >= 100) {
      return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
    } else if (progress > 0) {
      return <PlayCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
    } else {
      return <BookOpen className="w-5 h-5 text-gray-400 dark:text-gray-500" />
    }
  }

  const getStatusText = (status: string, progress: number) => {
    // 根据进度百分比动态判断状态
    if (progress >= 100) {
      return '已完成'
    } else if (progress > 0) {
      return '进行中'
    } else {
      return '未开始'
    }
  }

  const getStatusColor = (status: string, progress: number) => {
    // 根据进度百分比动态判断颜色
    if (progress >= 100) {
      return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
    } else if (progress > 0) {
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
    } else {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-night-600 dark:border-purple-400"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">课程进度</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">查看你的学习进度和课程状态</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索课程..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field pl-10 appearance-none"
              >
                <option value="all">全部状态</option>
                <option value="not_started">未开始</option>
                <option value="in_progress">进行中</option>
                <option value="paused">已暂停</option>
                <option value="completed">已完成</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Course List */}
      {filteredProgress.length > 0 ? (
        <div className="grid gap-6">
          {filteredProgress.map((course) => (
            <div key={course.id} className="card dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {getStatusIcon(course.status, course.progress)}
                      <div className="ml-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          <span className="text-purple-night-600 dark:text-purple-400 font-bold mr-2">
                            {LeanCloudService.getCourseNumber(course.courseOrder || 1)}
                          </span>
                          {course.courseName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {course.courseCategory} - {course.courseId}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status, course.progress)}`}>
                      {getStatusText(course.status, course.progress)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      进度: {course.progress >= 100 ? '1/1' : `${course.completedLessons || 0}/${course.totalLessons || 1}`} 课时
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4 mr-2" />
                      完成度: {course.progress}%
                    </div>
                    {course.lastStudyDate && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        最后学习: {new Date(course.lastStudyDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>学习进度</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-night-600 dark:bg-purple-500 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Notes */}
                  {course.notes && (
                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-medium">备注：</span>
                        {course.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card dark:bg-slate-800 dark:border-slate-700 text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchTerm || statusFilter !== 'all' ? '没有找到匹配的课程' : '暂无课程进度'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' 
              ? '尝试调整搜索条件或筛选器' 
              : '开始你的第一门课程吧！'
            }
          </p>
        </div>
      )}
    </div>
  )
}
