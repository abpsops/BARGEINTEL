import type { STSOperation } from "@/types"

/**
 * Flags operations that started less than `minGapHours` (default 5) after
 * the SAME barge's previous operation *with a different vessel*. A single
 * barge physically cannot finish supplying one ship, transit and start
 * supplying a different one within a couple of hours, so that pattern is
 * flagged as a likely AIS/data anomaly.
 *
 * A short gap between two operations for the SAME vessel is NOT flagged —
 * that's normal for a bunkering split into more than one session (e.g. a
 * pause and resume, or a top-up shortly after), not a spoofing signal.
 *
 * `items` does not need to be pre-sorted; this groups by barge internally
 * and walks each barge's own operations in chronological order. Returns
 * the indices (into the original `items` array) of every operation that
 * is either the trigger of a short cross-vessel gap or the operation
 * immediately before it, since both ends of a too-close pair are equally
 * suspicious.
 */
export function findShortGapFlags<T>(
  items: T[],
  bargeKeyFn: (item: T) => string,
  timestampFn: (item: T) => number | null,
  vesselKeyFn: (item: T) => string,
  minGapHours = 5
): Set<number> {
  const flagged = new Set<number>()
  const byBarge = new Map<string, number[]>() // bargeKey -> original indices
  items.forEach((item, i) => {
    const key = bargeKeyFn(item)
    if (!byBarge.has(key)) byBarge.set(key, [])
    byBarge.get(key)!.push(i)
  })

  const minGapMs = minGapHours * 60 * 60 * 1000

  byBarge.forEach((indices) => {
    const withTs = indices
      .map((i) => ({ i, ts: timestampFn(items[i]) }))
      .filter((x): x is { i: number; ts: number } => x.ts !== null)
      .sort((a, b) => a.ts - b.ts)

    for (let k = 1; k < withTs.length; k++) {
      const gap = withTs[k].ts - withTs[k - 1].ts
      const sameVessel = vesselKeyFn(items[withTs[k - 1].i]) === vesselKeyFn(items[withTs[k].i])
      if (gap >= 0 && gap < minGapMs && !sameVessel) {
        flagged.add(withTs[k - 1].i)
        flagged.add(withTs[k].i)
      }
    }
  })

  return flagged
}

/** Millisecond timestamp for an STSOperation's start, or null if unparseable. */
function opTimestamp(op: Pick<STSOperation, "operation_date" | "start_time">): number | null {
  if (!op.start_time) return null
  const t = new Date(`${op.operation_date}T${op.start_time}:00`).getTime()
  return isNaN(t) ? null : t
}

/** The key used everywhere in the app to identify "the same vessel" — IMO when known, name otherwise. */
export function vesselIdentityKey(op: Pick<STSOperation, "receiving_vessel_imo" | "receiving_vessel_name">): string {
  return op.receiving_vessel_imo || op.receiving_vessel_name
}

/**
 * Convenience wrapper around findShortGapFlags for real STSOperation
 * records — the same 5-hour, different-vessel rule used by the PDF
 * export, but callable directly from any page (Barges table, Dashboard
 * KPI) without re-deriving the barge/timestamp/vessel key functions each
 * time.
 */
export function findOperationAnomalies(
  operations: STSOperation[],
  minGapHours = 5
): Set<number> {
  return findShortGapFlags(
    operations,
    (o) => o.barge_id,
    opTimestamp,
    vesselIdentityKey,
    minGapHours
  )
}
