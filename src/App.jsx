import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { PublicRoute, ProtectedRoute } from './components/layout/RouteGuard'
import Sidebar from './components/layout/Sidebar'
import Login         from './pages/auth/Login'
import ResetPassword from './pages/auth/ResetPassword'
import StudentDashboard               from './pages/student/StudentDashboard'
import ApplyLeave                     from './pages/student/ApplyLeave'
import { StudentLeaves, LeaveDetail } from './pages/student/StudentLeaves'
import { WardenDashboard, WardenPending, WardenHistory } from './pages/warden/WardenPages'
import { DeanDashboard, DeanPending, DeanHistory }       from './pages/dean/DeanPages'
import { SecurityScan } from './pages/security/SecurityPages'
import { AdminDashboard, AdminUsers, AdminStudents, AdminLeaves, AdminReports, AdminAudit, AdminMessages } from './pages/admin/AdminPages'
import ParentResponse from './pages/parent/ParentResponse'
import ProfilePage    from './pages/profile/ProfilePage'


const W = (ch) => <Sidebar>{ch}</Sidebar>

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          duration: 4000,
          style: { background:'#0A1628', color:'#fff', borderRadius:'12px', fontSize:'14px', padding:'12px 16px' },
          success: { iconTheme: { primary:'#10B981', secondary:'#fff' } },
          error:   { iconTheme: { primary:'#EF4444', secondary:'#fff' } },
        }}/>
        <Routes>
          <Route path="/"               element={<Navigate to="/login" replace />} />
          <Route path="/login"          element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/parent/response"element={<ParentResponse />} />

          <Route path="/student/*" element={<ProtectedRoute role="ROLE_STUDENT">{W(<Routes>
            <Route path="dashboard"  element={<StudentDashboard />} />
            <Route path="apply"      element={<ApplyLeave />} />
            <Route path="leaves"     element={<StudentLeaves />} />
            <Route path="leaves/:id" element={<LeaveDetail />} />
            <Route path="profile"    element={<ProfilePage />} />
            <Route path="*"          element={<Navigate to="dashboard" replace />} />
          </Routes>)}</ProtectedRoute>} />

          <Route path="/warden/*" element={<ProtectedRoute role="ROLE_WARDEN">{W(<Routes>
            <Route path="dashboard" element={<WardenDashboard />} />
            <Route path="pending"   element={<WardenPending />} />
            <Route path="history"   element={<WardenHistory />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route path="*"         element={<Navigate to="dashboard" replace />} />
          </Routes>)}</ProtectedRoute>} />

          <Route path="/dean/*" element={<ProtectedRoute role="ROLE_DEAN">{W(<Routes>
            <Route path="dashboard" element={<DeanDashboard />} />
            <Route path="pending"   element={<DeanPending />} />
            <Route path="history"   element={<DeanHistory />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route path="*"         element={<Navigate to="dashboard" replace />} />
          </Routes>)}</ProtectedRoute>} />

          <Route path="/security/*" element={<ProtectedRoute role="ROLE_SECURITY">{W(<Routes>
            <Route path="scan"      element={<SecurityScan />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route path="*"         element={<Navigate to="dashboard" replace />} />
          </Routes>)}</ProtectedRoute>} />

          <Route path="/admin/*" element={<ProtectedRoute role="ROLE_ADMIN">{W(<Routes>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users"     element={<AdminUsers />} />
            <Route path="students"  element={<AdminStudents />} />
            <Route path="leaves"    element={<AdminLeaves />} />
            <Route path="reports"   element={<AdminReports />} />
            <Route path="audit"     element={<AdminAudit />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="*"         element={<Navigate to="dashboard" replace />} />
          </Routes>)}</ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
