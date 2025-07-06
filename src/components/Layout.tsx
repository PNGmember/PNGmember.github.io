import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import ChangePassword from './ChangePassword'
import ThemeToggle from './ThemeToggle'
import {
  Home,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Shield,
  Key
} from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChangePassword, setShowChangePassword] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const handlePasswordChangeSuccess = () => {
    alert('密码修改成功！')
  }

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '课程进度', href: '/progress', icon: BookOpen },
    { name: '新训考核报告', href: '/training-report', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-2xl dark:shadow-slate-800/50">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <img
                src="/purple-night-logo.png"
                alt="紫夜公会"
                className="w-10 h-10 rounded-xl shadow-lg object-contain"
              />
              <span className="ml-3 text-xl font-bold gradient-text">紫夜公会</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <X className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            </button>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`nav-link ${
                    isActive
                      ? 'nav-link-active'
                      : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Mobile User Actions */}
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <div className="space-y-2">
              {user?.role === 'student' && (
                <button
                  onClick={() => {
                    setShowChangePassword(true)
                    setSidebarOpen(false)
                  }}
                  className="w-full flex items-center px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                >
                  <Key className="w-4 h-4 mr-3" />
                  修改密码
                </button>
              )}
              <button
                onClick={() => {
                  handleLogout()
                  setSidebarOpen(false)
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-r border-gray-200/50 dark:border-gray-700/50 shadow-xl dark:shadow-slate-800/30">
          <div className="flex h-20 items-center px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <img
              src="/purple-night-logo.png"
              alt="紫夜公会"
              className="w-12 h-12 rounded-xl shadow-lg object-contain"
            />
            <span className="ml-4 text-2xl font-bold gradient-text">紫夜公会</span>
          </div>
          <nav className="flex-1 px-6 py-6 space-y-3">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-link ${
                    isActive
                      ? 'nav-link-active'
                      : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm dark:shadow-slate-800/30">
          <div className="flex h-20 items-center justify-between px-6 sm:px-8 lg:px-10">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-3 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-night-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {user?.nickname || user?.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.role === 'student' ? '学员' : '管理员'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Admin Entry */}
                {(user?.role === 'admin' || user?.role === 'instructor' || user?.role === 'guild_admin' || user?.role === 'super_admin') && (
                  <Link
                    to="/admin"
                    className="btn-ghost text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    管理后台
                  </Link>
                )}

                {/* Change Password (Students only) */}
                {user?.role === 'student' && (
                  <button
                    onClick={() => setShowChangePassword(true)}
                    className="btn-ghost text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    修改密码
                  </button>
                )}

                {/* Theme Toggle */}
                <ThemeToggle size="md" />

                <button
                  onClick={handleLogout}
                  className="btn-ghost text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-800"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  退出
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword
          onClose={() => setShowChangePassword(false)}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  )
}
