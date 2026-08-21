import type { OperationType } from "@/types"

const BUNKERING_PATTERNS = [
  /^sts\s*bunkering\s*operation$/i,
  /^sts\s*bunkering$/i,
  /^sts\s*bunker$/i,
  /^bunkering$/i,
  /^bunker(ing)?\s*operation$/i,
]

const SUPPLY_PATTERNS = [
  /^sts\s*supply$/i,
  /^sts\s*fuel\s*supply$/i,
  /^supply$/i,
  /^fuel\s*supply$/i,
]

/**
 * Maps a free-text source label to one of the three internal operation
 * classifications. Unknown labels must map to OTHER_STS rather than being
 * guessed at — see spec section 14 ("Do not incorrectly classify unknown
 * events").
 */
export function normalizeOperationType(rawLabel: string): OperationType {
  const trimmed = (rawLabel || "").trim()
  if (BUNKERING_PATTERNS.some((p) => p.test(trimmed))) return "STS_BUNKERING"
  if (SUPPLY_PATTERNS.some((p) => p.test(trimmed))) return "STS_SUPPLY"
  return "OTHER_STS"
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  STS_BUNKERING: "STS Bunkering",
  STS_SUPPLY: "STS Supply",
  OTHER_STS: "Other STS",
}
