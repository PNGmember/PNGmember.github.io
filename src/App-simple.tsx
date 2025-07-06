import React, { useState, useEffect } from 'react'

function SimpleApp() {
  const [status, setStatus] = useState('正在初始化...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 简单的初始化测试
    try {
      setStatus('✅ React应用启动成功')
      
      // 测试LeanCloud连接
      import('./config/leancloud').then(() => {
        setStatus('✅ LeanCloud配置加载成功')
      }).catch((err) => {
        setError(`❌ LeanCloud配置加载失败: ${err.message}`)
      })
      
    } catch (err) {
      setError(`❌ 应用初始化失败: ${err instanceof Error ? err.message : '未知错误'}`)
    }
  }, [])

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          maxWidth: '600px',
          backdropFilter: 'blur(10px)'
        }}>
          <h1>🚨 应用启动失败</h1>
          <div style={{
            background: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.5)',
            borderRadius: '8px',
            padding: '15px',
            margin: '20px 0',
            fontFamily: 'monospace',
            fontSize: '14px'
          }}>
            {error}
          </div>
          <p>可能的解决方案：</p>
          <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
            <li>检查网络连接</li>
            <li>清除浏览器缓存</li>
            <li>尝试刷新页面</li>
            <li>检查浏览器控制台错误</li>
          </ul>
          <div style={{ marginTop: '30px' }}>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'rgba(124, 58, 237, 0.8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                margin: '5px'
              }}
            >
              🔄 重新加载
            </button>
            <button 
              onClick={() => window.location.href = '/debug.html'}
              style={{
                background: 'rgba(59, 130, 246, 0.8)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                margin: '5px'
              }}
            >
              🔍 调试页面
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '600px',
        backdropFilter: 'blur(10px)'
      }}>
        <img 
          src="/purple-night-logo.png" 
          alt="紫夜公会" 
          style={{
            width: '80px',
            height: '80px',
            margin: '20px auto',
            display: 'block',
            borderRadius: '12px'
          }}
        />
        
        <h1>🎯 紫夜公会</h1>
        <h2>成员信息管理平台</h2>
        
        <div style={{
          background: 'rgba(34, 197, 94, 0.2)',
          border: '1px solid rgba(34, 197, 94, 0.5)',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px 0'
        }}>
          <strong>{status}</strong>
        </div>
        
        <p>简化版本正在运行，用于测试基础功能。</p>
        
        <div style={{ marginTop: '30px' }}>
          <button 
            onClick={() => {
              // 尝试加载完整应用
              window.location.href = '/?full=true'
            }}
            style={{
              background: 'rgba(124, 58, 237, 0.8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            🚀 加载完整应用
          </button>
          <button 
            onClick={() => window.location.href = '/debug.html'}
            style={{
              background: 'rgba(59, 130, 246, 0.8)',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: 'pointer',
              margin: '5px'
            }}
          >
            🔍 调试页面
          </button>
        </div>
        
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '12px',
          fontSize: '14px'
        }}>
          <h3>🔐 测试账户</h3>
          <p><strong>管理员:</strong> admin + 管理员密码</p>
          <p><strong>学员:</strong> 昵称 + QQ号密码</p>
        </div>
      </div>
    </div>
  )
}

export default SimpleApp
