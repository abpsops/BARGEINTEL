import { useQuery } from "@tanstack/react-query"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import KpiCard from "@/components/ui/KpiCard"
import { Building2, Sailboat, Radar, Ship, Clock, CalendarDays, CalendarRange, AlertTriangle } from "lucide-react"
import { formatDateDisplay, resolvePreset } from "@/lib/dates"
import { findOperationAnomalies } from "@/lib/anomalies"
import { Link } from "react-router-dom"

export default function Dashboard() {
  const provider = getDataProvider()
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })
  const { data: operations = [] } = useQuery({
    queryKey: ["operations-all"],
    queryFn: () => provider.getSTSOperations({}),
  })

  const last24h = resolvePreset("today")
  const last7 = resolvePreset("last7")
  const thisMonth = resolvePreset("thisMonth")

  const countInRange = (from: string, to: string) =>
    operations.filter((o) => o.operation_date >= from && o.operation_date <= to).length

  const uniqueVessels = new Set(operations.map((o) => o.receiving_vessel_imo || o.receiving_vessel_name)).size
  const anomalyCount = findOperationAnomalies(operations).size
  const latestActivity = operations.length
    ? operations.reduce((max, o) => (o.operation_date > max ? o.operation_date : max), operations[0].operation_date)
    : null

  const byDay = new Map<string, number>()
  operations.forEach((o) => byDay.set(o.operation_date, (byDay.get(o.operation_date) ?? 0) + 1))
  const dailySeries = [...byDay.entries()]
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .slice(-30)
    .map(([date, count]) => ({ date: date.slice(5), count }))

  const byCompetitor = competitors
    .map((c) => ({
      name: c.code,
      count: operations.filter((o) => o.competitor_id === c.id).length,
    }))
    .sort((a, b) => b.count - a.count)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Observed competitor STS activity across all tracked barges."
      />

      <div className="px-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <KpiCard label="Tracked Competitors" value={competitors.length} icon={Building2} tone="brand" />
        <KpiCard label="Tracked Barges" value={barges.length} icon={Sailboat} tone="bunker" />
        <KpiCard label="Observed STS Operations" value={operations.length} icon={Radar} tone="supply" />
        <KpiCard label="Unique Vessels" value={uniqueVessels} icon={Ship} tone="ok" />
        <Link to="/barges" className="block">
          <KpiCard
            label="Flagged Anomalies"
            value={anomalyCount}
            sublabel={anomalyCount > 0 ? "Different barge/vessel <5h — view in Barges" : "None detected"}
            icon={AlertTriangle}
            tone="warn"
          />
        </Link>
      </div>

      <div className="px-6 mt-3 grid grid-cols-3 gap-3">
        <KpiCard label="Last 24H" value={countInRange(last24h.from, last24h.to)} icon={Clock} tone="brand" />
        <KpiCard label="Last 7 Days" value={countInRange(last7.from, last7.to)} icon={CalendarDays} tone="bunker" />
        <KpiCard label="This Month" value={countInRange(thisMonth.from, thisMonth.to)} icon={CalendarRange} tone="supply" />
      </div>

      <div className="px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl glass p-4">
          <div className="text-xs font-medium text-paper-500 mb-3">
            STS Activity by Day
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dailySeries}>
              <CartesianGrid stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: "#FFFFFF", border: "1px solid #E2E8F0", fontSize: 12 }}
                labelStyle={{ color: "#0B1220" }}
              />
              <Bar dataKey="count" fill="#0F8A80" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl glass p-4">
          <div className="text-xs font-medium text-paper-500 mb-3">
            Activity by Competitor
          </div>
          <div className="space-y-2">
            {byCompetitor.map((c) => {
              const max = byCompetitor[0]?.count || 1
              return (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-10 text-xs font-mono text-paper-300">{c.name}</span>
                  <div className="flex-1 h-2 rounded-md bg-ink-700 overflow-hidden">
                    <div
                      className="h-full bg-signal-supply"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-mono text-paper-500">{c.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-6 mt-4 mb-8 flex items-center justify-between text-xs text-paper-500">
        <span>
          Latest observed activity:{" "}
          {latestActivity ? formatDateDisplay(latestActivity) : "No data available."}
        </span>
        <Link to="/sts-analysis" className="text-brand-600 hover:underline">
          Run competitor analysis →
        </Link>
      </div>
    </div>
  )
}
