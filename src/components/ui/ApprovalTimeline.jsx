import { Check, X, Clock, User, Shield, GraduationCap, Lock } from 'lucide-react'
import { format } from 'date-fns'

const STAGES = [
  { key: 'student',  label: 'Student Applied',   Icon: User },
  { key: 'parent',   label: 'Parent Approval',   Icon: Shield },
  { key: 'warden',   label: 'Warden Approval',   Icon: Lock },
  { key: 'dean',     label: 'Dean Approval',      Icon: GraduationCap },
]

function stageState(leave, stageKey) {
  const s = leave.status
  const rejected = s === 'PARENT_REJECTED' || s === 'WARDEN_REJECTED' || s === 'DEAN_REJECTED' || s === 'CANCELLED'

  if (stageKey === 'student') return { state: 'done', time: leave.createdAt }

  if (stageKey === 'parent') {
    if (s === 'PARENT_REJECTED') return { state: 'rejected', time: null }
    if (['PENDING_WARDEN','WARDEN_REJECTED','PENDING_DEAN','DEAN_REJECTED','APPROVED','COMPLETED'].includes(s))
      return { state: 'done', time: leave.parentApprovedAt }
    return { state: s === 'PENDING_PARENT' ? 'active' : 'pending' }
  }

  if (stageKey === 'warden') {
    if (s === 'WARDEN_REJECTED') return { state: 'rejected', time: null }
    if (['PENDING_DEAN','DEAN_REJECTED','APPROVED','COMPLETED'].includes(s))
      return { state: 'done', time: leave.wardenApprovedAt }
    if (s === 'PENDING_WARDEN') return { state: 'active' }
    return { state: 'pending' }
  }

  if (stageKey === 'dean') {
    if (s === 'DEAN_REJECTED') return { state: 'rejected', time: null }
    if (['APPROVED','COMPLETED'].includes(s)) return { state: 'done', time: leave.deanApprovedAt }
    if (s === 'PENDING_DEAN') return { state: 'active' }
    return { state: 'pending' }
  }
}

export default function ApprovalTimeline({ leave }) {
  return (
    <div className="relative">
      {/* Connector line */}
      <div className="absolute left-5 top-10 bottom-10 w-0.5 bg-slate-100" />

      <div className="space-y-1">
        {STAGES.map(({ key, label, Icon }, i) => {
          const { state, time } = stageState(leave, key)

          const dotCls = {
            done:    'bg-emerald-500 border-emerald-500 text-white shadow-md',
            active:  'bg-navy-600 border-navy-600 text-white shadow-glow animate-pulse-slow',
            rejected:'bg-red-500 border-red-500 text-white shadow-md',
            pending: 'bg-white border-slate-200 text-slate-300',
          }[state]

          const labelCls = {
            done:    'text-slate-800',
            active:  'text-navy-700 font-semibold',
            rejected:'text-red-600',
            pending: 'text-slate-400',
          }[state]

          return (
            <div key={key} className="flex items-start gap-4 py-3 relative z-10">
              {/* Dot */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center ${dotCls}`}>
                {state === 'done'     && <Check size={14} strokeWidth={3} />}
                {state === 'rejected' && <X size={14} strokeWidth={3} />}
                {state === 'active'   && <Icon size={14} />}
                {state === 'pending'  && <Icon size={14} />}
              </div>

              {/* Content */}
              <div className="pt-1.5">
                <p className={`text-sm font-medium ${labelCls}`}>{label}</p>
                {time && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {format(new Date(time), 'dd MMM yyyy, h:mm a')}
                  </p>
                )}
                {state === 'active' && (
                  <span className="inline-block mt-1 text-xs bg-navy-50 text-navy-600 px-2 py-0.5 rounded-full font-medium">
                    Waiting for action
                  </span>
                )}
                {state === 'rejected' && (
                  <span className="inline-block mt-1 text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    Rejected
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
