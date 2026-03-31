import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/dashboard';
  const [showKeyLogin, setShowKeyLogin] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleGoogle = async () => {
    setLoading('google');
    setError('');
    const { error } = await auth.signInWithGoogle();
    if (error) { setError(error.message); setLoading(''); }
  };

  const handleApple = async () => {
    setLoading('apple');
    setError('');
    const { error } = await auth.signInWithApple();
    if (error) { setError(error.message); setLoading(''); }
  };

  const handleSSO = async () => {
    setLoading('sso');
    setError('');
    const { error } = await auth.signInWithAzure();
    if (error) { setError(error.message); setLoading(''); }
  };

  const handleMagicLink = async () => {
    if (!email) return;
    setLoading('magic');
    setError('');
    const { error } = await auth.signInWithMagicLink(email);
    if (error) { setError(error.message); setLoading(''); }
    else { setSent(true); setLoading(''); }
  };

  const handleKeyLogin = () => {
    if (apiKey) {
      localStorage.setItem('habanero_api_key', apiKey);
      navigate(redirect);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">📧</div>
          <h2 className="text-2xl font-bold mb-2">Check your email</h2>
          <p className="text-gray-400 mb-6">We sent a sign-in link to <span className="text-white font-medium">{email}</span></p>
          <button onClick={() => setSent(false)} className="text-orange-400 text-sm hover:underline">Use a different email</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-10 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-4">🌶</div>
          <h1 className="text-2xl font-bold">Habanero</h1>
          <p className="text-gray-400 mt-1">Network Diagnostics Platform</p>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-lg p-3 mb-4 text-red-400 text-sm">{error}</div>
        )}

        <div className="space-y-3 mb-6">
          <button onClick={handleGoogle} disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 rounded-lg hover:bg-gray-100 transition disabled:opacity-50">
            {loading === 'google' ? <Spinner /> : (
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            Continue with Google
          </button>

          <button onClick={handleApple} disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-black text-white font-medium py-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition disabled:opacity-50">
            {loading === 'apple' ? <Spinner /> : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
            )}
            Continue with Apple
          </button>

          <button onClick={handleSSO} disabled={!!loading}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-500 transition disabled:opacity-50">
            {loading === 'sso' ? <Spinner /> : '🔐'}
            Continue with SSO (Okta / Entra ID)
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-700"></div></div>
          <div className="relative flex justify-center"><span className="bg-gray-900 px-3 text-gray-500 text-sm">or</span></div>
        </div>

        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleMagicLink()}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-orange-500 mb-3" />
        <button onClick={handleMagicLink} disabled={!email || !!loading}
          className="w-full bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 rounded-lg transition mb-4">
          {loading === 'magic' ? 'Sending...' : 'Send Magic Link'}
        </button>

        <div className="text-center">
          <button onClick={() => setShowKeyLogin(!showKeyLogin)} className="text-gray-500 text-xs hover:text-gray-400">
            {showKeyLogin ? 'Hide' : 'Sign in with API key'}
          </button>
          {showKeyLogin && (
            <div className="mt-3">
              <input type="password" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleKeyLogin()}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-orange-500 mb-2" />
              <button onClick={handleKeyLogin} className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg text-sm transition">Connect</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Spinner() {
  return <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />;
}
