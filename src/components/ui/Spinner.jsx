export default function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' }[size]
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sz} rounded-full border-2 border-slate-200 border-t-navy-600 animate-spin`} />
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-3 text-sm text-slate-400">Loading…</p>
      </div>
    </div>
  )
}
