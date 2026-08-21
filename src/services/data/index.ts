import type { MaritimeDataProvider } from "./DataProvider"
import { DemoDataProvider } from "./DemoDataProvider"
import { SupabaseDataProvider } from "./SupabaseDataProvider"
import { isSupabaseConfigured } from "@/services/supabase/client"

let cached: MaritimeDataProvider | null = null

/**
 * The only function any page/component should call to get data. Returns
 * SupabaseDataProvider once VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are
 * set, otherwise falls back to demo data so the app is fully usable before
 * a real backend is wired up. See README for provisioning instructions.
 */
export function getDataProvider(): MaritimeDataProvider {
  if (!cached) {
    cached = isSupabaseConfigured ? new SupabaseDataProvider() : new DemoDataProvider()
  }
  return cached
}

export type { MaritimeDataProvider } from "./DataProvider"
