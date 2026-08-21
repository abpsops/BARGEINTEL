import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { UploadCloud, CheckCircle2, XCircle } from "lucide-react"
import { getDataProvider } from "@/services/data"
import { DemoDataProvider } from "@/services/data/DemoDataProvider"
import PageHeader from "@/components/ui/PageHeader"
import {
  parseFile,
  suggestMapping,
  normalizeRows,
  IMPORT_FIELDS,
  type FieldMapping,
  type ParsedFile,
  type NormalizedRowResult,
} from "@/services/data/importParser"

const FIELD_LABELS: Record<string, string> = {
  barge_imo: "Barge IMO *",
  barge_name: "Barge Name",
  receiving_vessel_name: "Receiving Vessel *",
  receiving_vessel_imo: "Receiving IMO",
  operation: "Operation Type",
  operation_date: "Operation Date *",
  start_time: "Start Time",
  end_time: "End Time",
  location: "Location",
  latitude: "Latitude",
  longitude: "Longitude",
}

export default function Import() {
  const provider = getDataProvider()
  const qc = useQueryClient()
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })

  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<FieldMapping | null>(null)
  const [results, setResults] = useState<NormalizedRowResult[] | null>(null)
  const [importSummary, setImportSummary] = useState<{ imported: number; skippedDuplicates: number; failed: number } | null>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (f: File) => {
    setFile(f)
    setResults(null)
    setImportSummary(null)
    const p = await parseFile(f)
    setParsed(p)
    setMapping(suggestMapping(p.headers))
  }

  const runPreview = () => {
    if (!parsed || !mapping) return
    setResults(normalizeRows(parsed.rows, mapping, barges, competitors, file?.name ?? "manual"))
  }

  const confirmImport = async () => {
    if (!results) return
    setBusy(true)
    const validOps = results.filter((r) => r.valid && r.operation).map((r) => r.operation!)
    const { imported, skippedDuplicates } = await provider.importOperations(validOps)
    const failed = results.filter((r) => !r.valid).length

    if (provider instanceof DemoDataProvider) {
      await provider.recordImport({
        id: `imp_${Date.now()}`,
        organization_id: "demo-org",
        filename: file?.name ?? "import.csv",
        provider: "csv",
        records_detected: results.length,
        records_imported: imported,
        records_skipped: skippedDuplicates,
        records_failed: failed,
        status: "completed",
        error_summary: failed > 0 ? `${failed} rows failed validation` : null,
        created_by: "operator",
        created_at: new Date().toISOString(),
      })
    }

    setImportSummary({ imported, skippedDuplicates, failed })
    setBusy(false)
    qc.invalidateQueries({ queryKey: ["operations-all"] })
    qc.invalidateQueries({ queryKey: ["sts-analysis"] })
  }

  const validCount = results?.filter((r) => r.valid).length ?? 0
  const invalidCount = results?.filter((r) => !r.valid).length ?? 0

  return (
    <div>
      <PageHeader title="Import Data" subtitle="Import authorised STS data from CSV or XLSX exports." />

      <div className="px-6 pb-10 space-y-5">
        {!parsed && (
          <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-600 bg-ink-900 py-14 cursor-pointer hover:border-signal-bunker/60 transition-colors">
            <UploadCloud size={28} className="text-paper-500" />
            <span className="text-sm text-paper-300">Drop a CSV or XLSX file, or click to browse</span>
            <span className="text-xs text-paper-500">Only authorised, licensed STS data exports</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
            />
          </label>
        )}

        {parsed && mapping && !results && (
          <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
            <div className="text-sm text-paper-300 mb-1">{file?.name}</div>
            <div className="text-xs text-paper-500 mb-4">
              {parsed.rows.length} rows detected · {parsed.headers.length} columns
            </div>

            <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-2">Field Mapping</div>
            <div className="grid grid-cols-2 gap-3">
              {IMPORT_FIELDS.map((field) => (
                <div key={field} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-paper-300 w-44">{FIELD_LABELS[field]}</span>
                  <select
                    value={mapping[field] ?? ""}
                    onChange={(e) => setMapping({ ...mapping, [field]: e.target.value || null })}
                    className="flex-1 bg-ink-800 border border-ink-600 rounded px-2 py-1 text-xs"
                  >
                    <option value="">— not mapped —</option>
                    {parsed.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button
              onClick={runPreview}
              className="mt-5 rounded bg-signal-bunker text-ink-950 px-4 py-2 text-xs font-medium"
            >
              Preview & Validate
            </button>
          </div>
        )}

        {results && !importSummary && (
          <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between border-b border-ink-700">
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-signal-ok">
                  <CheckCircle2 size={13} /> {validCount} valid
                </span>
                <span className="flex items-center gap-1.5 text-signal-crit">
                  <XCircle size={13} /> {invalidCount} rejected
                </span>
              </div>
              <button
                onClick={confirmImport}
                disabled={busy || validCount === 0}
                className="rounded bg-signal-bunker text-ink-950 px-4 py-1.5 text-xs font-medium disabled:opacity-40"
              >
                {busy ? "Importing…" : `Import ${validCount} Records`}
              </button>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                  <th className="px-4 py-2">Row</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Barge IMO</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Vessel</th>
                  <th className="px-4 py-2">Notes</th>
                </tr>
              </thead>
              <tbody className="max-h-80">
                {results.slice(0, 200).map((r) => (
                  <tr key={r.rowNumber} className="border-b border-ink-800">
                    <td className="px-4 py-1.5 text-paper-500">{r.rowNumber}</td>
                    <td className="px-4 py-1.5">
                      {r.valid ? (
                        <span className="text-signal-ok">Valid</span>
                      ) : (
                        <span className="text-signal-crit">Rejected</span>
                      )}
                    </td>
                    <td className="px-4 py-1.5 font-mono">{r.operation?.barge_imo ?? "—"}</td>
                    <td className="px-4 py-1.5">{r.operation?.operation_date ?? "—"}</td>
                    <td className="px-4 py-1.5">{r.operation?.receiving_vessel_name ?? "—"}</td>
                    <td className="px-4 py-1.5 text-paper-500">{r.errors.join("; ")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {importSummary && (
          <div className="rounded-lg border border-signal-ok/40 bg-signal-ok/10 p-5">
            <div className="text-sm text-paper-100 font-medium mb-1">Import complete</div>
            <div className="text-xs text-paper-300">
              {importSummary.imported} records imported · {importSummary.skippedDuplicates} duplicates skipped ·{" "}
              {importSummary.failed} rows failed validation
            </div>
            <button
              onClick={() => {
                setFile(null)
                setParsed(null)
                setMapping(null)
                setResults(null)
                setImportSummary(null)
              }}
              className="mt-3 rounded border border-ink-600 px-3 py-1.5 text-xs text-paper-300 hover:bg-ink-800"
            >
              Import another file
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
