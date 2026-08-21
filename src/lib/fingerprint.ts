/**
 * Deterministic fingerprint used to detect duplicate STS operations when a
 * source_provider/source_record_id pair is not available. Deliberately
 * excludes vessel *name* alone as a key input (spec section 38) — uses IMO,
 * date, operation, receiving vessel and start time instead.
 */
export function fingerprintOperation(input: {
  bargeImo: string
  operationDate: string
  operationType: string
  receivingVesselImo: string | null
  location: string | null
  startTime: string | null
}): string {
  const parts = [
    input.bargeImo.trim(),
    input.operationDate.trim(),
    input.operationType.trim(),
    (input.receivingVesselImo || "").trim(),
    (input.location || "").trim().toLowerCase(),
    (input.startTime || "").trim(),
  ]
  // Small non-cryptographic hash — sufficient for de-dup keys, not security.
  let hash = 0
  const str = parts.join("|")
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0
  }
  return `fp_${Math.abs(hash)}_${str.length}`
}
