import type { STSOperation } from "@/types"

/**
 * Generic gap-based anomaly detector: groups `items` by `primaryGroupKeyFn`
 * (e.g. "same barge" or "same vessel"), sorts each group chronologically,
 * and flags any pair of consecutive items in a group that are less than
 * `minGapHours` apart AND differ on `secondaryKeyFn` (e.g. a different
 * vessel, or a different barge).
 *
 * This is the shared primitive behind findOperationAnomalies() below,
 * which calls it twice with the two key functions swapped to catch both
 * "same barge, different vessel, too fast" and "same vessel, different
 * barge, too fast" — the only exemption is the SAME entity on both keys
 * (e.g. same barge AND same vessel), which is normal multi-grade
 * bunkering, not a spoofing signal.
 *
 * `items` does not need to be pre-sorted. Returns the indices (into the
 * original `items` array) of every item that is either the trigger of a
 * short cross-key gap or the item immediately before it, since both ends
 * of a too-close pair are equally suspicious.
 */
export function findShortGapFlags<T>(
  items: T[],
  primaryGroupKeyFn: (item: T) => string,
  timestampFn: (item: T) => number | null,
  secondaryKeyFn: (item: T) => string,
  minGapHours = 5
): Set<number> {
  const flagged = new Set<number>()
  const byGroup = new Map<string, number[]>() // groupKey -> original indices
  items.forEach((item, i) => {
    const key = primaryGroupKeyFn(item)
    if (!byGroup.has(key)) byGroup.set(key, [])
    byGroup.get(key)!.push(i)
  })

  const minGapMs = minGapHours * 60 * 60 * 1000

  byGroup.forEach((indices) => {
    const withTs = indices
      .map((i) => ({ i, ts: timestampFn(items[i]) }))
      .filter((x): x is { i: number; ts: number } => x.ts !== null)
      .sort((a, b) => a.ts - b.ts)

    for (let k = 1; k < withTs.length; k++) {
      const gap = withTs[k].ts - withTs[k - 1].ts
      const sameSecondary = secondaryKeyFn(items[withTs[k - 1].i]) === secondaryKeyFn(items[withTs[k].i])
      if (gap >= 0 && gap < minGapMs && !sameSecondary) {
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

/**
 * The key used everywhere in the app to identify "the same vessel" — IMO
 * when known, name otherwise. Real uploaded/parsed data never actually
 * has a vessel IMO (only the barge's own IMO is known; the receiving
 * vessel's IMO field is always empty from shipTrackParser.ts), so in
 * practice this almost always falls back to the name.
 *
 * Two independently-parsed files can extract the same vessel's name with
 * a trivial formatting difference (different case, doubled internal
 * spaces, a stray non-breaking space) even though a human reading both
 * would call them obviously the same ship — so the name side of the
 * comparison is normalized (trimmed, whitespace-collapsed, uppercased)
 * rather than compared as a raw string. This is purely for matching;
 * displayed vessel names elsewhere in the app are untouched.
 */
export function vesselIdentityKey(op: Pick<STSOperation, "receiving_vessel_imo" | "receiving_vessel_name">): string {
  if (op.receiving_vessel_imo) return op.receiving_vessel_imo.trim()
  return op.receiving_vessel_name
    .replace(/\u00A0/g, " ") // non-breaking space -> regular space
    .trim()
    .replace(/\s+/g, " ")
    .toUpperCase()
}

/**
 * Convenience wrapper around findShortGapFlags for real STSOperation
 * records — flags a short gap in EITHER direction:
 *
 *  - same barge, different vessel, < minGapHours apart (a barge can't
 *    finish one ship and start a completely different one that fast), OR
 *  - same vessel, different barge, < minGapHours apart (a vessel can't be
 *    bunkered by two different physical barges that close together).
 *
 * The only combination that's NOT flagged is the SAME barge servicing the
 * SAME vessel across a short gap — that's normal multi-grade bunkering
 * (e.g. VLSFO then MGO back to back), not a spoofing signal.
 */
export function findOperationAnomalies(
  operations: STSOperation[],
  minGapHours = 5
): Set<number> {
  const bargeThenVessel = findShortGapFlags(
    operations,
    (o) => o.barge_id,
    opTimestamp,
    vesselIdentityKey,
    minGapHours
  )
  const vesselThenBarge = findShortGapFlags(
    operations,
    vesselIdentityKey,
    opTimestamp,
    (o) => o.barge_id,
    minGapHours
  )
  return new Set([...bargeThenVessel, ...vesselThenBarge])
}
