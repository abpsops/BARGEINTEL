import { describe, it, expect } from "vitest"
import { findShortGapFlags, findOperationAnomalies } from "@/lib/anomalies"
import type { STSOperation } from "@/types"

interface Op {
  barge: string
  vessel: string
  ts: number | null
}

const hr = 60 * 60 * 1000

describe("findShortGapFlags", () => {
  it("flags a pair of DIFFERENT-vessel operations on the same barge less than 5 hours apart", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amal", vessel: "ZUMA", ts: 2 * hr }, // different vessel, only 2h later — flagged
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.has(0)).toBe(true)
    expect(flagged.has(1)).toBe(true)
  })

  it("does NOT flag a short gap between two operations for the SAME vessel", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amal", vessel: "SAL", ts: 2 * hr }, // same vessel — a normal split/multi-session bunkering
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.size).toBe(0)
  })

  it("does not flag operations 5 or more hours apart, even for different vessels", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amal", vessel: "ZUMA", ts: 5 * hr },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.size).toBe(0)
  })

  it("does not compare across different barges", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amber", vessel: "ZUMA", ts: 1 * hr }, // close in time, but a different barge
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.size).toBe(0)
  })

  it("is unaffected by input order — sorts chronologically per barge internally", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "V3", ts: 3 * hr },
      { barge: "Amal", vessel: "V1", ts: 0 },
      { barge: "Amal", vessel: "V4", ts: 4 * hr },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    // V1 -> V3 (3h, different vessels, flag both), V3 -> V4 (1h, different vessels, flag both)
    expect(flagged.size).toBe(3)
  })

  it("ignores operations with no parseable timestamp", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: null },
      { barge: "Amal", vessel: "ZUMA", ts: 0 },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.size).toBe(0)
  })

  it("respects a custom minGapHours threshold", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amal", vessel: "ZUMA", ts: 3 * hr },
    ]
    expect(findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel, 2).size).toBe(0)
    expect(findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel, 4).size).toBe(2)
  })

  it("a same-vessel short gap does not suppress flagging a later different-vessel short gap", () => {
    const items: Op[] = [
      { barge: "Amal", vessel: "SAL", ts: 0 },
      { barge: "Amal", vessel: "SAL", ts: 1 * hr },   // same vessel — fine, not flagged
      { barge: "Amal", vessel: "ZUMA", ts: 2 * hr },  // different vessel, only 1h later — flagged
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts, (o) => o.vessel)
    expect(flagged.has(0)).toBe(false)
    expect(flagged.has(1)).toBe(true)
    expect(flagged.has(2)).toBe(true)
  })
})

describe("findOperationAnomalies (real STSOperation records)", () => {
  const baseOp = {
    id: "",
    organization_id: "org1",
    barge_id: "barge1",
    barge_imo: "9239953",
    barge_name: "Amal",
    competitor_id: "c1",
    competitor_name: "OMTI",
    receiving_vessel_id: null,
    end_time: null,
    duration_minutes: null,
    location: "Fujairah",
    latitude: null,
    longitude: null,
    operation_type: "STS_BUNKERING" as const,
    raw_operation_label: "",
    source_provider: "test",
    source_record_id: null,
    confidence: "high" as const,
    created_at: "",
    updated_at: "",
  }

  it("flags a real STSOperation pair matching the different-vessel, <5h rule", () => {
    const ops: STSOperation[] = [
      { ...baseOp, receiving_vessel_imo: "1111111", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "00:15" },
      { ...baseOp, receiving_vessel_imo: "2222222", receiving_vessel_name: "ZUMA", operation_date: "2026-08-30", start_time: "02:00" },
    ]
    const flagged = findOperationAnomalies(ops)
    expect(flagged.has(0)).toBe(true)
    expect(flagged.has(1)).toBe(true)
  })

  it("flags the SAME vessel bunkered by two DIFFERENT barges less than 5 hours apart (screenshot case: Amber then Coya both bunker OCTA DIVINE an hour apart)", () => {
    const ops: STSOperation[] = [
      { ...baseOp, barge_id: "barge_amber", barge_name: "Amber", barge_imo: "9604031", receiving_vessel_imo: "9999999", receiving_vessel_name: "OCTA DIVINE", operation_date: "2026-08-30", start_time: "12:19" },
      { ...baseOp, barge_id: "barge_coya", barge_name: "Coya", barge_imo: "9524786", receiving_vessel_imo: "9999999", receiving_vessel_name: "OCTA DIVINE", operation_date: "2026-08-30", start_time: "13:24" },
    ]
    const flagged = findOperationAnomalies(ops)
    expect(flagged.has(0)).toBe(true)
    expect(flagged.has(1)).toBe(true)
  })

  it("does NOT flag the same vessel bunkered by two different barges 5+ hours apart", () => {
    const ops: STSOperation[] = [
      { ...baseOp, barge_id: "barge_amber", barge_name: "Amber", receiving_vessel_imo: "9999999", receiving_vessel_name: "OCTA DIVINE", operation_date: "2026-08-30", start_time: "06:00" },
      { ...baseOp, barge_id: "barge_coya", barge_name: "Coya", receiving_vessel_imo: "9999999", receiving_vessel_name: "OCTA DIVINE", operation_date: "2026-08-30", start_time: "13:24" },
    ]
    expect(findOperationAnomalies(ops).size).toBe(0)
  })

  it("does not flag two unrelated operations (different barge AND different vessel) close together", () => {
    const ops: STSOperation[] = [
      { ...baseOp, barge_id: "barge_amber", barge_name: "Amber", receiving_vessel_imo: "1111111", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "00:15" },
      { ...baseOp, barge_id: "barge_coya", barge_name: "Coya", receiving_vessel_imo: "2222222", receiving_vessel_name: "ZUMA", operation_date: "2026-08-30", start_time: "01:00" },
    ]
    expect(findOperationAnomalies(ops).size).toBe(0)
  })

  it("does not flag the same vessel appearing twice close together", () => {
    const ops: STSOperation[] = [
      { ...baseOp, receiving_vessel_imo: "1111111", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "00:15" },
      { ...baseOp, receiving_vessel_imo: "1111111", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "02:00" },
    ]
    expect(findOperationAnomalies(ops).size).toBe(0)
  })

  it("falls back to vessel name when IMO is missing, for the same-vessel check", () => {
    const ops: STSOperation[] = [
      { ...baseOp, receiving_vessel_imo: "", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "00:15" },
      { ...baseOp, receiving_vessel_imo: "", receiving_vessel_name: "SAL", operation_date: "2026-08-30", start_time: "02:00" },
    ]
    expect(findOperationAnomalies(ops).size).toBe(0)
  })
})

