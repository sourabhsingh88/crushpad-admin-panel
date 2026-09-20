import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Shield, Lock, Mail, KeyRound, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../api/client';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCredentials, loginWithSecretKey } = useAuth();

  const [mode, setMode] = useState<'credentials' | 'secretKey'>('credentials');
  const [email, setEmail] = useState('admin@crushpad.app');
  const [password, setPassword] = useState('Admin@12345');
  const [secretKey, setSecretKeyInput] = useState(() => {
    return import.meta.env.VITE_ADMIN_SECRET_KEY || 'crushpad-admin-secret-key-2026';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'credentials') {
        await loginWithCredentials(email, password);
      } else {
        await loginWithSecretKey(secretKey);
      }
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Login failed. Please check credentials or backend status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#090d16] relative overflow-hidden">
      {/* Background glow accents */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card */}
        <div className="bg-[#0f172a]/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl shadow-black/80">
          {/* Logo & Title */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-600 flex items-center justify-center shadow-xl shadow-rose-500/25 mb-4 ring-4 ring-rose-500/10">
              <Flame className="w-9 h-9 fill-white text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>CrushPad</span>
              <span className="text-xs uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Admin
              </span>
            </h1>
            <p className="text-slate-400 text-xs mt-1">Platform Operations & Cloudflare R2 Control</p>
            <p className="text-[11px] text-cyan-400 font-mono mt-1 px-2.5 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-800/40">
              API: {API_BASE_URL}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-900/80 rounded-xl mb-6 border border-slate-800/60">
            <button
              type="button"
              onClick={() => { setMode('credentials'); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'credentials'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Account Login
            </button>
            <button
              type="button"
              onClick={() => { setMode('secretKey'); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'secretKey'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Secret Key
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@crushpad.app"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Platform Secret Key (X-Admin-Key)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-amber-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={secretKey}
                    onChange={(e) => setSecretKeyInput(e.target.value)}
                    placeholder="Enter admin secret key"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Configured in <code className="text-rose-400">application.properties</code> as <code className="text-slate-300">app.admin.secret-key</code>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span>Authenticating with Backend...</span>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  <span>Enter Control Center</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Fill Credentials Helper */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Default Credentials Ready</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              admin@crushpad.app • Admin@12345
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
