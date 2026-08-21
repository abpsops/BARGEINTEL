export const DEFAULT_TIMEZONE = "Asia/Dubai"

export type DatePreset =
  | "today"
  | "yesterday"
  | "last7"
  | "last30"
  | "thisMonth"
  | "prevMonth"
  | "custom"

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Resolves a preset into an inclusive [dateFrom, dateTo] pair (YYYY-MM-DD). */
export function resolvePreset(preset: DatePreset): { from: string; to: string } {
  const now = new Date()
  const today = toISODate(now)

  switch (preset) {
    case "today":
      return { from: today, to: today }
    case "yesterday": {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      return { from: toISODate(y), to: toISODate(y) }
    }
    case "last7": {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      return { from: toISODate(from), to: today }
    }
    case "last30": {
      const from = new Date(now)
      from.setDate(from.getDate() - 29)
      return { from: toISODate(from), to: today }
    }
    case "thisMonth": {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: toISODate(from), to: today }
    }
    case "prevMonth": {
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const to = new Date(now.getFullYear(), now.getMonth(), 0)
      return { from: toISODate(from), to: toISODate(to) }
    }
    default:
      return { from: today, to: today }
  }
}

/** Inclusive check: is `dateStr` (YYYY-MM-DD) within [from, to]? */
export function isWithinRange(dateStr: string, from: string | null, to: string | null): boolean {
  if (from && dateStr < from) return false
  if (to && dateStr > to) return false
  return true
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}
