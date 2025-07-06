import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LeanCloudService } from '../../services/leancloudService'
import {
  Users,
  BookOpen,
  TrendingUp,
  BarChart3,
  UserCheck,
  Clock,
  Award,
  Activity,
  UserPlus
} from 'lucide-react'

export default function AdminDashboard() {
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStatistics()
  }, [])

  const loadStatistics = async () => {
    try {
      setLoading(true)
      const stats = await LeanCloudService.getStatistics()
      setStatistics(stats)
    } catch (error) {
      setError('加载统计数据失败')
      console.error('Failed to load statistics:', error)
    } finally {
      setLoading(false)
    }
  }

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">管理概览</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">紫夜公会成员信息管理系统</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
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
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">活跃用户</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.activeUsers}</p>
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总课程数</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="card dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <TrendingUp className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">完成率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.courseCompletionRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Level Distribution */}
      {statistics && (
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">用户等级分布</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {Object.entries(statistics.usersByLevel).map(([level, count]) => (
              <div key={level} className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{count as number}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{level}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速操作</h2>
          <div className="space-y-3">
            <Link 
              to="/admin/users" 
              className="flex items-center p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
            >
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">用户管理</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">管理用户信息和权限</div>
              </div>
            </Link>
            
            <Link 
              to="/admin/courses" 
              className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <BookOpen className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">课程管理</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">添加和编辑课程信息</div>
              </div>
            </Link>
            
            <Link
              to="/admin/assignment"
              className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
            >
              <UserPlus className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">课程分配</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">为学员分配课程</div>
              </div>
            </Link>

            <Link
              to="/admin/progress"
              className="flex items-center p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">进度管理</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">查看和更新学习进度</div>
              </div>
            </Link>
            
            <Link 
              to="/admin/statistics" 
              className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">数据统计</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">查看详细统计报表</div>
              </div>
            </Link>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">系统状态</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Activity className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">系统状态</span>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                正常运行
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">最近活动</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {statistics?.recentActivity || 0} 项操作
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Award className="w-5 h-5 text-purple-500 dark:text-purple-400 mr-2" />
                <span className="text-sm text-gray-700 dark:text-gray-300">数据库</span>
              </div>
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium rounded-full">
                正常运行
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
