import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/services'
import { Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const FIELDS_STEP1 = [
  { name: 'name',         label: 'Full Name',         type: 'text',  placeholder: 'Deepak Maurya' },
  { name: 'email',        label: 'Email Address',     type: 'email', placeholder: 'deepak@akgec.ac.in' },
  { name: 'password',     label: 'Password',          type: 'password', placeholder: 'Min 8 characters' },
  { name: 'studentNo',    label: 'Student No.',       type: 'text',  placeholder: 'e.g. 22045' },
  { name: 'rollNumber',   label: 'Roll Number',       type: 'text',  placeholder: 'e.g. 22CS101' },
]
const FIELDS_STEP2 = [
  { name: 'courseBranch', label: 'Course / Branch',   type: 'text',  placeholder: 'B.Tech CSE' },
  { name: 'year',         label: 'Year',              type: 'number',placeholder: '2' },
  { name: 'hostelName',   label: 'Hostel Name',       type: 'text',  placeholder: 'Boys Hostel Block A' },
  { name: 'roomNumber',   label: 'Room Number',       type: 'text',  placeholder: 'A-204' },
  { name: 'mobileNumber', label: 'Mobile Number',     type: 'tel',   placeholder: '9876543210' },
  { name: 'parentEmail',  label: "Parent's Email",    type: 'email', placeholder: 'parent@gmail.com' },
  { name: 'parentPhone',  label: "Parent's Phone",    type: 'tel',   placeholder: '9876543210' },
]

const INIT = {
  name:'', email:'', password:'', studentNo:'', rollNumber:'',
  courseBranch:'', year:'', hostelName:'', roomNumber:'',
  mobileNumber:'', parentEmail:'', parentPhone:'',
}

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState(INIT)
  const [loading, setLoad]  = useState(false)

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoad(true)
    try {
      await authApi.registerStudent({ ...form, year: Number(form.year) })
      const user = await login(form.email, form.password)
      toast.success('Account created! Welcome.')
      navigate('/student/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoad(false)
    }
  }

  const fields = step === 1 ? FIELDS_STEP1 : FIELDS_STEP2

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-navy-900 mb-4">
            <Building2 size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-display">Create Student Account</h2>
          <p className="text-slate-500 text-sm mt-1">AKGEC Hostel Leave Portal</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          {[1, 2].map(s => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all
                ${step >= s ? 'bg-navy-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                {s}
              </div>
              <span className={`text-xs font-medium ${step >= s ? 'text-navy-700' : 'text-slate-400'}`}>
                {s === 1 ? 'Account Info' : 'Hostel Details'}
              </span>
              {s === 1 && <div className={`flex-1 h-0.5 ${step > 1 ? 'bg-navy-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2) } : handleSubmit}>
          <div className="card space-y-4">
            {fields.map(({ name, label, type, placeholder }) => (
              <div key={name}>
                <label className="label">{label}</label>
                <input name={name} type={type} required
                  className="input" placeholder={placeholder}
                  value={form[name]} onChange={set} />
              </div>
            ))}
          </div>

          <div className="flex gap-3 mt-5">
            {step === 2 && (
              <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">
                <ArrowLeft size={16} /> Back
              </button>
            )}
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : step === 1 ? (
                <span className="flex items-center gap-2">Continue <ArrowRight size={16} /></span>
              ) : (
                <span className="flex items-center gap-2">Create Account <ArrowRight size={16} /></span>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-navy-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
