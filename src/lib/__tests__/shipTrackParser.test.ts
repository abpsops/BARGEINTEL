import { describe, it, expect } from "vitest"
import { extractBunkeringEvents, toSTSOperations, type ShipTrackRow } from "@/services/data/shipTrackParser"
import type { Barge } from "@/types"

const testBarge: Barge = {
  id: "barge_1",
  organization_id: "org_1",
  competitor_id: "comp_1",
  name: "FNSA 10",
  imo: "9432074",
  mmsi: "470712000",
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

function row(overrides: Partial<ShipTrackRow>): ShipTrackRow {
  return {
    mmsi: 470712000,
    imo: "9432074",
    name: "FNSA 10",
    timestamp: new Date("2026-08-19T09:30:50Z"),
    latitude: 25.301223,
    longitude: 56.46418,
    narrative: "",
    destination: "",
    ...overrides,
  }
}

describe("extractBunkeringEvents", () => {
  it("extracts the vessel name from a real 'STS Operation Bunkering with X' narrative", () => {
    const rows = [row({ name: "ANDES", narrative: "STS Operation Bunkering with ANDES\\n19 Aug 2026 09:30" })]
    const results = extractBunkeringEvents(rows)
    expect(results.length).toBe(1)
    expect(results[0].vesselName).toBe("ANDES")
  })

  it("excludes 'STS Operation Supply' rows — only Bunkering counts", () => {
    const rows = [row({ name: "FNSA 5", narrative: "STS Operation Supply with FNSA 5\\n20 Aug 2026 01:21" })]
    expect(extractBunkeringEvents(rows).length).toBe(0)
  })

  it("excludes non-STS narratives like waiting-at-anchorage or destination changes", () => {
    const rows = [
      row({ narrative: "Waiting at \\nFujairah 'A' Anchorage\\n19 Aug 2026 09:41 5 hours" }),
      row({ narrative: "Destination Change To\\nKhor Fakkan\\n19 Aug 2026 02:49" }),
    ]
    expect(extractBunkeringEvents(rows).length).toBe(0)
  })

  it("classifies location to the nearest known anchorage from lat/lon", () => {
    const rows = [
      row({
        name: "LILAC",
        narrative: "STS Operation Bunkering with LILAC\\n19 Aug 2026 04:14",
        latitude: 25.378103,
        longitude: 56.47909,
      }),
    ]
    const results = extractBunkeringEvents(rows)
    expect(results[0].location).toBe("Khor Fakkan")
  })

  it("reports Unknown rather than a misleading nearest match for garbled coordinates", () => {
    const rows = [
      row({
        name: "SAL",
        narrative: "STS Operation Bunkering with SAL\\n21 Aug 2026 08:22",
        latitude: 0.086053,
        longitude: -0.005503,
      }),
    ]
    const results = extractBunkeringEvents(rows)
    expect(results[0].location).toBe("Unknown")
  })

  it("processes a realistic mixed batch matching the real export shape", () => {
    const rows: ShipTrackRow[] = [
      row({ name: "ANDES", narrative: "STS Operation Bunkering with ANDES\\n19 Aug 2026 09:30" }),
      row({ narrative: "Waiting at \\nFujairah 'A' Anchorage\\n19 Aug 2026 09:41 5 hours" }),
      row({ narrative: "Destination Change To\\nKhor Fakkan\\n19 Aug 2026 02:49" }),
      row({ name: "LILAC", narrative: "STS Operation Bunkering with LILAC\\n19 Aug 2026 04:14", latitude: 25.378103, longitude: 56.47909 }),
      row({ name: "FNSA 5", narrative: "STS Operation Supply with FNSA 5\\n20 Aug 2026 01:21" }),
      row({ name: "AMAZON", narrative: "STS Operation Bunkering with AMAZON\\n21 Aug 2026 11:23" }),
    ]
    const results = extractBunkeringEvents(rows)
    expect(results.map((r) => r.vesselName)).toEqual(["ANDES", "LILAC", "AMAZON"])
  })
})

describe("toSTSOperations", () => {
  it("tags every event with the given barge's identity and STS_BUNKERING type, never inventing a receiving IMO", () => {
    const rows = [row({ name: "ANDES", narrative: "STS Operation Bunkering with ANDES\\n19 Aug 2026 09:30" })]
    const ops = toSTSOperations(extractBunkeringEvents(rows), testBarge, "OMTI", "test.xlsx")
    expect(ops[0].barge_imo).toBe(testBarge.imo)
    expect(ops[0].operation_type).toBe("STS_BUNKERING")
    expect(ops[0].receiving_vessel_imo).toBe("")
    expect(ops[0].confidence).toBe("high")
  })

  it("converts the UTC timestamp to Asia/Dubai local time (+4h) rather than showing raw UTC", () => {
    const rows = [
      row({
        name: "ANDES",
        narrative: "STS Operation Bunkering with ANDES\\n19 Aug 2026 09:30",
        timestamp: new Date("2026-08-19T09:30:49.999Z"),
      }),
    ]
    const ops = toSTSOperations(extractBunkeringEvents(rows), testBarge, "OMTI", "test.xlsx")
    expect(ops[0].operation_date).toBe("2026-08-19")
    expect(ops[0].start_time).toBe("13:30")
  })

  it("rolls over to the next local date when the UTC time is late enough that +4h crosses midnight", () => {
    const rows = [
      row({
        name: "SAL",
        narrative: "STS Operation Bunkering with SAL\\n21 Aug 2026 20:22",
        timestamp: new Date("2026-08-21T20:22:52.999Z"),
      }),
    ]
    const ops = toSTSOperations(extractBunkeringEvents(rows), testBarge, "OMTI", "test.xlsx")
    expect(ops[0].operation_date).toBe("2026-08-22")
    expect(ops[0].start_time).toBe("00:22")
  })
})
