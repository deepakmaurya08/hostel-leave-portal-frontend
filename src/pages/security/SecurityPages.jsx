import { useState } from 'react'
import { useApi } from '../../hooks/useApi'
import { securityApi } from '../../api/services'
import { PageLoader } from '../../components/ui/Spinner'
import { format } from 'date-fns'
import { ScanLine, CheckCircle, XCircle, LogOut, LogIn, Users, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

// ── Dashboard ─────────────────────────────────────────────────────────────────


// ── QR Scanner ────────────────────────────────────────────────────────────────
export function SecurityScan() {
  const [qrInput,  setQrInput]  = useState('')
  const [scanData, setScanData] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [acting,   setActing]   = useState(false)
  const [remarks,  setRemarks]  = useState('')
  const [error,    setError]    = useState('')

  const handleScan = async (e) => {
    e.preventDefault()
    const token = qrInput.trim()
    if (!token) return
    setScanning(true)
    setScanData(null)
    setError('')
    try {
      const res = await securityApi.scanQr(token)
      setScanData(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'QR code is invalid or not found')
    } finally { setScanning(false) }
  }

  const handleAction = async (action) => {
    setActing(true)
    try {
      const fn  = action === 'exit' ? securityApi.markExit : securityApi.markEntry
      const res = await fn({ qrToken: qrInput.trim(), remarks })
      setScanData(res.data.data)
      setRemarks('')
      toast.success(action === 'exit'
        ? '✅ Exit marked successfully'
        : '✅ Entry marked — leave completed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed')
    } finally { setActing(false) }
  }

  const canExit  = scanData?.valid && scanData?.nextAction === 'MARK_EXIT'
  const canEntry = scanData?.valid && scanData?.nextAction === 'MARK_ENTRY'
  const done     = scanData?.valid && scanData?.nextAction === 'COMPLETED'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">QR Code Scanner</h1>
        <p className="text-slate-500 text-sm mt-1">Paste QR token or type leave pass number to verify</p>
      </div>

      {/* Input */}
      <div className="card">
        <form onSubmit={handleScan} className="space-y-4">
          <div>
            <label className="label">QR Token / Leave Pass Number</label>
            <input type="text" className="input font-mono text-sm" autoFocus
              placeholder="Paste QR token here…"
              value={qrInput} onChange={e => { setQrInput(e.target.value); setScanData(null); setError('') }} />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <XCircle size={16} className="flex-shrink-0" /> {error}
            </div>
          )}
          <button type="submit" disabled={scanning || !qrInput.trim()} className="btn-primary w-full justify-center py-3">
            {scanning
              ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Verifying…</span>
              : <><ScanLine size={17}/>Verify QR Code</>}
          </button>
        </form>
      </div>

      {/* Result */}
      {scanData && (
        <div className={`card border-2 animate-slide-up ${
          !scanData.valid ? 'border-red-200 bg-red-50'
          : done         ? 'border-blue-200 bg-blue-50'
          :                'border-emerald-200 bg-emerald-50'}`}>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${scanData.valid ? 'bg-emerald-500' : 'bg-red-500'}`}>
              {scanData.valid ? <CheckCircle size={20} className="text-white"/> : <XCircle size={20} className="text-white"/>}
            </div>
            <div>
              <p className={`font-semibold ${scanData.valid ? 'text-emerald-800' : 'text-red-800'}`}>
                {scanData.valid ? 'Valid Leave Pass' : 'Invalid / Not Approved'}
              </p>
              
            </div>
          </div>

          {scanData.valid && (
            <>
              {/* Student info grid */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-5 text-sm bg-white/60 rounded-xl p-4">
                <InfoRow label="Name"       value={scanData.studentName} />
                <InfoRow label="Roll No."   value={scanData.rollNumber} />
                <InfoRow label="Hostel"     value={scanData.hostelName} />
                <InfoRow label="Room"       value={scanData.roomNumber} />
                <InfoRow label="Pass No."   value={scanData.leavePassNumber} />
                <InfoRow label="Leave Type" value={scanData.leaveType?.replace('_',' ')} />
                <InfoRow label="From"       value={scanData.fromDate} />
                <InfoRow label="To"         value={scanData.toDate} />
              </div>

              {/* Approval badges */}
              <div className="flex gap-2 flex-wrap mb-5">
                {[
                  { label: 'Parent',  ok: scanData.parentApproved },
                  { label: 'Warden',  ok: scanData.wardenApproved },
                  { label: 'Dean',    ok: scanData.deanApproved },
                ].map(({ label, ok }) => (
                  <span key={label} className={`badge ${ok ? 'badge-approved' : 'bg-slate-100 text-slate-400'}`}>
                    {ok ? '✓' : '○'} {label}
                  </span>
                ))}
              </div>

              {/* Gate status */}
              

             
              {/* Overdue warning */}
              
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ── On Leave List ─────────────────────────────────────────────────────────────


function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="font-medium text-slate-800">{value || '—'}</p>
    </div>
  )
}
