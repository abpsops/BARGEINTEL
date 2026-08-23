export interface LiveAisContact {
  mmsi: number
  imo: string | null
  name: string | null
  latitude: number
  longitude: number
  speedOverGround: number | null
  courseOverGround: number | null
  navigationalStatus: number | null
  lastUpdate: number // epoch ms
}

type ContactListener = (contact: LiveAisContact) => void
type StatusListener = (status: "connecting" | "connected" | "error" | "closed") => void

// Same bounding box used in FLOW's Fujairah live tracking.
const FUJAIRAH_BBOX: [[number, number], [number, number]] = [
  [24.8, 56.0],
  [25.7, 57.2],
]

/**
 * Thin wrapper around the AISStream.io WebSocket feed. AISStream sends two
 * message types we care about: PositionReport (lat/lon/speed, keyed by
 * MMSI only) and ShipStaticData (IMO, name, keyed by MMSI) — so IMO
 * matching against our tracked barge fleet requires joining both message
 * types by MMSI, not just filtering PositionReport in isolation.
 */
export class AisStreamClient {
  private ws: WebSocket | null = null
  private contactListeners = new Set<ContactListener>()
  private statusListeners = new Set<StatusListener>()
  private mmsiToStatic = new Map<number, { imo: string | null; name: string | null }>()

  constructor(private apiKey: string) {}

  onContact(fn: ContactListener) {
    this.contactListeners.add(fn)
    return () => this.contactListeners.delete(fn)
  }

  onStatus(fn: StatusListener) {
    this.statusListeners.add(fn)
    return () => this.statusListeners.delete(fn)
  }

  connect() {
    this.emitStatus("connecting")
    this.ws = new WebSocket("wss://stream.aisstream.io/v0/stream")

    this.ws.onopen = () => {
      this.emitStatus("connected")
      this.ws?.send(
        JSON.stringify({
          APIKey: this.apiKey,
          BoundingBoxes: [FUJAIRAH_BBOX],
          FilterMessageTypes: ["PositionReport", "ShipStaticData"],
        })
      )
    }

    this.ws.onmessage = async (event) => {
      // AISStream can send binary Blob frames — decode before JSON.parse.
      const text = event.data instanceof Blob ? await event.data.text() : event.data
      let msg: any
      try {
        msg = JSON.parse(text)
      } catch {
        return
      }
      this.handleMessage(msg)
    }

    this.ws.onerror = () => this.emitStatus("error")
    this.ws.onclose = () => this.emitStatus("closed")
  }

  disconnect() {
    this.ws?.close()
    this.ws = null
  }

  private handleMessage(msg: any) {
    const mmsi = msg?.MetaData?.MMSI
    if (!mmsi) return

    if (msg.MessageType === "ShipStaticData") {
      const data = msg.Message?.ShipStaticData
      const imoRaw = data?.ImoNumber
      this.mmsiToStatic.set(mmsi, {
        imo: imoRaw && imoRaw > 0 ? String(imoRaw) : null,
        name: msg.MetaData?.ShipName?.trim() || null,
      })
      return
    }

    if (msg.MessageType === "PositionReport") {
      const pos = msg.Message?.PositionReport
      if (!pos) return
      const known = this.mmsiToStatic.get(mmsi)
      const contact: LiveAisContact = {
        mmsi,
        imo: known?.imo ?? null,
        name: known?.name ?? msg.MetaData?.ShipName?.trim() ?? null,
        latitude: msg.MetaData?.latitude ?? pos.Latitude,
        longitude: msg.MetaData?.longitude ?? pos.Longitude,
        speedOverGround: pos.Sog ?? null,
        courseOverGround: pos.Cog ?? null,
        navigationalStatus: pos.NavigationalStatus ?? null,
        lastUpdate: Date.now(),
      }
      this.contactListeners.forEach((fn) => fn(contact))
    }
  }

  private emitStatus(s: Parameters<StatusListener>[0]) {
    this.statusListeners.forEach((fn) => fn(s))
  }
}
