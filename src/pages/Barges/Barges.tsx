import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, X, AlertTriangle, UploadCloud, Download } from "lucide-react"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import { isValidIMO } from "@/lib/imo"
import { formatDateDisplay } from "@/lib/dates"
import BargeSTSUploadModal from "@/components/BargeSTSUploadModal"
import { exportToCsv } from "@/lib/exportCsv"
import type { Barge } from "@/types"

export default function Barges() {
  const provider = getDataProvider()
  const qc = useQueryClient()
  const [showBulk, setShowBulk] = useState(false)
  const [competitorId, setCompetitorId] = useState("")
  const [bulkText, setBulkText] = useState("")
  const [namePrefix, setNamePrefix] = useState("Barge")
  const [uploadBarge, setUploadBarge] = useState<Barge | null>(null)

  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })
  const { data: operations = [] } = useQuery({ queryKey: ["operations-all"], queryFn: () => provider.getSTSOperations({}) })

  const competitorName = (id: string) => competitors.find((c) => c.id === id)?.name ?? "—"

  const downloadAllBargeSTS = () => {
    const bunkeringOps = operations.filter((o) => o.operation_type === "STS_BUNKERING")
    exportToCsv(
      "bargeintel_all_barges_sts_bunkering.csv",
      bunkeringOps
        .slice()
        .sort((a, b) => (a.barge_name < b.barge_name ? -1 : a.barge_name > b.barge_name ? 1 : 0))
        .map((o) => ({
          Competitor: o.competitor_name,
          Barge: o.barge_name,
          "Barge IMO": o.barge_imo,
          Vessel: o.receiving_vessel_name,
          Date: o.operation_date,
          Time: o.start_time,
        }))
    )
  }

  const parsedLines = bulkText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
  const validImos = parsedLines.filter(isValidIMO)
  const invalidImos = parsedLines.filter((l) => !isValidIMO(l))

  const submitBulk = async () => {
    if (!competitorId || validImos.length === 0) return
    for (let i = 0; i < validImos.length; i++) {
      await provider.upsertBarge({
        imo: validImos[i],
        name: `${namePrefix} ${i + 1}`,
        competitor_id: competitorId,
      })
    }
    setBulkText("")
    setShowBulk(false)
    qc.invalidateQueries({ queryKey: ["barges"] })
  }

  const remove = async (id: string) => {
    await provider.deleteBarge(id)
    qc.invalidateQueries({ queryKey: ["barges"] })
  }

  const bargeStats = (bargeId: string) => {
    const ops = operations.filter((o) => o.barge_id === bargeId)
    const uniqueVessels = new Set(ops.map((o) => o.receiving_vessel_imo || o.receiving_vessel_name)).size
    const latest = ops.length ? ops.reduce((m, o) => (o.operation_date > m ? o.operation_date : m), ops[0].operation_date) : null
    return { ops: ops.length, uniqueVessels, latest }
  }

  return (
    <div>
      <PageHeader
        title="Barges"
        subtitle="Competitor barge fleet, tracked by IMO."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={downloadAllBargeSTS}
              className="flex items-center gap-1.5 rounded border border-ink-600 px-3 py-1.5 text-xs text-paper-300 hover:bg-ink-800 focus-ring"
            >
              <Download size={13} /> Download All STS Bunkering Data
            </button>
            <button
              onClick={() => setShowBulk((s) => !s)}
              className="flex items-center gap-1.5 rounded bg-signal-bunker/15 border border-signal-bunker/40 text-signal-bunker px-3 py-1.5 text-xs hover:bg-signal-bunker/25 transition-colors focus-ring"
            >
              <Plus size={13} /> Bulk Add Barges
            </button>
          </div>
        }
      />

      <div className="px-6">
        {showBulk && (
          <div className="mb-4 rounded-lg border border-ink-700 bg-ink-900 p-4 space-y-3">
            <div className="flex gap-3 items-end flex-wrap">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">
                  Competitor
                </label>
                <select
                  value={competitorId}
                  onChange={(e) => setCompetitorId(e.target.value)}
                  className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-sm min-w-[200px]"
                >
                  <option value="">Select competitor…</option>
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">
                  Name prefix
                </label>
                <input
                  value={namePrefix}
                  onChange={(e) => setNamePrefix(e.target.value)}
                  className="bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-sm w-32"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">
                Paste IMO numbers — one per line
              </label>
              <textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                rows={6}
                placeholder={"9876543\n1234567\n2345678"}
                className="w-full bg-ink-800 border border-ink-600 rounded px-2 py-1.5 text-sm font-mono"
              />
            </div>

            {parsedLines.length > 0 && (
              <div className="text-xs flex items-center gap-4">
                <span className="text-signal-ok">{validImos.length} valid</span>
                {invalidImos.length > 0 && (
                  <span className="text-signal-crit flex items-center gap-1">
                    <AlertTriangle size={12} /> {invalidImos.length} failed check-digit validation
                  </span>
                )}
              </div>
            )}

            <button
              onClick={submitBulk}
              disabled={!competitorId || validImos.length === 0}
              className="rounded bg-signal-bunker text-ink-950 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
            >
              Add {validImos.length || ""} Barges
            </button>
          </div>
        )}

        <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                <th className="px-4 py-2.5">Competitor</th>
                <th className="px-4 py-2.5">Barge</th>
                <th className="px-4 py-2.5">IMO</th>
                <th className="px-4 py-2.5">MMSI</th>
                <th className="px-4 py-2.5 text-right">Operations</th>
                <th className="px-4 py-2.5 text-right">Unique Vessels</th>
                <th className="px-4 py-2.5">Last Activity</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {barges.map((b) => {
                const s = bargeStats(b.id)
                return (
                  <tr key={b.id} className="border-b border-ink-800 hover:bg-ink-800/60">
                    <td className="px-4 py-2.5 text-paper-300">{competitorName(b.competitor_id)}</td>
                    <td className="px-4 py-2.5">{b.name}</td>
                    <td className="px-4 py-2.5 font-mono text-paper-500">{b.imo}</td>
                    <td className="px-4 py-2.5 font-mono text-paper-500">{b.mmsi ?? "N/A"}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{s.ops}</td>
                    <td className="px-4 py-2.5 text-right font-mono">{s.uniqueVessels}</td>
                    <td className="px-4 py-2.5 text-xs text-paper-500">{s.latest ? formatDateDisplay(s.latest) : "N/A"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setUploadBarge(b)}
                          title="Upload STS data for this barge"
                          className="text-paper-500 hover:text-signal-bunker focus-ring"
                        >
                          <UploadCloud size={14} />
                        </button>
                        <button onClick={() => remove(b.id)} className="text-paper-500 hover:text-signal-crit focus-ring">
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {barges.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-paper-500 text-sm">
                    No barges tracked yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {uploadBarge && (
        <BargeSTSUploadModal
          barge={uploadBarge}
          competitorName={competitorName(uploadBarge.competitor_id)}
          onClose={() => setUploadBarge(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["operations-all"] })
            qc.invalidateQueries({ queryKey: ["sts-analysis"] })
          }}
        />
      )}
    </div>
  )
}
