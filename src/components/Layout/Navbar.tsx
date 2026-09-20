import React from 'react';
import { Menu, Bell, Shield, Radio, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../api/client';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { secretKey, setSecretKey } = useAuth();

  const handleUpdateSecretKey = () => {
    const key = prompt('Update Admin Secret Key (X-Admin-Key):', secretKey);
    if (key !== null && key.trim()) {
      setSecretKey(key.trim());
      alert('Admin Secret Key updated successfully.');
    }
  };

  return (
    <header className="h-16 px-6 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide truncate max-w-[220px] sm:max-w-xs font-mono">
            Backend • {API_BASE_URL.replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Secret Key Action */}
        <button
          onClick={handleUpdateSecretKey}
          title="Inspect / Edit Admin Secret Key"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Admin Key</span>
        </button>

        {/* Cloudflare Storage Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
          <Radio className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cloudflare R2 Direct</span>
        </div>

        {/* Security Status */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20">
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span className="hidden sm:inline">Root Level Security</span>
        </div>
      </div>
    </header>
  );
};
