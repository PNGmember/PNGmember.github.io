import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, User, Lock, X } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  // 组件加载时从本地存储恢复登录信息
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rememberedCredentials')
    if (savedCredentials) {
      try {
        const { username, rememberMe: savedRememberMe } = JSON.parse(savedCredentials)
        setFormData(prev => ({ ...prev, username }))
        setRememberMe(savedRememberMe)
      } catch (error) {
        console.warn('Failed to parse saved credentials:', error)
        localStorage.removeItem('rememberedCredentials')
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const user = await login(formData.username, formData.password, rememberMe)

      // 处理记住用户名
      if (rememberMe) {
        localStorage.setItem('rememberedCredentials', JSON.stringify({
          username: formData.username,
          rememberMe: true
        }))
      } else {
        localStorage.removeItem('rememberedCredentials')
      }

      // 根据用户角色跳转到不同页面
      if (user.role === 'admin' || user.role === 'instructor' || user.role === 'guild_admin' || user.role === 'super_admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4 relative">
      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle size="lg" />
      </div>

      <div className="max-w-md w-full">
        {/* Main Card */}
        <div className="card-elevated fade-in">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 transform hover:scale-105 transition-transform duration-200">
              <img
                src="/purple-night-logo.png"
                alt="紫夜公会"
                className="w-full h-full object-contain drop-shadow-lg"
              />
            </div>
            <h1 className="text-3xl font-bold gradient-text mb-2">紫夜公会</h1>
            <p className="text-gray-600 dark:text-gray-300 font-medium">成员信息管理平台</p>
          </div>



          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl shadow-sm">
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label className="form-label">
              用户名
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <User className="text-gray-500 w-5 h-5" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="input-field pl-12"
                placeholder="请输入用户名"
                required
              />
            </div>
          </div>



          {/* Password */}
          <div>
            <label className="form-label">
              密码
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 pointer-events-none">
                <Lock className="text-gray-500 w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-field pl-12 pr-12"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 z-10"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label htmlFor="rememberMe" className="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  记住登录状态
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  登录中...
                </div>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">紫夜公会成员专用平台</p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              账号由管理员分配，如需帮助请联系管理员
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
