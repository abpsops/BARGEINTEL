import { haversineMeters, nearestLocationName, PROXIMITY_METERS, MAX_SPEED_KNOTS, MIN_DURATION_MS } from "./detection.js"
import type { VesselFix, DetectedEncounter } from "./detection.js"

export interface PersistedEncounter {
  bargeMmsi: number
  bargeImo: string
  otherMmsi: number
  otherImo: string | null
  otherName: string | null
  firstSeen: number
  lastSeen: number
  lastLat: number
  lastLon: number
}

// A run happens every ~15 minutes — if a pair hasn't been seen close+slow
// for 3 polling cycles running, treat the encounter as over rather than
// waiting indefinitely for a fix that may never come (AIS gaps happen).
export const POLL_STALE_MS = 45 * 60 * 1000

export interface ReconcileResult {
  stillOpen: PersistedEncounter[]
  newlyClosed: DetectedEncounter[]
}

/**
 * Given one snapshot's worth of fixes (barges + everything else nearby)
 * and the encounters still open from the previous run, produces the
 * updated open-encounter list and any encounters that just qualified as
 * completed STS candidates. Pure and stateless — all state is passed in
 * and returned, nothing is held between calls, since each poll is a fresh
 * process.
 */
export function reconcile(
  bargeFixes: VesselFix[],
  otherFixes: VesselFix[],
  openEncounters: PersistedEncounter[],
  now: number
): ReconcileResult {
  const openByKey = new Map(openEncounters.map((e) => [`${e.bargeMmsi}:${e.otherMmsi}`, e]))
  const seenThisRun = new Set<string>()
  const newlyClosed: DetectedEncounter[] = []

  for (const barge of bargeFixes) {
    for (const other of otherFixes) {
      if (barge.mmsi === other.mmsi) continue
      const key = `${barge.mmsi}:${other.mmsi}`
      const distance = haversineMeters(barge.latitude, barge.longitude, other.latitude, other.longitude)
      const bothSlow =
        (barge.speedKnots ?? 99) <= MAX_SPEED_KNOTS && (other.speedKnots ?? 99) <= MAX_SPEED_KNOTS
      if (distance > PROXIMITY_METERS || !bothSlow) continue

      seenThisRun.add(key)
      const existing = openByKey.get(key)
      const ts = Math.max(barge.timestamp, other.timestamp)
      if (existing) {
        existing.lastSeen = ts
        existing.lastLat = barge.latitude
        existing.lastLon = barge.longitude
      } else {
        openByKey.set(key, {
          bargeMmsi: barge.mmsi,
          bargeImo: barge.imo!,
          otherMmsi: other.mmsi,
          otherImo: other.imo,
          otherName: other.name,
          firstSeen: ts,
          lastSeen: ts,
          lastLat: barge.latitude,
          lastLon: barge.longitude,
        })
      }
    }
  }

  const stillOpen: PersistedEncounter[] = []
  for (const [key, enc] of openByKey) {
    const stale = now - enc.lastSeen > POLL_STALE_MS
    if (stale) {
      if (enc.lastSeen - enc.firstSeen >= MIN_DURATION_MS) {
        newlyClosed.push({
          bargeMmsi: enc.bargeMmsi,
          bargeImo: enc.bargeImo,
          otherMmsi: enc.otherMmsi,
          otherImo: enc.otherImo,
          otherName: enc.otherName,
          startTime: enc.firstSeen,
          endTime: enc.lastSeen,
          location: nearestLocationName(enc.lastLat, enc.lastLon),
          latitude: enc.lastLat,
          longitude: enc.lastLon,
        })
      }
      // stale — drop it, whether or not it qualified
      continue
    }
    stillOpen.push(enc)
  }

  return { stillOpen, newlyClosed }
}
