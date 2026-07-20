import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { VoterIdentification } from './pages/VoterIdentification';
import { VotingPage } from './pages/VotingPage';
import { VotingSuccess } from './pages/VotingSuccess';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminCargos } from './pages/AdminCargos';
import { AdminCandidatos } from './pages/AdminCandidatos';
import { AdminPlanchas } from './pages/AdminPlanchas';
import { AdminVotantes } from './pages/AdminVotantes';
import { AdminResults } from './pages/AdminResults';
import { AdminAuditoria } from './pages/AdminAuditoria';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/votar" element={<VoterIdentification />} />
        <Route path="/votar/candidatos" element={<VotingPage />} />
        <Route path="/votar/exito" element={<VotingSuccess />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/cargos" element={<AdminCargos />} />
        <Route path="/admin/candidatos" element={<AdminCandidatos />} />
        <Route path="/admin/planchas" element={<AdminPlanchas />} />
        <Route path="/admin/votantes" element={<AdminVotantes />} />
        <Route path="/admin/resultados" element={<AdminResults />} />
        <Route path="/admin/auditoria" element={<AdminAuditoria />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

