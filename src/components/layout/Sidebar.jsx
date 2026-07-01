import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LayoutDashboard, FileText, PlusCircle, History, CheckSquare, Users, BarChart3, ScanLine, LogOut, Menu, Building2, UserCircle,Mail } from 'lucide-react'
import akgecLogo from '../../assets/akgec-logo.jpg'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const NAV = {
  ROLE_STUDENT:  [
    { to:'/student/dashboard', label:'Dashboard',  Icon:LayoutDashboard },
    { to:'/student/apply',     label:'Apply Leave', Icon:PlusCircle },
    { to:'/student/leaves',    label:'My Leaves',   Icon:FileText },
  ],
  ROLE_WARDEN:   [
    { to:'/warden/dashboard',  label:'Dashboard',   Icon:LayoutDashboard },
    { to:'/warden/pending',    label:'Pending',      Icon:CheckSquare },
    { to:'/warden/history',    label:'History',      Icon:History },
  ],
  ROLE_DEAN:     [
    { to:'/dean/dashboard',    label:'Dashboard',   Icon:LayoutDashboard },
    { to:'/dean/pending',      label:'Pending',      Icon:CheckSquare },
    { to:'/dean/history',      label:'History',      Icon:History },
  ],
  ROLE_SECURITY: [
    { to:'/security/scan',      label:'Scan QR',    Icon:ScanLine },
  ],
  ROLE_ADMIN:    [
    { to:'/admin/dashboard',   label:'Dashboard',   Icon:LayoutDashboard },
    { to:'/admin/users',       label:'Users',        Icon:Users },
    { to:'/admin/students',    label:'Students',     Icon:FileText },
    { to:'/admin/leaves',      label:'All Leaves',   Icon:CheckSquare },
    { to:'/admin/reports',     label:'Reports',      Icon:BarChart3 },
    { to:'/admin/audit',       label:'Audit Logs',   Icon:History },
    { to:'/admin/messages', label:'Messages', Icon:Mail },
  ],
}

const ROLE_LABELS = { ROLE_STUDENT:'Student', ROLE_WARDEN:'Warden', ROLE_DEAN:'Dean', ROLE_SECURITY:'Security', ROLE_ADMIN:'Admin' }
const PROFILE_PATH = { ROLE_STUDENT:'/student/profile', ROLE_WARDEN:'/warden/profile', ROLE_DEAN:'/dean/profile', ROLE_SECURITY:'/security/scan', ROLE_ADMIN:'/admin/profile' }


// OUTSIDE Sidebar — prevents re-mount on state change
function SidebarInner({ user, navItems, onNavClick, onLogout }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <img
                src={akgecLogo}
                alt="AKGEC Logo"
                className="w-10 h-10 rounded-lg bg-white p-1 object-contain"
            />

            <div>
                <p className="text-white font-semibold text-sm font-display">
                    AKGEC Hostel
                </p>
                <p className="text-white/40 text-xs">
                    Leave Portal
                </p>
            </div>
        </div>
        </div>
      </div>

      <NavLink to={PROFILE_PATH[user?.role] || '/profile'} onClick={onNavClick}
        className="px-5 py-4 border-b border-white/10 flex items-center gap-3 hover:bg-white/5 transition-colors">
        {user?.profilePhoto ? (
          <img
            src={`${BASE}${user.profilePhoto}`}
            alt="Profile"
            className="w-9 h-9 rounded-full border-2 border-white/20 object-cover flex-shrink-0"
            onError={e => { e.target.style.display = 'none' }}
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-navy-600 border-2 border-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}


        <div className="min-w-0 flex-1">
          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
          <p className="text-white/40 text-xs">{ROLE_LABELS[user?.role]} · View Profile</p>
        </div>
      </NavLink>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} onClick={onNavClick}
            className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}>
            <Icon size={17}/>{label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 pt-2 border-t border-white/10 space-y-0.5">
        <NavLink to={PROFILE_PATH[user?.role] || '/profile'} onClick={onNavClick}
          className={({ isActive }) => isActive ? 'nav-item-active' : 'nav-item'}>
          <UserCircle size={17}/>My Profile
        </NavLink>
        <button onClick={onLogout} className="nav-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={17}/>Sign Out
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = NAV[user?.role] || []
  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <aside className="hidden md:flex flex-col w-60 bg-navy-900 flex-shrink-0">
        <SidebarInner user={user} navItems={navItems} onNavClick={() => {}} onLogout={handleLogout} />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-navy-900 flex flex-col z-10">
            <SidebarInner user={user} navItems={navItems} onNavClick={() => setMobileOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100">
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-100">
            <Menu size={20}/>
          </button>
          <span className="font-semibold text-sm text-slate-800 font-display">AKGEC Hostel Portal</span>
          <NavLink to={PROFILE_PATH[user?.role] || '/profile'}>
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto.startsWith('http') ? user.profilePhoto : `${BASE}${user.profilePhoto}`}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
              onError={e => { e.target.style.display = 'none' }}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </NavLink>
        </div>
        <main className="flex-1 overflow-y-auto p-5 md:p-8 animate-fade-in">{children}</main>
      </div>
    </div>
  )
}
