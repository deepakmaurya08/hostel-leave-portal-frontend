import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApi } from '../../hooks/useApi'
import { wardenApi, deanApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import StatusBadge from '../../components/ui/StatusBadge'
import ApprovalTimeline from '../../components/ui/ApprovalTimeline'
import Modal from '../../components/ui/Modal'
import { format } from 'date-fns'
import { CheckCircle, XCircle, Eye, Clock, ArrowUpRight, History } from 'lucide-react'
import toast from 'react-hot-toast'

// ─── Warden Dashboard ─────────────────────────────────────────────────────────
export function WardenDashboard() {
  const { data, loading } = useApi(wardenApi.getDashboard)
  const navigate = useNavigate()
  if (loading) return <PageLoader />

  const stats = [
    { label: 'Pending Review',    value: data?.pendingRequests ?? 0, color: 'text-amber-600',   bg: 'bg-amber-50',   Icon: Clock },
    { label: 'Approved Today',    value: data?.approvedToday   ?? 0, color: 'text-emerald-600', bg: 'bg-emerald-50', Icon: CheckCircle },
    { label: 'Rejected Today',    value: data?.rejectedToday   ?? 0, color: 'text-red-600',     bg: 'bg-red-50',     Icon: XCircle },
    { label: 'Escalated to Dean', value: data?.escalatedToDean ?? 0, color: 'text-indigo-600',  bg: 'bg-indigo-50',  Icon: ArrowUpRight },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Warden Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Review and action student leave requests</p>
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
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 font-display">Pending Requests</h2>
            <button onClick={() => navigate('/warden/pending')} className="text-sm text-navy-600 font-medium hover:text-navy-700">
              View all →
            </button>
          </div>
          <LeaveTable leaves={data.pendingLeaves.slice(0, 5)} />
        </div>
      )}
    </div>
  )
}

// ─── Warden Pending ───────────────────────────────────────────────────────────
export function WardenPending() {
  const { data: leaves, loading, refetch } = useApi(wardenApi.getPendingLeaves)
  const [selected, setSelected] = useState(null)
  if (loading) return <PageLoader />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Pending Leave Requests</h1>
        <p className="text-slate-500 text-sm mt-1">{leaves?.length || 0} requests awaiting your review</p>
      </div>
      {!leaves?.length ? (
        <div className="card text-center py-16">
          <CheckCircle size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">All clear — no pending requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map(leave => (
            <ReviewCard key={leave.id} leave={leave} onSelect={() => setSelected(leave)} />
          ))}
        </div>
      )}
      {selected && (
        <ApproveRejectModal
          leave={selected} role="warden"
          onClose={() => setSelected(null)}
          onDone={() => { setSelected(null); refetch() }}
        />
      )}
    </div>
  )
}

