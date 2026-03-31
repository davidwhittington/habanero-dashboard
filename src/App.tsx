import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Tickets from './pages/Tickets';
import FleetHealth from './pages/FleetHealth';
import AgentManager from './pages/AgentManager';
import MeshMonitor from './pages/MeshMonitor';
import ClientPortal from './pages/ClientPortal';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Activate from './pages/Activate';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<Activate />} />
        <Route path="/portal" element={<ClientPortal />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/fleet" element={<FleetHealth />} />
        <Route path="/agents" element={<AgentManager />} />
        <Route path="/mesh" element={<MeshMonitor />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
