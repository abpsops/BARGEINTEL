import { describe, it, expect } from "vitest"
import { EncounterTracker, haversineMeters, MIN_DURATION_MS } from "../detection.js"
import type { VesselFix } from "../detection.js"

const BARGE_IMO = "9074729"

function fix(overrides: Partial<VesselFix>): VesselFix {
  return {
    mmsi: 470000001,
    imo: BARGE_IMO,
    name: "Test Barge",
    latitude: 25.12,
    longitude: 56.38,
    speedKnots: 0.2,
    timestamp: Date.now(),
    ...overrides,
  }
}

describe("haversineMeters", () => {
  it("returns 0 for identical points", () => {
    expect(haversineMeters(25.1, 56.3, 25.1, 56.3)).toBeCloseTo(0, 3)
  })

  it("returns a sensible distance for a known offset", () => {
    // ~0.01 degrees latitude is roughly 1111 meters
    const d = haversineMeters(25.0, 56.0, 25.01, 56.0)
    expect(d).toBeGreaterThan(1000)
    expect(d).toBeLessThan(1200)
  })
})

describe("EncounterTracker", () => {
  it("does not emit an encounter shorter than the minimum duration", () => {
    const tracker = new EncounterTracker()
    const t0 = Date.now()
    const barge = fix({ mmsi: 1, timestamp: t0 })
    const other = fix({ mmsi: 2, imo: null, name: "MV Test", timestamp: t0 })

    tracker.update(barge, other)
    // Only 5 minutes later — well under the 45-minute minimum
    const later = fix({ mmsi: 1, timestamp: t0 + 5 * 60 * 1000 })
    const otherLater = fix({ mmsi: 2, imo: null, timestamp: t0 + 5 * 60 * 1000 })
    // Separate them (speed picks up) to force a close-out
    otherLater.speedKnots = 8
    const result = tracker.update(later, otherLater)

    expect(result).toBeNull()
  })

  it("emits an encounter once the minimum duration is exceeded and they separate", () => {
    const tracker = new EncounterTracker()
    const t0 = Date.now()
    const barge = fix({ mmsi: 1, timestamp: t0 })
    const other = fix({ mmsi: 2, imo: null, name: "MV Test", timestamp: t0 })
    tracker.update(barge, other)

    // A confirmation partway through, still close and slow — this is what
    // actually extends the tracked duration.
    const tMid = t0 + MIN_DURATION_MS + 60_000
    const bargeMid = fix({ mmsi: 1, timestamp: tMid })
    const otherMid = fix({ mmsi: 2, imo: null, name: "MV Test", timestamp: tMid })
    tracker.update(bargeMid, otherMid)

    // Now they separate.
    const t1 = tMid + 60_000
    const bargeLater = fix({ mmsi: 1, timestamp: t1 })
    const otherLater = fix({ mmsi: 2, imo: null, name: "MV Test", timestamp: t1, speedKnots: 10 })

    const result = tracker.update(bargeLater, otherLater)
    expect(result).not.toBeNull()
    expect(result?.bargeImo).toBe(BARGE_IMO)
    expect(result?.otherName).toBe("MV Test")
  })

  it("does not open an encounter when vessels are far apart", () => {
    const tracker = new EncounterTracker()
    const t0 = Date.now()
    const barge = fix({ mmsi: 1, timestamp: t0 })
    const farOther = fix({ mmsi: 2, imo: null, longitude: 57.0, timestamp: t0 })
    const result = tracker.update(barge, farOther)
    expect(result).toBeNull()
  })

  it("does not open an encounter when either vessel is moving", () => {
    const tracker = new EncounterTracker()
    const t0 = Date.now()
    const barge = fix({ mmsi: 1, timestamp: t0, speedKnots: 5 })
    const other = fix({ mmsi: 2, imo: null, timestamp: t0 })
    const result = tracker.update(barge, other)
    expect(result).toBeNull()
  })

  it("sweepStale closes a long-running encounter that never explicitly separated", () => {
    const tracker = new EncounterTracker()
    const t0 = Date.now()
    const barge = fix({ mmsi: 1, timestamp: t0 })
    const other = fix({ mmsi: 2, imo: null, name: "MV Stale", timestamp: t0 })
    tracker.update(barge, other)

    // A confirmation after the minimum duration, still close and slow —
    // this is the last real signal before AIS reports simply stop.
    const tMid = t0 + MIN_DURATION_MS + 60_000
    const bargeMid = fix({ mmsi: 1, timestamp: tMid })
    const otherMid = fix({ mmsi: 2, imo: null, name: "MV Stale", timestamp: tMid })
    tracker.update(bargeMid, otherMid)

    const muchLater = tMid + 30 * 60 * 1000
    const results = tracker.sweepStale(muchLater)
    expect(results.length).toBe(1)
    expect(results[0].otherName).toBe("MV Stale")
  })
})
