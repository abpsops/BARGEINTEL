import { resolvePreset, type DatePreset } from "@/lib/dates"

const PRESETS: { key: DatePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7", label: "Last 7 Days" },
  { key: "last30", label: "Last 30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "prevMonth", label: "Previous Month" },
]

export default function DateRangeFilter({
  from,
  to,
  onChange,
}: {
  from: string
  to: string
  onChange: (from: string, to: string) => void
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-xs text-paper-100 focus-ring"
      />
      <span className="text-paper-500 text-xs">to</span>
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-xs text-paper-100 focus-ring"
      />
      <div className="flex items-center gap-1 ml-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              const r = resolvePreset(p.key)
              onChange(r.from, r.to)
            }}
            className="rounded px-2 py-1 text-[11px] text-paper-500 hover:bg-ink-700 hover:text-paper-200 transition-colors focus-ring"
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
