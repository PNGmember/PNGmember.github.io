import React, { useState, useEffect } from 'react'
import { LeanCloudService } from '../../services/leancloudService'
import { 
  UserPlus, 
  Search, 
  Filter, 
  Plus,
  BookOpen,
  Users,
  CheckSquare,
  Square,
  Save,
  X,
  AlertCircle
} from 'lucide-react'
import type { User, Course } from '../../config/leancloud'

export default function CourseAssignment() {
  const [users, setUsers] = useState<User[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [assignProgress, setAssignProgress] = useState(0)
  const [userAssignedCourses, setUserAssignedCourses] = useState<Map<string, string[]>>(new Map())

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [userList, courseList] = await Promise.all([
        LeanCloudService.getAllUsers(),
        LeanCloudService.getCourses()
      ])
      const students = userList.filter(u => u.role === 'student')
      setUsers(students)
      setCourses(courseList)

      // 获取所有学员的已分配课程
      const studentIds = students.map(u => u.id)
      const assignedCoursesMap = await LeanCloudService.getBatchUserAssignedCourses(studentIds)
      setUserAssignedCourses(assignedCoursesMap)
    } catch (error) {
      setError('加载数据失败')
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleCourseSelect = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    )
  }

  const handleSelectAllUsers = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([])
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id))
    }
  }

  const handleSelectAllCourses = () => {
    // 只选择未完全分配的课程
    const availableCourses = courses.filter(course => {
      const assignedCount = selectedUsers.filter(userId =>
        userAssignedCourses.get(userId)?.includes(course.id)
      ).length
      return assignedCount < selectedUsers.length || selectedUsers.length === 0
    })

    const availableCourseIds = availableCourses.map(c => c.id)

    if (selectedCourses.length === availableCourseIds.length) {
      setSelectedCourses([])
    } else {
      setSelectedCourses(availableCourseIds)
    }
  }

  const handleAssignCourses = async () => {
    if (selectedUsers.length === 0 || selectedCourses.length === 0) {
      setError('请选择学员和课程')
      return
    }

    try {
      setAssigning(true)
      setAssignProgress(0)

      await LeanCloudService.batchAssignCourses(
        selectedUsers,
        selectedCourses,
        (progress) => setAssignProgress(progress)
      )

      // 重新加载已分配课程数据
      const assignedCoursesMap = await LeanCloudService.getBatchUserAssignedCourses(users.map(u => u.id))
      setUserAssignedCourses(assignedCoursesMap)

      setShowAssignModal(false)
      setSelectedUsers([])
      setSelectedCourses([])
      setError('')
      alert(`成功为 ${selectedUsers.length} 名学员分配了 ${selectedCourses.length} 门课程`)
    } catch (error) {
      setError('分配课程失败: ' + error.message)
    } finally {
      setAssigning(false)
      setAssignProgress(0)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">课程分配</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">为学员分配课程和管理学习计划</p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="btn-primary flex items-center"
          disabled={selectedUsers.length === 0}
        >
          <UserPlus className="w-4 h-4 mr-2" />
          批量分配课程
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索学员..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              已选择 {selectedUsers.length} 名学员
            </span>
            <button
              onClick={handleSelectAllUsers}
              className="text-sm text-purple-night-600 dark:text-purple-400 hover:text-purple-night-700 dark:hover:text-purple-300"
            >
              {selectedUsers.length === filteredUsers.length ? '取消全选' : '全选'}
            </button>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="card dark:bg-slate-800 dark:border-slate-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={handleSelectAllUsers}
                    className="flex items-center"
                  >
                    {selectedUsers.length === filteredUsers.length && filteredUsers.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-purple-night-600 dark:text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  学员信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  等级
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  已分配课程
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  加入时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer ${
                    selectedUsers.includes(user.id) ? 'bg-purple-night-50 dark:bg-purple-900/20' : ''
                  }`}
                  onClick={() => handleUserSelect(user.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {selectedUsers.includes(user.id) ? (
                      <CheckSquare className="w-4 h-4 text-purple-night-600 dark:text-purple-400" />
                    ) : (
                      <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.nickname}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          @{user.username}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {(user as any).level || '未新训'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-1" />
                      <span className="text-sm text-gray-900 dark:text-gray-200">
                        {userAssignedCourses.get(user.id)?.length || 0} 门课程
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.joinDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      user.isActive
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {user.isActive ? '活跃' : '非活跃'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                批量分配课程 ({selectedUsers.length} 名学员)
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300">选择课程</h4>
                <button
                  onClick={handleSelectAllCourses}
                  className="text-sm text-purple-night-600 dark:text-purple-400 hover:text-purple-night-700 dark:hover:text-purple-300"
                >
                  {selectedCourses.length === courses.length ? '取消全选' : '全选课程'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3 dark:border-slate-600">
                {courses.map((course) => {
                  // 计算有多少选中的学员已经分配了这门课程
                  const assignedCount = selectedUsers.filter(userId =>
                    userAssignedCourses.get(userId)?.includes(course.id)
                  ).length
                  const isFullyAssigned = assignedCount === selectedUsers.length && selectedUsers.length > 0
                  const isPartiallyAssigned = assignedCount > 0 && assignedCount < selectedUsers.length

                  return (
                    <div
                      key={course.id}
                      className={`p-3 border rounded-lg transition-colors ${
                        isFullyAssigned
                          ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed opacity-60'
                          : selectedCourses.includes(course.id)
                          ? 'border-purple-night-500 dark:border-purple-500 bg-purple-night-50 dark:bg-purple-900/20 cursor-pointer'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                      }`}
                      onClick={() => !isFullyAssigned && handleCourseSelect(course.id)}
                    >
                      <div className="flex items-center">
                        {isFullyAssigned ? (
                          <CheckSquare className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                        ) : selectedCourses.includes(course.id) ? (
                          <CheckSquare className="w-4 h-4 text-purple-night-600 dark:text-purple-400 mr-2" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            <span className="text-purple-night-600 dark:text-purple-400 font-bold mr-2">
                              {LeanCloudService.getCourseNumber(course.order)}
                            </span>
                            {course.name}
                            {isFullyAssigned && (
                              <span className="ml-2 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded">
                                已全部分配
                              </span>
                            )}
                            {isPartiallyAssigned && (
                              <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                                部分已分配 ({assignedCount}/{selectedUsers.length})
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {course.category} • {course.totalLessons} 课时
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                已选择 {selectedCourses.length} 门课程
                {selectedUsers.length > 0 && (
                  <span className="ml-2">
                    • 可分配课程: {courses.filter(course => {
                      const assignedCount = selectedUsers.filter(userId =>
                        userAssignedCourses.get(userId)?.includes(course.id)
                      ).length
                      return assignedCount < selectedUsers.length
                    }).length} 门
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="btn-secondary"
                disabled={assigning}
              >
                取消
              </button>
              <button
                onClick={handleAssignCourses}
                className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={assigning || selectedCourses.length === 0}
              >
                {assigning ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    分配中... ({assignProgress}%)
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    确认分配
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
