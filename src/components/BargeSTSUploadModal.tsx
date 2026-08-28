import { useState } from "react"
import { UploadCloud, X, CheckCircle2 } from "lucide-react"
import type { Barge } from "@/types"
import { getDataProvider } from "@/services/data"
import {
  parseFile,
  suggestMapping,
  normalizeSingleBargeRows,
  SINGLE_BARGE_FIELDS,
  type FieldMapping,
  type ParsedFile,
  type SingleBargeRowResult,
} from "@/services/data/importParser"
import { formatDateDisplay } from "@/lib/dates"

const FIELD_LABELS: Record<string, string> = {
  receiving_vessel_name: "Vessel Name *",
  receiving_vessel_imo: "Vessel IMO",
  operation_date: "Date *",
  start_time: "Start Time",
  end_time: "End Time",
  operation: "Operation Type (used to filter for Bunkering)",
  location: "Location",
}

export default function BargeSTSUploadModal({
  barge,
  competitorName,
  onClose,
  onSaved,
}: {
  barge: Barge
  competitorName: string
  onClose: () => void
  onSaved: (count: number) => void
}) {
  const provider = getDataProvider()
  const [file, setFile] = useState<File | null>(null)
  const [parsed, setParsed] = useState<ParsedFile | null>(null)
  const [mapping, setMapping] = useState<FieldMapping | null>(null)
  const [results, setResults] = useState<SingleBargeRowResult[] | null>(null)
  const [saved, setSaved] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)

  const onFile = async (f: File) => {
    setFile(f)
    setResults(null)
    const p = await parseFile(f)
    setParsed(p)
    setMapping(suggestMapping(p.headers))
  }

  const runPreview = () => {
    if (!parsed || !mapping) return
    setResults(normalizeSingleBargeRows(parsed.rows, mapping, barge, competitorName, file?.name ?? "manual"))
  }

  const keptRows = results?.filter((r) => r.valid && r.keep) ?? []

  const confirmSave = async () => {
    if (!results) return
    setBusy(true)
    const ops = keptRows.map((r) => r.operation!)
    const { imported } = await provider.importOperations(ops)
    setBusy(false)
    setSaved(imported)
    onSaved(imported)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto scrollbar-thin bg-ink-950 border border-ink-700 rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-ink-700">
          <div>
            <div className="text-sm font-medium">{barge.name}</div>
            <div className="text-xs text-paper-500 font-mono">IMO {barge.imo} · {competitorName}</div>
          </div>
          <button onClick={onClose} className="text-paper-500 hover:text-paper-300 focus-ring">
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {!parsed && (
            <label className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-600 py-12 cursor-pointer hover:border-signal-bunker/60 transition-colors">
              <UploadCloud size={24} className="text-paper-500" />
              <span className="text-sm text-paper-300">Drop this barge's export, or click to browse</span>
              <span className="text-xs text-paper-500">CSV or XLSX — only STS Bunkering rows will be kept</span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </label>
          )}

          {parsed && mapping && !results && (
            <div>
              <div className="text-xs text-paper-500 mb-3">
                {file?.name} · {parsed.rows.length} rows detected
              </div>
              <div className="text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-2">Field Mapping</div>
              <div className="space-y-2">
                {SINGLE_BARGE_FIELDS.map((field) => (
                  <div key={field} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-paper-300 w-64">{FIELD_LABELS[field]}</span>
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
              <button onClick={runPreview} className="mt-4 rounded bg-signal-bunker text-white px-4 py-2 text-xs font-medium">
                Sort & Preview
              </button>
            </div>
          )}

          {results && saved === null && (
            <div>
              <div className="flex items-center gap-4 text-xs mb-3">
                <span className="text-signal-ok">{keptRows.length} STS Bunkering rows kept</span>
                <span className="text-paper-500">
                  {results.length - keptRows.length} other rows excluded (wrong type or invalid)
                </span>
              </div>
              <div className="rounded border border-ink-700 overflow-hidden max-h-64 overflow-y-auto scrollbar-thin">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono sticky top-0 bg-ink-900">
                      <th className="px-3 py-2">Vessel</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {keptRows.map((r) => (
                      <tr key={r.rowNumber} className="border-b border-ink-800">
                        <td className="px-3 py-1.5">{r.operation!.receiving_vessel_name}</td>
                        <td className="px-3 py-1.5">{formatDateDisplay(r.operation!.operation_date)}</td>
                        <td className="px-3 py-1.5 font-mono text-paper-500">{r.operation!.start_time ?? "—"}</td>
                      </tr>
                    ))}
                    {keptRows.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-3 py-6 text-center text-paper-500">
                          No STS Bunkering rows found in this file.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <button
                onClick={confirmSave}
                disabled={busy || keptRows.length === 0}
                className="mt-4 rounded bg-signal-bunker text-white px-4 py-2 text-xs font-medium disabled:opacity-40"
              >
                {busy ? "Saving…" : `Save ${keptRows.length} Records to ${barge.name}`}
              </button>
            </div>
          )}

          {saved !== null && (
            <div className="rounded-lg border border-signal-ok/40 bg-signal-ok/10 p-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-signal-ok shrink-0" />
              <div className="text-sm">
                {saved} STS Bunkering record{saved === 1 ? "" : "s"} saved for {barge.name}.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
