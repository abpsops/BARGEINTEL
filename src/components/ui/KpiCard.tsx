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
    <div className="rounded-lg border border-ink-700 bg-ink-900 px-4 py-3.5">
      <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono">{label}</div>
      <div className="mt-1.5 font-display text-2xl text-paper-100">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-paper-500">{sublabel}</div>}
    </div>
  )
}
