import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth()

  console.log('🛡️ ProtectedRoute check:', { isAuthenticated, isLoading, hasUser: !!user })

  // عرض شاشة التحميل أثناء التحقق من المصادقة
  if (isLoading) {
    console.log('🔄 Showing loading screen...')
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحقق من صلاحية الدخول...</p>
        </div>
      </div>
    )
  }

  // إعادة التوجيه إلى صفحة تسجيل الدخول إذا لم يكن المستخدم مصادق عليه
  if (!isAuthenticated) {
    console.log('❌ User not authenticated, redirecting to login...')
    return <Navigate to="/login" replace />
  }

  console.log('✅ User authenticated, rendering protected content...')
  return <>{children}</>
}

export default ProtectedRoute
