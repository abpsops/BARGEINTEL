import { useQuery } from "@tanstack/react-query"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import KpiCard from "@/components/ui/KpiCard"
import { formatDateDisplay } from "@/lib/dates"

export default function DataQuality() {
  const provider = getDataProvider()
  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })
  const { data: imports = [] } = useQuery({ queryKey: ["imports"], queryFn: () => provider.listImports() })

  const missingReceivingImo = operations.filter((o) => !o.receiving_vessel_imo).length
  const missingLocation = operations.filter((o) => !o.location).length
  const otherStsCount = operations.filter((o) => o.operation_type === "OTHER_STS").length
  const lowConfidence = operations.filter((o) => o.confidence !== "high").length

  return (
    <div>
      <PageHeader title="Data Quality" subtitle="Issues detected across imported and observed STS records." />

      <div className="px-6">
        <div className="grid grid-cols-4 gap-3">
          <KpiCard label="Total Records" value={operations.length} />
          <KpiCard label="Missing Receiving IMO" value={missingReceivingImo} />
          <KpiCard label="Missing Location" value={missingLocation} />
          <KpiCard label="Unknown Operation Type" value={otherStsCount} sublabel="Classified as Other STS" />
        </div>

        {lowConfidence > 0 && (
          <div className="mt-3 rounded border border-signal-warn/40 bg-signal-warn/10 px-3 py-2 text-xs text-signal-warn">
            {lowConfidence} records carry medium/low classification confidence and may need manual review.
          </div>
        )}

        <div className="mt-6 rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
          <div className="px-4 py-2.5 text-[10px] uppercase tracking-wider text-paper-500 font-mono border-b border-ink-700">
            Import History
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                <th className="px-4 py-2">File</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2 text-right">Detected</th>
                <th className="px-4 py-2 text-right">Imported</th>
                <th className="px-4 py-2 text-right">Skipped</th>
                <th className="px-4 py-2 text-right">Failed</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp) => (
                <tr key={imp.id} className="border-b border-ink-800">
                  <td className="px-4 py-2">{imp.filename}</td>
                  <td className="px-4 py-2 text-xs text-paper-500">{formatDateDisplay(imp.created_at.slice(0, 10))}</td>
                  <td className="px-4 py-2 text-right font-mono">{imp.records_detected}</td>
                  <td className="px-4 py-2 text-right font-mono text-signal-ok">{imp.records_imported}</td>
                  <td className="px-4 py-2 text-right font-mono text-signal-warn">{imp.records_skipped}</td>
                  <td className="px-4 py-2 text-right font-mono text-signal-crit">{imp.records_failed}</td>
                  <td className="px-4 py-2 text-xs">{imp.status}</td>
                </tr>
              ))}
              {imports.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-paper-500 text-sm">
                    No imports recorded yet.
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
