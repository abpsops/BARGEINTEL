import type { OperationType } from "@/types"
import { OPERATION_LABELS } from "@/lib/normalizeOperation"

const STYLES: Record<OperationType, string> = {
  STS_BUNKERING: "bg-signal-bunker/15 text-signal-bunker border-signal-bunker/40",
  STS_SUPPLY: "bg-signal-supply/15 text-signal-supply border-signal-supply/40",
  OTHER_STS: "bg-ink-600/40 text-paper-500 border-ink-500",
}

export default function OperationBadge({ type }: { type: OperationType }) {
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-mono whitespace-nowrap ${STYLES[type]}`}
    >
      {OPERATION_LABELS[type]}
    </span>
  )
}
