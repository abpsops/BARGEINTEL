import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { X, Ship, Sailboat, Building2, Radar } from "lucide-react"
import { getDataProvider } from "@/services/data"
import { formatDateDisplay } from "@/lib/dates"

export default function GlobalSearch({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const provider = getDataProvider()

  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })
  const { data: operations = [] } = useQuery({
    queryKey: ["operations-all"],
    queryFn: () => provider.getSTSOperations({}),
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  const q = query.trim().toLowerCase()

  const matchedCompetitors = q ? competitors.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) : []
  const matchedBarges = q ? barges.filter((b) => b.name.toLowerCase().includes(q) || b.imo.includes(q)) : []

  const vesselMap = new Map<string, { name: string; imo: string; count: number }>()
  if (q) {
    operations
      .filter((op) => op.receiving_vessel_name.toLowerCase().includes(q) || op.receiving_vessel_imo.includes(q))
      .forEach((op) => {
        const key = op.receiving_vessel_imo || op.receiving_vessel_name
        const existing = vesselMap.get(key)
        if (existing) existing.count++
        else vesselMap.set(key, { name: op.receiving_vessel_name, imo: op.receiving_vessel_imo, count: 1 })
      })
  }
  const matchedVessels = [...vesselMap.values()].slice(0, 8)

  const matchedEvents = q
    ? operations
        .filter((op) => op.barge_name.toLowerCase().includes(q) || op.location?.toLowerCase().includes(q))
        .slice(0, 6)
    : []

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center pt-24" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-ink-800 border border-ink-600 rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-ink-700">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vessel, IMO, barge, competitor…"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-paper-500"
          />
          <button onClick={onClose} className="text-paper-500 hover:text-paper-300 focus-ring">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto scrollbar-thin">
          {!q && <div className="px-4 py-6 text-sm text-paper-500 text-center">Start typing to search…</div>}

          {q && matchedCompetitors.length + matchedBarges.length + matchedVessels.length + matchedEvents.length === 0 && (
            <div className="px-4 py-6 text-sm text-paper-500 text-center">No matches found.</div>
          )}

          {matchedCompetitors.length > 0 && (
            <SearchGroup icon={Building2} label="Competitors">
              {matchedCompetitors.map((c) => (
                <div key={c.id} className="px-4 py-2 text-sm hover:bg-ink-700 cursor-pointer">
                  {c.name} <span className="text-paper-500 font-mono text-xs">{c.code}</span>
                </div>
              ))}
            </SearchGroup>
          )}

          {matchedBarges.length > 0 && (
            <SearchGroup icon={Sailboat} label="Barges">
              {matchedBarges.map((b) => (
                <div key={b.id} className="px-4 py-2 text-sm hover:bg-ink-700 cursor-pointer flex justify-between">
                  <span>{b.name}</span>
                  <span className="text-paper-500 font-mono text-xs">IMO {b.imo}</span>
                </div>
              ))}
            </SearchGroup>
          )}

          {matchedVessels.length > 0 && (
            <SearchGroup icon={Ship} label="Vessels">
              {matchedVessels.map((v) => (
                <div key={v.imo || v.name} className="px-4 py-2 text-sm hover:bg-ink-700 cursor-pointer flex justify-between">
                  <span>{v.name}</span>
                  <span className="text-paper-500 font-mono text-xs">{v.count} ops</span>
                </div>
              ))}
            </SearchGroup>
          )}

          {matchedEvents.length > 0 && (
            <SearchGroup icon={Radar} label="STS Events">
              {matchedEvents.map((e) => (
                <div key={e.id} className="px-4 py-2 text-sm hover:bg-ink-700 cursor-pointer flex justify-between">
                  <span>
                    {e.barge_name} → {e.receiving_vessel_name}
                  </span>
                  <span className="text-paper-500 font-mono text-xs">{formatDateDisplay(e.operation_date)}</span>
                </div>
              ))}
            </SearchGroup>
          )}
        </div>
      </div>
    </div>
  )
}

function SearchGroup({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="py-1">
      <div className="px-4 py-1 flex items-center gap-1.5 text-xs font-medium text-paper-500">
        <Icon size={11} /> {label}
      </div>
      {children}
    </div>
  )
}
