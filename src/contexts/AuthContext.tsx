import React, { createContext, useContext, useState, useEffect } from 'react'
import { LeanCloudService } from '../services/leancloudService'
import type { User } from '../config/leancloud'

interface AuthContextType {
  user: User | null
  login: (username: string, password: string, rememberMe?: boolean) => Promise<User>
  register: (username: string, password: string, email: string, nickname: string) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 检查是否有已登录的用户
    const initializeAuth = () => {
      try {
        // 检查是否有记住的登录状态
        const rememberMe = localStorage.getItem('rememberLogin')
        if (rememberMe === 'true') {
          // 尝试获取当前用户
          const currentUser = LeanCloudService.getCurrentUser()
          if (currentUser) {
            console.log('恢复登录状态:', currentUser.username)
            setUser(currentUser)
          } else {
            // 没有有效的用户会话，清除记住状态
            console.log('没有有效的用户会话，清除记住状态')
            localStorage.removeItem('rememberLogin')
          }
        } else {
          console.log('没有记住登录状态')
        }
      } catch (error) {
        console.error('初始化认证失败:', error)
        localStorage.removeItem('rememberLogin')
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean = false) => {
    try {
      const user = await LeanCloudService.login(username, password)
      setUser(user)

      // 设置记住登录状态
      if (rememberMe) {
        localStorage.setItem('rememberLogin', 'true')
      } else {
        localStorage.removeItem('rememberLogin')
      }

      return user
    } catch (error) {
      throw error
    }
  }

  const register = async (username: string, password: string, email: string, nickname: string) => {
    try {
      const user = await LeanCloudService.register(username, password, email, nickname)
      setUser(user)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await LeanCloudService.logout()
      setUser(null)
      // 清除记住登录状态
      localStorage.removeItem('rememberLogin')
      localStorage.removeItem('rememberedCredentials')
    } catch (error) {
      throw error
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
