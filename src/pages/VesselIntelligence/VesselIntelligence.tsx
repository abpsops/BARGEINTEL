import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search } from "lucide-react"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import KpiCard from "@/components/ui/KpiCard"
import { formatDateDisplay } from "@/lib/dates"

export default function VesselIntelligence() {
  const provider = getDataProvider()
  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })
  const [query, setQuery] = useState("")
  const [selectedKey, setSelectedKey] = useState<string | null>(null)

  const q = query.trim().toLowerCase()
  const suggestions = useMemo(() => {
    if (!q) return []
    const map = new Map<string, { name: string; imo: string }>()
    operations.forEach((o) => {
      if (o.receiving_vessel_name.toLowerCase().includes(q) || o.receiving_vessel_imo.includes(q)) {
        map.set(o.receiving_vessel_imo || o.receiving_vessel_name, {
          name: o.receiving_vessel_name,
          imo: o.receiving_vessel_imo,
        })
      }
    })
    return [...map.values()].slice(0, 8)
  }, [operations, q])

  const vesselOps = selectedKey
    ? operations
        .filter((o) => (o.receiving_vessel_imo || o.receiving_vessel_name) === selectedKey)
        .sort((a, b) => (a.operation_date < b.operation_date ? 1 : -1))
    : []

  const relationship = useMemo(() => {
    const map = new Map<string, Map<string, number>>() // competitor -> barge -> count
    vesselOps.forEach((o) => {
      if (!map.has(o.competitor_name)) map.set(o.competitor_name, new Map())
      const bm = map.get(o.competitor_name)!
      bm.set(o.barge_name, (bm.get(o.barge_name) ?? 0) + 1)
    })
    return [...map.entries()].map(([competitor, barges]) => ({
      competitor,
      total: [...barges.values()].reduce((a, b) => a + b, 0),
      barges: [...barges.entries()].sort((a, b) => b[1] - a[1]),
    })).sort((a, b) => b.total - a.total)
  }, [vesselOps])

  const uniqueCompetitors = new Set(vesselOps.map((o) => o.competitor_id)).size
  const uniqueBarges = new Set(vesselOps.map((o) => o.barge_id)).size
  const first = vesselOps.length ? vesselOps[vesselOps.length - 1].operation_date : null
  const last = vesselOps.length ? vesselOps[0].operation_date : null

  return (
    <div>
      <PageHeader title="Vessel Intelligence" subtitle="Competitor supply history for a specific vessel." />

      <div className="px-6">
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-paper-500" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedKey(null) }}
            placeholder="Vessel name or IMO…"
            className="w-full bg-ink-800 border border-ink-600 rounded pl-8 pr-3 py-2 text-sm focus-ring"
          />
          {suggestions.length > 0 && !selectedKey && (
            <div className="absolute z-10 mt-1 w-full rounded border border-ink-600 bg-ink-800 shadow-xl">
              {suggestions.map((s) => (
                <div
                  key={s.imo || s.name}
                  onClick={() => { setSelectedKey(s.imo || s.name); setQuery(s.name) }}
                  className="px-3 py-2 text-sm hover:bg-ink-700 cursor-pointer flex justify-between"
                >
                  <span>{s.name}</span>
                  <span className="text-paper-500 font-mono text-xs">{s.imo || "N/A"}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {!selectedKey && (
          <p className="mt-6 text-sm text-paper-500">Search for a vessel to see its competitor supply history.</p>
        )}

        {selectedKey && (
          <div className="mt-6">
            <div className="grid grid-cols-4 gap-3">
              <KpiCard label="Total Operations" value={vesselOps.length} />
              <KpiCard label="Unique Competitors" value={uniqueCompetitors} />
              <KpiCard label="Unique Barges" value={uniqueBarges} />
              <KpiCard label="First → Last Observed" value={first && last ? `${formatDateDisplay(first)} → ${formatDateDisplay(last)}` : "N/A"} />
            </div>

            <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
                <div className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-paper-500 font-mono border-b border-ink-700">
                  Supply History
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {vesselOps.map((o) => (
                      <tr key={o.id} className="border-b border-ink-800">
                        <td className="px-4 py-2 text-xs text-paper-500 whitespace-nowrap">{formatDateDisplay(o.operation_date)}</td>
                        <td className="px-4 py-2">{o.competitor_name}</td>
                        <td className="px-4 py-2 text-paper-300">{o.barge_name}</td>
                        <td className="px-4 py-2 text-xs text-paper-500">{o.location ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
                <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-3">
                  Competitor Relationship
                </div>
                <div className="space-y-4">
                  {relationship.map((r) => (
                    <div key={r.competitor}>
                      <div className="flex items-center justify-between text-sm font-medium">
                        <span>{r.competitor}</span>
                        <span className="font-mono text-xs text-paper-500">{r.total} ops</span>
                      </div>
                      <div className="mt-1 space-y-0.5">
                        {r.barges.map(([barge, count]) => (
                          <div key={barge} className="flex items-center justify-between text-xs text-paper-500 pl-3">
                            <span>{barge}</span>
                            <span className="font-mono">{count} operation{count > 1 ? "s" : ""}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
