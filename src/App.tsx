import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import DashboardLayout from "@/layouts/DashboardLayout"
import Dashboard from "@/pages/Dashboard/Dashboard"
import Competitors from "@/pages/Competitors/Competitors"
import Barges from "@/pages/Barges/Barges"
import STSAnalysis from "@/pages/STSAnalysis/STSAnalysis"
import VesselIntelligence from "@/pages/VesselIntelligence/VesselIntelligence"
import VesselOverlap from "@/pages/VesselOverlap/VesselOverlap"
import Import from "@/pages/Import/Import"
import DataQuality from "@/pages/DataQuality/DataQuality"
import Reports from "@/pages/Reports/Reports"
import Watchlists from "@/pages/Watchlists/Watchlists"
import Settings from "@/pages/Settings/Settings"

export default function App() {
  return (
    <BrowserRouter basename="/BARGEINTEL/">
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/competitors" element={<Competitors />} />
          <Route path="/competitors/:id" element={<Competitors />} />
          <Route path="/barges" element={<Barges />} />
          <Route path="/sts-analysis" element={<STSAnalysis />} />
          <Route path="/vessel-intelligence" element={<VesselIntelligence />} />
          <Route path="/vessel-overlap" element={<VesselOverlap />} />
          <Route path="/import" element={<Import />} />
          <Route path="/data-quality" element={<DataQuality />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/watchlists" element={<Watchlists />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
