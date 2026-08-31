import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface PdfSummaryRow {
  label: string
  operations: number
  vessels: number
}

export interface PdfExportOptions {
  /** Shown under the title, e.g. "Tracked period: 29 Aug 2026 – 31 Aug 2026". */
  dateRangeLabel?: string
  /**
   * 0-based indices into `rows` after which a visual separator line is
   * drawn under that row — e.g. the last row of each barge's block of
   * entries, so one barge's rows are visually set off from the next.
   */
  groupBreakAfterRows?: number[]
  /**
   * When provided, a final summary page is appended after the main table:
   * a "Vessels Supplied by Competitor" breakdown and an "Operations by
   * Location" breakdown (e.g. Fujairah, Khor Fakkan, Salalah, Sohar,
   * Shinas, Al Duqm — whatever locations actually appear in the data).
   */
  summary?: {
    byCompetitor: PdfSummaryRow[]
    byLocation: PdfSummaryRow[]
    totalOperations: number
    totalVessels: number
  }
}

export function exportToPdf(
  filename: string,
  title: string,
  columns: string[],
  rows: (string | number | null)[][],
  options?: PdfExportOptions
) {
  const doc = new jsPDF({ orientation: "landscape" })
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.setFontSize(9)
  doc.setTextColor(90, 90, 90)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 21)
  if (options?.dateRangeLabel) {
    doc.text(`Tracked period: ${options.dateRangeLabel}`, 14, 26)
  }
  doc.setTextColor(0, 0, 0)

  const groupBreaks = new Set(options?.groupBreakAfterRows ?? [])

  autoTable(doc, {
    startY: options?.dateRangeLabel ? 31 : 26,
    head: [columns],
    body: rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c)))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 138, 128] },
    didDrawCell: (data) => {
      if (data.section === "body" && groupBreaks.has(data.row.index)) {
        doc.setDrawColor(15, 138, 128)
        doc.setLineWidth(0.6)
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
        doc.setLineWidth(0.1)
        doc.setDrawColor(0, 0, 0)
      }
    },
  })

  if (options?.summary) {
    const { byCompetitor, byLocation, totalOperations, totalVessels } = options.summary

    doc.addPage()
    doc.setFontSize(14)
    doc.text("Summary", 14, 15)
    doc.setFontSize(9)
    doc.setTextColor(90, 90, 90)
    doc.text(`${title} — ${options.dateRangeLabel ?? ""}`, 14, 21)
    doc.setTextColor(0, 0, 0)

    doc.setFontSize(10)
    doc.text(`Total operations: ${totalOperations}    Total vessels supplied: ${totalVessels}`, 14, 29)

    autoTable(doc, {
      startY: 34,
      head: [["Competitor", "Operations", "Vessels Supplied"]],
      body: byCompetitor.map((r) => [r.label, String(r.operations), String(r.vessels)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 138, 128] },
      foot: [["Total", String(totalOperations), String(totalVessels)]],
      footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
      margin: { left: 14, right: pageWidth / 2 + 4 },
      tableWidth: pageWidth / 2 - 18,
    })

    autoTable(doc, {
      startY: 34,
      head: [["Location", "Operations", "Vessels Supplied"]],
      body: byLocation.map((r) => [r.label, String(r.operations), String(r.vessels)]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [15, 138, 128] },
      foot: [["Total", String(totalOperations), String(totalVessels)]],
      footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
      margin: { left: pageWidth / 2 + 4, right: 14 },
      tableWidth: pageWidth / 2 - 18,
    })
  }

  doc.save(filename)
}

/**
 * Builds the per-group breakdown used on the summary page: how many
 * bunkering operations (and how many distinct vessels) each competitor or
 * location accounts for. "Vessels supplied" counts a vessel once per group
 * even if it was bunkered there more than once, matching how "how many
 * vessels done" reads in a brief report.
 */
export function buildPdfSummary<T>(
  items: T[],
  groupKeyFn: (item: T) => string,
  vesselKeyFn: (item: T) => string
): { rows: PdfSummaryRow[]; totalOperations: number; totalVessels: number } {
  const groups = new Map<string, { operations: number; vessels: Set<string> }>()
  items.forEach((item) => {
    const key = groupKeyFn(item) || "Unknown"
    const vesselKey = vesselKeyFn(item)
    if (!groups.has(key)) groups.set(key, { operations: 0, vessels: new Set() })
    const g = groups.get(key)!
    g.operations += 1
    if (vesselKey) g.vessels.add(vesselKey)
  })

  const rows = Array.from(groups.entries())
    .map(([label, g]) => ({ label, operations: g.operations, vessels: g.vessels.size }))
    .sort((a, b) => b.operations - a.operations)

  const allVessels = new Set(items.map(vesselKeyFn).filter(Boolean))
  return { rows, totalOperations: items.length, totalVessels: allVessels.size }
}

/** Formats a min/max operation-date pair as "29 Aug 2026 – 31 Aug 2026". */
export function buildDateRangeLabel(dates: string[], formatFn: (d: string) => string): string | undefined {
  const valid = dates.filter(Boolean).slice().sort()
  if (!valid.length) return undefined
  const from = valid[0]
  const to = valid[valid.length - 1]
  return from === to ? formatFn(from) : `${formatFn(from)} – ${formatFn(to)}`
}
