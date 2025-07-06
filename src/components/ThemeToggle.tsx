import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme()

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        relative overflow-hidden
        bg-white dark:bg-gray-800
        border border-gray-200 dark:border-gray-700
        rounded-xl
        shadow-sm hover:shadow-md
        transition-all duration-300
        flex items-center justify-center
        group
        ${className}
      `}
      title={theme === 'light' ? '切换到深色模式' : '切换到浅色模式'}
    >
      {/* 背景动画 */}
      <div className={`
        absolute inset-0 
        bg-gradient-to-r from-yellow-400 to-orange-400
        dark:from-blue-600 dark:to-purple-600
        opacity-0 group-hover:opacity-20
        transition-opacity duration-300
      `} />
      
      {/* 图标容器 */}
      <div className="relative z-10">
        {theme === 'light' ? (
          <Sun className={`
            ${iconSizes[size]}
            text-yellow-600 dark:text-yellow-400
            transition-all duration-300
            group-hover:rotate-90 group-hover:scale-110
          `} />
        ) : (
          <Moon className={`
            ${iconSizes[size]}
            text-blue-600 dark:text-blue-400
            transition-all duration-300
            group-hover:rotate-12 group-hover:scale-110
          `} />
        )}
      </div>
      
      {/* 涟漪效果 */}
      <div className={`
        absolute inset-0
        bg-gradient-to-r from-yellow-400/20 to-orange-400/20
        dark:from-blue-600/20 dark:to-purple-600/20
        rounded-xl
        scale-0 group-active:scale-100
        transition-transform duration-150
      `} />
    </button>
  )
}
