import { describe, it, expect } from "vitest"
import { reconcile, POLL_STALE_MS, type PersistedEncounter } from "../periodicReconcile.js"
import { MIN_DURATION_MS } from "../detection.js"
import type { VesselFix } from "../detection.js"

const BARGE_IMO = "9074729"

function bargeFix(overrides: Partial<VesselFix> = {}): VesselFix {
  return {
    mmsi: 1,
    imo: BARGE_IMO,
    name: "Test Barge",
    latitude: 25.12,
    longitude: 56.38,
    speedKnots: 0.2,
    timestamp: Date.now(),
    ...overrides,
  }
}

function otherFix(overrides: Partial<VesselFix> = {}): VesselFix {
  return {
    mmsi: 2,
    imo: null,
    name: "MV Test",
    latitude: 25.12,
    longitude: 56.38,
    speedKnots: 0.1,
    timestamp: Date.now(),
    ...overrides,
  }
}

describe("reconcile", () => {
  it("opens a new encounter on first sighting, with nothing closed yet", () => {
    const now = Date.now()
    const result = reconcile([bargeFix({ timestamp: now })], [otherFix({ timestamp: now })], [], now)
    expect(result.stillOpen.length).toBe(1)
    expect(result.newlyClosed.length).toBe(0)
    expect(result.stillOpen[0].bargeImo).toBe(BARGE_IMO)
  })

  it("extends an existing open encounter's lastSeen when still close", () => {
    const t0 = Date.now()
    const existing: PersistedEncounter[] = [
      {
        bargeMmsi: 1,
        bargeImo: BARGE_IMO,
        otherMmsi: 2,
        otherImo: null,
        otherName: "MV Test",
        firstSeen: t0,
        lastSeen: t0,
        lastLat: 25.12,
        lastLon: 56.38,
      },
    ]
    const t1 = t0 + 15 * 60 * 1000
    const result = reconcile([bargeFix({ timestamp: t1 })], [otherFix({ timestamp: t1 })], existing, t1)
    expect(result.stillOpen.length).toBe(1)
    expect(result.stillOpen[0].lastSeen).toBe(t1)
    expect(result.newlyClosed.length).toBe(0)
  })

  it("closes and emits an encounter once it exceeds the minimum duration and goes stale", () => {
    const t0 = Date.now()
    const existing: PersistedEncounter[] = [
      {
        bargeMmsi: 1,
        bargeImo: BARGE_IMO,
        otherMmsi: 2,
        otherImo: null,
        otherName: "MV Test",
        firstSeen: t0,
        lastSeen: t0 + MIN_DURATION_MS + 60_000,
        lastLat: 25.12,
        lastLon: 56.38,
      },
    ]
    // No fixes this run (pair no longer appears close) — clearly past stale timeout
    const now = t0 + MIN_DURATION_MS + POLL_STALE_MS + 10 * 60 * 1000
    const result = reconcile([], [], existing, now)
    expect(result.stillOpen.length).toBe(0)
    expect(result.newlyClosed.length).toBe(1)
    expect(result.newlyClosed[0].otherName).toBe("MV Test")
  })

  it("drops a stale encounter without emitting it if it never reached the minimum duration", () => {
    const t0 = Date.now()
    const existing: PersistedEncounter[] = [
      {
        bargeMmsi: 1,
        bargeImo: BARGE_IMO,
        otherMmsi: 2,
        otherImo: null,
        otherName: "MV Brief",
        firstSeen: t0,
        lastSeen: t0 + 5 * 60 * 1000, // only 5 minutes — under the 45-minute minimum
        lastLat: 25.12,
        lastLon: 56.38,
      },
    ]
    const now = t0 + 5 * 60 * 1000 + POLL_STALE_MS + 10 * 60 * 1000
    const result = reconcile([], [], existing, now)
    expect(result.stillOpen.length).toBe(0)
    expect(result.newlyClosed.length).toBe(0)
  })

  it("does not pair vessels that are far apart or moving", () => {
    const now = Date.now()
    const farOther = otherFix({ longitude: 57.0, timestamp: now })
    const movingOther = otherFix({ speedKnots: 8, timestamp: now })
    const result1 = reconcile([bargeFix({ timestamp: now })], [farOther], [], now)
    const result2 = reconcile([bargeFix({ timestamp: now })], [movingOther], [], now)
    expect(result1.stillOpen.length).toBe(0)
    expect(result2.stillOpen.length).toBe(0)
  })
})
