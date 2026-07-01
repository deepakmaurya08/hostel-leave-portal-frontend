import { Clock, CheckCircle, XCircle, CheckCheck, Ban } from 'lucide-react'

const STATUS_CONFIG = {
  PENDING_PARENT:  { label: 'Awaiting Parent',  cls: 'badge-pending',   Icon: Clock },
  PENDING_WARDEN:  { label: 'Awaiting Warden',  cls: 'badge-pending',   Icon: Clock },
  PENDING_DEAN:    { label: 'Awaiting Dean',     cls: 'badge-pending',   Icon: Clock },
  PARENT_REJECTED: { label: 'Parent Rejected',   cls: 'badge-rejected',  Icon: XCircle },
  WARDEN_REJECTED: { label: 'Warden Rejected',   cls: 'badge-rejected',  Icon: XCircle },
  DEAN_REJECTED:   { label: 'Dean Rejected',     cls: 'badge-rejected',  Icon: XCircle },
  APPROVED:        { label: 'Approved',           cls: 'badge-approved',  Icon: CheckCircle },
  COMPLETED:       { label: 'Completed',          cls: 'badge-completed', Icon: CheckCheck },
  CANCELLED:       { label: 'Cancelled',          cls: 'badge bg-slate-100 text-slate-500', Icon: Ban },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge bg-slate-100 text-slate-500', Icon: Clock }
  const { Icon } = cfg
  return (
    <span className={cfg.cls}>
      <Icon size={11} />
      {cfg.label}
    </span>
  )
}
