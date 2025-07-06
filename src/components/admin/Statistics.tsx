import React, { useState, useEffect } from 'react'
import { LeanCloudService } from '../../services/leancloudService'
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp,
  Award,
  Calendar,
  Download,
  RefreshCw,
  PieChart,
  Activity
} from 'lucide-react'

export default function Statistics() {
  const [statistics, setStatistics] = useState<any>(null)
  const [progressData, setProgressData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const [stats, progress] = await Promise.all([
        LeanCloudService.getStatistics(),
        LeanCloudService.getAllCourseProgress()
      ])
      setStatistics(stats)
      setProgressData(progress)
    } catch (error) {
      setError('加载统计数据失败')
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

  // 计算课程类别完成率
  const calculateCategoryStats = () => {
    const categories = ['入门课程', '标准技能一阶课程', '标准技能二阶课程', '团队训练', '进阶课程']
    return categories.map(category => {
      const categoryProgress = progressData.filter(p => p.courseCategory === category)
      const completed = categoryProgress.filter(p => p.status === 'completed').length
      const total = categoryProgress.length
      return {
        category,
        completed,
        total,
        rate: total > 0 ? Math.round((completed / total) * 100) : 0
      }
    })
  }

  // 计算月度活跃度
  const calculateMonthlyActivity = () => {
    const now = new Date()
    const months = []
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('zh-CN', { month: 'short' })
      
      // 模拟数据
      const activity = Math.floor(Math.random() * 50) + 10
      months.push({
        month: monthName,
        activity
      })
    }
    
    return months
  }

  const categoryStats = calculateCategoryStats()
  const monthlyActivity = calculateMonthlyActivity()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 dark:border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">数据统计</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">紫夜公会学习数据分析</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadStatistics}
            className="btn-secondary flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            刷新数据
          </button>
          <button className="btn-primary flex items-center">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Overview Stats */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总用户数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalUsers}</p>
                <p className="text-xs text-green-600 dark:text-green-400">活跃: {statistics.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总课程数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalCourses}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">5个类别</p>
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">完成率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.courseCompletionRate}%</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">整体进度</p>
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <Activity className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">近期活动</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.recentActivity}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">本周操作</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Level Distribution */}
        {statistics && (
          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">用户等级分布</h2>
            </div>
            <div className="space-y-3">
              {Object.entries(statistics.usersByLevel).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Award className="w-4 h-4 text-purple-500 dark:text-purple-400 mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                      <div 
                        className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full" 
                        style={{ width: `${((count as number) / statistics.totalUsers) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">
                      {count as number}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Category Completion */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">课程类别完成率</h2>
          </div>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 dark:text-gray-300">{stat.category}</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {stat.completed}/{stat.total} ({stat.rate}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${stat.rate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Activity */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center mb-4">
          <Calendar className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">月度学习活跃度</h2>
        </div>
        <div className="flex items-end space-x-4 h-64">
          {monthlyActivity.map((month, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-green-500 dark:bg-green-600 rounded-t-md transition-all duration-500 hover:bg-green-600 dark:hover:bg-green-500"
                style={{ height: `${(month.activity / 60) * 100}%` }}
              ></div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{month.month}</div>
              <div className="text-xs text-gray-500 dark:text-gray-500">{month.activity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">学习进度统计</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">总进度记录</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">{progressData.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">已完成课程</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {progressData.filter(p => p.status === 'completed').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">进行中课程</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                {progressData.filter(p => p.status === 'in_progress').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">未开始课程</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {progressData.filter(p => p.status === 'not_started').length}
              </span>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">用户活跃度</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">日活跃用户</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.floor(statistics?.activeUsers * 0.6) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">周活跃用户</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {Math.floor(statistics?.activeUsers * 0.8) || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">月活跃用户</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {statistics?.activeUsers || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">活跃率</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                {statistics ? Math.round((statistics.activeUsers / statistics.totalUsers) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">系统概况</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">数据更新时间</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">系统状态</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">正常运行</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">数据库</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">演示模式</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">版本</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
