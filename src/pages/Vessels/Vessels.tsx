import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams } from "react-router-dom"
import { AlertTriangle } from "lucide-react"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import { formatDateDisplay } from "@/lib/dates"
import { findOperationAnomalies, vesselIdentityKey } from "@/lib/anomalies"
import type { STSOperation } from "@/types"

interface VesselSummary {
  key: string
  name: string
  imo: string
  operations: number
  competitors: Set<string>
  lastSeen: string
}

export default function Vessels() {
  const provider = getDataProvider()
  const [searchParams] = useSearchParams()
  const deepLinkKey = searchParams.get("imo") || searchParams.get("name") || null

  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })
  const [selectedKey, setSelectedKey] = useState<string | null>(deepLinkKey)
  const [query, setQuery] = useState("")

  const anomalyOpIds = useMemo(
    () => new Set(Array.from(findOperationAnomalies(operations)).map((i) => operations[i].id)),
    [operations]
  )

  const vessels = useMemo(() => {
    const map = new Map<string, VesselSummary>()
    operations.forEach((o) => {
      const key = vesselIdentityKey(o)
      if (!key) return
      const existing = map.get(key)
      if (existing) {
        existing.operations++
        existing.competitors.add(o.competitor_name)
        if (o.operation_date > existing.lastSeen) existing.lastSeen = o.operation_date
      } else {
        map.set(key, {
          key,
          name: o.receiving_vessel_name,
          imo: o.receiving_vessel_imo,
          operations: 1,
          competitors: new Set([o.competitor_name]),
          lastSeen: o.operation_date,
        })
      }
    })
    return Array.from(map.values()).sort((a, b) => b.operations - a.operations)
  }, [operations])

  const q = query.trim().toLowerCase()
  const filteredVessels = q
    ? vessels.filter((v) => v.name.toLowerCase().includes(q) || v.imo.includes(q))
    : vessels

  const selected = vessels.find((v) => v.key === selectedKey) || null

  const history: STSOperation[] = useMemo(() => {
    if (!selected) return []
    return operations
      .filter((o) => vesselIdentityKey(o) === selected.key)
      .slice()
      .sort((a, b) => {
        const aKey = `${a.operation_date} ${a.start_time ?? ""}`
        const bKey = `${b.operation_date} ${b.start_time ?? ""}`
        return aKey > bKey ? -1 : aKey < bKey ? 1 : 0
      })
  }, [operations, selected])

  return (
    <div>
      <PageHeader
        title="Vessels"
        subtitle="Every observed receiving vessel and its full bunkering history across all tracked competitors."
      />

      <div className="px-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 rounded-xl glass overflow-hidden flex flex-col max-h-[70vh]">
          <div className="p-3 border-b border-ink-700">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter by vessel name or IMO…"
              className="w-full bg-ink-950 border border-ink-700 rounded-md px-3 py-1.5 text-sm focus-ring"
            />
          </div>
          <div className="overflow-y-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-left text-xs font-medium text-paper-500 sticky top-0 bg-white">
                  <th className="px-4 py-2">Vessel</th>
                  <th className="px-4 py-2 text-right">Ops</th>
                  <th className="px-4 py-2 text-right">Competitors</th>
                </tr>
              </thead>
              <tbody>
                {filteredVessels.map((v) => (
                  <tr
                    key={v.key}
                    onClick={() => setSelectedKey(v.key)}
                    className={`border-b border-ink-800 cursor-pointer hover:bg-ink-800/60 ${
                      selectedKey === v.key ? "bg-ink-800" : ""
                    }`}
                  >
                    <td className="px-4 py-2">
                      <div>{v.name}</div>
                      {v.imo && <div className="text-[11px] font-mono text-paper-500">IMO {v.imo}</div>}
                    </td>
                    <td className="px-4 py-2 text-right font-mono">{v.operations}</td>
                    <td className="px-4 py-2 text-right font-mono">{v.competitors.size}</td>
                  </tr>
                ))}
                {filteredVessels.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-paper-500 text-sm">
                      No vessels match.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl glass p-4">
          {!selected && <div className="text-sm text-paper-500">Select a vessel to view its full bunkering history.</div>}
          {selected && (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="font-display text-lg">{selected.name}</div>
                  {selected.imo && <div className="text-xs font-mono text-paper-500">IMO {selected.imo}</div>}
                </div>
                <div className="flex gap-4 text-right">
                  <div>
                    <div className="text-[10px] text-paper-500 uppercase tracking-wide">Operations</div>
                    <div className="font-mono text-lg">{selected.operations}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-paper-500 uppercase tracking-wide">Competitors</div>
                    <div className="font-mono text-lg">{selected.competitors.size}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-paper-500 uppercase tracking-wide">Last Seen</div>
                    <div className="font-mono text-sm pt-1.5">{formatDateDisplay(selected.lastSeen)}</div>
                  </div>
                </div>
              </div>

              <div className="text-xs font-medium text-paper-500 mb-2">
                Supplied by {selected.competitors.size} competitor{selected.competitors.size === 1 ? "" : "s"}:{" "}
                <span className="text-paper-300">{Array.from(selected.competitors).join(", ")}</span>
              </div>

              <div className="rounded-md border border-ink-700 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-ink-700 text-left font-medium text-paper-500">
                      <th className="px-3 py-2">Competitor</th>
                      <th className="px-3 py-2">Barge</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                      <th className="px-3 py-2">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className={`border-b border-ink-800 ${anomalyOpIds.has(h.id) ? "bg-signal-crit/10" : ""}`}>
                        <td className="px-3 py-1.5">{h.competitor_name}</td>
                        <td className="px-3 py-1.5">{h.barge_name}</td>
                        <td className="px-3 py-1.5">{formatDateDisplay(h.operation_date)}</td>
                        <td className="px-3 py-1.5 font-mono text-paper-500">
                          <span className="flex items-center gap-1">
                            {h.start_time ?? "—"}
                            {anomalyOpIds.has(h.id) && (
                              <AlertTriangle
                                size={11}
                                className="text-signal-crit"
                                aria-label="Flagged: possible AIS/data anomaly"
                              />
                            )}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-paper-300">{h.location ?? "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
