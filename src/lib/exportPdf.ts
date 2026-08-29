import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export function exportToPdf(
  filename: string,
  title: string,
  columns: string[],
  rows: (string | number | null)[][]
) {
  const doc = new jsPDF({ orientation: "landscape" })
  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.setFontSize(9)
  doc.text(`Generated ${new Date().toLocaleString()}`, 14, 21)

  autoTable(doc, {
    startY: 26,
    head: [columns],
    body: rows.map((r) => r.map((c) => (c === null || c === undefined ? "" : String(c)))),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [15, 138, 128] },
  })

  doc.save(filename)
}
