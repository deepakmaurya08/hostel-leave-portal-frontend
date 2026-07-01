import { useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Building2 } from 'lucide-react'

export default function ParentResponse() {
  const [params] = useSearchParams()
  const action = params.get('action')   // 'approved' or 'rejected'
  const status = params.get('status')   // backend message

  const approved = action === 'approved'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full text-center animate-slide-up">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-900 mb-6">
          <Building2 size={26} className="text-white" />
        </div>

        {/* Result icon */}
        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 mx-auto ${
          approved ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {approved
            ? <CheckCircle size={40} className="text-emerald-600" />
            : <XCircle    size={40} className="text-red-600" />}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 font-display mb-2">
          {approved ? 'Leave Approved' : 'Leave Rejected'}
        </h1>

        <p className="text-slate-500 mb-6">
          {approved
            ? "You have approved your ward's leave request. It has been forwarded to the Warden for the next level of approval."
            : "You have rejected your ward's leave request. They have been notified by email."}
        </p>

        <div className={`rounded-xl p-4 text-sm ${approved ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
          {approved
            ? '✓ The request will now be reviewed by the Hostel Warden.'
            : '✗ The student has been notified and can re-apply if needed.'}
        </div>

        <p className="text-xs text-slate-400 mt-8">
          Ajay Kumar Garg Engineering College, Ghaziabad<br />
          Hostel Leave Management Portal
        </p>
      </div>
    </div>
  )
}
