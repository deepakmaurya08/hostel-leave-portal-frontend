import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ROLE_HOME = {
  ROLE_STUDENT:  '/student/dashboard',
  ROLE_WARDEN:   '/warden/dashboard',
  ROLE_DEAN:     '/dean/dashboard',
  ROLE_SECURITY: '/security/dashboard',
  ROLE_ADMIN:    '/admin/dashboard',
}

// Redirect already-logged-in users away from /login
export function PublicRoute({ children }) {
  const { user } = useAuth()
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/'} replace />
  return children
}

// Require login + correct role
export function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />
  return children
}
