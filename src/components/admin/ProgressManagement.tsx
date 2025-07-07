import React, { useState, useEffect, useCallback } from 'react'
import { LeanCloudService } from '../../services/leancloudService'
import {
  TrendingUp,
  Search,
  Filter,
  User,
  BookOpen,
  CheckCircle,
  Clock,
  PlayCircle,
  PauseCircle,
  Calendar,
  Edit,
  Save,
  X,
  Star,
  Trash2,
  AlertCircle,
  Plus,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
  Settings
} from 'lucide-react'
import type { CourseProgress } from '../../config/leancloud'

export default function ProgressManagement() {
  const [progressData, setProgressData] = useState<(CourseProgress & { userName: string })[]>([])
  const [filteredProgress, setFilteredProgress] = useState<(CourseProgress & { userName: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [editingProgress, setEditingProgress] = useState<(CourseProgress & { userName: string }) | null>(null)

  // 排序状态
  const [sortField, setSortField] = useState<string>('userName')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  // 批量选择状态
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showBatchModal, setShowBatchModal] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)
  const [batchStatus, setBatchStatus] = useState<CourseProgress['status']>('in_progress')

  const categories = ['入门课程', '标准技能一阶课程', '标准技能二阶课程', '团队训练', '进阶课程']

  useEffect(() => {
    loadProgressData()
  }, [])

  useEffect(() => {
    filterProgress()
  }, [progressData, searchTerm, statusFilter, categoryFilter, sortField, sortDirection])

  const loadProgressData = async () => {
    try {
      setLoading(true)
      const data = await LeanCloudService.getAllCourseProgress()
      setProgressData(data)
    } catch (error) {
      setError('加载进度数据失败')
      console.error('Failed to load progress data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProgress = useCallback(() => {
    console.log('执行filterProgress，排序字段:', sortField, '排序方向:', sortDirection)
    let filtered = progressData

    // 按状态筛选
    if (statusFilter !== 'all') {
      filtered = filtered.filter(progress => progress.status === statusFilter)
    }

    // 按类别筛选
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(progress => progress.courseCategory === categoryFilter)
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(progress =>
        progress.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progress.courseId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    console.log('排序前数据量:', filtered.length)
    // 排序
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof typeof a]
      let bValue: any = b[sortField as keyof typeof b]

      // 特殊处理日期字段
      if (sortField === 'lastStudyDate') {
        // 将日期转换为时间戳，空值排在最后
        aValue = a.lastStudyDate ? new Date(a.lastStudyDate).getTime() : (sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER)
        bValue = b.lastStudyDate ? new Date(b.lastStudyDate).getTime() : (sortDirection === 'asc' ? Number.MAX_SAFE_INTEGER : Number.MIN_SAFE_INTEGER)
      }

      // 特殊处理数字字段
      else if (sortField === 'progress' || sortField === 'courseOrder') {
        aValue = Number(aValue) || 0
        bValue = Number(bValue) || 0
      }

      // 字符串比较
      else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      // 处理null/undefined值
      if (aValue == null && bValue == null) return 0
      if (aValue == null) return sortDirection === 'asc' ? 1 : -1
      if (bValue == null) return sortDirection === 'asc' ? -1 : 1

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    console.log('排序后前3项:', filtered.slice(0, 3).map(item => ({
      userName: item.userName,
      courseName: item.courseName,
      [sortField]: item[sortField as keyof typeof item]
    })))

    setFilteredProgress(filtered)
  }, [progressData, searchTerm, statusFilter, categoryFilter, sortField, sortDirection])

  // 处理排序
  const handleSort = (field: string) => {
    console.log('排序字段:', field, '当前字段:', sortField, '当前方向:', sortDirection)
    if (sortField === field) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      console.log('切换排序方向:', newDirection)
      setSortDirection(newDirection)
    } else {
      console.log('设置新排序字段:', field)
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // 获取排序图标
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 ml-1" /> :
      <ChevronDown className="w-4 h-4 ml-1" />
  }

  // 批量选择处理
  const handleSelectAll = () => {
    if (selectedItems.length === filteredProgress.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredProgress.map(p => p.id))
    }
  }

  const handleSelectItem = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  // 批量更新进度（添加限流处理）
  const handleBatchUpdate = async () => {
    try {
      setError('') // 清除之前的错误
      const updates = {
        progress: batchProgress,
        status: batchStatus,
        lastStudyDate: new Date()
      }

      // 分批处理，避免触发限流
      const batchSize = 3 // 每批处理3个请求
      const delay = 500 // 每批之间延迟500ms

      for (let i = 0; i < selectedItems.length; i += batchSize) {
        const batch = selectedItems.slice(i, i + batchSize)

        try {
          // 并发处理当前批次
          await Promise.all(
            batch.map(id => LeanCloudService.updateCourseProgress(id, updates))
          )

          // 更新本地状态（当前批次）
          setProgressData(prev => prev.map(p =>
            batch.includes(p.id) ? { ...p, ...updates } : p
          ))

          // 如果不是最后一批，等待一段时间
          if (i + batchSize < selectedItems.length) {
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        } catch (batchError) {
          console.error(`批次 ${Math.floor(i / batchSize) + 1} 更新失败:`, batchError)
          throw new Error(`批次更新失败: ${batchError.message}`)
        }
      }

      setSelectedItems([])
      setShowBatchModal(false)
      setBatchProgress(0)
      setBatchStatus('in_progress')

      // 显示成功消息
      alert(`成功更新了 ${selectedItems.length} 个进度记录`)
    } catch (error) {
      console.error('批量更新失败:', error)
      setError(`批量更新失败: ${error.message || '未知错误'}`)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <PlayCircle className="w-4 h-4 text-blue-500" />
      case 'paused':
        return <PauseCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return '已完成'
      case 'in_progress': return '进行中'
      case 'paused': return '已暂停'
      case 'not_started': return '未开始'
      default: return '未知'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'in_progress': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'paused': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case 'not_started': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '入门课程': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case '标准技能一阶课程': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case '标准技能二阶课程': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
      case '团队训练': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
      case '进阶课程': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const handleUpdateProgress = async (progressId: string, updates: Partial<CourseProgress>) => {
    try {
      await LeanCloudService.updateCourseProgress(progressId, updates)
      // 更新本地状态
      setProgressData(progressData.map(p =>
        p.id === progressId ? { ...p, ...updates } : p
      ))
      setEditingProgress(null)
    } catch (error) {
      setError('更新进度失败')
    }
  }

  const handleDeleteProgress = async (progressId: string, courseName: string, userName: string) => {
    if (window.confirm(`确定要删除 ${userName} 的课程"${courseName}"进度吗？此操作不可恢复。`)) {
      try {
        await LeanCloudService.deleteCourseProgress(progressId)
        // 更新本地状态
        setProgressData(progressData.filter(p => p.id !== progressId))
      } catch (error) {
        setError('删除进度失败')
      }
    }
  }

  const calculateUserLevel = (userId: string) => {
    const userProgress = progressData.filter(p => p.userId === userId)
    const levelInfo = LeanCloudService.getMemberLevelProgress(userProgress)
    return levelInfo.current.level
  }

  // 统计数据
  const stats = {
    totalProgress: progressData.length,
    completedCourses: progressData.filter(p => p.status === 'completed').length,
    inProgressCourses: progressData.filter(p => p.status === 'in_progress').length,
    averageProgress: progressData.length > 0 
      ? Math.round(progressData.reduce((sum, p) => sum + p.progress, 0) / progressData.length)
      : 0
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">学习进度管理</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">管理所有成员的学习进度</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">总进度记录</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalProgress}</p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">已完成</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <PlayCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">进行中</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.inProgressCourses}</p>
            </div>
          </div>
        </div>

        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">平均进度</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.averageProgress}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Batch Actions */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="搜索用户或课程..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

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

            <div className="sm:w-48">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field"
              >
                <option value="all">全部类别</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Batch Actions */}
          {selectedItems.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  已选择 {selectedItems.length} 项
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBatchModal(true)}
                  className="btn-primary text-sm flex items-center"
                >
                  <Settings className="w-4 h-4 mr-1" />
                  批量更改进度
                </button>
                <button
                  onClick={() => setSelectedItems([])}
                  className="btn-secondary text-sm"
                >
                  取消选择
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress List */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex items-center">
                    <button
                      onClick={handleSelectAll}
                      className="mr-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                    >
                      {selectedItems.length === filteredProgress.length && filteredProgress.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSort('userName')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      学员信息
                      {getSortIcon('userName')}
                    </button>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => handleSort('courseName')}
                      className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-left"
                    >
                      课程信息
                      {getSortIcon('courseName')}
                    </button>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSort('courseOrder')}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center"
                        title="按课程编号排序"
                      >
                        编号{getSortIcon('courseOrder')}
                      </button>
                      <button
                        onClick={() => handleSort('courseCategory')}
                        className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 flex items-center"
                        title="按课程类别排序"
                      >
                        类别{getSortIcon('courseCategory')}
                      </button>
                    </div>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('progress')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    完成度
                    {getSortIcon('progress')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    状态
                    {getSortIcon('status')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSort('lastStudyDate')}
                    className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                  >
                    最后学习
                    {getSortIcon('lastStudyDate')}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProgress.map((progress) => (
                <tr key={progress.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleSelectItem(progress.id)}
                        className="mr-3 p-1 rounded hover:bg-gray-200 dark:hover:bg-slate-600"
                      >
                        {selectedItems.includes(progress.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        )}
                      </button>
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {progress.userName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {calculateUserLevel(progress.userId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          <span className="text-purple-night-600 dark:text-purple-400 font-bold mr-2">
                            {LeanCloudService.getCourseNumber(progress.courseOrder || 1)}
                          </span>
                          {progress.courseName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {progress.courseId}
                        </div>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${getCategoryColor(progress.courseCategory)}`}>
                          {progress.courseCategory}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                          {progress.progress}%
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              progress.progress === 100
                                ? 'bg-green-500 dark:bg-green-500'
                                : progress.progress >= 50
                                ? 'bg-blue-500 dark:bg-blue-500'
                                : 'bg-yellow-500 dark:bg-yellow-500'
                            }`}
                            style={{ width: `${progress.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(progress.status)}
                      <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(progress.status)}`}>
                        {getStatusText(progress.status)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {progress.lastStudyDate && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(progress.lastStudyDate).toLocaleDateString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingProgress(progress)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="编辑进度"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProgress(progress.id, progress.courseName, progress.userName)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="删除进度"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Progress Modal */}
      {editingProgress && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">编辑学习进度</h3>
              <button
                onClick={() => setEditingProgress(null)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  学员：{editingProgress.userName}
                </label>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  课程：{editingProgress.courseName}
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  完成度: {editingProgress.progress}%
                </label>
                <div className="space-y-3">
                  {/* 滑动条 */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={editingProgress.progress}
                    onChange={(e) => {
                      const progress = parseInt(e.target.value)
                      setEditingProgress({
                        ...editingProgress,
                        progress: progress,
                        // 根据进度自动设置状态
                        status: progress === 0 ? 'not_started' :
                               progress === 100 ? 'completed' : 'in_progress'
                      })
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${editingProgress.progress}%, #e5e7eb ${editingProgress.progress}%, #e5e7eb 100%)`
                    }}
                  />

                  {/* 快捷按钮 */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingProgress({
                        ...editingProgress,
                        progress: 0,
                        status: 'not_started'
                      })}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300 rounded-md transition-colors"
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProgress({
                        ...editingProgress,
                        progress: 25,
                        status: 'in_progress'
                      })}
                      className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md transition-colors"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProgress({
                        ...editingProgress,
                        progress: 50,
                        status: 'in_progress'
                      })}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-md transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProgress({
                        ...editingProgress,
                        progress: 75,
                        status: 'in_progress'
                      })}
                      className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md transition-colors"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProgress({
                        ...editingProgress,
                        progress: 100,
                        status: 'completed'
                      })}
                      className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md transition-colors"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  状态
                </label>
                <select
                  value={editingProgress.status}
                  onChange={(e) => setEditingProgress({
                    ...editingProgress,
                    status: e.target.value as CourseProgress['status']
                  })}
                  className="input-field"
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="paused">已暂停</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  备注
                </label>
                <textarea
                  value={editingProgress.notes || ''}
                  onChange={(e) => setEditingProgress({
                    ...editingProgress,
                    notes: e.target.value
                  })}
                  className="input-field"
                  rows={3}
                  placeholder="添加备注..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingProgress(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleUpdateProgress(editingProgress.id, {
                  progress: editingProgress.progress,
                  status: editingProgress.status,
                  notes: editingProgress.notes,
                  lastStudyDate: new Date()
                })}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Update Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">批量更改进度</h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                将为 <span className="font-medium text-blue-600 dark:text-blue-400">{selectedItems.length}</span> 个进度记录应用以下更改：
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  完成度: {batchProgress}%
                </label>
                <div className="space-y-3">
                  {/* 滑动条 */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={batchProgress}
                    onChange={(e) => {
                      const progress = parseInt(e.target.value)
                      setBatchProgress(progress)
                      // 根据进度自动设置状态
                      setBatchStatus(
                        progress === 0 ? 'not_started' :
                        progress === 100 ? 'completed' : 'in_progress'
                      )
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${batchProgress}%, #e5e7eb ${batchProgress}%, #e5e7eb 100%)`
                    }}
                  />

                  {/* 快捷按钮 */}
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setBatchProgress(0)
                        setBatchStatus('not_started')
                      }}
                      className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 dark:text-gray-300 rounded-md transition-colors"
                    >
                      0%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchProgress(25)
                        setBatchStatus('in_progress')
                      }}
                      className="px-3 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 hover:bg-yellow-200 dark:hover:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-md transition-colors"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchProgress(50)
                        setBatchStatus('in_progress')
                      }}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-md transition-colors"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchProgress(75)
                        setBatchStatus('in_progress')
                      }}
                      className="px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-md transition-colors"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBatchProgress(100)
                        setBatchStatus('completed')
                      }}
                      className="px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-800 dark:text-green-300 rounded-md transition-colors"
                    >
                      100%
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  状态
                </label>
                <select
                  value={batchStatus}
                  onChange={(e) => setBatchStatus(e.target.value as CourseProgress['status'])}
                  className="input-field"
                >
                  <option value="not_started">未开始</option>
                  <option value="in_progress">进行中</option>
                  <option value="paused">已暂停</option>
                  <option value="completed">已完成</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowBatchModal(false)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleBatchUpdate}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                批量更新 ({selectedItems.length} 项)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
