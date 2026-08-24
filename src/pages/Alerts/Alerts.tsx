import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Bell, BellOff } from "lucide-react"
import { getDataProvider } from "@/services/data"
import PageHeader from "@/components/ui/PageHeader"
import type { Alert } from "@/types"

/**
 * In-app alert rules. Persisted only in local component state for now — no
 * backend delivery mechanism exists yet (no email/WhatsApp/Teams sender is
 * wired up), matching spec section 32: build the architecture first, add
 * real notification channels once a backend worker exists to send them.
 */
export default function Alerts() {
  const provider = getDataProvider()
  const { data: competitors = [] } = useQuery({ queryKey: ["competitors"], queryFn: () => provider.getCompetitors() })
  const { data: barges = [] } = useQuery({ queryKey: ["barges"], queryFn: () => provider.getBarges() })

  const [alerts, setAlerts] = useState<Alert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [alertType, setAlertType] = useState<Alert["alert_type"]>("competitor_activity")
  const [targetId, setTargetId] = useState("")

  const createAlert = () => {
    if (!name.trim()) return
    setAlerts((prev) => [
      ...prev,
      {
        id: `alert_${Date.now()}`,
        organization_id: "demo-org",
        name: name.trim(),
        alert_type: alertType,
        conditions_json: targetId ? { targetId } : {},
        enabled: true,
        created_at: new Date().toISOString(),
      },
    ])
    setName("")
    setTargetId("")
    setShowForm(false)
  }

  const toggle = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)))
  }

  const targetLabel = (a: Alert) => {
    const id = (a.conditions_json as { targetId?: string })?.targetId
    if (!id) return "Any activity"
    if (a.alert_type === "competitor_activity") return competitors.find((c) => c.id === id)?.name ?? id
    if (a.alert_type === "barge_activity") return barges.find((b) => b.id === id)?.name ?? id
    return id
  }

  return (
    <div>
      <PageHeader
        title="Alerts"
        subtitle="Get notified when tracked competitors, barges, or vessels show new activity."
        actions={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 rounded bg-signal-bunker/15 border border-signal-bunker/40 text-signal-bunker px-3 py-1.5 text-xs hover:bg-signal-bunker/25 transition-colors focus-ring"
          >
            <Plus size={13} /> New Alert
          </button>
        }
      />

      <div className="px-6 pb-10">
        {showForm && (
          <div className="mb-4 rounded-lg border border-ink-700 bg-ink-900 p-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Fujairah competitor activity"
                className="bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-sm w-64"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">Trigger on</label>
              <select
                value={alertType}
                onChange={(e) => { setAlertType(e.target.value as Alert["alert_type"]); setTargetId("") }}
                className="bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-sm"
              >
                <option value="competitor_activity">Any competitor activity</option>
                <option value="barge_activity">Specific barge activity</option>
                <option value="vessel_activity">Specific vessel activity</option>
              </select>
            </div>
            {alertType === "competitor_activity" && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">Competitor</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-sm min-w-[180px]"
                >
                  <option value="">Any competitor</option>
                  {competitors.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            {alertType === "barge_activity" && (
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-paper-500 font-mono mb-1">Barge</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-sm min-w-[180px]"
                >
                  <option value="">Select barge…</option>
                  {barges.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}
            <button onClick={createAlert} className="rounded bg-signal-bunker text-ink-950 px-3 py-1.5 text-xs font-medium">
              Create Alert
            </button>
          </div>
        )}

        <div className="rounded-lg border border-ink-700 bg-ink-900 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 text-left text-[10px] uppercase tracking-wider text-paper-500 font-mono">
                <th className="px-4 py-2.5">Alert</th>
                <th className="px-4 py-2.5">Trigger</th>
                <th className="px-4 py-2.5">Target</th>
                <th className="px-4 py-2.5">Status</th>
                <th className="px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((a) => (
                <tr key={a.id} className="border-b border-ink-800">
                  <td className="px-4 py-2.5">{a.name}</td>
                  <td className="px-4 py-2.5 text-paper-300 text-xs">{a.alert_type.replace("_", " ")}</td>
                  <td className="px-4 py-2.5 text-paper-300 text-xs">{targetLabel(a)}</td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs ${a.enabled ? "text-signal-ok" : "text-paper-500"}`}>
                      {a.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button onClick={() => toggle(a.id)} className="text-paper-500 hover:text-paper-200 focus-ring">
                      {a.enabled ? <BellOff size={14} /> : <Bell size={14} />}
                    </button>
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-paper-500 text-sm">
                    No alerts configured yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[11px] text-paper-500 max-w-2xl">
          Alerts fire in-app only for now — email, WhatsApp and Teams delivery need a backend worker to send them,
          which isn't wired up yet.
        </p>
      </div>
    </div>
  )
}
