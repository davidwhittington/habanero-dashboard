import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Activate() {
  const [params] = useSearchParams();
  const prefillCode = params.get('code') || '';
  const navigate = useNavigate();

  // 4 groups of 4 characters each
  const [groups, setGroups] = useState<string[]>(() => {
    if (prefillCode) {
      const parts = prefillCode.replace('HAB-', '').split('-');
      return parts.length === 4 ? parts : ['', '', '', ''];
    }
    return ['', '', '', ''];
  });

  const [activating, setActivating] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string; site?: string; consultant?: string } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Auto-focus first empty group
    const firstEmpty = groups.findIndex(g => g.length < 4);
    if (firstEmpty >= 0) inputRefs.current[firstEmpty]?.focus();
  }, []);

  const handleGroupChange = (index: number, value: string) => {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    const newGroups = [...groups];
    newGroups[index] = clean;
    setGroups(newGroups);

    // Auto-advance to next group when 4 chars entered
    if (clean.length === 4 && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all groups filled
    if (index === 3 && clean.length === 4 && newGroups.every(g => g.length === 4)) {
      handleActivate(newGroups);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && groups[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === '-' || e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
      if (index < 3) inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9-]/g, '');
    const parts = pasted.replace('HAB-', '').split('-');
    if (parts.length === 4) {
      setGroups(parts.map(p => p.slice(0, 4)));
      if (parts.every(p => p.length === 4)) {
        handleActivate(parts);
      }
    }
  };

  const handleActivate = async (codeGroups: string[]) => {
    const code = `HAB-${codeGroups.join('-')}`;
    setActivating(true);
    setResult(null);

    try {
      const res = await fetch('https://api.ipvegan.com/api/v1/fleet/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          device_id: `dashboard-${Date.now()}`,
          hostname: 'dashboard-user',
        }),
      });
      const data = await res.json();
      setResult({
        ok: data.ok,
        message: data.message || data.error?.message || 'Unknown error',
        site: data.site_name,
        consultant: data.consultant,
      });

      if (data.ok) {
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    } catch {
      setResult({ ok: false, message: 'Cannot reach API. Check your connection.' });
    }

    setActivating(false);
  };

  const isComplete = groups.every(g => g.length === 4);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-900 rounded-2xl p-10 max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-orange-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6">🌶</div>

        <h1 className="text-2xl font-bold mb-2">Activate Agent</h1>
        <p className="text-gray-400 mb-8">Enter the activation code displayed on your agent's console.</p>

        {/* Code input: HAB- [____] - [____] - [____] - [____] */}
        <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
          <span className="text-gray-500 font-mono text-lg font-bold">HAB</span>
          <span className="text-gray-600">-</span>
          {groups.map((group, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                value={group}
                onChange={(e) => handleGroupChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                maxLength={4}
                className="w-20 bg-gray-800 border-2 border-gray-700 rounded-lg px-3 py-3 text-white text-center font-mono text-xl tracking-widest focus:outline-none focus:border-orange-500 uppercase"
                placeholder="····"
              />
              {i < 3 && <span className="text-gray-600">-</span>}
            </div>
          ))}
        </div>

        {/* Status */}
        {activating && (
          <div className="flex items-center justify-center gap-2 text-orange-400 mb-4">
            <div className="w-4 h-4 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" />
            Activating...
          </div>
        )}

        {result && (
          <div className={`rounded-xl p-4 mb-4 ${result.ok ? 'bg-green-950/50 border border-green-800' : 'bg-red-950/50 border border-red-800'}`}>
            {result.ok ? (
              <>
                <p className="text-green-400 font-semibold text-lg mb-1">✓ Activated!</p>
                <p className="text-gray-300">Site: {result.site}</p>
                <p className="text-gray-400 text-sm">Connected to {result.consultant}'s fleet</p>
                <p className="text-gray-500 text-xs mt-2">Redirecting to dashboard...</p>
              </>
            ) : (
              <p className="text-red-400">{result.message}</p>
            )}
          </div>
        )}

        {!activating && !result && (
          <button
            onClick={() => handleActivate(groups)}
            disabled={!isComplete}
            className="bg-orange-600 hover:bg-orange-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Activate
          </button>
        )}

        <p className="text-gray-600 text-xs mt-6">
          Don't have a code? Ask your IT consultant to generate one from their Habanero dashboard.
        </p>
      </div>
    </div>
  );
}
