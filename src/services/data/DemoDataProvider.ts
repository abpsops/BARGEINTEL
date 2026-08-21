import type { Barge, Competitor, DataImport, STSFilters, STSOperation, Vessel } from "@/types"
import type { MaritimeDataProvider } from "./DataProvider"
import { generateDemoDataset } from "./demoData"
import { fingerprintOperation } from "@/lib/fingerprint"
import { isWithinRange } from "@/lib/dates"

const STORAGE_KEY = "bargeintel_demo_v1"

interface Store {
  competitors: Competitor[]
  barges: Barge[]
  vessels: Vessel[]
  operations: STSOperation[]
  imports: DataImport[]
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // fall through to regenerate
  }
  const seed = generateDemoDataset()
  const store: Store = { ...seed, imports: [] }
  persist(store)
  return store
}

function persist(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {
    // storage unavailable — demo continues in-memory only for this session
  }
}

let store: Store | null = null
function getStore(): Store {
  if (!store) store = loadStore()
  return store
}

let idCounter = 1000
const nextId = (prefix: string) => `${prefix}_${idCounter++}`

export class DemoDataProvider implements MaritimeDataProvider {
  readonly name = "Demo Data Provider"
  readonly isDemo = true

  async getCompetitors(): Promise<Competitor[]> {
    return [...getStore().competitors]
  }

  async getCompetitor(id: string): Promise<Competitor | null> {
    return getStore().competitors.find((c) => c.id === id) ?? null
  }

  async upsertCompetitor(c: Partial<Competitor> & { name: string; code: string }): Promise<Competitor> {
    const s = getStore()
    const now = new Date().toISOString()
    if (c.id) {
      const idx = s.competitors.findIndex((x) => x.id === c.id)
      if (idx >= 0) {
        s.competitors[idx] = { ...s.competitors[idx], ...c, updated_at: now }
        persist(s)
        return s.competitors[idx]
      }
    }
    const created: Competitor = {
      id: nextId("comp"),
      organization_id: "demo-org",
      name: c.name,
      code: c.code,
      description: c.description ?? null,
      active: c.active ?? true,
      created_at: now,
      updated_at: now,
    }
    s.competitors.push(created)
    persist(s)
    return created
  }

  async deleteCompetitor(id: string): Promise<void> {
    const s = getStore()
    s.competitors = s.competitors.filter((c) => c.id !== id)
    s.barges = s.barges.filter((b) => b.competitor_id !== id)
    persist(s)
  }

  async getBarges(params?: { competitorId?: string }): Promise<Barge[]> {
    const s = getStore()
    return s.barges.filter((b) => !params?.competitorId || b.competitor_id === params.competitorId)
  }

  async upsertBarge(
    b: Partial<Barge> & { imo: string; name: string; competitor_id: string }
  ): Promise<Barge> {
    const s = getStore()
    const now = new Date().toISOString()
    if (b.id) {
      const idx = s.barges.findIndex((x) => x.id === b.id)
      if (idx >= 0) {
        s.barges[idx] = { ...s.barges[idx], ...b, updated_at: now }
        persist(s)
        return s.barges[idx]
      }
    }
    const created: Barge = {
      id: nextId("barge"),
      organization_id: "demo-org",
      competitor_id: b.competitor_id,
      name: b.name,
      imo: b.imo,
      mmsi: b.mmsi ?? null,
      call_sign: b.call_sign ?? null,
      flag: b.flag ?? null,
      vessel_type: b.vessel_type ?? "Bunker Barge",
      dwt: b.dwt ?? null,
      loa: b.loa ?? null,
      active: b.active ?? true,
      notes: b.notes ?? null,
      created_at: now,
      updated_at: now,
    }
    s.barges.push(created)
    persist(s)
    return created
  }

  async deleteBarge(id: string): Promise<void> {
    const s = getStore()
    s.barges = s.barges.filter((b) => b.id !== id)
    persist(s)
  }

  async getVessel(params: { imo?: string; name?: string }): Promise<Vessel | null> {
    const s = getStore()
    if (params.imo) return s.vessels.find((v) => v.imo === params.imo) ?? null
    if (params.name) return s.vessels.find((v) => v.name === params.name) ?? null
    return null
  }

  async getSTSOperations(filters: Partial<STSFilters>): Promise<STSOperation[]> {
    const s = getStore()
    return s.operations.filter((op) => {
      if (!isWithinRange(op.operation_date, filters.dateFrom ?? null, filters.dateTo ?? null)) return false
      if (filters.competitorIds?.length && !filters.competitorIds.includes(op.competitor_id)) return false
      if (filters.bargeIds?.length && !filters.bargeIds.includes(op.barge_id)) return false
      if (filters.operationTypes?.length && !filters.operationTypes.includes(op.operation_type)) return false
      if (filters.locations?.length && !(op.location && filters.locations.includes(op.location))) return false
      if (filters.receivingVesselQuery) {
        const q = filters.receivingVesselQuery.toLowerCase()
        if (
          !op.receiving_vessel_name.toLowerCase().includes(q) &&
          !op.receiving_vessel_imo.includes(q)
        )
          return false
      }
      return true
    })
  }

  async importOperations(
    rows: Omit<STSOperation, "id" | "created_at" | "updated_at">[]
  ): Promise<{ imported: number; skippedDuplicates: number }> {
    const s = getStore()
    const existingFingerprints = new Set(
      s.operations.map((op) =>
        fingerprintOperation({
          bargeImo: op.barge_imo,
          operationDate: op.operation_date,
          operationType: op.operation_type,
          receivingVesselImo: op.receiving_vessel_imo,
          location: op.location,
          startTime: op.start_time,
        })
      )
    )

    let imported = 0
    let skippedDuplicates = 0
    const now = new Date().toISOString()

    for (const row of rows) {
      const fp = fingerprintOperation({
        bargeImo: row.barge_imo,
        operationDate: row.operation_date,
        operationType: row.operation_type,
        receivingVesselImo: row.receiving_vessel_imo,
        location: row.location,
        startTime: row.start_time,
      })
      if (existingFingerprints.has(fp)) {
        skippedDuplicates++
        continue
      }
      existingFingerprints.add(fp)
      s.operations.push({ ...row, id: nextId("op"), created_at: now, updated_at: now })
      imported++
    }
    persist(s)
    return { imported, skippedDuplicates }
  }

  async listImports(): Promise<DataImport[]> {
    return [...getStore().imports]
  }

  async recordImport(imp: DataImport) {
    const s = getStore()
    s.imports.unshift(imp)
    persist(s)
  }
}
