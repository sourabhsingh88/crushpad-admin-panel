import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  ShieldBan,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  AlertCircle,
  ExternalLink,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AdminApi } from '../api/client';
import { AdminUserListItemDto, AdminUserDetailDto, Page } from '../types';

export const Users: React.FC = () => {
  const [usersPage, setUsersPage] = useState<Page<AdminUserListItemDto> | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // User detail modal state
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getUsers(query, statusFilter, page, 15);
      if (res.success && res.data) {
        setUsersPage(res.data);
      }
    } catch (err: any) {
      showToast('Failed to load users list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchUsers();
  };

  const handleViewDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const res = await AdminApi.getUserDetail(id);
      if (res.success && res.data) {
        setSelectedUser(res.data);
      }
    } catch (err) {
      showToast('Failed to load user details', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleBlockUser = async (id: number) => {
    if (!confirm(`Block user #${id}? They will not be able to log in or match.`)) return;
    try {
      await AdminApi.blockUser(id);
      showToast(`User #${id} blocked successfully.`);
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, isBlocked: true, active: false });
      }
    } catch (err) {
      showToast('Failed to block user', 'error');
    }
  };

  const handleUnblockUser = async (id: number) => {
    try {
      await AdminApi.unblockUser(id);
      showToast(`User #${id} unblocked.`);
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, isBlocked: false, active: true });
      }
    } catch (err) {
      showToast('Failed to unblock user', 'error');
    }
  };

  const handleApproveVerification = async (id: number) => {
    try {
      await AdminApi.approveUserVerification(id);
      showToast(`User #${id} verified with Blue Tick!`);
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, isVerified: true, documentStatus: 'APPROVED' });
      }
    } catch (err) {
      showToast('Failed to approve verification', 'error');
    }
  };

  const handleRejectVerification = async (id: number) => {
    const reason = prompt('Enter reason for document rejection:', 'Document unclear or invalid');
    if (reason === null) return;
    try {
      await AdminApi.rejectUserVerification(id, reason);
      showToast(`Verification rejected for user #${id}`);
      fetchUsers();
      if (selectedUser?.id === id) {
        setSelectedUser({ ...selectedUser, isVerified: false, documentStatus: 'REJECTED' });
      }
    } catch (err) {
      showToast('Failed to reject verification', 'error');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!confirm(`PERMANENTLY delete user #${id}? This will purge profile, chats, and files.`)) return;
    try {
      await AdminApi.deleteUser(id);
      showToast(`User #${id} deleted permanently.`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      showToast('Failed to delete user', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium border animate-bounce ${
            toast.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40'
              : 'bg-rose-950/90 text-rose-200 border-rose-500/40'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <UsersIcon className="w-6 h-6 text-blue-400" />
            <span>User Moderation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, moderate accounts, manage verification documents, and ban abusive profiles
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a]/90 border border-slate-800/80 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <form onSubmit={handleSearch} className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-20 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Search
          </button>
        </form>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: 'All Users' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'BLOCKED', label: 'Blocked' },
            { id: 'PENDING_VERIFICATION', label: 'Pending Verification' },
            { id: 'VERIFIED', label: 'Verified' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setStatusFilter(tab.id); setPage(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === tab.id
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Verification</th>
                <th className="py-3.5 px-4">Account State</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500 mb-2" />
                    <span>Loading users...</span>
                  </td>
                </tr>
              ) : !usersPage?.content || usersPage.content.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No users found matching current filters.
                  </td>
                </tr>
              ) : (
                usersPage.content.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* User Profile */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5 flex-shrink-0">
                          {u.profilePictureUrl ? (
                            <img
                              src={u.profilePictureUrl}
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-slate-200">
                              {u.name?.charAt(0) || u.username?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-1.5">
                            <span>{u.name || 'Unnamed'}</span>
                            {u.isVerified && (
                              <span className="p-0.5 rounded-full bg-cyan-500/20 text-cyan-400" title="Verified Blue Tick">
                                <CheckCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            @{u.username || `user_${u.id}`} {u.age ? `• ${u.age} y/o` : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="text-slate-300 font-mono">{u.email || '-'}</div>
                      <div className="text-[11px] text-slate-400">{u.phoneNumber || '-'}</div>
                    </td>

                    {/* Verification Document Status */}
                    <td className="py-3.5 px-4">
                      {u.isVerified ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Verified
                        </span>
                      ) : u.documentStatus === 'PENDING' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1 w-fit">
                          Pending ID
                        </span>
                      ) : u.documentStatus === 'REJECTED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          Rejected ID
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 w-fit">
                          No ID Uploaded
                        </span>
                      )}
                    </td>

                    {/* Account State */}
                    <td className="py-3.5 px-4">
                      {u.isBlocked ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 w-fit">
                          <ShieldBan className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.role || 'USER'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetail(u.id)}
                          title="View Profile Details"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {u.isBlocked ? (
                          <button
                            onClick={() => handleUnblockUser(u.id)}
                            title="Unblock User"
                            className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(u.id)}
                            title="Block User"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          >
                            <ShieldBan className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          title="Delete User Permanently"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {usersPage && usersPage.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {usersPage.number + 1} of {usersPage.totalPages} ({usersPage.totalElements} total users)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={usersPage.first}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={usersPage.last}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User Detail Inspection Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 p-0.5">
                  {selectedUser.profilePictureUrl ? (
                    <img src={selectedUser.profilePictureUrl} alt="" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center font-bold text-white text-base">
                      {selectedUser.name?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <span>{selectedUser.name || 'User #' + selectedUser.id}</span>
                    {selectedUser.isVerified && <CheckCircle className="w-4 h-4 text-cyan-400" />}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">@{selectedUser.username} • ID: {selectedUser.id}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Gender & Age</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  {selectedUser.gender || 'Unknown'}, {selectedUser.age || '-'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Location</span>
                <p className="text-xs font-semibold text-slate-200 mt-0.5">
                  {selectedUser.city ? `${selectedUser.city}, ${selectedUser.country || ''}` : 'Not set'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Intent</span>
                <p className="text-xs font-semibold text-rose-400 mt-0.5">
                  {selectedUser.relationshipIntent || 'Dating'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-bold">Registered</span>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>

            {/* Bio */}
            {selectedUser.bio && (
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Bio / About Me
                </span>
                <p className="text-xs text-slate-200 italic">"{selectedUser.bio}"</p>
              </div>
            )}

            {/* Verification Document Audit */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-cyan-400" />
                  Government ID Verification
                </span>
                <span className="text-xs font-semibold text-cyan-400">
                  Status: {selectedUser.documentStatus || 'NONE'}
                </span>
              </div>

              {selectedUser.documentUrl ? (
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <img
                    src={selectedUser.documentUrl}
                    alt="ID Document"
                    className="w-44 h-28 object-cover rounded-xl border border-slate-700 shadow"
                  />
                  <div className="space-y-2 text-xs">
                    <a
                      href={selectedUser.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open Full Resolution ID
                    </a>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleApproveVerification(selectedUser.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Approve & Grant Blue Tick
                      </button>
                      <button
                        onClick={() => handleRejectVerification(selectedUser.id)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Reject ID
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">User has not submitted an ID verification document yet.</p>
              )}
            </div>

            {/* Moderation Controls Footer */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              {selectedUser.isBlocked ? (
                <button
                  onClick={() => handleUnblockUser(selectedUser.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" /> Unblock Account
                </button>
              ) : (
                <button
                  onClick={() => handleBlockUser(selectedUser.id)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2"
                >
                  <ShieldBan className="w-4 h-4" /> Ban & Block Account
                </button>
              )}

              <button
                onClick={() => handleDeleteUser(selectedUser.id)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-700/80 text-rose-300 font-bold text-xs flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
