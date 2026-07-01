import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { adminApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import { format } from 'date-fns'
import {
  Users, BarChart3, Shield, GraduationCap, Lock, User,
  ToggleLeft, ToggleRight, Plus, Key, Edit, Trash2,
  Activity, FileText, TrendingUp, Eye
} from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_OPTIONS = ['ROLE_WARDEN','ROLE_DEAN','ROLE_SECURITY','ROLE_ADMIN']
const ROLE_LABELS  = { ROLE_STUDENT:'Student', ROLE_WARDEN:'Warden', ROLE_DEAN:'Dean', ROLE_SECURITY:'Security', ROLE_ADMIN:'Admin' }
const ROLE_COLORS  = { ROLE_STUDENT:'bg-indigo-100 text-indigo-700', ROLE_WARDEN:'bg-amber-100 text-amber-700', ROLE_DEAN:'bg-purple-100 text-purple-700', ROLE_SECURITY:'bg-emerald-100 text-emerald-700', ROLE_ADMIN:'bg-red-100 text-red-700' }

// ── Dashboard ─────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  const { data: report, loading } = useApi(adminApi.getSystemReport)
  if (loading) return <PageLoader />

  const leaveCounts = report?.leaveCountsByStatus || {}
  const userCounts  = report?.userCountsByRole    || {}

  const pipeline = [
    { label: 'Pending Parent',  value: leaveCounts.PENDING_PARENT  || 0, color: '#F59E0B' },
    { label: 'Pending Warden',  value: leaveCounts.PENDING_WARDEN  || 0, color: '#F97316' },
    { label: 'Pending Dean',    value: leaveCounts.PENDING_DEAN    || 0, color: '#8B5CF6' },
    { label: 'Approved',        value: leaveCounts.APPROVED        || 0, color: '#10B981' },
    { label: 'Completed',       value: leaveCounts.COMPLETED       || 0, color: '#3B82F6' },
    { label: 'All Rejected',    value: (leaveCounts.PARENT_REJECTED||0)+(leaveCounts.WARDEN_REJECTED||0)+(leaveCounts.DEAN_REJECTED||0), color: '#EF4444' },
  ]
  const total = report?.totalLeaves || 1

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Full system overview and control</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Leaves"       value={report?.totalLeaves   || 0} Icon={FileText}   color="text-navy-600"   bg="bg-navy-50" />
        <MetricCard label="Total Students"     value={report?.totalStudents || 0} Icon={Users}      color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard label="On Leave Now"       value={report?.studentsCurrentlyOnLeave || 0} Icon={Activity} color="text-amber-600" bg="bg-amber-50" />
        <MetricCard label="Last 30 Days"       value={report?.recentLeaves  || 0} Icon={TrendingUp}  color="text-emerald-600" bg="bg-emerald-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold text-slate-800 font-display mb-4">Leave Pipeline</h2>
          <div className="space-y-3">
            {pipeline.map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-sm text-slate-500 w-32 flex-shrink-0">{label}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100,(value/total)*100)}%`, backgroundColor: color }} />
                </div>
                <span className="text-sm font-semibold w-8 text-right" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-slate-800 font-display mb-4">User Breakdown</h2>
          <div className="space-y-3">
            {Object.entries(userCounts).map(([role, count]) => (
              <div key={role} className="flex items-center gap-3">
                <span className={`badge ${ROLE_COLORS[role] || 'bg-slate-100 text-slate-600'}`}>{ROLE_LABELS[role] || role}</span>
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full" />
                <span className="text-sm font-semibold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Users ─────────────────────────────────────────────────────────────────────
export function AdminUsers() {
  const { data: users, loading, refetch } = useApi(adminApi.getAllUsers)
  const [showCreate,  setShowCreate]  = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [toggling,    setToggling]    = useState(null)
  const [resetting,   setResetting]   = useState(false)
  const [filter,      setFilter]      = useState('ALL')

  const handleToggle = async (id) => {
    setToggling(id)
    try { await adminApi.toggleActive(id); refetch(); toast.success('Status updated') }
    catch { toast.error('Failed') }
    finally { setToggling(null) }
  }

  const handleResetPwd = async (e) => {
    e.preventDefault()
    if (newPassword.length < 6) return toast.error('Min 6 characters')
    setResetting(true)
    try { await adminApi.resetPassword(resetTarget.id, { newPassword }); toast.success('Password reset'); setResetTarget(null); setNewPassword('') }
    catch { toast.error('Failed') }
    finally { setResetting(false) }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try { await adminApi.deleteUser(id); refetch(); toast.success('User deleted') }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete') }
  }

  if (loading) return <PageLoader />

  const filtered = filter === 'ALL' ? users : users?.filter(u => u.role === filter)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Staff Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users?.length || 0} total users</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16}/>Add Staff User</button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {['ALL', ...ROLE_OPTIONS].map(r => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
              ${filter === r ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {r === 'ALL' ? 'All' : ROLE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="card p-0">
        <div className="table-wrapper rounded-2xl">
          <table className="table">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered?.map(u => (
                <tr key={u.id}>
                  <td className="font-medium text-slate-800">{u.name}</td>
                  <td className="text-slate-500 text-sm">{u.email}</td>
                  <td><span className={`badge ${ROLE_COLORS[u.role]||'bg-slate-100 text-slate-600'}`}>{ROLE_LABELS[u.role]||u.role}</span></td>
                  <td><span className={`badge ${u.active ? 'badge-approved' : 'bg-slate-100 text-slate-500'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleToggle(u.id)} disabled={toggling === u.id}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors" title={u.active?'Deactivate':'Activate'}>
                        {u.active ? <ToggleRight size={18} className="text-emerald-500"/> : <ToggleLeft size={18}/>}
                      </button>
                      <button onClick={() => { setResetTarget(u); setNewPassword('') }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700" title="Reset Password">
                        <Key size={15}/>
                      </button>
                      <button onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors" title="Delete">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserModal open={showCreate} onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); refetch() }} />
      <Modal open={!!resetTarget} title={`Reset Password — ${resetTarget?.name}`} onClose={() => setResetTarget(null)}>
        <form onSubmit={handleResetPwd} className="space-y-4">
          <div>
            <label className="label">New Password</label>
            <input type="password" className="input" placeholder="Min 6 characters" required minLength={6}
              value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={resetting} className="btn-primary w-full justify-center">
            {resetting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </Modal>
    </div>
  )
}

function CreateUserModal({ open, onClose, onDone }) {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'ROLE_WARDEN' })
  const [loading, setLoading] = useState(false)
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await adminApi.createUser(form); toast.success('User created'); setForm({ name:'', email:'', password:'', role:'ROLE_WARDEN' }); onDone() }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  return (
    <Modal open={open} title="Add Staff User" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="label">Full Name</label><input name="name" type="text" required className="input" value={form.name} onChange={set} /></div>
        <div><label className="label">Email (@akgec.ac.in)</label><input name="email" type="email" required className="input" placeholder="name@akgec.ac.in" value={form.email} onChange={set} /></div>
        <div><label className="label">Password</label><input name="password" type="password" required className="input" value={form.password} onChange={set} /></div>
        <div>
          <label className="label">Role</label>
          <select name="role" className="input" value={form.role} onChange={set}>
            {ROLE_OPTIONS.map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
          </select>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Creating…' : 'Create User'}</button>
      </form>
    </Modal>
  )
}

// ── Students ──────────────────────────────────────────────────────────────────
export function AdminStudents() {
  const { data: students, loading, refetch } = useApi(adminApi.getAllStudents)
  const [search,      setSearch]      = useState('')
  const [showCreate,  setShowCreate]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)

  const filtered = students?.filter(s =>
    s.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.hostelName?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? This also deletes their account.')) return
    try { await adminApi.deleteStudent(id); refetch(); toast.success('Student deleted') }
    catch (err) { toast.error(err.response?.data?.message || 'Failed') }
  }

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">Students</h1>
          <p className="text-slate-500 text-sm mt-1">{students?.length || 0} registered</p>
        </div>
        <div className="flex gap-3">
          <input type="text" className="input w-56" placeholder="Search by name or roll no…"
            value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={() => setShowCreate(true)} className="btn-primary"><Plus size={16}/>Add Student</button>
        </div>
      </div>

      <div className="card p-0">
        <div className="table-wrapper rounded-2xl">
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Roll No.</th><th>Course</th><th>Hostel / Room</th><th>Parent Email</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered?.map(s => (
                <tr key={s.id}>
                  <td><p className="font-medium text-slate-800">{s.user?.name}</p><p className="text-xs text-slate-400">{s.user?.email}</p></td>
                  <td className="font-mono text-sm text-slate-600">{s.rollNumber}</td>
                  <td className="text-slate-500 text-sm">{s.courseBranch} · Y{s.year}</td>
                  <td className="text-slate-500 text-sm">{s.hostelName} · {s.roomNumber}</td>
                  <td className="text-slate-400 text-xs">{s.parentEmail}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditTarget(s)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-navy-600"><Edit size={14}/></button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateStudentModal open={showCreate} onClose={() => setShowCreate(false)} onDone={() => { setShowCreate(false); refetch() }} />
      {editTarget && <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} onDone={() => { setEditTarget(null); refetch() }} />}
    </div>
  )
}

function CreateStudentModal({ open, onClose, onDone }) {
  const init = { name:'', email:'', password:'', studentNo:'', rollNumber:'', courseBranch:'', year:'', hostelName:'', roomNumber:'', parentEmail:'', parentPhone:'', mobileNumber:'', homeAddress:'' }
  const [form, setForm] = useState(init)
  const [loading, setLoading] = useState(false)
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await adminApi.createStudent({ ...form, year: Number(form.year) })
      toast.success('Student created'); setForm(init); onDone()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setLoading(false) }
  }

  const fields = [
    ['name','Full Name','text'], ['email','Email (@akgec.ac.in)','email'], ['password','Password','password'],
    ['studentNo','Student No.','text'], ['rollNumber','Roll Number','text'],
    ['courseBranch','Course/Branch','text'], ['year','Year','number'],
    ['hostelName','Hostel Name','text'], ['roomNumber','Room Number','text'],
    ['parentEmail','Parent Email','email'], ['parentPhone','Parent Phone','tel'], ['mobileNumber','Mobile','tel'],
     ['attendancePercentage','Attendance %','number'], 
  ]

  return (
    <Modal open={open} title="Add New Student" onClose={onClose} width="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(([name, label, type]) => (
            <div key={name}>
              <label className="label">{label}</label>
              <input name={name} type={type} required={['name','email','password','rollNumber','studentNo','hostelName','roomNumber','parentEmail'].includes(name)}
                className="input" value={form[name]} onChange={set} />
            </div>
          ))}
        </div>
        <div><label className="label">Home Address</label><textarea name="homeAddress" rows={2} className="input resize-none" value={form.homeAddress} onChange={set} /></div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center mt-2">{loading ? 'Creating…' : 'Create Student Account'}</button>
      </form>
    </Modal>
  )
}

function EditStudentModal({ student, onClose, onDone }) {
  const [form, setForm] = useState({
    courseBranch: student.courseBranch || '', year: student.year || '',
    hostelName: student.hostelName || '', roomNumber: student.roomNumber || '',
    parentEmail: student.parentEmail || '', parentPhone: student.parentPhone || '',
    mobileNumber: student.mobileNumber || '',
  })
  const [loading, setLoading] = useState(false)
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try { await adminApi.updateStudent(student.id, { ...form, year: Number(form.year) }); toast.success('Updated'); onDone() }
    catch { toast.error('Failed to update') }
    finally { setLoading(false) }
  }

  return (
    <Modal open title={`Edit — ${student.user?.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {[['courseBranch','Course/Branch','text'],['year','Year','number'],['hostelName','Hostel','text'],['roomNumber','Room','text'],['parentEmail','Parent Email','email'],['parentPhone','Parent Phone','tel'],['mobileNumber','Mobile','tel']].map(([name,label,type]) => (
          <div key={name}><label className="label">{label}</label><input name={name} type={type} className="input" value={form[name]} onChange={set} /></div>
        ))}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center">{loading ? 'Saving…' : 'Save Changes'}</button>
      </form>
    </Modal>
  )
}

// ── All Leaves (Admin view) ───────────────────────────────────────────────────
export function AdminLeaves() {
  const { data: leaves, loading } = useApi(adminApi.getAllLeaves)
  const [search, setSearch] = useState('')

  const filtered = leaves?.filter(l =>
    l.studentName?.toLowerCase().includes(search.toLowerCase()) ||
    l.rollNumber?.toLowerCase().includes(search.toLowerCase()) ||
    l.leavePassNumber?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">All Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{leaves?.length || 0} total</p>
        </div>
        <input type="text" className="input w-64" placeholder="Search by name, roll no, pass no…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="card p-0">
        <div className="table-wrapper rounded-2xl">
          <table className="table">
            <thead><tr><th>Pass No.</th><th>Student</th><th>Dates</th><th>Days</th><th>Status</th><th>Submitted</th></tr></thead>
            <tbody>
              {filtered?.map(l => (
                <tr key={l.id}>
                  <td className="font-mono text-xs text-slate-400">{l.leavePassNumber}</td>
                  <td><p className="font-medium text-slate-800">{l.studentName}</p><p className="text-xs text-slate-400">{l.rollNumber}</p></td>
                  <td className="text-xs text-slate-500">{l.fromDate ? format(new Date(l.fromDate),'dd MMM') : '—'} – {l.toDate ? format(new Date(l.toDate),'dd MMM yyyy') : '—'}</td>
                  <td>{l.leaveDays}d</td>
                  <td><StatusBadge status={l.status}/></td>
                  <td className="text-xs text-slate-400">{l.createdAt ? format(new Date(l.createdAt),'dd MMM yyyy') : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Reports ───────────────────────────────────────────────────────────────────
export function AdminReports() {
  const { data: report, loading } = useApi(adminApi.getSystemReport)
  if (loading) return <PageLoader />

  const leaveCounts = report?.leaveCountsByStatus || {}
  const total = report?.totalLeaves || 1

  const rows = [
    { label:'Pending Parent',  value: leaveCounts.PENDING_PARENT  || 0, color:'#F59E0B' },
    { label:'Pending Warden',  value: leaveCounts.PENDING_WARDEN  || 0, color:'#F97316' },
    { label:'Pending Dean',    value: leaveCounts.PENDING_DEAN    || 0, color:'#8B5CF6' },
    { label:'Approved',        value: leaveCounts.APPROVED        || 0, color:'#10B981' },
    { label:'Completed',       value: leaveCounts.COMPLETED       || 0, color:'#3B82F6' },
    { label:'Parent Rejected', value: leaveCounts.PARENT_REJECTED || 0, color:'#EF4444' },
    { label:'Warden Rejected', value: leaveCounts.WARDEN_REJECTED || 0, color:'#DC2626' },
    { label:'Dean Rejected',   value: leaveCounts.DEAN_REJECTED   || 0, color:'#B91C1C' },
    { label:'Cancelled',       value: leaveCounts.CANCELLED       || 0, color:'#94A3B8' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 font-display">System Reports</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard label="Total Leaves"    value={report?.totalLeaves   || 0} Icon={FileText}  color="text-navy-600"   bg="bg-navy-50" />
        <MetricCard label="Total Students"  value={report?.totalStudents || 0} Icon={Users}     color="text-indigo-600" bg="bg-indigo-50" />
        <MetricCard label="On Leave Now"    value={report?.studentsCurrentlyOnLeave || 0} Icon={Activity} color="text-amber-600" bg="bg-amber-50" />
        <MetricCard label="Last 30 Days"    value={report?.recentLeaves  || 0} Icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" />
      </div>
      <div className="card">
        <h2 className="font-semibold text-slate-800 font-display mb-5">Leave Status Distribution</h2>
        <div className="space-y-3">
          {rows.map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
              <span className="text-sm text-slate-600 flex-1">{label}</span>
              <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width:`${(value/total)*100}%`, backgroundColor: color }} />
              </div>
              <span className="text-sm font-semibold text-slate-700 w-8 text-right">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between text-sm">
          <span className="text-slate-500">Total leaves</span>
          <span className="font-bold text-slate-900">{report?.totalLeaves || 0}</span>
        </div>
      </div>
    </div>
  )
}

// ── Audit Logs ────────────────────────────────────────────────────────────────
export function AdminAudit() {
  const { data: logs, loading } = useApi(() => adminApi.getAuditLogs(200))
  const ACTION_COLORS = {
    SUBMITTED:'bg-indigo-100 text-indigo-700', PARENT_APPROVED:'bg-emerald-100 text-emerald-700',
    PARENT_REJECTED:'bg-red-100 text-red-600', WARDEN_APPROVED:'bg-emerald-100 text-emerald-700',
    WARDEN_REJECTED:'bg-red-100 text-red-600', DEAN_APPROVED:'bg-emerald-100 text-emerald-700',
    DEAN_REJECTED:'bg-red-100 text-red-600',   PASS_GENERATED:'bg-blue-100 text-blue-700',
    EXIT_MARKED:'bg-amber-100 text-amber-700',  ENTRY_MARKED:'bg-purple-100 text-purple-700',
    CANCELLED:'bg-slate-100 text-slate-500',
  }
  if (loading) return <PageLoader />
  const actions = logs?.recentActions || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Audit Logs</h1>
        <p className="text-slate-500 text-sm mt-1">{actions.length} recent actions</p>
      </div>
      <div className="card p-0">
        <div className="table-wrapper rounded-2xl">
          <table className="table">
            <thead><tr><th>Time</th><th>Performed By</th><th>Action</th><th>Remarks</th></tr></thead>
            <tbody>
              {actions.map(log => (
                <tr key={log.id}>
                  <td className="text-xs text-slate-400 whitespace-nowrap">{log.timestamp ? format(new Date(log.timestamp),'dd MMM, h:mm a') : '—'}</td>
                  <td><p className="text-sm text-slate-700">{log.performedBy}</p>{log.role && <p className="text-xs text-slate-400">{ROLE_LABELS[log.role]||log.role}</p>}</td>
                  <td><span className={`badge ${ACTION_COLORS[log.action]||'bg-slate-100 text-slate-500'}`}>{log.action?.replace(/_/g,' ')}</span></td>
                  <td className="text-sm text-slate-500 max-w-xs truncate">{log.remarks||'—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

//Admin messages------------------------------------------------------------

export function AdminMessages() {
  const { data: messages, loading, refetch } = useApi(adminApi.getMessages)
  const [selected, setSelected] = useState(null)

  const handleRead = async (id) => {
    await adminApi.markMessageRead(id)
    refetch()
    setSelected(null)
  }

  if (loading) return <PageLoader />

  const unread = messages?.filter(m => !m.read).length || 0

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Messages</h1>
        <p className="text-slate-500 text-sm mt-1">
          {messages?.length || 0} total · {unread} unread
        </p>
      </div>

      {!messages?.length ? (
        <div className="card text-center py-16">
          <p className="text-slate-400 text-sm">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map(m => (
            <div key={m.id}
              onClick={() => { setSelected(m); if (!m.read) handleRead(m.id) }}
              className={`card cursor-pointer hover:shadow-card-hover transition-all p-5
                ${!m.read ? 'border-l-4 border-l-navy-600 bg-navy-50/30' : ''}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-slate-800">{m.name}</p>
                    {!m.read && (
                      <span className="badge bg-navy-100 text-navy-700">New</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500">{m.email}</p>
                  <p className="text-sm text-slate-600 mt-2 line-clamp-2">{m.message}</p>
                </div>
                <p className="text-xs text-slate-400 flex-shrink-0">
                  {m.createdAt ? format(new Date(m.createdAt), 'dd MMM, h:mm a') : '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Message detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-slide-up">
            <h3 className="font-semibold text-slate-900 mb-1">{selected.name}</h3>
            <p className="text-sm text-navy-600 mb-4">{selected.email}</p>
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 leading-relaxed">
              {selected.message}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              {selected.createdAt ? format(new Date(selected.createdAt), 'dd MMM yyyy, h:mm a') : '—'}
            </p>
            <button onClick={() => setSelected(null)} className="btn-secondary w-full justify-center mt-4">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({ label, value, Icon, color, bg }) {
  return (
    <div className="card flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      <div>
        <p className="text-xl font-bold text-slate-900 font-display">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}
