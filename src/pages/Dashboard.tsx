import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface FleetDevice {
  device_id: string;
  hostname: string;
  site_name: string;
  health_score: number;
  online: boolean;
  gateway: string;
  ip_address: string;
  os_version: string;
  agent_version: string;
  last_seen: string;
  last_diagnostic: {
    status: string;
    chain?: string;
    findings: any[];
    gateway: string;
    can_route: boolean;
    dns_works: boolean;
  } | null;
}

interface FleetResponse {
  ok: boolean;
  devices: FleetDevice[];
  total: number;
  online: number;
}

const API_KEY = localStorage.getItem('habanero_api_key') || '';

export default function Dashboard() {
  const [fleet, setFleet] = useState<FleetResponse | null>(null);
  const [error, setError] = useState('');
  const [key, setKey] = useState(API_KEY);
  const [loading, setLoading] = useState(false);

  const fetchFleet = async (apiKey: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://api.ipvegan.com/api/v1/fleet/devices', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const data = await res.json();
      if (data.ok) {
        setFleet(data);
        localStorage.setItem('habanero_api_key', apiKey);
      } else {
        setError(data.error?.message || 'Failed to load fleet');
      }
    } catch (e) {
      setError('Cannot reach API');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (key) fetchFleet(key);
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!key) return;
    const interval = setInterval(() => fetchFleet(key), 30000);
    return () => clearInterval(interval);
  }, [key]);

  if (!key || (!fleet && !loading)) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 rounded-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-2">Habanero Fleet</h1>
          <p className="text-gray-400 mb-6">Enter your API key to view your fleet.</p>
          <input
            type="password"
            placeholder="API Key (Bearer token)"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white mb-4 focus:outline-none focus:border-orange-500"
          />
          <button
            onClick={() => fetchFleet(key)}
            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition"
          >
            Connect
          </button>
          {error && <p className="text-red-400 mt-3 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  const devices = fleet?.devices || [];
  const online = devices.filter(d => d.online);
  const offline = devices.filter(d => !d.online);
  const avgHealth = devices.length > 0 ? Math.round(devices.reduce((s, d) => s + d.health_score, 0) / devices.length) : 0;
  const criticalDevices = devices.filter(d => d.health_score < 50);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-sm font-bold">H</div>
          <h1 className="text-xl font-bold">Habanero Fleet</h1>
        </div>
        <nav className="flex gap-6 text-sm">
          <Link to="/dashboard" className="text-orange-400 font-medium">Dashboard</Link>
          <Link to="/fleet" className="text-gray-400 hover:text-white">Fleet</Link>
          <Link to="/tickets" className="text-gray-400 hover:text-white">Tickets</Link>
          <Link to="/agents" className="text-gray-400 hover:text-white">Agents</Link>
          <Link to="/mesh" className="text-gray-400 hover:text-white">Mesh</Link>
        </nav>
        <div className="flex items-center gap-2">
          {loading && <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />}
          <span className="text-xs text-gray-500">Auto-refresh 30s</span>
        </div>
      </header>

      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <SummaryCard label="Total Devices" value={devices.length} color="white" />
          <SummaryCard label="Online" value={online.length} color="green" />
          <SummaryCard label="Offline" value={offline.length} color={offline.length > 0 ? 'red' : 'gray'} />
          <SummaryCard label="Avg Health" value={`${avgHealth}%`} color={avgHealth >= 80 ? 'green' : avgHealth >= 50 ? 'yellow' : 'red'} />
        </div>

        {/* Critical Alerts */}
        {criticalDevices.length > 0 && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-4 mb-8">
            <h3 className="text-red-400 font-semibold mb-2">Critical Devices</h3>
            {criticalDevices.map(d => (
              <div key={d.device_id} className="flex items-center gap-3 py-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="font-mono text-sm">{d.hostname}</span>
                <span className="text-gray-500 text-xs">{d.site_name}</span>
                <span className="text-red-400 text-sm ml-auto">Health: {d.health_score}%</span>
              </div>
            ))}
          </div>
        )}

        {/* Device Grid */}
        <h2 className="text-lg font-semibold mb-4">Fleet Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {devices.map(device => (
            <DeviceCard key={device.device_id} device={device} />
          ))}
        </div>

        {devices.length === 0 && !loading && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-4xl mb-4">📡</p>
            <p className="text-lg mb-2">No devices in fleet</p>
            <p className="text-sm">Generate an activation code to add your first agent.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colorMap: Record<string, string> = {
    white: 'text-white',
    green: 'text-green-400',
    red: 'text-red-400',
    yellow: 'text-yellow-400',
    gray: 'text-gray-500',
  };

  return (
    <div className="bg-gray-900 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-1">{label}</p>
      <p className={`text-3xl font-bold ${colorMap[color] || 'text-white'}`}>{value}</p>
    </div>
  );
}

function DeviceCard({ device }: { device: FleetDevice }) {
  const healthColor = device.health_score >= 80 ? 'bg-green-500' : device.health_score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  const statusDot = device.online ? 'bg-green-500' : 'bg-gray-600';
  const diag = device.last_diagnostic;
  const lastSeen = device.last_seen ? new Date(device.last_seen) : null;
  const ago = lastSeen ? Math.round((Date.now() - lastSeen.getTime()) / 1000) : null;

  return (
    <div className="bg-gray-900 rounded-xl p-5 hover:bg-gray-800/80 transition border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${statusDot}`} />
          <span className="font-semibold">{device.hostname}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-8 rounded-full ${healthColor}`} />
          <span className="text-sm font-mono">{device.health_score}</span>
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-y-2 text-sm">
        <Detail label="Site" value={device.site_name} />
        <Detail label="Gateway" value={device.gateway || '—'} />
        <Detail label="IP" value={device.ip_address || '—'} />
        <Detail label="OS" value={device.os_version || '—'} />
        <Detail label="Status" value={diag?.status || '—'} highlight={diag?.status === 'healthy' ? 'green' : 'red'} />
        <Detail label="Last seen" value={ago !== null ? (ago < 60 ? `${ago}s ago` : ago < 3600 ? `${Math.round(ago/60)}m ago` : `${Math.round(ago/3600)}h ago`) : '—'} />
      </div>

      {/* Findings */}
      {diag && diag.findings && diag.findings.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-500 mb-1">{diag.findings.length} finding(s)</p>
          {diag.findings.slice(0, 3).map((f: any, i: number) => (
            <p key={i} className="text-xs text-yellow-400 truncate">{f.severity}: {f.description}</p>
          ))}
        </div>
      )}

      {/* Chain */}
      {diag?.chain && (
        <p className="text-xs text-gray-600 mt-2 font-mono truncate">{diag.chain}</p>
      )}
    </div>
  );
}

function Detail({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  const hColor = highlight === 'green' ? 'text-green-400' : highlight === 'red' ? 'text-red-400' : 'text-gray-300';
  return (
    <div>
      <span className="text-gray-500 text-xs">{label}</span>
      <p className={`text-xs font-mono ${highlight ? hColor : 'text-gray-300'}`}>{value}</p>
    </div>
  );
}
