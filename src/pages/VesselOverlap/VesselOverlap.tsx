import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"

export default function VesselOverlap() {
  const provider = getDataProvider()
  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })

  const overlapRows = useMemo(() => {
    const map = new Map<string, { name: string; imo: string; competitors: Set<string> }>()
    operations.forEach((o) => {
      const key = o.receiving_vessel_imo || o.receiving_vessel_name
      const existing = map.get(key)
      if (existing) existing.competitors.add(o.competitor_name)
      else map.set(key, { name: o.receiving_vessel_name, imo: o.receiving_vessel_imo, competitors: new Set([o.competitor_name]) })
    })
    return [...map.values()]
      .filter((v) => v.competitors.size > 1)
      .sort((a, b) => b.competitors.size - a.competitors.size)
  }, [operations])

  return (
    <div>
      <PageHeader
        title="Vessel Overlap"
        subtitle="Vessels supplied by more than one competitor — highest competitive contest first."
      />
      <div className="px-6 pb-10">
        <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                <th className="px-4 py-2.5">Vessel</th>
                <th className="px-4 py-2.5">IMO</th>
                <th className="px-4 py-2.5 text-right">Competitors</th>
                <th className="px-4 py-2.5">Competitor Names</th>
              </tr>
            </thead>
            <tbody>
              {overlapRows.map((v) => (
                <tr key={v.imo || v.name} className="border-b border-ink-800 hover:bg-ink-800/60">
                  <td className="px-4 py-2.5 font-medium">{v.name}</td>
                  <td className="px-4 py-2.5 font-mono text-paper-500">{v.imo || "N/A"}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-signal-supply">{v.competitors.size}</td>
                  <td className="px-4 py-2.5 text-paper-300">{[...v.competitors].join(", ")}</td>
                </tr>
              ))}
              {overlapRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-paper-500 text-sm">
                    No vessels observed receiving supply from more than one competitor.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
