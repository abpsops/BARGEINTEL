import { NavLink, Outlet } from "react-router-dom"
import { useState } from "react"
import { Anchor, LayoutDashboard, Radar, Building2, Sailboat, FileBarChart, Search } from "lucide-react"
import { getDataProvider } from "@/services/data"
import GlobalSearch from "@/components/layout/GlobalSearch"

const NAV_SECTIONS: {
  label: string
  items: { to: string; label: string; icon: React.ElementType }[]
}[] = [
  { label: "", items: [{ to: "/", label: "Dashboard", icon: LayoutDashboard }] },
  {
    label: "Intelligence",
    items: [{ to: "/sts-analysis", label: "Competitor Analysis", icon: Radar }],
  },
  {
    label: "Fleet",
    items: [
      { to: "/competitors", label: "Competitors", icon: Building2 },
      { to: "/barges", label: "Barges", icon: Sailboat },
    ],
  },
  {
    label: "Reports",
    items: [{ to: "/reports", label: "Reports", icon: FileBarChart }],
  },
]

export default function DashboardLayout() {
  const provider = getDataProvider()
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <div className="flex h-screen bg-ink-950 text-paper-100">
      <aside className="w-60 shrink-0 border-r border-ink-700 bg-ink-900 flex flex-col">
        <div className="px-5 py-5">
          <div className="flex items-center gap-2">
            <Anchor className="text-brand-600" size={20} strokeWidth={2} />
            <span className="font-display text-lg tracking-tight">BunkerWatch</span>
          </div>
          <p className="mt-1 text-[11px] text-paper-500 font-mono leading-tight">
            Competitor STS Intelligence
          </p>
        </div>
        <div className="mx-5 h-px bg-ink-700" />

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-5">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i}>
              {section.label && (
                <div className="px-2 mb-1.5 text-xs font-medium text-paper-500">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === "/"}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors focus-ring ${
                        isActive
                          ? "bg-ink-700 text-paper-100"
                          : "text-paper-300 hover:bg-ink-800 hover:text-paper-100"
                      }`
                    }
                  >
                    <item.icon size={15} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {provider.isDemo && (
          <div className="mx-3 mb-3 rounded-md border border-signal-warn/40 bg-signal-warn/10 px-2.5 py-2 text-[11px] text-signal-warn font-mono">
            DEMO DATA — no Supabase connected
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 shrink-0 border-b border-ink-700 flex items-center justify-between px-6 bg-ink-900/60 backdrop-blur">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 rounded-md border border-ink-600 bg-ink-800 px-3 py-1.5 text-sm text-paper-500 hover:text-paper-300 hover:border-ink-500 transition-colors w-80 focus-ring"
          >
            <Search size={14} />
            <span>Search vessel, IMO, barge, competitor…</span>
            <kbd className="ml-auto text-[10px] font-mono border border-ink-600 rounded-md px-1">/</kbd>
          </button>
          <div className="h-7 w-7 rounded-full bg-ink-700 flex items-center justify-center text-xs font-mono text-paper-300">
            OP
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
