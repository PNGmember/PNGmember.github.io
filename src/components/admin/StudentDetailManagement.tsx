import React, { useState, useEffect } from 'react'
import { LeanCloudService } from '../../services/leancloudService'
import { X, User, BookOpen, Plus, Edit, Save, RotateCcw, Award, MessageSquare } from 'lucide-react'

interface StudentDetailManagementProps {
  userId: string
  onClose: () => void
  onUpdate: () => void
}

interface StudentInfo {
  id: string
  username: string
  nickname: string
  email: string
  level: string
  isActive: boolean
}

interface CourseProgress {
  id: string
  courseId: string
  courseName: string
  courseCategory: string
  courseOrder: number
  progress: number
  status: string
  lastStudyDate: Date | null
  remark?: string
}

interface Course {
  id: string
  name: string
  category: string
  order: number
  description: string
}

export default function StudentDetailManagement({ userId, onClose, onUpdate }: StudentDetailManagementProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null)
  const [courseProgress, setCourseProgress] = useState<CourseProgress[]>([])
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'progress' | 'assign'>('progress')
  const [editingProgress, setEditingProgress] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ progress: number; status: string; remark: string }>({ 
    progress: 0, 
    status: '', 
    remark: '' 
  })

  useEffect(() => {
    loadStudentData()
  }, [userId])

  const loadStudentData = async () => {
    try {
      setLoading(true)
      setError('')

      // 加载学员信息
      const studentInfo = await LeanCloudService.getStudentById(userId)
      setStudent(studentInfo)

      // 加载学员的课程进度
      const progress = await LeanCloudService.getStudentCourseProgress(userId)
      setCourseProgress(progress)

      // 加载所有可用课程
      const courses = await LeanCloudService.getAllCourses()
      
      // 过滤出未分配的课程
      const assignedCourseIds = progress.map(p => p.courseId)
      const unassignedCourses = courses.filter(course => !assignedCourseIds.includes(course.id))
      setAvailableCourses(unassignedCourses)

    } catch (error) {
      setError('加载学员数据失败')
      console.error('Failed to load student data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditProgress = (progressId: string, currentProgress: number, currentStatus: string, currentRemark?: string) => {
    setEditingProgress(progressId)
    setEditValues({ 
      progress: currentProgress, 
      status: currentStatus,
      remark: currentRemark || ''
    })
  }

  const handleSaveProgress = async (progressId: string) => {
    try {
      // 根据进度自动更新状态
      let statusToSave = editValues.status;
      
      if (editValues.progress === 100) {
        statusToSave = 'completed';
      } else if (editValues.progress > 0 && statusToSave === 'not_started') {
        statusToSave = 'in_progress';
      }

      await LeanCloudService.updateCourseProgress(progressId, {
        progress: editValues.progress,
        status: statusToSave,
        lastStudyDate: new Date(),
        remark: editValues.remark
      })
      
      setEditingProgress(null)
      await loadStudentData()
      onUpdate()
    } catch (error) {
      setError('更新进度失败')
      console.error('Failed to update progress:', error)
    }
  }

  const handleAssignCourse = async (courseId: string) => {
    try {
      await LeanCloudService.assignCourseToStudent(userId, courseId)
      await loadStudentData()
      onUpdate()
    } catch (error) {
      setError('分配课程失败')
      console.error('Failed to assign course:', error)
    }
  }

  const handleResetProgress = async (progressId: string) => {
    if (!confirm('确定要重置这门课程的进度吗？')) return
    
    try {
      await LeanCloudService.updateCourseProgress(progressId, {
        progress: 0,
        status: 'not_started',
        lastStudyDate: null
      })
      
      await loadStudentData()
      onUpdate()
    } catch (error) {
      setError('重置进度失败')
      console.error('Failed to reset progress:', error)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      'not_started': '未开始',
      'in_progress': '进行中',
      'completed': '已完成',
      'paused': '已暂停'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap = {
      'not_started': 'text-gray-500 bg-gray-100',
      'in_progress': 'text-blue-700 bg-blue-100',
      'completed': 'text-green-700 bg-green-100',
      'paused': 'text-yellow-700 bg-yellow-100'
    }
    return colorMap[status as keyof typeof colorMap] || 'text-gray-500 bg-gray-100'
  }

  const getCourseNumber = (order: number) => {
    if (order >= 1 && order <= 7) return `1.${order}`
    if (order >= 8 && order <= 13) return `2.${order - 7}`
    if (order >= 14 && order <= 18) return `3.${order - 13}`
    if (order >= 19 && order <= 23) return `4.${order - 18}`
    if (order >= 24 && order <= 29) return `5.${order - 23}`
    return order.toString()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center overflow-y-auto overflow-x-hidden">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-night-600 dark:border-purple-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden my-6 mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <User className="w-6 h-6 text-purple-night-600 dark:text-purple-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                学员管理 - {student?.nickname || student?.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                等级: {student?.level} | 状态: {student?.isActive ? '正常' : '已停用'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="border-b dark:border-slate-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('progress')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'progress'
                  ? 'border-purple-night-500 text-purple-night-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <BookOpen className="w-4 h-4 inline mr-2" />
              课程进度管理
            </button>
            <button
              onClick={() => setActiveTab('assign')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assign'
                  ? 'border-purple-night-500 text-purple-night-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              分配新课程
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'progress' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">课程进度列表</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  共 {courseProgress.length} 门课程
                </div>
              </div>

              {courseProgress.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  该学员暂未分配任何课程
                </div>
              ) : (
                <div className="space-y-3">
                  {courseProgress
                    .sort((a, b) => a.courseOrder - b.courseOrder)
                    .map((progress) => (
                    <div key={progress.id} className="border dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-mono text-purple-night-600 dark:text-purple-400 bg-purple-night-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                              {getCourseNumber(progress.courseOrder)}
                            </span>
                            <h5 className="font-medium text-gray-900 dark:text-white">{progress.courseName}</h5>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(progress.status)} ${progress.status === 'not_started' ? 'dark:bg-gray-800 dark:text-gray-300' : ''} ${progress.status === 'in_progress' ? 'dark:bg-blue-900/30 dark:text-blue-300' : ''} ${progress.status === 'completed' ? 'dark:bg-green-900/30 dark:text-green-300' : ''} ${progress.status === 'paused' ? 'dark:bg-yellow-900/30 dark:text-yellow-300' : ''}`}>
                              {getStatusText(progress.status)}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>类别: {progress.courseCategory}</span>
                            {progress.lastStudyDate && (
                              <span>最后学习: {new Date(progress.lastStudyDate).toLocaleDateString()}</span>
                            )}
                            {progress.remark && (
                              <span className="flex items-center">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                备注: {progress.remark}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {editingProgress === progress.id ? (
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  step="5"
                                  value={editValues.progress}
                                  onChange={(e) => {
                                    const newProgress = Number(e.target.value);
                                    let newStatus = editValues.status;
                                    
                                    // 自动更新状态
                                    if (newProgress === 100) {
                                      newStatus = 'completed';
                                    } else if (newProgress > 0 && progress.progress === 0) {
                                      newStatus = 'in_progress';
                                    }
                                    
                                    setEditValues(prev => ({ 
                                      ...prev, 
                                      progress: newProgress,
                                      status: newStatus
                                    }));
                                  }}
                                  className="w-20"
                                />
                                <span className="text-sm font-medium w-12 text-gray-900 dark:text-white">{editValues.progress}%</span>
                                <select
                                  value={editValues.status}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, status: e.target.value }))}
                                  className="text-sm border rounded px-2 py-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                >
                                  <option value="not_started">未开始</option>
                                  <option value="in_progress">进行中</option>
                                  <option value="completed">已完成</option>
                                  <option value="paused">已暂停</option>
                                </select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder="添加备注..."
                                  value={editValues.remark}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, remark: e.target.value }))}
                                  className="text-sm border rounded px-2 py-1 w-full dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                                />
                              </div>
                              <div className="flex justify-end space-x-2 mt-1">
                                <button
                                  onClick={() => handleSaveProgress(progress.id)}
                                  className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingProgress(null)}
                                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-lg font-semibold text-gray-900 dark:text-white">{progress.progress}%</div>
                                <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                  <div
                                    className="bg-purple-night-600 dark:bg-purple-500 h-2 rounded-full"
                                    style={{ width: `${progress.progress}%` }}
                                  ></div>
                                </div>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEditProgress(progress.id, progress.progress, progress.status, progress.remark)}
                                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="编辑进度"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleResetProgress(progress.id)}
                                  className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
                                  title="重置进度"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'assign' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">分配新课程</h4>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  可分配 {availableCourses.length} 门课程
                </div>
              </div>

              {availableCourses.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p>所有课程都已分配给该学员</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableCourses
                    .sort((a, b) => a.order - b.order)
                    .map((course) => (
                    <div key={course.id} className="border dark:border-slate-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-mono text-purple-night-600 dark:text-purple-400 bg-purple-night-50 dark:bg-purple-900/30 px-2 py-1 rounded">
                              {getCourseNumber(course.order)}
                            </span>
                            <h5 className="font-medium text-gray-900 dark:text-white">{course.name}</h5>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{course.category}</p>
                          {course.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{course.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleAssignCourse(course.id)}
                          className="ml-4 btn-primary text-sm"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          分配
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
