import { describe, it, expect } from "vitest"
import { isValidIMO } from "@/lib/imo"
import { normalizeOperationType } from "@/lib/normalizeOperation"
import { isWithinRange, resolvePreset } from "@/lib/dates"
import { fingerprintOperation } from "@/lib/fingerprint"

describe("isValidIMO", () => {
  it("accepts a structurally valid IMO with correct check digit", () => {
    // 9074729: 9*7+0*6+7*5+4*4+7*3+2*2 = 63+0+35+16+21+4 = 139 -> check digit 9
    expect(isValidIMO("9074729")).toBe(true)
  })

  it("rejects a 7-digit string with a wrong check digit", () => {
    expect(isValidIMO("9074720")).toBe(false)
  })

  it("rejects non-7-digit strings", () => {
    expect(isValidIMO("12345")).toBe(false)
    expect(isValidIMO("")).toBe(false)
    expect(isValidIMO(null)).toBe(false)
  })
})

describe("normalizeOperationType", () => {
  it("maps known bunkering labels to STS_BUNKERING", () => {
    expect(normalizeOperationType("STS Bunkering")).toBe("STS_BUNKERING")
    expect(normalizeOperationType("Bunkering")).toBe("STS_BUNKERING")
  })

  it("maps known supply labels to STS_SUPPLY", () => {
    expect(normalizeOperationType("STS Supply")).toBe("STS_SUPPLY")
    expect(normalizeOperationType("STS Fuel Supply")).toBe("STS_SUPPLY")
  })

  it("maps unknown labels to OTHER_STS rather than guessing", () => {
    expect(normalizeOperationType("Ship Repair Alongside")).toBe("OTHER_STS")
    expect(normalizeOperationType("")).toBe("OTHER_STS")
  })
})

describe("date range filtering", () => {
  it("is inclusive of both boundary dates", () => {
    expect(isWithinRange("2026-08-18", "2026-08-18", "2026-08-20")).toBe(true)
    expect(isWithinRange("2026-08-20", "2026-08-18", "2026-08-20")).toBe(true)
    expect(isWithinRange("2026-08-17", "2026-08-18", "2026-08-20")).toBe(false)
    expect(isWithinRange("2026-08-21", "2026-08-18", "2026-08-20")).toBe(false)
  })

  it("resolves last7 to a 7-day inclusive span ending today", () => {
    const { from, to } = resolvePreset("last7")
    const days = (new Date(to).getTime() - new Date(from).getTime()) / 86400000
    expect(days).toBe(6)
  })
})

describe("fingerprintOperation", () => {
  it("produces the same fingerprint for identical operations", () => {
    const base = {
      bargeImo: "9074729",
      operationDate: "2026-08-18",
      operationType: "STS_BUNKERING",
      receivingVesselImo: "9876543",
      location: "Fujairah",
      startTime: "08:00",
    }
    expect(fingerprintOperation(base)).toBe(fingerprintOperation({ ...base }))
  })

  it("differs when the receiving vessel differs, even with the same barge/date", () => {
    const base = {
      bargeImo: "9074729",
      operationDate: "2026-08-18",
      operationType: "STS_BUNKERING",
      receivingVesselImo: "9876543",
      location: "Fujairah",
      startTime: "08:00",
    }
    const other = { ...base, receivingVesselImo: "1111111" }
    expect(fingerprintOperation(base)).not.toBe(fingerprintOperation(other))
  })
})
