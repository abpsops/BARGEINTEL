export type UserRole = "ADMIN" | "ANALYST" | "VIEWER"

export type OperationType = "STS_BUNKERING" | "STS_SUPPLY" | "OTHER_STS"

export interface Organization {
  id: string
  name: string
  created_at: string
}

export interface UserProfile {
  id: string
  organization_id: string
  full_name: string
  role: UserRole
  created_at: string
}

export interface Competitor {
  id: string
  organization_id: string
  name: string
  code: string
  description: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Barge {
  id: string
  organization_id: string
  competitor_id: string
  name: string
  imo: string
  mmsi: string | null
  call_sign: string | null
  flag: string | null
  vessel_type: string | null
  dwt: number | null
  loa: number | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Vessel {
  id: string
  imo: string
  mmsi: string | null
  name: string
  vessel_type: string | null
  flag: string | null
  dwt: number | null
  loa: number | null
  call_sign: string | null
  created_at: string
  updated_at: string
}

export interface STSOperation {
  id: string
  organization_id: string

  barge_id: string
  barge_imo: string
  barge_name: string
  competitor_id: string
  competitor_name: string

  receiving_vessel_id: string | null
  receiving_vessel_imo: string
  receiving_vessel_name: string

  operation_date: string // YYYY-MM-DD
  start_time: string | null
  end_time: string | null
  duration_minutes: number | null

  location: string | null
  latitude: number | null
  longitude: number | null

  operation_type: OperationType
  raw_operation_label: string

  source_provider: string
  source_record_id: string | null
  confidence: "high" | "medium" | "low"

  created_at: string
  updated_at: string
}

export interface DataImport {
  id: string
  organization_id: string
  filename: string
  provider: string
  records_detected: number
  records_imported: number
  records_skipped: number
  records_failed: number
  status: "pending" | "processing" | "completed" | "failed"
  error_summary: string | null
  created_by: string
  created_at: string
}

export interface DataImportRow {
  id: string
  import_id: string
  row_number: number
  raw_data: Record<string, string>
  normalized_data: Partial<STSOperation> | null
  status: "valid" | "duplicate" | "invalid" | "imported"
  error_message: string | null
}

export interface Watchlist {
  id: string
  organization_id: string
  name: string
  description: string | null
  created_at: string
}

export interface SavedSearch {
  id: string
  organization_id: string
  name: string
  filters_json: STSFilters
  created_by: string
  created_at: string
}

export interface Alert {
  id: string
  organization_id: string
  name: string
  alert_type: "competitor_activity" | "barge_activity" | "vessel_activity"
  conditions_json: Record<string, unknown>
  enabled: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  organization_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: Record<string, unknown>
  created_at: string
}

export interface STSFilters {
  dateFrom: string | null
  dateTo: string | null
  competitorIds: string[]
  bargeIds: string[]
  operationTypes: OperationType[]
  locations: string[]
  receivingVesselQuery: string
}

export interface DataQualityIssue {
  type:
    | "missing_imo"
    | "missing_date"
    | "missing_receiving_vessel"
    | "unknown_operation_type"
    | "unknown_competitor"
    | "duplicate"
  count: number
}
