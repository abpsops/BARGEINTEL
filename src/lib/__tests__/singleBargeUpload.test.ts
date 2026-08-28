import { describe, it, expect } from "vitest"
import { normalizeSingleBargeRows, suggestMapping } from "@/services/data/importParser"
import type { Barge } from "@/types"

const testBarge: Barge = {
  id: "barge_1",
  organization_id: "org_1",
  competitor_id: "comp_1",
  name: "Test Barge",
  imo: "9074729",
  mmsi: null,
  call_sign: null,
  flag: null,
  vessel_type: "Bunker Barge",
  dwt: null,
  loa: null,
  active: true,
  notes: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
}

describe("normalizeSingleBargeRows", () => {
  it("keeps only rows classified as STS Bunkering when an operation column exists", () => {
    const rows = [
      { Vessel: "MT Ocean Star", Date: "2026-08-01", Operation: "STS Bunkering" },
      { Vessel: "MV Blue Pearl", Date: "2026-08-02", Operation: "STS Supply" },
      { Vessel: "MT Gulf Trader", Date: "2026-08-03", Operation: "Bunkering" },
    ]
    const mapping = suggestMapping(Object.keys(rows[0]))
    const results = normalizeSingleBargeRows(rows, mapping, testBarge, "Test Competitor", "manual")

    const kept = results.filter((r) => r.keep)
    expect(kept.length).toBe(2)
    expect(kept.map((r) => r.operation!.receiving_vessel_name)).toEqual(["MT Ocean Star", "MT Gulf Trader"])
  })

  it("treats every valid row as STS Bunkering when there is no operation column at all", () => {
    const rows = [
      { Vessel: "MT Ocean Star", Date: "2026-08-01" },
      { Vessel: "MV Blue Pearl", Date: "2026-08-02" },
    ]
    const mapping = suggestMapping(Object.keys(rows[0]))
    const results = normalizeSingleBargeRows(rows, mapping, testBarge, "Test Competitor", "manual")
    expect(results.every((r) => r.keep)).toBe(true)
    expect(results.every((r) => r.operation!.confidence === "medium")).toBe(true)
  })

  it("rejects rows missing a vessel name or date", () => {
    const rows = [
      { Vessel: "", Date: "2026-08-01", Operation: "STS Bunkering" },
      { Vessel: "MT Ocean Star", Date: "", Operation: "STS Bunkering" },
    ]
    const mapping = suggestMapping(Object.keys(rows[0]))
    const results = normalizeSingleBargeRows(rows, mapping, testBarge, "Test Competitor", "manual")
    expect(results.every((r) => !r.valid)).toBe(true)
    expect(results.every((r) => !r.keep)).toBe(true)
  })

  it("tags every kept row with the given barge's identity, not a value from the file", () => {
    const rows = [{ Vessel: "MT Ocean Star", Date: "2026-08-01", Operation: "STS Bunkering" }]
    const mapping = suggestMapping(Object.keys(rows[0]))
    const results = normalizeSingleBargeRows(rows, mapping, testBarge, "Test Competitor", "manual")
    expect(results[0].operation!.barge_id).toBe(testBarge.id)
    expect(results[0].operation!.barge_imo).toBe(testBarge.imo)
    expect(results[0].operation!.competitor_name).toBe("Test Competitor")
  })
})
