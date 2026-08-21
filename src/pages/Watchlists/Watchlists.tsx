import { useState } from "react"
import { Plus } from "lucide-react"
import PageHeader from "@/components/ui/PageHeader"

interface LocalWatchlist {
  id: string
  name: string
  description: string
}

export default function Watchlists() {
  const [watchlists, setWatchlists] = useState<LocalWatchlist[]>([])
  const [name, setName] = useState("")

  const add = () => {
    if (!name.trim()) return
    setWatchlists((w) => [...w, { id: `wl_${Date.now()}`, name: name.trim(), description: "" }])
    setName("")
  }

  return (
    <div>
      <PageHeader
        title="Watchlists"
        subtitle="Group barges or vessels you want to monitor closely."
        actions={
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Watchlist name…"
              className="bg-ink-800 border border-ink-600 rounded px-2.5 py-1.5 text-xs focus-ring"
            />
            <button
              onClick={add}
              className="flex items-center gap-1.5 rounded bg-signal-bunker/15 border border-signal-bunker/40 text-signal-bunker px-3 py-1.5 text-xs hover:bg-signal-bunker/25 transition-colors focus-ring"
            >
              <Plus size={13} /> Create
            </button>
          </div>
        }
      />
      <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {watchlists.map((w) => (
          <div key={w.id} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
            <div className="font-display text-base">{w.name}</div>
            <div className="mt-2 text-xs text-paper-500">No items added yet.</div>
          </div>
        ))}
        {watchlists.length === 0 && (
          <div className="text-sm text-paper-500 col-span-full">
            No watchlists yet — e.g. "Fujairah Competitors" or "High Activity Barges".
          </div>
        )}
      </div>
    </div>
  )
}
