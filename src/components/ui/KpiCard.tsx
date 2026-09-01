import type { LucideIcon } from "lucide-react"

export type KpiTone = "brand" | "bunker" | "supply" | "ok" | "warn"

const TONE_BG: Record<KpiTone, string> = {
  brand: "bg-brand-600",
  bunker: "bg-signal-bunker",
  supply: "bg-signal-supply",
  ok: "bg-signal-ok",
  warn: "bg-signal-warn",
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
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_BG[tone]}`}>
            <Icon size={13} className="text-white" strokeWidth={2.25} />
          </div>
        )}
      </div>
      <div className="mt-1.5 font-display text-2xl font-semibold text-paper-100">{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-paper-500">{sublabel}</div>}
    </div>
  )
}
