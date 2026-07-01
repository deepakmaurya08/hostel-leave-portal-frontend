import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { authApi } from '../../api/services'
import { Building2, Mail, Lock, ArrowRight, Eye, EyeOff, Send, X, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'
import akgecLogo from '../../assets/akgec-logo.jpg';

const ROLE_REDIRECT = {
  ROLE_STUDENT: '/student/dashboard', ROLE_WARDEN: '/warden/dashboard',
  ROLE_DEAN: '/dean/dashboard', ROLE_SECURITY: '/security/dashboard', ROLE_ADMIN: '/admin/dashboard',
}

const validateAkgecEmail = (email) => {
  return email && !email.endsWith("@akgec.ac.in")
    ? "Only @akgec.ac.in emails allowed"
    : "";
};

// Animated floating particles for background
function Particles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(18)].map((_, i) => (
        <div key={i} className="absolute rounded-full opacity-10 animate-pulse-slow"
          style={{
            width:  `${8 + (i * 7) % 40}px`,
            height: `${8 + (i * 7) % 40}px`,
            background: i % 3 === 0 ? '#4F46E5' : i % 3 === 1 ? '#818CF8' : '#ffffff',
            top:  `${(i * 23 + 7)  % 100}%`,
            left: `${(i * 17 + 11) % 100}%`,
            animationDelay: `${(i * 0.4) % 3}s`,
            animationDuration: `${3 + (i % 4)}s`,
          }}
        />
      ))}
    </div>
  )
}

// Forgot password inline panel
function ForgotPanel({ onClose }) {
  const [email,   setEmail]   = useState('')
  const [emailErr, setEmailErr] = useState('');
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)

  const validateEmail = (value) => {
    setEmailErr(validateAkgecEmail(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
   if (emailErr) {
        toast.error(emailErr);
        return;
    }
    setLoading(true)
    try {
      await authApi.forgotPassword({ email })
      setSent(true)
    } catch { 
      toast.error('Failed to send reset email') 
    }finally {
       setLoading(false) ;
      }
  };

  return (
    <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl animate-slide-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-indigo-800">Reset Password</p>
        <button onClick={onClose} className="text-indigo-400 hover:text-indigo-600"><X size={15}/></button>
      </div>
      {sent ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          ✓ Reset link sent! Check your @akgec.ac.in inbox.
        </p>
      ) : (
        <form onSubmit={handleSubmit}>
    <div className="flex gap-2">
        <input
            type="email"
            required
            className={`input flex-1 text-sm py-2 ${emailErr ? "input-error" : ""}`}
            placeholder="email@akgec.ac.in"
            value={email}
            onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
            }}
        />

        <button
            type="submit"
            disabled={loading || !!emailErr}
            className="btn-primary btn-sm px-4"
        >
            {loading
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : <Send size={14} />}
        </button>
    </div>

    {emailErr && (
        <p className="error-msg mt-2">
            {emailErr}
        </p>
    )}
</form>
      )}
    </div>
  )
}