// ─── Warden History ───────────────────────────────────────────────────────────
export function WardenHistory() {
  const { data: leaves, loading } = useApi(wardenApi.getHistory)
  if (loading) return <PageLoader />
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 font-display">Leave History</h1>
      <div className="card p-0"><LeaveTable leaves={leaves || []} /></div>
    </div>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ leave, onSelect }) {
  const isLong = leave.leaveDays > 5
  return (
    <div className={`card p-5 ${isLong ? 'border-l-4 border-l-amber-400' : ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">{leave.leavePassNumber}</span>
            <StatusBadge status={leave.status} />
            {isLong && <span className="badge bg-amber-100 text-amber-700">Long leave ({leave.leaveDays}d)</span>}
          </div>
          <p className="font-semibold text-slate-800">{leave.studentName}</p>
          <p className="text-sm text-slate-500">{leave.rollNumber} · {leave.hostelName} · Room {leave.roomNumber}</p>
          <p className="text-sm text-slate-600 mt-1 line-clamp-1">{leave.reason}</p>
          <p className="text-xs text-slate-400 mt-1">
            {format(new Date(leave.fromDate), 'dd MMM')} → {format(new Date(leave.toDate), 'dd MMM yyyy')}
            <span className="ml-2 font-medium text-slate-600">{leave.leaveDays} days</span>
          </p>
        </div>
        <button onClick={onSelect} className="btn-secondary btn-sm flex-shrink-0">
          <Eye size={14} /> Review
        </button>
      </div>
    </div>
  )
}

// ─── Leave Table ──────────────────────────────────────────────────────────────
function LeaveTable({ leaves }) {
  if (!leaves.length) return <div className="text-center py-12 text-slate-400 text-sm">No records found</div>
  return (
    <div className="table-wrapper rounded-2xl">
      <table className="table">
        <thead>
          <tr><th>Pass No.</th><th>Student</th><th>Hostel</th><th>Dates</th><th>Days</th><th>Status</th></tr>
        </thead>
        <tbody>
          {leaves.map(l => (
            <tr key={l.id}>
              <td className="font-mono text-xs text-slate-400">{l.leavePassNumber}</td>
              <td><p className="font-medium text-slate-800">{l.studentName}</p><p className="text-xs text-slate-400">{l.rollNumber}</p></td>
              <td className="text-slate-500 text-sm">{l.hostelName} · {l.roomNumber}</td>
              <td className="text-xs text-slate-500">{format(new Date(l.fromDate),'dd MMM')} – {format(new Date(l.toDate),'dd MMM yyyy')}</td>
              <td>{l.leaveDays}d</td>
              <td><StatusBadge status={l.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Approve / Reject Modal — shared by Warden AND Dean ──────────────────────
export function ApproveRejectModal({ leave, role, onClose, onDone }) {
  const [remarks,    setRemarks]    = useState('')
  const [workingDays,setWd]         = useState('')
  const [commTime,   setCommTime]   = useState('')
  const [loading,    setLoading]    = useState(false)

  // Pick the right API based on role — no require(), just a prop-driven switch
  const doApprove = (payload) =>
    role === 'warden' ? wardenApi.approveLeave(leave.id, payload) : deanApi.approveLeave(leave.id, payload)
  const doReject  = (payload) =>
    role === 'warden' ? wardenApi.rejectLeave(leave.id, payload)  : deanApi.rejectLeave(leave.id, payload)

  const act = async (action) => {
    setLoading(true)
    try {
      const payload = {
        remarks,
        ...(role === 'warden' && {
          workingDaysCount:     workingDays ? Number(workingDays) : undefined,
          wardenParentCommTime: commTime || undefined,
        }),
      }
      if (action === 'approve') await doApprove(payload)
      else                       await doReject(payload)
      toast.success(`Leave ${action === 'approve' ? 'approved ✓' : 'rejected'}`)
      onDone()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally { setLoading(false) }
  }

  return (
    <Modal open title={`Review — ${leave.leavePassNumber}`} onClose={onClose} width="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Left: leave info */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Student</p>
            <p className="font-semibold text-slate-800">{leave.studentName}</p>
            <p className="text-sm text-slate-500">{leave.rollNumber} · {leave.hostelName} · Room {leave.roomNumber}</p>
            <p className="text-sm text-slate-500">{leave.courseBranch}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Leave Period</p>
            <p className="text-sm font-medium text-slate-700">
              {format(new Date(leave.fromDate),'dd MMM yyyy')} → {format(new Date(leave.toDate),'dd MMM yyyy')}
              <span className="ml-2 text-navy-600 font-semibold">{leave.leaveDays} days</span>
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Reason</p>
            <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-2.5">{leave.reason}</p>
          </div>
          {leave.visitPersonName && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Visiting</p>
              <p className="text-sm text-slate-700">{leave.visitPersonName} ({leave.visitPersonRelation})</p>
              <p className="text-xs text-slate-500">{leave.visitPersonContact}</p>
            </div>
          )}
          {leave.attendancePercentage && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Attendance</p>
              <p className="text-sm font-semibold text-slate-700">{leave.attendancePercentage}%</p>
            </div>
          )}
          {leave.documentUrls?.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">
                Uploaded Documents
              </p>

              <div className="space-y-2">
                {leave.documentUrls.map((doc, index) => (
                  <a
                    key={index}
                    href={`http://localhost:8080/api${doc}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-blue-600 underline text-sm"
                  >
                    View Document {index + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
          <div className="pt-1">
            <p className="text-xs text-slate-400 uppercase tracking-wide mb-2">Approval Progress</p>
            <ApprovalTimeline leave={leave} />
          </div>
        </div>

        {/* Right: action form */}
        <div className="space-y-4">
          <div>
            <label className="label">Remarks</label>
            <textarea rows={3} className="input resize-none"
              placeholder="Add your remarks (optional)"
              value={remarks} onChange={e => setRemarks(e.target.value)} />
          </div>

          {role === 'warden' && (
            <>
              <div>
                <label className="label">Working days during leave</label>
                <input type="number" className="input" placeholder="e.g. 3"
                  value={workingDays} onChange={e => setWd(e.target.value)} />
              </div>
              <div>
                <label className="label">Communication with parent / time</label>
                <input type="text" className="input" placeholder="e.g. Called at 10:30 AM"
                  value={commTime} onChange={e => setCommTime(e.target.value)} />
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => act('approve')} disabled={loading}
              className="btn-success justify-center py-2.5">
              {loading ? '…' : <><CheckCircle size={16} />Approve {role === 'warden' ? '& Forward to Dean' : '& Generate Pass'}</>}
            </button>
            <button onClick={() => act('reject')} disabled={loading}
              className="btn-danger justify-center py-2.5">
              {loading ? '…' : <><XCircle size={16} />Reject</>}
            </button>
            <button onClick={onClose} className="btn-secondary justify-center">Cancel</button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
