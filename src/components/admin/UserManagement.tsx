import React, { useState, useEffect } from 'react'
import { LeanCloudService } from '../../services/leancloudService'
import StudentDetailManagement from './StudentDetailManagement'
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  GraduationCap,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
  Save,
  X,
  Settings,
  Download,
  Upload
} from 'lucide-react'
import type { User as UserType } from '../../config/leancloud'

export default function UserManagement() {
  const [users, setUsers] = useState<UserType[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [managingStudentId, setManagingStudentId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    qq: '',
    nickname: '',
    role: 'student' as UserType['role'],
    isActive: true,
    password: ''
  })
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const userList = await LeanCloudService.getAllUsers()
      setUsers(userList)
    } catch (error) {
      setError('加载用户列表失败')
      console.error('Failed to load users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // 按角色筛选
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // 按搜索词筛选
    if (searchTerm) {
      filtered = filtered.filter(user => {
        const qq = user.email.includes('@qq.com') ? user.email.replace('@qq.com', '') : user.email
        return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
               user.nickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
               qq.includes(searchTerm)
      })
    }

    setFilteredUsers(filtered)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
      case 'guild_admin':
      case 'super_admin':
        return <Shield className="w-4 h-4 text-red-500 dark:text-red-400" />
      case 'instructor':
        return <GraduationCap className="w-4 h-4 text-blue-500 dark:text-blue-400" />
      case 'student':
        return <User className="w-4 h-4 text-green-500 dark:text-green-400" />
      case 'member':
        return <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      default:
        return <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
    }
  }

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin':
        return '管理员'
      case 'guild_admin':
        return '公会管理员'
      case 'super_admin':
        return '超级管理员'
      case 'instructor':
        return '教官'
      case 'student':
        return '学员'
      case 'member':
        return '成员'
      default:
        return '未知'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
      case 'guild_admin':
      case 'super_admin':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
      case 'instructor':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
      case 'student':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
      case 'member':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
    }
  }

  const handleEditUser = (user: UserType) => {
    setEditingUser(user)
    // 优先使用qqNumber字段，如果没有则从邮箱中提取QQ号
    let qq = ''
    if (user.qqNumber) {
      qq = user.qqNumber
    } else if (user.email && user.email.includes('@qq.com')) {
      qq = user.email.replace('@qq.com', '')
    } else {
      qq = user.email || ''
    }

    setFormData({
      qq: qq,
      nickname: user.nickname,
      role: user.role,
      isActive: user.isActive,
      password: '' // 编辑时不显示密码
    })
  }

  const handleAddUser = () => {
    setShowAddModal(true)
    setFormData({
      qq: '',
      nickname: '',
      role: 'student',
      isActive: true,
      password: ''
    })
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setEditingUser(null)
    setFormData({
      qq: '',
      nickname: '',
      role: 'student',
      isActive: true,
      password: ''
    })
  }

  const handleSaveUser = async () => {
    if (!formData.qq || !formData.nickname) {
      setError('请填写所有必填字段')
      return
    }

    if (!editingUser && !formData.password) {
      setError('新用户必须设置密码')
      return
    }

    try {
      setSaving(true)

      if (editingUser) {
        // 更新用户（不包括role字段，因为前端无权限修改）
        await LeanCloudService.updateUser(editingUser.id, {
          email: `${formData.qq}@qq.com`, // 将QQ号转换为邮箱格式
          nickname: formData.nickname,
          isActive: formData.isActive
        })

        // 更新本地状态（保持原有的role不变）
        setUsers(users.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                email: `${formData.qq}@qq.com`,
                nickname: formData.nickname,
                isActive: formData.isActive
              }
            : u
        ))
      } else {
        // 创建新用户，用户名就是昵称
        const newUser = await LeanCloudService.createUser({
          username: formData.nickname, // 用户名就是昵称
          email: `${formData.qq}@qq.com`, // 将QQ号转换为邮箱格式
          nickname: formData.nickname,
          role: formData.role,
          isActive: formData.isActive,
          password: formData.password
        })

        setUsers([...users, newUser])
      }

      handleCloseModal()
      setError('')
    } catch (error) {
      setError(editingUser ? '更新用户失败' : '创建用户失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    const user = users.find(u => u.id === userId)
    const userName = user?.nickname || user?.username || '未知用户'

    if (window.confirm(`确定要删除用户"${userName}"吗？\n\n⚠️ 此操作将同时删除：\n- 用户基本信息\n- 所有课程进度记录\n\n此操作不可恢复！`)) {
      try {
        setError('') // 清除之前的错误
        await LeanCloudService.deleteUser(userId)

        // 从本地状态中移除
        setUsers(users.filter(u => u.id !== userId))

        console.log(`成功删除用户: ${userName}`)
      } catch (error: any) {
        setError('删除用户失败: ' + (error.message || '未知错误'))
        console.error('删除用户失败:', error)
      }
    }
  }

  const handleUpdateRole = async (userId: string, newRole: 'member' | 'admin' | 'instructor') => {
    try {
      await LeanCloudService.updateUserRole(userId, newRole, [])
      // 更新本地状态
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (error) {
      setError('更新用户角色失败')
    }
  }

  const handleImportStudents = async () => {
    try {
      setImporting(true)
      setError('')

      const result = await LeanCloudService.importStudentsFromMembers()
      setImportResult(result)
      setShowImportModal(true)

      // 重新加载用户列表
      await loadUsers()

    } catch (error) {
      setError('导入学员数据失败: ' + error.message)
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">加载中...</span>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">用户管理</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">管理紫夜公会成员信息</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleImportStudents}
              disabled={importing}
              className="btn-secondary flex items-center"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  导入中...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  导入学员
                </>
              )}
            </button>
            <button
              onClick={handleAddUser}
              className="btn-primary"
            >
              <Plus className="w-5 h-5 mr-2" />
              添加用户
            </button>
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

        {/* Filters */}
        <div className="card dark:bg-slate-800 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search */}
            <div className="flex-1">
              <label className="form-label">搜索用户</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="输入用户名、昵称或QQ号..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-12"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="lg:w-64">
              <label className="form-label">角色筛选</label>
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="input-field pl-12 appearance-none"
                >
                  <option value="all">全部角色</option>
                  <option value="student">学员</option>
                  <option value="instructor">教官</option>
                  <option value="admin">管理员</option>
                  <option value="guild_admin">公会管理员</option>
                  <option value="super_admin">超级管理员</option>
                  <option value="member">成员</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* User List */}
        <div className="card p-0 overflow-hidden dark:bg-slate-800 dark:border-slate-700">
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>用户信息</th>
                  <th>角色</th>
                  <th>状态</th>
                  <th>加入时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {user.nickname}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                            @{user.username}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            QQ: {user.email.includes('@qq.com') ? user.email.replace('@qq.com', '') : user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {getRoleIcon(user.role)}
                        <span className={`ml-2 badge ${getRoleColor(user.role)}`}>
                          {getRoleText(user.role)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        {user.isActive ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mr-2" />
                            <span className="badge badge-success">正常</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5 text-red-500 dark:text-red-400 mr-2" />
                            <span className="badge badge-danger">停用</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(user.joinDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-3">
                        {user.role === 'student' && (
                          <button
                            onClick={() => setManagingStudentId(user.id)}
                            className="p-2 text-purple-night-600 dark:text-purple-400 hover:text-purple-night-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl transition-colors duration-200"
                            title="管理学员进度和课程"
                          >
                            <Settings className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors duration-200"
                          title="编辑用户信息"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={user.role === 'admin'}
                          title="删除用户"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
            <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">总用户数</div>
          </div>
          <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.isActive).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">活跃用户</div>
          </div>
          <div className="card dark:bg-slate-800 dark:border-slate-700 text-center">
            <User className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {users.filter(u => u.role === 'student').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">学员</div>
          </div>
        </div>

        {/* Add/Edit User Modal */}
        {(showAddModal || editingUser) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingUser ? '编辑用户' : '添加用户'}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    昵称 *
                  </label>
                  <input
                    type="text"
                    value={formData.nickname}
                    onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                    className="input-field"
                    placeholder="请输入昵称（将作为用户名）"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    QQ号 *
                  </label>
                  <input
                    type="text"
                    value={formData.qq}
                    onChange={(e) => setFormData({ ...formData, qq: e.target.value })}
                    className="input-field"
                    placeholder="请输入QQ号"
                    pattern="[0-9]*"
                  />
                </div>

                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      密码 *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input-field"
                      placeholder="请输入密码"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    角色
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as UserType['role'] })}
                    className="input-field"
                    disabled={!!editingUser} // 编辑时禁用角色选择
                  >
                    <option value="student">学员</option>
                    <option value="instructor">教官</option>
                    <option value="admin">管理员</option>
                    <option value="guild_admin">公会管理员</option>
                    <option value="super_admin">超级管理员</option>
                  </select>
                  {editingUser && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      角色修改需要后端管理员权限，当前无法在前端修改
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-purple-night-600 focus:ring-purple-night-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-gray-100">
                    账户激活
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="btn-secondary"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  onClick={handleSaveUser}
                  className="btn-primary flex items-center"
                  disabled={saving}
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {saving ? '保存中...' : '保存'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Student Detail Management Modal - 移到外部，避免受到 space-y-8 的影响 */}
      {managingStudentId && (
        <StudentDetailManagement
          userId={managingStudentId}
          onClose={() => setManagingStudentId(null)}
          onUpdate={loadUsers}
        />
      )}

      {/* Import Result Modal */}
      {showImportModal && importResult && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">导入结果</h3>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-300">成功导入</span>
                  </div>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                    {importResult.success}
                  </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    <span className="text-sm font-medium text-red-800 dark:text-red-300">导入失败</span>
                  </div>
                  <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                    {importResult.failed}
                  </p>
                </div>
              </div>

              {/* 错误详情 */}
              {importResult.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">错误详情：</h4>
                  <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600 dark:text-red-400 mb-1">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* 说明信息 */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">导入说明：</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• 从Member表导入符合条件的成员（guild=purplenight，stage≠紫夜，status=正常）</li>
                  <li>• 导入到Student表，不创建登录账户</li>
                  <li>• 用户名和昵称使用Member表的nickname字段</li>
                  <li>• QQ号和密码保存在Student表中</li>
                  <li>• 初始等级为"未新训"</li>
                  <li>• 保留原始的stage和status信息</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowImportModal(false)}
                className="btn-primary"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