// Contact admin inline panel
function ContactPanel({ onClose }) {
  const [adminInfo, setAdminInfo] = useState(null)
  const [emailErr, setEmailErr] = useState('');
  const [form,      setForm]      = useState({ name: '', email: '', message: '' })
  const [sending,   setSending]   = useState(false)
  const [sent,      setSent]      = useState(false)
  const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

  const validateEmail = (value) => {
    setEmailErr(validateAkgecEmail(value));
};

  useEffect(() => {
    authApi.getAdminInfo()
      .then(r => setAdminInfo(r.data.data))
      .catch(() => {})
  }, [])

  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (emailErr) {
        toast.error(emailErr);
        return;
    }

    setSending(true);

    try {
      await authApi.contactAdmin(form)
      setSent(true)
      toast.success('Message sent to admin!');

    } catch { 
      toast.error('Failed to send message');
     }finally { 
      setSending(false);
     }
  };

  return (
    <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl animate-slide-up space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-800">Contact Admin</p>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={15}/></button>
      </div>

      {/* Admin profile card */}
      {adminInfo && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-navy-900 flex-shrink-0 flex items-center justify-center">
            {adminInfo.photo
              ? <img src={`${BASE}${adminInfo.photo}`} alt="Admin" className="w-full h-full object-cover"
                  onError={e => { e.target.style.display = 'none' }}/>
              : <span className="text-white font-bold text-lg">{adminInfo.name?.charAt(0)?.toUpperCase()}</span>}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-800 text-sm">{adminInfo.name}</p>
            <p className="text-xs text-slate-500 leading-tight">{adminInfo.description}</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{adminInfo.batch}</p>
          </div>
        </div>
      )}

      {sent ? (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg p-3">
          ✓ Your message has been sent to the admin. They will reach out via email.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label text-xs">Your Name</label>
              <input name="name" type="text" required className="input text-sm py-2"
                placeholder="Full name" value={form.name} onChange={set} />
            </div>
            <div>
              <label className="label text-xs">Your Email</label>
              <input
              name="email"
              type="email"
              required
              className={`input text-sm py-2 ${emailErr ? "input-error" : ""}`}
              placeholder="email@akgec.ac.in"
              value={form.email}
              onChange={(e) => {
                  setForm(prev => ({
                      ...prev,
                      email: e.target.value,
                  }));
                  validateEmail(e.target.value);
              }}
          />

         {emailErr && <p className="error-msg mt-1">{emailErr}</p>}
            </div>
          </div>
          <div>
            <label className="label text-xs">Message</label>
            <textarea name="message" required rows={3} className="input resize-none text-sm"
              placeholder="Describe your issue or question…"
              value={form.message} onChange={set} />
          </div>
          <button type="submit" disabled={sending || !!emailErr} className="btn-primary w-full justify-center text-sm py-2.5">
            {sending ? 'Sending…' : <><Send size={14}/>Send Message</>}
          </button>
        </form>
      )}
    </div>
  )
}

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showPwd,     setShowPwd]     = useState(false)
  const [emailErr,    setEmailErr]    = useState('')
  const [showForgot,  setShowForgot]  = useState(false)
  const [showContact, setShowContact] = useState(false)

  const validateEmail = (value) => {
    setEmailErr(validateAkgecEmail(value));
    };

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.endsWith('@akgec.ac.in')) { setEmailErr('Only @akgec.ac.in emails allowed'); return }
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(`Welcome, ${user.name}!`)
      navigate(ROLE_REDIRECT[user.role] || '/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Brand Panel ─────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] bg-navy-900 p-12 relative overflow-hidden">
        <Particles />

        {/* Glowing orbs */}
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute bottom-1/4 -left-10 w-56 h-56 rounded-full bg-violet-500/15 blur-2xl" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-md">
            <img
                src={akgecLogo}
                alt="AKGEC Logo"
                className="w-10 h-10 object-contain"
            />
        </div>
          <span className="text-white font-semibold font-display tracking-wide">AKGEC Hostel Portal</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-indigo-200 text-xs font-medium">Live System</span>
          </div>
          <h1 className="text-4xl font-bold text-white font-display leading-tight mb-4">
            Smart Hostel<br />Leave Management
          </h1>
          <p className="text-white/60 text-lg leading-relaxed mb-10">
            Digital leave system for AKGEC hostels — from student application to gate verification.
          </p>
          <div className="space-y-3">
            {['Multi-level approval workflow','Instant PDF leave pass','Real-time status tracking','Parent email notifications'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-500/80 flex items-center justify-center flex-shrink-0">
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5l2 2L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-white/70 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-xs">
          Ajay Kumar Garg Engineering College, Ghaziabad
          <br />
          <p>Developed By - DEEPAK MAURYA(IT)</p>
        </p>
      </div>

      {/* ── Right Login Form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-indigo-50/20">
        <div className="w-full max-w-md animate-slide-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-white shadow-md flex items-center justify-center overflow-hidden">
                <img
                    src={akgecLogo}
                    alt="AKGEC Logo"
                    className="w-8 h-8 object-contain"
                />
            </div>
            
            <span className="font-semibold text-slate-800 font-display">AKGEC Hostel Portal</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 font-display mb-1">Sign in</h2>
          <p className="text-slate-500 text-sm mb-8">Use your AKGEC institutional email to access the portal</p>

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="on">
            {/* Email */}
            <div>
              <label className="label">AKGEC Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email" required autoFocus autoComplete="email"
                  className={`input pl-10 ${emailErr ? 'input-error' : ''}`}
                  placeholder="email@akgec.ac.in"
                  value={email}
                  onChange={e => { setEmail(e.target.value); validateEmail(e.target.value) }}
                />
              </div>
              {emailErr && <p className="error-msg">{emailErr}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPwd ? 'text' : 'password'} required autoComplete="current-password"
                  className="input pl-10 pr-10"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPwd(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPwd ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !!emailErr}
              className="btn-primary w-full justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                  Signing in…
                </span>
              ) : <span className="flex items-center gap-2">Sign In <ArrowRight size={16}/></span>}
            </button>
          </form>

          {/* Forgot password */}
          <div className="mt-4 text-center">
            <button onClick={() => { setShowForgot(p => !p); setShowContact(false) }}
              className="text-sm text-navy-600 hover:text-navy-700 font-medium hover:underline">
              Forgot password?
            </button>
          </div>
          {showForgot && <ForgotPanel onClose={() => setShowForgot(false)} />}

          {/* Contact admin */}
          <div className="mt-3 text-center">
            <button onClick={() => { setShowContact(p => !p); setShowForgot(false) }}
              className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700">
              <span>Contact Admin</span>
              {showContact ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
            </button>
          </div>
          {showContact && <ContactPanel onClose={() => setShowContact(false)} />}

          <p className="text-center text-xs text-slate-400 mt-6">
            Don't have credentials? Contact your hostel admin.
          </p>
        </div>
      </div>
    </div>
  )
}
