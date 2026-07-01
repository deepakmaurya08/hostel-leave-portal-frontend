import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { deanApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { ApproveRejectModal } from '../warden/WardenPages'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Clock, Star, Eye, FileText } from 'lucide-react'

export function DeanDashboard() {
  const { data, loading } = useApi(deanApi.getDashboard)
  if (loading) return <PageLoader />

  const stats = [
    { label: 'Awaiting Final Approval', value: data?.pendingForApproval ?? 0, color: 'text-amber-600',   bg: 'bg-amber-50',   Icon: Clock },
    { label: 'Priority (>3 days)',       value: data?.priorityRequests   ?? 0, color: 'text-red-600',     bg: 'bg-red-50',     Icon: Star },
    { label: 'Total Approved',           value: data?.totalApproved      ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle },
    { label: 'Total Completed',          value: data?.totalCompleted     ?? 0, color: 'text-indigo-600',  bg: 'bg-indigo-50',  Icon: CheckCircle },
  ]
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Dean Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Final authority for all hostel leave approvals</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, color, bg, Icon }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-display">{value}</p>
              <p className="text-xs text-slate-500 mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
      {data?.pendingLeaves?.length > 0 && (
        <div className="card p-0">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-900 font-display">Awaiting Final Approval</h2>
          </div>
          <DeanTable leaves={data.pendingLeaves} />
        </div>
      )}
    </div>
  )
}

export function DeanPending() {
  const { data: leaves, loading, refetch } = useApi(deanApi.getPendingLeaves)
  const [selected, setSelected] = useState(null)
  if (loading) return <PageLoader />
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Pending Final Approvals</h1>
        <p className="text-slate-500 text-sm mt-1">{leaves?.length || 0} requests awaiting your decision</p>
      </div>
      {!leaves?.length ? (
        <div className="card text-center py-16">
          <CheckCircle size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No pending requests</p>
        </div>
      ) : (
        <div className="card p-0"><DeanTable leaves={leaves} onSelect={setSelected} /></div>
      )}
      {selected && (
        <ApproveRejectModal leave={selected} role="dean"
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); refetch() }}
        />
      )}
    </div>
  )
}

export function DeanHistory() {
  const { data: leaves, loading } = useApi(deanApi.getHistory)
  if (loading) return <PageLoader />
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 font-display">Approval History</h1>
      <div className="card p-0"><DeanTable leaves={leaves || []} /></div>
    </div>
  )
}

function DeanTable({ leaves, onSelect }) {
  if (!leaves.length) return <div className="text-center py-12 text-slate-400 text-sm">No records found</div>
  return (
    <div className="table-wrapper rounded-2xl">
      <table className="table">
        <thead>
          <tr><th>Pass No.</th><th>Student</th><th>Hostel</th><th>Dates</th><th>Days</th><th>Warden</th><th>Status</th>{onSelect && <th></th>}</tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.id}>
              <td className="font-mono text-xs text-slate-400">{l.leavePassNumber}</td>
              <td><p className="font-medium text-slate-800">{l.studentName}</p><p className="text-xs text-slate-400">{l.rollNumber}</p></td>
              <td className="text-slate-500 text-xs">{l.hostelName} · {l.roomNumber}</td>
              <td className="text-xs text-slate-500">{format(new Date(l.fromDate),'dd MMM')} – {format(new Date(l.toDate),'dd MMM')}</td>
              <td className={l.leaveDays > 3 ? 'font-bold text-amber-600' : ''}>{l.leaveDays}d</td>
              <td className="text-xs text-slate-500">{l.approvedByWarden || '—'}</td>
              <td><StatusBadge status={l.status} /></td>
              {onSelect && (
                <td><button onClick={() => onSelect(l)} className="btn-secondary btn-sm"><Eye size={13}/>Review</button></td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
