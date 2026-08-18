import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NetworkProvider } from './context/NetworkContext';
import { NotificationProvider } from './context/NotificationContext';
import { BackNavigationProvider } from './context/BackNavigationContext';
import { EscrowProvider } from './context/EscrowContext';
import ErrorBoundary from './components/ErrorBoundary';
import TransactionReceiptModal from './components/TransactionReceiptModal';
import AppLayout from './components/AppLayout';

// Core Application Pages (Phase 1)
import OverviewPage from './pages/OverviewPage';
import CropPlanningPage from './pages/CropPlanningPage';
import FraudDetectionPage from './pages/FraudDetectionPage';
import MarketplacePage from './pages/MarketplacePage';
import VoiceCopilotPage from './pages/VoiceCopilotPage';
import SatellitePage from './pages/SatellitePage';
import WeatherPage from './pages/WeatherPage';
import SimulatorPage from './pages/SimulatorPage';
import ArbitragePage from './pages/ArbitragePage';
import BuyerDashboardPage from './pages/BuyerDashboardPage';
import LoginPage from './pages/LoginPage';

// Phase 2 Expansion Pages
import SchemesPage from './pages/SchemesPage';
import FinancePage from './pages/FinancePage';
import DiagnosePage from './pages/DiagnosePage';
import IrrigationPage from './pages/IrrigationPage';
import RentalsPage from './pages/RentalsPage';
import CalendarPage from './pages/CalendarPage';
import CommunityPage from './pages/CommunityPage';
import LivestockPage from './pages/LivestockPage';

// Supabase & Payment Integration Page
import PaymentPage from './pages/PaymentPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <NetworkProvider>
            <NotificationProvider>
              <EscrowProvider>
                <HashRouter>
                  <BackNavigationProvider>
                    <Routes>
                      {/* Main Application Shell */}
                      <Route path="/" element={<AppLayout />}>
                        <Route index element={<Navigate to="/overview" replace />} />
                      
                        {/* Core Routes */}
                        <Route path="overview" element={<OverviewPage />} />
                        <Route path="crop-planning" element={<CropPlanningPage />} />
                        <Route path="fraud-detection" element={<FraudDetectionPage />} />
                        <Route path="trust-shield" element={<Navigate to="/fraud-detection" replace />} />
                        <Route path="marketplace" element={<MarketplacePage />} />
                        <Route path="copilot" element={<VoiceCopilotPage />} />
                        <Route path="satellite" element={<SatellitePage />} />
                        <Route path="weather" element={<WeatherPage />} />
                        <Route path="simulator" element={<SimulatorPage />} />
                        <Route path="arbitrage" element={<ArbitragePage />} />
                        
                        {/* Phase 2 New Routes */}
                        <Route path="schemes" element={<SchemesPage />} />
                        <Route path="finance" element={<FinancePage />} />
                        <Route path="diagnose" element={<DiagnosePage />} />
                        <Route path="irrigation" element={<IrrigationPage />} />
                        <Route path="rentals" element={<RentalsPage />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="community" element={<CommunityPage />} />
                        <Route path="livestock" element={<LivestockPage />} />
                        
                        {/* Payment & Escrow */}
                        <Route path="payment" element={<PaymentPage />} />
                        
                        {/* Dashboards & Auth */}
                        <Route path="farmer-dashboard" element={<OverviewPage />} />
                        <Route path="buyer-dashboard" element={<BuyerDashboardPage />} />
                        <Route path="login" element={<LoginPage />} />
                        
                        {/* Legacy Aliases */}
                        <Route path="direct-market" element={<Navigate to="/marketplace" replace />} />
                        <Route path="heatmap" element={<Navigate to="/satellite" replace />} />
                        <Route path="what-if" element={<Navigate to="/simulator" replace />} />
                        <Route path="markets" element={<Navigate to="/arbitrage" replace />} />
                        <Route path="crop-health" element={<Navigate to="/satellite" replace />} />
                        <Route path="dashboard/farmer" element={<Navigate to="/farmer-dashboard" replace />} />
                        <Route path="dashboard/buyer" element={<Navigate to="/buyer-dashboard" replace />} />
                        
                        <Route path="*" element={<Navigate to="/overview" replace />} />
                      </Route>
                    </Routes>
                    <TransactionReceiptModal />
                  </BackNavigationProvider>
                </HashRouter>
              </EscrowProvider>
            </NotificationProvider>
          </NetworkProvider>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
