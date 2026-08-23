import { useEffect, useMemo, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import { Radio, Key } from "lucide-react"
import { getDataProvider } from "@/services/data"
import { AisStreamClient, type LiveAisContact } from "@/services/ais/aisStreamClient"
import { getAisStreamKey, setAisStreamKey, clearAisStreamKey } from "@/services/ais/apiKeyStorage"
import PageHeader from "@/components/ui/PageHeader"

// Default marker icons need explicit URLs when bundled — Leaflet's CSS
// asset resolution doesn't work through Vite without this.
const bargeIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:12px;height:12px;border-radius:50%;background:#4FD1C5;border:2px solid #0B1220;box-shadow:0 0 0 2px #4FD1C5;"></div>`,
  iconSize: [12, 12],
})

const FUJAIRAH_CENTER: [number, number] = [25.25, 56.6]

export default function LiveMap() {
  const provider = getDataProvider()
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })

  const [apiKey, setApiKeyState] = useState(() => getAisStreamKey() ?? "")
  const [keyInput, setKeyInput] = useState("")
  const [status, setStatus] = useState<"idle" | "connecting" | "connected" | "error" | "closed">("idle")
  const [contacts, setContacts] = useState<Map<number, LiveAisContact>>(new Map())
  const clientRef = useRef<AisStreamClient | null>(null)

  const bargeByImo = useMemo(() => new Map(barges.map((b) => [b.imo, b])), [barges])
  const competitorById = useMemo(() => new Map(competitors.map((c) => [c.id, c])), [competitors])

  useEffect(() => {
    if (!apiKey) return
    const client = new AisStreamClient(apiKey)
    clientRef.current = client
    const unsubStatus = client.onStatus((s) => setStatus(s))
    const unsubContact = client.onContact((c) => {
      setContacts((prev) => {
        const next = new Map(prev)
        next.set(c.mmsi, c)
        return next
      })
    })
    client.connect()
    return () => {
      unsubStatus()
      unsubContact()
      client.disconnect()
    }
  }, [apiKey])

  const trackedContacts = useMemo(
    () => [...contacts.values()].filter((c) => c.imo && bargeByImo.has(c.imo)),
    [contacts, bargeByImo]
  )
  const untrackedCount = contacts.size - trackedContacts.length

  const saveKey = () => {
    if (!keyInput.trim()) return
    setAisStreamKey(keyInput.trim())
    setApiKeyState(keyInput.trim())
    setKeyInput("")
  }

  const disconnect = () => {
    clientRef.current?.disconnect()
    clearAisStreamKey()
    setApiKeyState("")
    setContacts(new Map())
    setStatus("idle")
  }

  return (
    <div>
      <PageHeader
        title="Live Map"
        subtitle="Real-time AIS positions for tracked competitor barges around Fujairah, via AISStream.io."
        actions={
          apiKey ? (
            <div className="flex items-center gap-2 text-xs">
              <StatusDot status={status} />
              <span className="text-paper-500 font-mono">{status}</span>
              <button onClick={disconnect} className="ml-2 rounded border border-ink-600 px-2.5 py-1 text-paper-300 hover:bg-ink-800">
                Disconnect
              </button>
            </div>
          ) : undefined
        }
      />

      <div className="px-6 pb-10">
        {!apiKey && (
          <div className="rounded-lg border border-ink-700 bg-ink-900 p-5 max-w-lg">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Key size={14} className="text-signal-bunker" /> Connect AISStream.io
            </div>
            <p className="mt-1.5 text-xs text-paper-500">
              Live positions require a free AISStream.io API key. Get one at{" "}
              <a href="https://aisstream.io" target="_blank" rel="noreferrer" className="text-signal-bunker hover:underline">
                aisstream.io
              </a>{" "}
              — it's stored only in this browser, never sent anywhere but AISStream itself.
            </p>
            <div className="mt-3 flex gap-2">
              <input
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveKey()}
                placeholder="AISStream API key…"
                type="password"
                className="flex-1 bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-xs focus-ring"
              />
              <button
                onClick={saveKey}
                className="rounded bg-signal-bunker text-ink-950 px-3 py-1.5 text-xs font-medium"
              >
                Connect
              </button>
            </div>
          </div>
        )}

        {apiKey && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 rounded-lg border border-ink-700 overflow-hidden h-[560px]">
              <MapContainer center={FUJAIRAH_CENTER} zoom={9} style={{ height: "100%", width: "100%", background: "#0B1220" }}>
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {trackedContacts.map((c) => {
                  const barge = bargeByImo.get(c.imo!)
                  const competitor = barge ? competitorById.get(barge.competitor_id) : undefined
                  return (
                    <Marker key={c.mmsi} position={[c.latitude, c.longitude]} icon={bargeIcon}>
                      <Popup>
                        <div style={{ fontSize: 12 }}>
                          <strong>{barge?.name ?? c.name}</strong>
                          <br />
                          {competitor?.name}
                          <br />
                          IMO {c.imo} · MMSI {c.mmsi}
                          <br />
                          SOG {c.speedOverGround ?? "N/A"} kn
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>
            </div>

            <div className="rounded-lg border border-ink-700 bg-ink-900 p-4">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-3">
                <Radio size={12} /> Tracked Barges Live
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
                {trackedContacts.length === 0 && (
                  <p className="text-xs text-paper-500">
                    {status === "connected"
                      ? "Waiting for AIS reports from tracked barges in range…"
                      : "Connecting…"}
                  </p>
                )}
                {trackedContacts.map((c) => {
                  const barge = bargeByImo.get(c.imo!)
                  return (
                    <div key={c.mmsi} className="border-b border-ink-800 pb-2">
                      <div className="text-sm">{barge?.name}</div>
                      <div className="text-[11px] text-paper-500 font-mono">
                        SOG {c.speedOverGround ?? "N/A"} kn · {new Date(c.lastUpdate).toLocaleTimeString()}
                      </div>
                    </div>
                  )
                })}
              </div>
              {untrackedCount > 0 && (
                <p className="mt-3 text-[11px] text-paper-500">
                  +{untrackedCount} other AIS contacts in range not matched to a tracked barge.
                </p>
              )}
            </div>
          </div>
        )}

        <p className="mt-4 text-[11px] text-paper-500 max-w-2xl">
          This shows live position only — it does not detect or record STS bunkering events. Matching happens by
          IMO, reported in each vessel's AIS static data, which can take a few minutes to arrive after connecting.
        </p>
      </div>
    </div>
  )
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "connected" ? "bg-signal-ok" : status === "connecting" ? "bg-signal-warn" : "bg-signal-crit"
  return <span className={`inline-block h-2 w-2 rounded-full ${color}`} />
}
