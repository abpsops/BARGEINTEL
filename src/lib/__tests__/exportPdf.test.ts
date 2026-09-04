import { describe, it, expect } from "vitest"
import { buildPdfCompetitorLocationBreakdown } from "@/lib/exportPdf"

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
