import type { LucideIcon } from "lucide-react"

export type KpiTone = "blue" | "cyan" | "teal" | "green" | "amber" | "orange" | "pink" | "purple" | "red"

const TONE_ICON_BG: Record<KpiTone, string> = {
  blue: "bg-vivid-blue",
  cyan: "bg-vivid-cyan",
  teal: "bg-vivid-teal",
  green: "bg-vivid-green",
  amber: "bg-vivid-amber",
  orange: "bg-vivid-orange",
  pink: "bg-vivid-pink",
  purple: "bg-vivid-purple",
  red: "bg-vivid-red",
}

const TONE_CARD_TINT: Record<KpiTone, string> = {
  blue: "bg-vivid-blue-tint",
  cyan: "bg-vivid-cyan-tint",
  teal: "bg-vivid-teal-tint",
  green: "bg-vivid-green-tint",
  amber: "bg-vivid-amber-tint",
  orange: "bg-vivid-orange-tint",
  pink: "bg-vivid-pink-tint",
  purple: "bg-vivid-purple-tint",
  red: "bg-vivid-red-tint",
}

const TONE_TEXT: Record<KpiTone, string> = {
  blue: "text-vivid-blue",
  cyan: "text-vivid-cyan",
  teal: "text-vivid-teal",
  green: "text-vivid-green",
  amber: "text-vivid-amber",
  orange: "text-vivid-orange",
  pink: "text-vivid-pink",
  purple: "text-vivid-purple",
  red: "text-vivid-red",
}

export default function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  tone = "blue",
}: {
  label: string
  value: string | number
  sublabel?: string
  icon?: LucideIcon
  tone?: KpiTone
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl border border-ink-700 ${TONE_CARD_TINT[tone]} px-4 py-3.5 shadow-sm`}>
      <div className={`absolute inset-x-0 top-0 h-1 ${TONE_ICON_BG[tone]}`} />
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium text-paper-300">{label}</div>
        {Icon && (
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${TONE_ICON_BG[tone]} shadow-sm`}>
            <Icon size={13} className="text-white" strokeWidth={2.25} />
          </div>
        )}
      </div>
      <div className={`mt-1.5 font-display text-2xl font-bold ${TONE_TEXT[tone]}`}>{value}</div>
      {sublabel && <div className="mt-0.5 text-xs text-paper-500">{sublabel}</div>}
    </div>
  )
}
