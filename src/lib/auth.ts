import { createContext, useContext } from 'react';
import type { User, Session } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}
