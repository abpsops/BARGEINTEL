import "leaflet/dist/leaflet.css"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "@/layouts/DashboardLayout"
import Dashboard from "@/pages/Dashboard/Dashboard"
import Competitors from "@/pages/Competitors/Competitors"
import Barges from "@/pages/Barges/Barges"
import STSAnalysis from "@/pages/STSAnalysis/STSAnalysis"
import VesselIntelligence from "@/pages/VesselIntelligence/VesselIntelligence"
import VesselOverlap from "@/pages/VesselOverlap/VesselOverlap"
import LiveMap from "@/pages/LiveMap/LiveMap"
import Import from "@/pages/Import/Import"
import DataQuality from "@/pages/DataQuality/DataQuality"
import Reports from "@/pages/Reports/Reports"
import Watchlists from "@/pages/Watchlists/Watchlists"
import Alerts from "@/pages/Alerts/Alerts"
import AuditLog from "@/pages/AuditLog/AuditLog"
import Settings from "@/pages/Settings/Settings"
import Login from "@/pages/Login/Login"
import { useAuth } from "@/hooks/useAuth"
import { isSupabaseConfigured } from "@/services/supabase/client"

export default function App() {
  return (
    <BrowserRouter basename="/BARGEINTEL/">
      <AuthGate>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/competitors" element={<Competitors />} />
            <Route path="/competitors/:id" element={<Competitors />} />
            <Route path="/barges" element={<Barges />} />
            <Route path="/sts-analysis" element={<STSAnalysis />} />
            <Route path="/vessel-intelligence" element={<VesselIntelligence />} />
            <Route path="/vessel-overlap" element={<VesselOverlap />} />
            <Route path="/live-map" element={<LiveMap />} />
            <Route path="/import" element={<Import />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/watchlists" element={<Watchlists />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/audit-log" element={<AuditLog />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthGate>
    </BrowserRouter>
  )
}

/**
 * Demo mode (no Supabase configured) never requires login — there's
 * nothing behind RLS to protect. Once Supabase is connected, every query
 * runs under Row Level Security scoped to the signed-in user's
 * organization, so an unauthenticated session sees nothing at all; this
 * gate is what makes that visible as "please sign in" instead of a
 * silently empty app.
 */
function AuthGate({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (!isSupabaseConfigured) return <>{children}</>
  if (loading) return null
  if (!isAuthenticated) return <Login />
  return <>{children}</>
}
