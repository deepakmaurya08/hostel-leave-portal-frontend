import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { studentApi, profileApi } from '../../api/services'
import { Upload, X, FileText, Calendar, User, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const LEAVE_TYPES = [
  { value: 'HOME_LEAVE', label: 'Home Leave' },
  { value: 'MEDICAL',    label: 'Medical' },
  { value: 'EMERGENCY',  label: 'Emergency' },
  { value: 'PERSONAL',   label: 'Personal' },
  { value: 'FESTIVAL',   label: 'Festival' },
  { value: 'OTHER',      label: 'Other' },
]
const today = new Date().toISOString().split('T')[0]

// ── Defined OUTSIDE component — prevents re-mount / focus-loss bug ─────────
function Section({ title, icon: Icon, children }) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-navy-50 flex items-center justify-center">
          <Icon size={14} className="text-navy-600" />
        </div>
        <h3 className="font-semibold text-slate-800 text-sm font-display">{title}</h3>
      </div>
      {children}
    </div>
  )
}

export default function ApplyLeave() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [files,   setFiles]   = useState([])

  // Individual state vars — object spread on each char causes re-render + focus loss
  const [leaveType,           setLeaveType]           = useState('HOME_LEAVE')
  const [fromDate,            setFromDate]             = useState('')
  const [toDate,              setToDate]               = useState('')
  const [timeOut,             setTimeOut]              = useState('')
  const [reason,              setReason]               = useState('')
  const [visitPersonName,     setVisitPersonName]      = useState('')
  const [visitPersonRelation, setVisitPersonRelation]  = useState('')
  const [visitPersonAddress,  setVisitPersonAddress]   = useState('')
  const [visitPersonContact,  setVisitPersonContact]   = useState('')
  const [emergencyContact,    setEmergencyContact]     = useState('')
  const [attendancePct,       setAttendancePct]        = useState('')
  const [attendanceSource,    setAttendanceSource]     = useState('')
  const [hodName,             setHodName]              = useState('')

  // Auto-fetch attendance on mount
  useEffect(() => {
    profileApi.getAttendance()
      .then(res => {
        const d = res.data.data
        setAttendancePct(String(d.percentage ?? ''))
        setAttendanceSource(d.source || '')
      })
      .catch(() => {}) // silently fail — user can fill manually
  }, [])

  const addFiles = (e) => setFiles(p => [...p, ...Array.from(e.target.files)].slice(0, 5))
  const removeFile = (i) => setFiles(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fromDate || !toDate) return toast.error('Please select leave dates')
    if (toDate < fromDate)    return toast.error('To date must be after from date')

    setLoading(true)
    try {
      const payload = {
        leaveType, fromDate, toDate, reason,
        timeOut:              timeOut              || null,
        visitPersonName:      visitPersonName      || null,
        visitPersonRelation:  visitPersonRelation  || null,
        visitPersonAddress:   visitPersonAddress   || null,
        visitPersonContact:   visitPersonContact   || null,
        emergencyContact:     emergencyContact     || null,
        attendancePercentage: attendancePct ? Number(attendancePct) : null,
        hodName:              hodName              || null,
      }
      const fd = new FormData()
      fd.append('leave', new Blob([JSON.stringify(payload)], { type: 'application/json' }))
      files.forEach(f => fd.append('documents', f))
      await studentApi.applyLeave(fd)
      toast.success('Leave submitted! Parent approval email sent.')
      navigate('/student/leaves')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit leave')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-slate-500 hover:text-slate-700 mb-4 flex items-center gap-1">
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Apply for Leave</h1>
        <p className="text-slate-500 text-sm mt-1">Fill in all details. Your parent will receive an approval email.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        <Section title="Leave Period" icon={Calendar}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="label">Leave Type</label>
              <select className="input" value={leaveType} onChange={e => setLeaveType(e.target.value)}>
                {LEAVE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From Date</label>
              <input type="date" min={today} required className="input"
                value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="label">To Date</label>
              <input type="date" min={fromDate || today} required className="input"
                value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="sm:w-1/3">
            <label className="label">Time Out</label>
            <input type="time" className="input" value={timeOut} onChange={e => setTimeOut(e.target.value)} />
          </div>
        </Section>

        <Section title="Reason for Leave" icon={FileText}>
          <div>
            <label className="label">State Clearly <span className="text-red-400">*</span></label>
            <textarea required rows={3} className="input resize-none"
              placeholder="Describe the reason for your leave in detail…"
              value={reason} onChange={e => setReason(e.target.value)} />
          </div>
        </Section>

        <Section title="Person Being Visited" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Name of Person</label>
              <input type="text" className="input" placeholder="Father / Mother / Relative"
                value={visitPersonName} onChange={e => setVisitPersonName(e.target.value)} />
            </div>
            <div>
              <label className="label">Relation</label>
              <input type="text" className="input" placeholder="e.g. Father"
                value={visitPersonRelation} onChange={e => setVisitPersonRelation(e.target.value)} />
            </div>
            <div>
              <label className="label">Contact Number</label>
              <input type="tel" className="input" placeholder="10-digit mobile"
                value={visitPersonContact} onChange={e => setVisitPersonContact(e.target.value)} />
            </div>
            <div>
              <label className="label">Emergency Contact</label>
              <input type="tel" className="input" placeholder="Alternate number"
                value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Address</label>
            <textarea rows={2} className="input resize-none"
              placeholder="Full address of person being visited"
              value={visitPersonAddress} onChange={e => setVisitPersonAddress(e.target.value)} />
          </div>
        </Section>

        <Section title="Attendance Details" icon={Clock}>
          {attendanceSource && (
            <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              Auto-filled from {attendanceSource}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Attendance Percentage</label>
              <input type="number" min="0" max="100" step="0.1"
                className="input bg-slate-50 cursor-not-allowed"
                placeholder="Auto-filled from ERP"
                value={attendancePct}
                readOnly />
            </div>
            <div>
              <label className="label">HoD / Co-ordinator Name</label>
              <input type="text" className="input" placeholder="Name of HoD"
                value={hodName} onChange={e => setHodName(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section title="Supporting Documents" icon={Upload}>
          <p className="text-xs text-slate-500 mb-3">Medical certificate, ID proof, etc. (max 5 files, 5MB each)</p>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-6 cursor-pointer hover:border-navy-400 hover:bg-navy-50/50 transition-all">
            <Upload size={24} className="text-slate-300 mb-2" />
            <span className="text-sm text-slate-500">Click to upload</span>
            <span className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 5MB</span>
            <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={addFiles} />
          </label>
          {files.length > 0 && (
            <div className="space-y-2 mt-3">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
                  <FileText size={15} className="text-navy-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-slate-400">{(f.size/1024).toFixed(0)}KB</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-slate-400 hover:text-red-500">
                    <X size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-700">
          <strong>Note:</strong> Leave from hostel does not mean leave from classes.
          Leave beyond 3 working days requires Director General approval.
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
            {loading
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting…</span>
              : 'Submit Leave Request'}
          </button>
        </div>
      </form>
    </div>
  )
}
