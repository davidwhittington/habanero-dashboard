import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE || 'https://api.ipvegan.com/api/v1';

interface FleetSession {
  user: {
    id: string;
    email: string;
    name: string;
    avatar: string;
    provider: string;
  };
  api_key: string;
  tier: string;
}

/**
 * After Supabase auth, exchange the JWT for a fleet API key.
 * The API key is stored in localStorage and used for all fleet API calls.
 * The Supabase JWT is used only for this initial exchange.
 */
export async function establishFleetSession(): Promise<FleetSession | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  try {
    const res = await fetch(`${API_BASE}/fleet/auth/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await res.json();
    if (data.ok && data.api_key) {
      // Store the fleet API key for subsequent calls
      localStorage.setItem('habanero_api_key', data.api_key);
      localStorage.setItem('habanero_user', JSON.stringify(data.user));
      localStorage.setItem('habanero_tier', data.tier);
      return data;
    }
  } catch (e) {
    console.error('Failed to establish fleet session:', e);
  }

  return null;
}

/**
 * Get the current fleet API key (from Supabase session exchange or direct entry).
 */
export function getFleetApiKey(): string {
  return localStorage.getItem('habanero_api_key') || '';
}

/**
 * Get the current user info (from Supabase session exchange).
 */
export function getFleetUser(): FleetSession['user'] | null {
  const raw = localStorage.getItem('habanero_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

/**
 * Clear all session data.
 */
export function clearSession() {
  localStorage.removeItem('habanero_api_key');
  localStorage.removeItem('habanero_user');
  localStorage.removeItem('habanero_tier');
}
