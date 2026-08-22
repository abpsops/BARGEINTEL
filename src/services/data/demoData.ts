import type { Barge, Competitor, STSOperation, Vessel } from "@/types"
import { FLEET_SEED } from "./fleetSeed"

const DEMO_ORG = "demo-org"

/**
 * Seeds competitors and barges from the real fleet extracted from
 * BARGE_TRACKING-2026 (14 Aug) — actual competitor names and check-digit
 * validated IMOs, not generated data. STS operations are intentionally left
 * empty: this app never fabricates STS activity, and doing so against real
 * competitor names would misrepresent real companies. Import actual STS
 * data under Import Data to populate operations.
 */
export function generateDemoDataset() {
  const now = new Date().toISOString()

  const competitors: Competitor[] = FLEET_SEED.map((c, i) => ({
    id: `comp_${i + 1}`,
    organization_id: DEMO_ORG,
    name: c.name,
    code: c.code,
    description: null,
    active: true,
    created_at: now,
    updated_at: now,
  }))

  const barges: Barge[] = []
  FLEET_SEED.forEach((c, ci) => {
    const competitorId = competitors[ci].id
    c.barges.forEach((b, bi) => {
      barges.push({
        id: `barge_${ci}_${bi}`,
        organization_id: DEMO_ORG,
        competitor_id: competitorId,
        name: b.name,
        imo: b.imo,
        mmsi: null,
        call_sign: null,
        flag: null,
        vessel_type: "Bunker Barge",
        dwt: null,
        loa: null,
        active: true,
        notes: null,
        created_at: now,
        updated_at: now,
      })
    })
  })

  const vessels: Vessel[] = []
  const operations: STSOperation[] = []

  return { competitors, barges, vessels, operations }
}
