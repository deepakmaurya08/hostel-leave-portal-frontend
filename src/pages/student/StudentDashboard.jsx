import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { studentApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import { FileText, Clock, CheckCircle, XCircle, PlusCircle, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'

export default function StudentDashboard() {
  const { data, loading } = useApi(studentApi.getDashboard)
  const navigate = useNavigate()
  if (loading) return <PageLoader />

  const stats = [
    { label: 'Total Leaves',  value: data?.totalLeavesTaken ?? 0, Icon: FileText,    color: 'text-indigo-600',  bg: 'bg-indigo-50' },
    { label: 'Pending',       value: data?.pendingRequests   ?? 0, Icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: 'Approved',      value: data?.approvedLeaves    ?? 0, Icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected',      value: data?.rejectedLeaves    ?? 0, Icon: XCircle,     color: 'text-red-600',     bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">
            Hello, {data?.studentName?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {data?.hostelName} · Room {data?.roomNumber} · {data?.rollNumber}
          </p>
        </div>
        <button onClick={() => navigate('/student/apply')} className="btn-primary">
          <PlusCircle size={17} /> Apply for Leave
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, Icon, color, bg }) => (
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

      {/* Recent leaves */}
      <div className="card p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900 font-display">Recent Leave Requests</h2>
          <button onClick={() => navigate('/student/leaves')}
            className="text-sm text-navy-600 font-medium hover:text-navy-700 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </button>
        </div>
        {!data?.recentLeaves?.length ? (
          <div className="text-center py-16">
            <FileText size={40} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No leave requests yet</p>
            <button onClick={() => navigate('/student/apply')} className="btn-primary mt-4 btn-sm">
              Apply now
            </button>
          </div>
        ) : (
          <div className="table-wrapper rounded-none rounded-b-2xl">
            <table className="table">
              <thead>
                <tr><th>Pass No.</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {data.recentLeaves.map(leave => (
                  <tr key={leave.id}>
                    <td className="font-mono text-xs text-slate-400">{leave.leavePassNumber}</td>
                    <td className="capitalize text-sm">{leave.leaveType?.replace('_', ' ')}</td>
                    <td className="text-sm">{format(new Date(leave.fromDate), 'dd MMM yyyy')}</td>
                    <td className="text-sm">{format(new Date(leave.toDate), 'dd MMM yyyy')}</td>
                    <td className="text-sm">{leave.leaveDays}d</td>
                    <td><StatusBadge status={leave.status} /></td>
                    <td>
                      <button onClick={() => navigate(`/student/leaves/${leave.id}`)}
                        className="text-navy-600 hover:text-navy-700 text-xs font-medium">
                        Details →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
