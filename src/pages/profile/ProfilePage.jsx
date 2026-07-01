import { useState, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { profileApi } from '../../api/services'
import { useApi } from '../../hooks/useApi'
import { PageLoader } from '../../components/ui/Spinner'
import { User, Mail, Phone, Shield, BookOpen, Home, Camera, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const ROLE_LABELS = { ROLE_STUDENT:'Student', ROLE_WARDEN:'Warden', ROLE_DEAN:'Dean', ROLE_SECURITY:'Security Guard', ROLE_ADMIN:'Administrator' }
const ROLE_COLORS = { ROLE_STUDENT:'bg-indigo-100 text-indigo-700', ROLE_WARDEN:'bg-amber-100 text-amber-700', ROLE_DEAN:'bg-purple-100 text-purple-700', ROLE_SECURITY:'bg-emerald-100 text-emerald-700', ROLE_ADMIN:'bg-red-100 text-red-700' }
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

// ── Read-only field ───────────────────────────────────────────────────────────
function ReadField({ icon: Icon, label, value, note }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mb-1.5">
        <Icon size={12} />{label}
      </label>
      <p className="text-sm font-medium text-slate-800 bg-slate-50 rounded-xl px-3.5 py-2.5 border border-slate-100">
        {value || '—'}
      </p>
      {note && <p className="text-xs text-slate-400 mt-1 ml-1">{note}</p>}
    </div>
  )
}

// ── Photo Upload ──────────────────────────────────────────────────────────────

function PhotoUpload({ currentPhoto, name, onUploaded }) {
  
  const { updateUserPhoto } = useAuth()

  const fileRef             = useRef(null)
  const [preview, setPreview] = useState(
      currentPhoto
        ? (currentPhoto.startsWith('http') ? currentPhoto : `${BASE}${currentPhoto}`)
        : null
    )
  const [uploading, setUploading]   = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) return toast.error('Only JPG, PNG or WebP')
    if (file.size > 3 * 1024 * 1024) return toast.error('Max 3MB')
    setPreview(URL.createObjectURL(file))
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('photo', file)
      const res = await profileApi.uploadPhoto(fd)
      const newPhotoUrl = res.data.data?.photoUrl
      onUploaded(res.data.data?.photoUrl)
      updateUserPhoto(newPhotoUrl)
      toast.success('Profile photo updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-200 bg-navy-900 flex items-center justify-center">
          {preview
            ? <img src={preview} alt="Profile" className="w-full h-full object-cover" />
            : <span className="text-white text-3xl font-bold font-display">{name?.charAt(0)?.toUpperCase()}</span>}
        </div>
        <button onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="absolute -bottom-2 -right-2 w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center
                     text-white hover:bg-navy-700 transition-colors shadow-lg border-2 border-white">
          {uploading
            ? <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            : <Camera size={13} />}
        </button>
      </div>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFile} />
      <p className="text-xs text-slate-400">Click camera icon to update photo</p>
    </div>
  )
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm({ profile, isStudent }) {
  const [mobile,      setMobile]      = useState(profile?.student?.mobileNumber || '')
  const [parentPhone, setParentPhone] = useState(profile?.student?.parentPhone   || '')
  const [saving,      setSaving]      = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await profileApi.updateContact({ mobileNumber: mobile, ...(isStudent && { parentPhone }) })
      toast.success('Contact details updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally { setSaving(false) }
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-800 font-display mb-4 flex items-center gap-2">
        <Phone size={16} className="text-navy-600" /> Contact Details
      </h3>
      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="label">My Mobile Number</label>
          <input type="tel" className="input" placeholder="10-digit mobile"
            value={mobile} onChange={e => setMobile(e.target.value)} />
        </div>
        {isStudent && (
          <div>
            <label className="label">Parent's Mobile Number</label>
            <input type="tel" className="input" placeholder="Parent's mobile"
              value={parentPhone} onChange={e => setParentPhone(e.target.value)} />
          </div>
        )}
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}

// ── Main ProfilePage ──────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { user, updateUserPhoto  }  = useAuth()
  const { data: profile, loading, refetch } = useApi(profileApi.getMyProfile)
  const [photoUrl, setPhotoUrl] = useState(null)
  const isStudent = user?.role === 'ROLE_STUDENT'

  if (loading) return <PageLoader />

  const currentPhoto = photoUrl || user?.profilePhoto || profile?.student?.user?.profilePhoto || null

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 font-display">My Profile</h1>

      {/* Avatar + info card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <PhotoUpload
            currentPhoto={currentPhoto}
            name={user?.name}
            onUploaded={(url) => {
              setPhotoUrl(url);          // local preview
              updateUserPhoto(url);      // permanent save
            }}
          />

          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900 font-display">{profile?.name || user?.name}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{profile?.email || user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
              <span className={`badge ${ROLE_COLORS[user?.role]}`}>{ROLE_LABELS[user?.role]}</span>
              {isStudent && profile?.student && (
                <>
                  <span className="badge bg-slate-100 text-slate-600">{profile.student.rollNumber}</span>
                  <span className="badge bg-slate-100 text-slate-600">{profile.student.hostelName} · {profile.student.roomNumber}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Student read-only academic details */}
      {isStudent && profile?.student && (
        <div className="card">
          <h3 className="font-semibold text-slate-800 font-display mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-navy-600" /> Academic &amp; Hostel Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ReadField icon={User}     label="Full Name"       value={profile.name} />
            <ReadField icon={Mail}     label="Email"           value={profile.email} />
            <ReadField icon={BookOpen} label="Roll Number"     value={profile.student.rollNumber} />
            <ReadField icon={BookOpen} label="Student No."     value={profile.student.studentNo} />
            <ReadField icon={BookOpen} label="Course / Branch" value={profile.student.courseBranch} />
            <ReadField icon={BookOpen} label="Year"            value={profile.student.year ? `Year ${profile.student.year}` : '—'} />
            <ReadField icon={Home}     label="Hostel Name"     value={profile.student.hostelName} />
            <ReadField icon={Home}     label="Room Number"     value={profile.student.roomNumber} />
            <div className="sm:col-span-2">
              <ReadField icon={Shield} label="Parent Email (read-only)"
                value={profile.student.parentEmail}
                note="Parent email cannot be changed here. Contact admin." />
            </div>
          </div>
        </div>
      )}

      {/* Editable contact */}
      <ContactForm profile={profile} isStudent={isStudent} />
    </div>
  )
}
