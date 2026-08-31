import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Download } from "lucide-react"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import DateRangeFilter from "@/components/filters/DateRangeFilter"
import { exportToCsv } from "@/lib/exportCsv"
import { resolvePreset, isWithinRange } from "@/lib/dates"

export default function Reports() {
  const provider = getDataProvider()
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })
  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })

  const defaultRange = resolvePreset("last30")
  const [dateFrom, setDateFrom] = useState(defaultRange.from)
  const [dateTo, setDateTo] = useState(defaultRange.to)

  const inRange = (op: (typeof operations)[number]) => isWithinRange(op.operation_date, dateFrom, dateTo)

  const competitorActivityReport = () => {
    const rows = competitors.map((c) => {
      const ops = operations.filter((o) => o.competitor_id === c.id && inRange(o))
      const bunkeringOps = ops.filter((o) => o.operation_type === "STS_BUNKERING")
      const uniqueVessels = new Set(ops.map((o) => o.receiving_vessel_imo || o.receiving_vessel_name)).size
      const activeBarges = new Set(ops.map((o) => o.barge_id)).size
      const locations = [...new Set(ops.map((o) => o.location).filter(Boolean))].join("; ")
      return {
        Competitor: c.name,
        "Total Operations": ops.length,
        "STS Bunkering Events": bunkeringOps.length,
        "Unique Vessels": uniqueVessels,
        "Active Barges": activeBarges,
        Locations: locations,
      }
    })
    exportToCsv(`competitor_activity_report_${dateFrom}_${dateTo}.csv`, rows)
  }

  const vesselCompetitiveHistoryReport = () => {
    const map = new Map<string, { name: string; imo: string; competitors: Set<string>; barges: Set<string>; dates: string[]; locations: Set<string> }>()
    operations.filter(inRange).forEach((o) => {
      const key = o.receiving_vessel_imo || o.receiving_vessel_name
      const existing = map.get(key)
      if (existing) {
        existing.competitors.add(o.competitor_name)
        existing.barges.add(o.barge_name)
        existing.dates.push(o.operation_date)
        if (o.location) existing.locations.add(o.location)
      } else {
        map.set(key, {
          name: o.receiving_vessel_name,
          imo: o.receiving_vessel_imo,
          competitors: new Set([o.competitor_name]),
          barges: new Set([o.barge_name]),
          dates: [o.operation_date],
          locations: new Set(o.location ? [o.location] : []),
        })
      }
    })
    const rows = [...map.values()].map((v) => ({
      Vessel: v.name,
      IMO: v.imo,
      Competitors: [...v.competitors].join("; "),
      Barges: [...v.barges].join("; "),
      Operations: v.dates.length,
      Locations: [...v.locations].join("; "),
    }))
    exportToCsv(`vessel_competitive_history_report_${dateFrom}_${dateTo}.csv`, rows)
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Choose a date range, then export a structured report for offline analysis." />

      <div className="px-6">
        <div className="rounded-xl glass p-4 mb-4 inline-block">
          <DateRangeFilter from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t) }} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ReportCard
            title="Competitor Activity Report"
            description="Total operations, STS Bunkering events, unique vessels and active barges per competitor, for the selected date range."
            onExport={competitorActivityReport}
          />
          <ReportCard
            title="Vessel Competitive History"
            description="Every observed receiving vessel with its competitor / barge / location history, for the selected date range."
            onExport={vesselCompetitiveHistoryReport}
          />
        </div>
      </div>
    </div>
  )
}

function ReportCard({ title, description, onExport }: { title: string; description: string; onExport: () => void }) {
  return (
    <div className="rounded-xl glass p-4">
      <div className="font-display text-base font-semibold">{title}</div>
      <p className="mt-1 text-xs text-paper-500">{description}</p>
      <button
        onClick={onExport}
        className="mt-4 flex items-center gap-1.5 rounded-md border border-ink-600 px-3 py-1.5 text-xs text-paper-300 hover:bg-ink-800 focus-ring"
      >
        <Download size={13} /> Export CSV
      </button>
    </div>
  )
}
