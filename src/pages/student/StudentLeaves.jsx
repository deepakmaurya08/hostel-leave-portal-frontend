import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { studentApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import ApprovalTimeline from '../../components/ui/ApprovalTimeline'
import { format } from 'date-fns'
import { Download, X, FileText, Calendar, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Leaves List ─────────────────────────────────────────────────────────────
export function StudentLeaves() {
  const { data: leaves, loading } = useApi(studentApi.getLeaves)
  const navigate = useNavigate()
  const [filter, setFilter] = useState('ALL')

  const STATUS_FILTERS = ['ALL', 'PENDING_PARENT', 'PENDING_WARDEN', 'PENDING_DEAN', 'APPROVED', 'COMPLETED', 'WARDEN_REJECTED', 'DEAN_REJECTED']

  const filtered = filter === 'ALL' ? leaves : leaves?.filter(l => l.status === filter)

  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-display">My Leave Requests</h1>
          <p className="text-slate-500 text-sm mt-1">{leaves?.length || 0} total requests</p>
        </div>
        <button onClick={() => navigate('/student/apply')} className="btn-primary">
          + Apply for Leave
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {['ALL', 'PENDING_WARDEN', 'PENDING_DEAN', 'APPROVED', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              ${filter === s ? 'bg-navy-600 text-white border-navy-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'}`}>
            {s === 'ALL' ? 'All' : s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {!filtered?.length ? (
        <div className="card text-center py-16">
          <FileText size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No leave requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(leave => (
            <LeaveCard key={leave.id} leave={leave} onClick={() => navigate(`/student/leaves/${leave.id}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaveCard({ leave, onClick }) {
  return (
    <div onClick={onClick} className="card-hover cursor-pointer p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-mono text-xs text-slate-400">{leave.leavePassNumber}</span>
          <StatusBadge status={leave.status} />
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {leave.leaveType?.replace('_', ' ')}
          </span>
        </div>
        <p className="text-sm font-medium text-slate-800 truncate">{leave.reason}</p>
        <p className="text-xs text-slate-500 mt-1">
          <Calendar size={11} className="inline mr-1" />
          {format(new Date(leave.fromDate), 'dd MMM yyyy')} → {format(new Date(leave.toDate), 'dd MMM yyyy')}
          <span className="ml-2 font-medium text-slate-600">{leave.leaveDays} days</span>
        </p>
      </div>
      <span className="text-slate-300 text-lg flex-shrink-0 hidden sm:block">›</span>
    </div>
  )
}

// ─── Leave Detail ─────────────────────────────────────────────────────────────
export function LeaveDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: leave, loading, refetch } = useApi(() => studentApi.getLeave(id), [id])
  const [cancelling, setCancelling] = useState(false)

  const canCancel = ['PENDING_PARENT', 'PENDING_WARDEN'].includes(leave?.status)

  const handleCancel = async () => {
    if (!confirm('Cancel this leave request?')) return
    setCancelling(true)
    try {
      await studentApi.cancelLeave(id)
      toast.success('Leave cancelled')
      refetch()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel')
    } finally { setCancelling(false) }
  }

  const handleDownload = async () => {
    try {
      const res = await studentApi.downloadPdf(id)
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a   = document.createElement('a')
      a.href = url; a.download = `leave_pass_${leave.leavePassNumber}.pdf`; a.click()
      URL.revokeObjectURL(url)
    } catch { toast.error('Failed to download PDF') }
  }

  if (loading) return <PageLoader />
  if (!leave) return <div className="card text-center py-12 text-slate-500">Leave not found</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate('/student/leaves')} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1">
        ← Back to leaves
      </button>

      {/* Header */}
      <div className="card flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{leave.leavePassNumber}</span>
            <StatusBadge status={leave.status} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 font-display">{leave.leaveType?.replace('_', ' ')}</h1>
          <p className="text-slate-500 text-sm mt-1">{leave.reason}</p>
          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
            <span className="flex items-center gap-1"><Calendar size={14} />{format(new Date(leave.fromDate), 'dd MMM yyyy')}</span>
            <span className="text-slate-400">→</span>
            <span className="flex items-center gap-1"><Calendar size={14} />{format(new Date(leave.toDate), 'dd MMM yyyy')}</span>
            <span className="flex items-center gap-1 font-medium text-navy-600"><Clock size={14} />{leave.leaveDays} days</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {leave.status === 'APPROVED' && (
            <button onClick={handleDownload} className="btn-primary btn-sm">
              <Download size={15} /> Download Pass
            </button>
          )}
          {canCancel && (
            <button onClick={handleCancel} disabled={cancelling} className="btn-danger btn-sm">
              {cancelling ? '…' : <><X size={15} />Cancel</>}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Approval Timeline */}
        <div className="card">
          <h2 className="font-semibold text-slate-800 font-display mb-4">Approval Progress</h2>
          <ApprovalTimeline leave={leave} />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-slate-800 font-display mb-3">Leave Details</h2>
            <dl className="space-y-2 text-sm">
              <Row label="Visit Person" value={leave.visitPersonName || '—'} />
              <Row label="Relation" value={leave.visitPersonRelation || '—'} />
              <Row label="Contact" value={leave.visitPersonContact || '—'} />
              <Row label="Attendance" value={leave.attendancePercentage ? `${leave.attendancePercentage}%` : '—'} />
              {leave.wardenRemarks && <Row label="Warden Remarks" value={leave.wardenRemarks} />}
              {leave.deanRemarks   && <Row label="Dean Remarks"   value={leave.deanRemarks} />}
            </dl>
          </div>

          
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-slate-500 flex-shrink-0">{label}</dt>
      <dd className="text-slate-800 text-right">{value}</dd>
    </div>
  )
}
