import type {
  Barge,
  Competitor,
  DataImport,
  STSFilters,
  STSOperation,
  Vessel,
} from "@/types"

/**
 * The single contract the entire frontend depends on. Pages and components
 * must never import a concrete provider directly — always go through
 * `getDataProvider()` in index.ts. This is what lets the app run on demo
 * data today and swap to Supabase (or a future authorised maritime API)
 * without touching a single page.
 */
export interface MaritimeDataProvider {
  readonly name: string
  readonly isDemo: boolean

  getCompetitors(): Promise<Competitor[]>
  getCompetitor(id: string): Promise<Competitor | null>
  upsertCompetitor(c: Partial<Competitor> & { name: string; code: string }): Promise<Competitor>
  deleteCompetitor(id: string): Promise<void>

  getBarges(params?: { competitorId?: string }): Promise<Barge[]>
  upsertBarge(b: Partial<Barge> & { imo: string; name: string; competitor_id: string }): Promise<Barge>
  deleteBarge(id: string): Promise<void>

  getVessel(params: { imo?: string; name?: string }): Promise<Vessel | null>

  getSTSOperations(filters: Partial<STSFilters>): Promise<STSOperation[]>

  /**
   * Deletes every STS operation record imported for a single barge — used
   * by the "Clear All" action on the Barges page to reset that barge's
   * analysed data back to zero without deleting the barge itself.
   */
  deleteOperationsByBarge(bargeId: string): Promise<void>

  importOperations(rows: Omit<STSOperation, "id" | "created_at" | "updated_at">[]): Promise<{
    imported: number
    skippedDuplicates: number
  }>

  listImports(): Promise<DataImport[]>
}
