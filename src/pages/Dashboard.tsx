import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Image,
  HardDrive,
  Activity,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Server,
  Cloud,
  Database,
  ArrowUpRight,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { AdminApi } from '../api/client';
import { PlatformStatsDto } from '../types';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setError(null);
      const res = await AdminApi.getPlatformStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      setError('Unable to fetch platform statistics. Ensure backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // 15s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-rose-500 animate-spin" />
        <p className="text-sm text-slate-400">Loading Platform Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">Platform Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, user moderation, Cloudflare R2 storage, and banner control
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-rose-400' : ''}`} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Telemetry'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchStats} className="underline text-xs font-semibold">Retry</button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Users</span>
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{stats?.users?.totalUsers ?? 0}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                {stats?.users?.activeUsers ?? 0} Active
              </span>
              <span>•</span>
              <span className="text-rose-400 font-semibold">
                {stats?.users?.blockedUsers ?? 0} Blocked
              </span>
            </div>
          </div>
          <Link to="/users" className="absolute bottom-3 right-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Manage <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Verified Blue Tick Profiles */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Blue Tick Verified</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{stats?.users?.verifiedUsers ?? 0}</div>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-amber-400 font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{stats?.users?.pendingVerificationUsers ?? 0} Pending Review</span>
            </div>
          </div>
          <Link to="/users" className="absolute bottom-3 right-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Review <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Promotional Banners */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Banners</span>
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Image className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{stats?.banners?.totalBanners ?? 0}</div>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">
                {stats?.banners?.approvedBanners ?? 0} Approved
              </span>
              <span>•</span>
              <span className="text-amber-400 font-semibold">
                {stats?.banners?.pendingApprovalBanners ?? 0} Pending
              </span>
            </div>
          </div>
          <Link to="/banners" className="absolute bottom-3 right-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Studio <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cloudflare R2 Storage */}
        <div className="p-5 rounded-2xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Cloudflare R2</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <HardDrive className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-white">{stats?.storage?.totalFiles ?? 0} files</div>
            <div className="flex items-center gap-1 mt-1 text-xs text-purple-400 font-semibold font-mono">
              <span>{stats?.storage?.formattedTotalSize || '0 B'} stored</span>
            </div>
          </div>
          <Link to="/storage" className="absolute bottom-3 right-4 text-xs text-slate-400 hover:text-white flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Storage <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Two Column Section: Health & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System & Infrastructure Health */}
        <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl space-y-5 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">System Infrastructure</h2>
                <p className="text-xs text-slate-400">Oracle 11g DB, JVM Runtime, and Cloudflare R2 Connection</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              All Operational
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* DB Health */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-blue-400" />
                  Oracle 11g
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-sm font-bold text-slate-200">
                {stats?.health?.dbConnected ? 'Online & Synchronized' : 'Disconnected'}
              </div>
              <p className="text-[11px] text-slate-400">HikariCP Pool • Port 1521</p>
            </div>

            {/* Cloudflare Storage Health */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                  Cloudflare R2
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </div>
              <div className="text-sm font-bold text-slate-200">
                {stats?.health?.storageConnected ? 'Direct S3 Connected' : 'Local Fallback'}
              </div>
              <p className="text-[11px] text-slate-400">Zero-Egress Multi-region</p>
            </div>

            {/* JVM Memory */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-rose-400" />
                  JVM Memory
                </span>
                <span className="text-xs font-mono text-slate-300">
                  {stats?.health?.jvmHeapUsedMb ?? 0} MB
                </span>
              </div>
              <div className="text-sm font-bold text-slate-200">
                Max: {stats?.health?.jvmHeapMaxMb ?? 0} MB
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Uptime: {Math.floor((stats?.health?.jvmUptimeSeconds ?? 0) / 60)} mins
              </p>
            </div>
          </div>

          {/* Category breakdown for storage */}
          {stats?.storage?.categoryCount && (
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Cloudflare R2 Storage Allocation
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(stats.storage.categoryCount).map(([cat, count]) => (
                  <div key={cat} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
                    <span className="text-[11px] uppercase font-bold text-cyan-400">{cat}</span>
                    <div className="text-lg font-black text-white mt-0.5">{count} files</div>
                    <div className="text-[11px] text-slate-400">
                      {stats.storage.categoryFormattedSize?.[cat] || '0 B'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Operations Column */}
        <div className="p-6 rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Quick Operations</h2>
              <p className="text-xs text-slate-400">Immediate platform shortcuts</p>
            </div>
          </div>

          <div className="space-y-2.5">
            <Link
              to="/banners"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-rose-900/30 to-slate-900 border border-rose-500/30 hover:border-rose-500/60 transition-all text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Image className="w-4 h-4 text-rose-400" />
                <span className="text-xs font-bold">Upload Cloudflare Banner</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/users"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold">Review ID Verifications</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/storage"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <HardDrive className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold">Audit R2 Media Bucket</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/maintenance"
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-200 hover:text-white"
            >
              <div className="flex items-center gap-3">
                <Server className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold">Maintenance & Clear Cache</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
