import React from 'react'
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import CourseProgress from './components/CourseProgress'
import TrainingReport from './components/TrainingReport'
import Layout from './components/Layout'
import AdminLayout from './components/admin/AdminLayout'
import AdminDashboard from './components/admin/AdminDashboard'
import UserManagement from './components/admin/UserManagement'
import CourseManagement from './components/admin/CourseManagement'
import CourseAssignment from './components/admin/CourseAssignment'
import ProgressManagement from './components/admin/ProgressManagement'
import Statistics from './components/admin/Statistics'

function StudentRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-night-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // 如果是管理员，重定向到管理后台
  if (user.role === 'admin' || user.role === 'instructor' || user.role === 'guild_admin' || user.role === 'super_admin') {
    return <Navigate to="/admin" />
  }

  // 只有学员可以访问用户端页面
  return user.role === 'student' ? <>{children}</> : <Navigate to="/login" />
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  // 如果正在加载，显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-night-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  // 如果是学员，重定向到用户端
  if (user.role === 'student') {
    return <Navigate to="/" />
  }

  // 只有管理员可以访问管理后台
  return (user.role === 'admin' || user.role === 'instructor' || user.role === 'guild_admin' || user.role === 'super_admin') ? <>{children}</> : <Navigate to="/login" />
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />

          {/* 学员用户路由 */}
          <Route path="/" element={
            <StudentRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </StudentRoute>
          } />
          <Route path="/progress" element={
            <StudentRoute>
              <Layout>
                <CourseProgress />
              </Layout>
            </StudentRoute>
          } />
          <Route path="/training-report" element={
            <StudentRoute>
              <Layout>
                <TrainingReport />
              </Layout>
            </StudentRoute>
          } />

          {/* 管理端路由 */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout>
                <UserManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/courses" element={
            <AdminRoute>
              <AdminLayout>
                <CourseManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/assignment" element={
            <AdminRoute>
              <AdminLayout>
                <CourseAssignment />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/progress" element={
            <AdminRoute>
              <AdminLayout>
                <ProgressManagement />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/statistics" element={
            <AdminRoute>
              <AdminLayout>
                <Statistics />
              </AdminLayout>
            </AdminRoute>
          } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
