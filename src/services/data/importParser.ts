import * as XLSX from "xlsx"
import type { Barge, Competitor, STSOperation } from "@/types"
import { normalizeIMO } from "@/lib/imo"
import { normalizeOperationType } from "@/lib/normalizeOperation"

export interface ParsedFile {
  headers: string[]
  rows: Record<string, string>[]
}

const COLUMN_ALIASES: Record<string, string[]> = {
  barge_imo: ["barge imo", "imo", "barge"],
  barge_name: ["barge name", "barge"],
  receiving_vessel_name: ["receiving vessel", "receiving vessel name", "vessel", "vessel name"],
  receiving_vessel_imo: ["receiving imo", "receiving vessel imo"],
  operation: ["operation", "operation type"],
  operation_date: ["date", "operation date"],
  start_time: ["start", "start time"],
  end_time: ["end", "end time"],
  location: ["location", "area"],
  latitude: ["latitude", "lat"],
  longitude: ["longitude", "lon", "lng"],
}

export type FieldMapping = Record<keyof typeof COLUMN_ALIASES, string | null>

export function parseFile(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(reader.error)
    reader.onload = () => {
      try {
        const data = reader.result
        const workbook =
          typeof data === "string"
            ? XLSX.read(data, { type: "string" })
            : XLSX.read(data, { type: "array" })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: "" })
        const headers = json.length > 0 ? Object.keys(json[0]) : []
        resolve({ headers, rows: json })
      } catch (e) {
        reject(e)
      }
    }
    if (file.name.toLowerCase().endsWith(".csv")) {
      reader.readAsText(file)
    } else {
      reader.readAsArrayBuffer(file)
    }
  })
}

/** Suggests a field mapping from detected headers using known aliases. */
export function suggestMapping(headers: string[]): FieldMapping {
  const mapping = {} as FieldMapping
  const lowerHeaders = headers.map((h) => ({ original: h, lower: h.trim().toLowerCase() }))

  for (const field of Object.keys(COLUMN_ALIASES) as (keyof typeof COLUMN_ALIASES)[]) {
    const aliases = COLUMN_ALIASES[field]
    const match = lowerHeaders.find((h) => aliases.includes(h.lower))
    mapping[field] = match ? match.original : null
  }
  return mapping
}

export interface NormalizedRowResult {
  rowNumber: number
  valid: boolean
  errors: string[]
  operation?: Omit<STSOperation, "id" | "created_at" | "updated_at">
}

/**
 * Normalizes raw import rows into internal STSOperation shape, matching
 * barges by IMO against the tracked competitor fleet. Rows referencing an
 * IMO not in the tracked fleet are skipped (spec: never invent data).
 */
export function normalizeRows(
  rawRows: Record<string, string>[],
  mapping: FieldMapping,
  barges: Barge[],
  competitors: Competitor[],
  sourceProvider: string
): NormalizedRowResult[] {
  const bargeByImo = new Map(barges.map((b) => [b.imo, b]))
  const competitorById = new Map(competitors.map((c) => [c.id, c]))

  return rawRows.map((row, i) => {
    const errors: string[] = []
    const get = (field: keyof typeof COLUMN_ALIASES) => (mapping[field] ? row[mapping[field]!] ?? "" : "")

    const bargeImo = normalizeIMO(get("barge_imo"))
    if (!bargeImo) errors.push("Missing or invalid barge IMO")

    const barge = bargeImo ? bargeByImo.get(bargeImo) : undefined
    if (bargeImo && !barge) errors.push(`IMO ${bargeImo} is not a tracked competitor barge`)

    const operationDateRaw = get("operation_date")
    const operationDate = normalizeDate(operationDateRaw)
    if (!operationDate) errors.push("Missing or unparseable operation date")

    const receivingVesselName = get("receiving_vessel_name").trim()
    if (!receivingVesselName) errors.push("Missing receiving vessel")

    const receivingVesselImo = normalizeIMO(get("receiving_vessel_imo")) ?? ""

    const rawOpLabel = get("operation").trim() || "STS Bunkering"
    const operationType = normalizeOperationType(rawOpLabel)

    if (errors.length > 0 || !barge) {
      return { rowNumber: i + 1, valid: false, errors }
    }

    const competitor = competitorById.get(barge.competitor_id)

    const start = get("start_time").trim() || null
    const end = get("end_time").trim() || null
    const duration = start && end ? diffMinutes(start, end) : null

    const lat = parseFloat(get("latitude"))
    const lng = parseFloat(get("longitude"))

    return {
      rowNumber: i + 1,
      valid: true,
      errors: [],
      operation: {
        organization_id: barge.organization_id,
        barge_id: barge.id,
        barge_imo: barge.imo,
        barge_name: barge.name,
        competitor_id: barge.competitor_id,
        competitor_name: competitor?.name ?? "Unknown",
        receiving_vessel_id: null,
        receiving_vessel_imo: receivingVesselImo,
        receiving_vessel_name: receivingVesselName,
        operation_date: operationDate!,
        start_time: start,
        end_time: end,
        duration_minutes: duration,
        location: get("location").trim() || null,
        latitude: Number.isFinite(lat) ? lat : null,
        longitude: Number.isFinite(lng) ? lng : null,
        operation_type: operationType,
        raw_operation_label: rawOpLabel,
        source_provider: sourceProvider,
        source_record_id: null,
        confidence: operationType === "OTHER_STS" ? "medium" : "high",
      },
    }
  })
}

function normalizeDate(raw: string): string | null {
  if (!raw) return null
  const trimmed = raw.trim()
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10)
  // Excel serial date number
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const parsed = XLSX.SSF.parse_date_code(Number(trimmed))
    if (parsed) return `${parsed.y}-${String(parsed.m).padStart(2, "0")}-${String(parsed.d).padStart(2, "0")}`
  }
  const d = new Date(trimmed)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}

function diffMinutes(start: string, end: string): number | null {
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return null
  let mins = eh * 60 + em - (sh * 60 + sm)
  if (mins < 0) mins += 24 * 60
  return mins
}

export const IMPORT_FIELDS = Object.keys(COLUMN_ALIASES) as (keyof typeof COLUMN_ALIASES)[]
