import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export interface PdfSummaryRow {
  label: string
  operations: number
  vessels: number
}

export interface PdfCompetitorLocationRow {
  competitor: string
  location: string
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
   * 0-based indices into `rows` to highlight in amber/yellow — flagged as
   * suspicious because this operation started less than 5 hours after the
   * same barge's previous operation, which isn't physically plausible for
   * a real STS bunkering (loading, transit and mooring all take time), so
   * it's flagged as a likely AIS/data anomaly ("spoofed").
   */
  flaggedRows?: number[]
  /**
   * When provided, a final summary page is appended after the main table:
   * a "Vessels Supplied by Competitor" breakdown and an "Operations by
   * Location" breakdown (e.g. Fujairah, Khor Fakkan, Salalah, Sohar,
   * Shinas, Al Duqm — whatever locations actually appear in the data).
   * If `byCompetitorLocation` is included, a further page breaks down
   * each competitor's operations by location.
   */
  summary?: {
    byCompetitor: PdfSummaryRow[]
    byLocation: PdfSummaryRow[]
    byCompetitorLocation?: PdfCompetitorLocationRow[]
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
  const flagged = new Set(options?.flaggedRows ?? [])
  const hasFlags = flagged.size > 0
  let tableEndY = options?.dateRangeLabel ? 31 : 26

  autoTable(doc, {
    startY: tableEndY,
    head: [columns],
    body: rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c)))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 138, 128] },
    didParseCell: (data) => {
      if (data.section === "body" && flagged.has(data.row.index)) {
        data.cell.styles.fillColor = [255, 236, 140]
        data.cell.styles.textColor = [110, 78, 0]
      }
    },
    didDrawCell: (data) => {
      if (data.section === "body" && groupBreaks.has(data.row.index)) {
        doc.setDrawColor(15, 138, 128)
        doc.setLineWidth(0.6)
        doc.line(data.cell.x, data.cell.y + data.cell.height, data.cell.x + data.cell.width, data.cell.y + data.cell.height)
        doc.setLineWidth(0.1)
        doc.setDrawColor(0, 0, 0)
      }
    },
    didDrawPage: (data) => {
      tableEndY = data.cursor?.y ?? tableEndY
    },
  })

  if (hasFlags) {
    doc.setFontSize(8)
    doc.setTextColor(110, 78, 0)
    doc.text(
      `Highlighted rows: less than 5 hours since this barge's previous bunkering operation — flagged as a possible AIS/data anomaly ("spoofed").`,
      14,
      tableEndY + 6
    )
    doc.setTextColor(0, 0, 0)
  }

  if (options?.summary) {
    const { byCompetitor, byLocation, byCompetitorLocation, totalOperations, totalVessels } = options.summary

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

    if (byCompetitorLocation && byCompetitorLocation.length) {
      doc.addPage()
      doc.setFontSize(14)
      doc.text("Competitor \u00D7 Location Breakdown", 14, 15)
      doc.setFontSize(9)
      doc.setTextColor(90, 90, 90)
      doc.text(`${title} — ${options.dateRangeLabel ?? ""}`, 14, 21)
      doc.setTextColor(0, 0, 0)

      // Shade every other competitor's block of rows (not every other row)
      // so each company's location breakdown reads as one visual group.
      const competitorOrder: string[] = []
      byCompetitorLocation.forEach((r) => {
        if (!competitorOrder.includes(r.competitor)) competitorOrder.push(r.competitor)
      })
      const shadedCompetitors = new Set(competitorOrder.filter((_, i) => i % 2 === 1))

      autoTable(doc, {
        startY: 26,
        head: [["Competitor", "Location", "Operations", "Vessels Supplied"]],
        body: byCompetitorLocation.map((r) => [r.competitor, r.location, String(r.operations), String(r.vessels)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [15, 138, 128] },
        foot: [["Total", "", String(totalOperations), String(totalVessels)]],
        footStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: "bold" },
        didParseCell: (data) => {
          if (data.section === "body") {
            const competitor = byCompetitorLocation[data.row.index]?.competitor
            if (competitor && shadedCompetitors.has(competitor)) {
              data.cell.styles.fillColor = [242, 245, 249]
            }
          }
        },
      })
    }
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

/**
 * Builds the per-competitor, per-location breakdown — how many operations
 * and distinct vessels each competitor did at each location. Sorted by
 * competitor's total operations (desc) so the busiest competitor's block
 * of locations appears first, and by that competitor's own locations
 * (desc by operations) within the block.
 */
export function buildPdfCompetitorLocationBreakdown<T>(
  items: T[],
  competitorKeyFn: (item: T) => string,
  locationKeyFn: (item: T) => string,
  vesselKeyFn: (item: T) => string
): PdfCompetitorLocationRow[] {
  const groups = new Map<string, Map<string, { operations: number; vessels: Set<string> }>>()
  const competitorTotals = new Map<string, number>()

  items.forEach((item) => {
    const competitor = competitorKeyFn(item) || "Unknown"
    const location = locationKeyFn(item) || "Unknown"
    const vesselKey = vesselKeyFn(item)
    if (!groups.has(competitor)) groups.set(competitor, new Map())
    const byLocation = groups.get(competitor)!
    if (!byLocation.has(location)) byLocation.set(location, { operations: 0, vessels: new Set() })
    const g = byLocation.get(location)!
    g.operations += 1
    if (vesselKey) g.vessels.add(vesselKey)
    competitorTotals.set(competitor, (competitorTotals.get(competitor) ?? 0) + 1)
  })

  const competitorsSorted = Array.from(groups.keys()).sort(
    (a, b) => (competitorTotals.get(b) ?? 0) - (competitorTotals.get(a) ?? 0)
  )

  const rows: PdfCompetitorLocationRow[] = []
  competitorsSorted.forEach((competitor) => {
    const byLocation = groups.get(competitor)!
    const locationsSorted = Array.from(byLocation.entries()).sort((a, b) => b[1].operations - a[1].operations)
    locationsSorted.forEach(([location, g]) => {
      rows.push({ competitor, location, operations: g.operations, vessels: g.vessels.size })
    })
  })

  return rows
}

/**
 * Flags operations that started less than `minGapHours` (default 5) after
 * the SAME barge's previous operation, anywhere in the dataset — not just
 * within one vessel or one location. A single barge physically cannot
 * finish one bunkering, transit and start another within a couple of
 * hours, so a short gap is flagged as a likely AIS/data anomaly.
 *
 * `items` does not need to be pre-sorted; this groups by barge internally
 * and walks each barge's own operations in chronological order. Returns
 * the indices (into the original `items` array) of every operation that
 * is either the trigger of a short gap or the operation immediately
 * before it, since both ends of a too-close pair are equally suspicious.
 */
export function findShortGapFlags<T>(
  items: T[],
  bargeKeyFn: (item: T) => string,
  timestampFn: (item: T) => number | null,
  minGapHours = 5
): Set<number> {
  const flagged = new Set<number>()
  const byBarge = new Map<string, number[]>() // bargeKey -> original indices
  items.forEach((item, i) => {
    const key = bargeKeyFn(item)
    if (!byBarge.has(key)) byBarge.set(key, [])
    byBarge.get(key)!.push(i)
  })

  const minGapMs = minGapHours * 60 * 60 * 1000

  byBarge.forEach((indices) => {
    const withTs = indices
      .map((i) => ({ i, ts: timestampFn(items[i]) }))
      .filter((x): x is { i: number; ts: number } => x.ts !== null)
      .sort((a, b) => a.ts - b.ts)

    for (let k = 1; k < withTs.length; k++) {
      const gap = withTs[k].ts - withTs[k - 1].ts
      if (gap >= 0 && gap < minGapMs) {
        flagged.add(withTs[k - 1].i)
        flagged.add(withTs[k].i)
      }
    }
  })

  return flagged
}

/** Formats a min/max operation-date pair as "29 Aug 2026 – 31 Aug 2026". */
export function buildDateRangeLabel(dates: string[], formatFn: (d: string) => string): string | undefined {
  const valid = dates.filter(Boolean).slice().sort()
  if (!valid.length) return undefined
  const from = valid[0]
  const to = valid[valid.length - 1]
  return from === to ? formatFn(from) : `${formatFn(from)} – ${formatFn(to)}`
}
