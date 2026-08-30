export default function KpiCard({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string | number
  sublabel?: string
}) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-900 shadow-sm px-4 py-3.5">
      <div className="text-xs font-medium text-paper-500">{label}</div>
      <div className="mt-1.5 font-display text-2xl text-paper-100">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-paper-500">{sublabel}</div>}
    </div>
  )
}
