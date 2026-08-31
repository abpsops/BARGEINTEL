import type { LucideIcon } from "lucide-react"

export type KpiTone = "brand" | "bunker" | "supply" | "ok" | "warn"

const TONE_GRADIENTS: Record<KpiTone, string> = {
  brand: "from-brand-500 to-indigo-400",
  bunker: "from-signal-bunker to-teal-400",
  supply: "from-signal-supply to-amber-400",
  ok: "from-signal-ok to-emerald-400",
  warn: "from-signal-warn to-orange-400",
}

export default function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "brand",
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  tone?: KpiTone
}) {
  return (
    <div className="rounded-xl glass px-4 py-3.5">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-paper-500">{label}</div>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${TONE_GRADIENTS[tone]} shadow-sm`}>
            <Icon size={13} className="text-white" strokeWidth={2.25} />
          </div>
        )}
      </div>
      <div className="mt-1.5 font-display text-2xl font-semibold text-paper-100">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-paper-500">{sublabel}</div>}
    </div>
  )
}
