import { describe, it, expect } from "vitest"
import { findShortGapFlags, buildPdfCompetitorLocationBreakdown } from "@/lib/exportPdf"

interface Op {
  barge: string
  ts: number | null
}

const hr = 60 * 60 * 1000

describe("findShortGapFlags", () => {
  it("flags a pair of operations on the same barge less than 5 hours apart", () => {
    const items: Op[] = [
      { barge: "Amal", ts: 0 },
      { barge: "Amal", ts: 2 * hr }, // only 2h after the previous — flagged
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts)
    expect(flagged.has(0)).toBe(true)
    expect(flagged.has(1)).toBe(true)
  })

  it("does not flag operations 5 or more hours apart", () => {
    const items: Op[] = [
      { barge: "Amal", ts: 0 },
      { barge: "Amal", ts: 5 * hr },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts)
    expect(flagged.size).toBe(0)
  })

  it("does not compare across different barges", () => {
    const items: Op[] = [
      { barge: "Amal", ts: 0 },
      { barge: "Amber", ts: 1 * hr }, // close in time, but a different barge
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts)
    expect(flagged.size).toBe(0)
  })

  it("is unaffected by input order — sorts chronologically per barge internally", () => {
    const items: Op[] = [
      { barge: "Amal", ts: 3 * hr },
      { barge: "Amal", ts: 0 },
      { barge: "Amal", ts: 4 * hr },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts)
    // 0 -> 3h (flag both), 3h -> 4h (flag both) => all three flagged
    expect(flagged.size).toBe(3)
  })

  it("ignores operations with no parseable timestamp", () => {
    const items: Op[] = [
      { barge: "Amal", ts: null },
      { barge: "Amal", ts: 0 },
    ]
    const flagged = findShortGapFlags(items, (o) => o.barge, (o) => o.ts)
    expect(flagged.size).toBe(0)
  })

  it("respects a custom minGapHours threshold", () => {
    const items: Op[] = [
      { barge: "Amal", ts: 0 },
      { barge: "Amal", ts: 3 * hr },
    ]
    expect(findShortGapFlags(items, (o) => o.barge, (o) => o.ts, 2).size).toBe(0)
    expect(findShortGapFlags(items, (o) => o.barge, (o) => o.ts, 4).size).toBe(2)
  })
})

interface Row {
  competitor: string
  location: string
  vessel: string
}

describe("buildPdfCompetitorLocationBreakdown", () => {
  it("groups operations and distinct vessels by competitor then location", () => {
    const rows: Row[] = [
      { competitor: "OMTI", location: "Fujairah", vessel: "SAL" },
      { competitor: "OMTI", location: "Fujairah", vessel: "AVATAR" },
      { competitor: "OMTI", location: "Sohar", vessel: "GAIA" },
      { competitor: "Akron", location: "Fujairah", vessel: "VISTA III" },
    ]
    const result = buildPdfCompetitorLocationBreakdown(
      rows,
      (r) => r.competitor,
      (r) => r.location,
      (r) => r.vessel
    )
    const omtiFuj = result.find((r) => r.competitor === "OMTI" && r.location === "Fujairah")
    const omtiSohar = result.find((r) => r.competitor === "OMTI" && r.location === "Sohar")
    const akronFuj = result.find((r) => r.competitor === "Akron" && r.location === "Fujairah")
    expect(omtiFuj).toEqual({ competitor: "OMTI", location: "Fujairah", operations: 2, vessels: 2 })
    expect(omtiSohar).toEqual({ competitor: "OMTI", location: "Sohar", operations: 1, vessels: 1 })
    expect(akronFuj).toEqual({ competitor: "Akron", location: "Fujairah", operations: 1, vessels: 1 })
  })

  it("orders the busiest competitor's rows first, as one contiguous block", () => {
    const rows: Row[] = [
      { competitor: "Akron", location: "Fujairah", vessel: "V1" },
      { competitor: "OMTI", location: "Fujairah", vessel: "V2" },
      { competitor: "OMTI", location: "Sohar", vessel: "V3" },
      { competitor: "OMTI", location: "Khor Fakkan", vessel: "V4" },
    ]
    const result = buildPdfCompetitorLocationBreakdown(
      rows,
      (r) => r.competitor,
      (r) => r.location,
      (r) => r.vessel
    )
    // OMTI has 3 ops vs Akron's 1, so all 3 OMTI rows come first, together.
    expect(result[0].competitor).toBe("OMTI")
    expect(result[1].competitor).toBe("OMTI")
    expect(result[2].competitor).toBe("OMTI")
    expect(result[3].competitor).toBe("Akron")
  })
})
