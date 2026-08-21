import type { Barge, Competitor, OperationType, STSOperation, Vessel } from "@/types"

// Simple seeded PRNG so demo data is stable across reloads within a session.
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rand = mulberry32(20260821)
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]

const DEMO_ORG = "demo-org"

const COMPETITOR_SEED = [
  { name: "Al Marwan Bunkering", code: "ABC" },
  { name: "Straits Marine Fuels", code: "XYZ" },
  { name: "Gulf Coast Suppliers", code: "DEF" },
  { name: "Horizon Bunker Services", code: "HZN" },
]

const LOCATIONS = ["Fujairah", "Khor Fakkan", "Port Rashid", "Jebel Ali", "Sharjah Anchorage"]

const OPERATION_LABELS: { label: string; type: OperationType }[] = [
  { label: "STS Bunkering", type: "STS_BUNKERING" },
  { label: "STS Bunkering Operation", type: "STS_BUNKERING" },
  { label: "STS Supply", type: "STS_SUPPLY" },
  { label: "STS Fuel Supply", type: "STS_SUPPLY" },
]

const VESSEL_NAME_PARTS1 = ["OCEAN", "GULF", "EASTERN", "BLUE", "SILVER", "NORTHERN", "CRYSTAL", "GRAND"]
const VESSEL_NAME_PARTS2 = ["STAR", "PEARL", "TRADER", "WIND", "VOYAGER", "HORIZON", "DAWN", "MARINER"]
const VESSEL_PREFIX = ["MT", "MV"]

function genIMO(): string {
  // Generate a structurally valid-looking 7 digit IMO with a real check digit.
  const digits = Array.from({ length: 6 }, () => Math.floor(rand() * 10))
  const weights = [7, 6, 5, 4, 3, 2]
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0)
  const check = sum % 10
  return [...digits, check].join("")
}

function genVesselName(): string {
  return `${pick(VESSEL_PREFIX)} ${pick(VESSEL_NAME_PARTS1)} ${pick(VESSEL_NAME_PARTS2)}`
}

export function generateDemoDataset() {
  const now = new Date()

  const competitors: Competitor[] = COMPETITOR_SEED.map((c, i) => ({
    id: `comp_${i + 1}`,
    organization_id: DEMO_ORG,
    name: c.name,
    code: c.code,
    description: null,
    active: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }))

  const barges: Barge[] = []
  competitors.forEach((comp, ci) => {
    const bargeCount = 3 + Math.floor(rand() * 3)
    for (let b = 0; b < bargeCount; b++) {
      barges.push({
        id: `barge_${ci}_${b}`,
        organization_id: DEMO_ORG,
        competitor_id: comp.id,
        name: `${comp.code} Barge ${b + 1}`,
        imo: genIMO(),
        mmsi: String(470000000 + Math.floor(rand() * 900000)),
        call_sign: null,
        flag: pick(["UAE", "Panama", "Marshall Islands"]),
        vessel_type: "Bunker Barge",
        dwt: 3000 + Math.floor(rand() * 5000),
        loa: 80 + Math.floor(rand() * 40),
        active: true,
        notes: null,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
      })
    }
  })

  // A pool of recurring receiving vessels so overlap/relationship views have signal.
  const vessels: Vessel[] = Array.from({ length: 60 }, (_, i) => ({
    id: `vessel_${i}`,
    imo: genIMO(),
    mmsi: null,
    name: genVesselName(),
    vessel_type: pick(["Bulk Carrier", "Tanker", "Container Ship", "General Cargo"]),
    flag: null,
    dwt: null,
    loa: null,
    call_sign: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  }))

  const operations: STSOperation[] = []
  let opCounter = 0

  for (let day = 59; day >= 0; day--) {
    const date = new Date(now)
    date.setDate(date.getDate() - day)
    const dateStr = date.toISOString().slice(0, 10)

    const eventsToday = Math.floor(rand() * 6) // 0-5 events/day across all competitors
    for (let e = 0; e < eventsToday; e++) {
      const barge = pick(barges)
      const competitor = competitors.find((c) => c.id === barge.competitor_id)!
      const vessel = pick(vessels)
      const opLabel = pick(OPERATION_LABELS)
      const startHour = Math.floor(rand() * 22)
      const durationMin = 60 + Math.floor(rand() * 300)
      opCounter++

      operations.push({
        id: `op_${opCounter}`,
        organization_id: DEMO_ORG,
        barge_id: barge.id,
        barge_imo: barge.imo,
        barge_name: barge.name,
        competitor_id: competitor.id,
        competitor_name: competitor.name,
        receiving_vessel_id: vessel.id,
        receiving_vessel_imo: vessel.imo,
        receiving_vessel_name: vessel.name,
        operation_date: dateStr,
        start_time: `${String(startHour).padStart(2, "0")}:00`,
        end_time: `${String((startHour + Math.floor(durationMin / 60)) % 24).padStart(2, "0")}:${String(durationMin % 60).padStart(2, "0")}`,
        duration_minutes: durationMin,
        location: pick(LOCATIONS),
        latitude: null,
        longitude: null,
        operation_type: opLabel.type,
        raw_operation_label: opLabel.label,
        source_provider: "demo",
        source_record_id: null,
        confidence: "high",
        created_at: date.toISOString(),
        updated_at: date.toISOString(),
      })
    }
  }

  return { competitors, barges, vessels, operations }
}
