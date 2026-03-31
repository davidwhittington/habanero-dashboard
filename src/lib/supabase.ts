import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signInWithGoogle: () =>
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),

  signInWithApple: () =>
    supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),

  signInWithAzure: () =>
    supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'openid profile email',
      },
    }),

  // SAML SSO (Okta, Entra ID, OneLogin, etc.)
  // Customer's IT admin configures their IdP with Supabase SAML.
  // User enters their corporate email domain, Supabase routes to the right IdP.
  signInWithSSO: (domain: string) =>
    supabase.auth.signInWithSSO({
      domain,
      options: { redirectTo: `${window.location.origin}/dashboard` },
    }),

  signInWithMagicLink: (email: string) =>
    supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    }),

  signOut: () => supabase.auth.signOut(),

  getSession: () => supabase.auth.getSession(),

  getUser: () => supabase.auth.getUser(),

  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
};
