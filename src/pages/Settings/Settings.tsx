import { getDataProvider } from "@/services/data"
import { isSupabaseConfigured, supabase } from "@/services/supabase/client"
import { DEFAULT_TIMEZONE } from "@/lib/dates"
import PageHeader from "@/components/ui/PageHeader"

export default function Settings() {
  const provider = getDataProvider()

  return (
    <div>
      <PageHeader title="Settings" subtitle="Data source, timezone, and account configuration." />
      <div className="px-6 pb-10 space-y-4 max-w-2xl">
        <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-2">Data Source</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm">{provider.name}</div>
              <div className="text-xs text-paper-500 mt-0.5">
                {isSupabaseConfigured
                  ? "Connected to your organization's Supabase project."
                  : "Running on local demo data. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to connect a real backend — see README."}
              </div>
            </div>
            <span
              className={`rounded px-2 py-1 text-[11px] font-mono ${
                provider.isDemo
                  ? "bg-signal-warn/15 text-signal-warn border border-signal-warn/40"
                  : "bg-signal-ok/15 text-signal-ok border border-signal-ok/40"
              }`}
            >
              {provider.isDemo ? "DEMO" : "LIVE"}
            </span>
          </div>
        </div>

        <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-2">Timezone</div>
          <div className="text-sm">{DEFAULT_TIMEZONE}</div>
          <div className="text-xs text-paper-500 mt-0.5">
            Date filters are inclusive of the full local day in this timezone.
          </div>
        </div>

        <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
          <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-2">Roles</div>
          <ul className="text-sm text-paper-300 space-y-1">
            <li><span className="font-mono text-paper-500">ADMIN</span> — full access</li>
            <li><span className="font-mono text-paper-500">ANALYST</span> — manage and analyse operational data</li>
            <li><span className="font-mono text-paper-500">VIEWER</span> — read-only access</li>
          </ul>
        </div>

        {isSupabaseConfigured && (
          <button
            onClick={() => supabase?.auth.signOut()}
            className="rounded border border-ink-600 px-3 py-1.5 text-xs text-paper-300 hover:bg-ink-800"
          >
            Sign out
          </button>
        )}
      </div>
    </div>
  )
}
