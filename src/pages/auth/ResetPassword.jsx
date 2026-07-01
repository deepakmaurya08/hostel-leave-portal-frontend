import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { authApi } from '../../api/services'
import { Building2, Lock, Eye, EyeOff, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const [params]   = useSearchParams()
  const navigate   = useNavigate()
  const token      = params.get('token')
  const [newPwd,   setNewPwd]   = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPwd,  setShowPwd]  = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)
  const [errors,   setErrors]   = useState({})

  const validate = () => {
    const e = {}
    if (newPwd.length < 8)  e.newPwd = 'At least 8 characters'
    if (newPwd !== confirm)  e.confirm = 'Passwords do not match'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword: newPwd })
      setDone(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/30 p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-900 mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Set New Password</h2>
          <p className="text-slate-500 text-sm mt-1">AKGEC Hostel Leave Portal</p>
        </div>

        {done ? (
          <div className="card text-center space-y-4">
            <CheckCircle size={48} className="text-emerald-500 mx-auto" />
            <h3 className="text-lg font-semibold text-slate-800 font-display">Password Updated!</h3>
            <p className="text-slate-500 text-sm">Redirecting you to login…</p>
          </div>
        ) : (
          <div className="card">
            {!token && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                Invalid reset link. Please request a new one from the login page.
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPwd ? 'text' : 'password'} required
                    className={`input pl-10 pr-10 ${errors.newPwd ? 'input-error' : ''}`}
                    placeholder="At least 8 characters"
                    value={newPwd} onChange={e => { setNewPwd(e.target.value); setErrors(p=>({...p,newPwd:''})) }} />
                  <button type="button" onClick={() => setShowPwd(p=>!p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
                {errors.newPwd && <p className="error-msg">{errors.newPwd}</p>}
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input type="password" required
                  className={`input ${errors.confirm ? 'input-error' : ''}`}
                  placeholder="Re-enter new password"
                  value={confirm} onChange={e => { setConfirm(e.target.value); setErrors(p=>({...p,confirm:''})) }} />
                {errors.confirm && <p className="error-msg">{errors.confirm}</p>}
              </div>
              <button type="submit" disabled={loading || !token} className="btn-primary w-full justify-center py-3">
                {loading
                  ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Resetting…</span>
                  : 'Reset Password'}
              </button>
            </form>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-navy-600 hover:underline">← Back to Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
