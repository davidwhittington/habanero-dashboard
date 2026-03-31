const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.ipvegan.com/api/v1';

async function fetchJSON<T>(path: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('habanero_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  // Auth
  login: (email: string) => fetchJSON('/auth/magic-link', { method: 'POST', body: JSON.stringify({ email }) }),
  verify: (token: string) => fetchJSON(`/auth/verify?token=${token}`),

  // Fleet
  fleetDevices: () => fetchJSON('/fleet/devices'),
  fleetHealth: () => fetchJSON('/fleet/health'),
  fleetDevice: (id: string) => fetchJSON(`/fleet/devices/${id}`),
  registerDevice: (data: any) => fetchJSON('/fleet/devices', { method: 'POST', body: JSON.stringify(data) }),

  // Tickets
  tickets: () => fetchJSON('/tickets'),
  ticket: (id: string) => fetchJSON(`/tickets/${id}`),
  createTicket: (data: any) => fetchJSON('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  addMessage: (id: string, msg: any) => fetchJSON(`/tickets/${id}/messages`, { method: 'POST', body: JSON.stringify(msg) }),

  // Agents
  agents: () => fetchJSON('/agents'),
  agent: (id: string) => fetchJSON(`/agents/${id}`),
  agentConfig: (id: string, config: any) => fetchJSON(`/agents/${id}/config`, { method: 'PUT', body: JSON.stringify(config) }),

  // Mesh
  meshMatrix: () => fetchJSON('/mesh/matrix'),
  meshPeers: () => fetchJSON('/mesh/peers'),
  meshHistory: (src: string, dst: string) => fetchJSON(`/mesh/history?src=${src}&dst=${dst}`),

  // Alerts
  alerts: () => fetchJSON('/alerts'),
  alertRules: () => fetchJSON('/alerts/rules'),

  // Reports
  reports: () => fetchJSON('/reports'),
  generateReport: (data: any) => fetchJSON('/reports', { method: 'POST', body: JSON.stringify(data) }),

  // Client portal (no auth needed, ticket+email)
  clientTicket: (ticketNumber: string, email: string) => fetchJSON(`/portal/ticket?number=${ticketNumber}&email=${email}`),
  clientAddMessage: (ticketNumber: string, email: string, msg: string) => fetchJSON('/portal/message', { method: 'POST', body: JSON.stringify({ ticketNumber, email, message: msg }) }),
};
