import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import SimpleApp from './App-simple.tsx'
import './index.css'

// 检查是否使用简化版本
const useSimple = new URLSearchParams(window.location.search).get('simple') === 'true' ||
                  localStorage.getItem('useSimpleApp') === 'true'

// 错误边界组件
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React应用错误:', error, errorInfo)
    // 自动切换到简化版本
    localStorage.setItem('useSimpleApp', 'true')
  }

  render() {
    if (this.state.hasError) {
      return <SimpleApp />
    }

    return this.props.children
  }
}

try {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ErrorBoundary>
        {useSimple ? <SimpleApp /> : <App />}
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('React应用启动失败:', error)
  // 降级到简化版本
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <SimpleApp />
    </React.StrictMode>,
  )
}
