import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Plus,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Trash2,
  ExternalLink,
  Upload,
  RefreshCw,
  Clock,
  Check,
  X,
  AlertCircle
} from 'lucide-react';
import { AdminApi } from '../api/client';
import { AdminBannerDto } from '../types';

export const Banners: React.FC = () => {
  const [banners, setBanners] = useState<AdminBannerDto[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [autoApprove, setAutoApprove] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getAllBanners(statusFilter);
      if (res.success && res.data) {
        setBanners(res.data);
      }
    } catch (err) {
      showToast('Failed to load banners list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [statusFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      showToast('Please select a banner image file', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('linkUrl', linkUrl);
      formData.append('sortOrder', sortOrder);
      formData.append('approved', String(autoApprove));
      formData.append('active', String(autoApprove));

      const res = await AdminApi.uploadBanner(formData);
      if (res.success) {
        showToast('Banner uploaded directly to Cloudflare R2 bucket!');
        setModalOpen(false);
        // Reset form
        setImageFile(null);
        setPreviewUrl(null);
        setTitle('');
        setDescription('');
        setLinkUrl('');
        setSortOrder('0');
        fetchBanners();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to upload banner to Cloudflare R2', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await AdminApi.approveBanner(id);
      showToast(`Banner #${id} approved for mobile app!`);
      fetchBanners();
    } catch (err) {
      showToast('Failed to approve banner', 'error');
    }
  };

  const handleReject = async (id: number) => {
    try {
      await AdminApi.rejectBanner(id);
      showToast(`Banner #${id} rejected.`);
      fetchBanners();
    } catch (err) {
      showToast('Failed to reject banner', 'error');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await AdminApi.toggleBannerActive(id);
      showToast(`Banner #${id} visibility toggled.`);
      fetchBanners();
    } catch (err) {
      showToast('Failed to toggle banner active state', 'error');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Delete banner #${id} and purge image from Cloudflare R2 bucket?`)) return;
    try {
      await AdminApi.deleteBanner(id);
      showToast(`Banner #${id} purged from Cloudflare R2.`);
      fetchBanners();
    } catch (err) {
      showToast('Failed to delete banner', 'error');
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-rose-950/40 via-purple-950/20 to-slate-900 border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-rose-400" />
            <span>Banner Studio & Approvals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Upload promotional banners directly to Cloudflare R2, approve submissions, and control live app carousels
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Banner</span>
          </button>
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-rose-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 w-fit">
        {[
          { id: 'ALL', label: 'All Banners' },
          { id: 'APPROVED', label: 'Approved (Live in App)' },
          { id: 'PENDING', label: 'Pending Moderation' },
          { id: 'REJECTED', label: 'Rejected' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              statusFilter === tab.id
                ? 'bg-rose-600 text-white shadow-md shadow-rose-500/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-rose-500 mb-2" />
          <p className="text-xs text-slate-400">Loading Cloudflare R2 banners...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 rounded-3xl bg-[#0f172a]/60 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
            <ImageIcon className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">No banners in this category</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Use the "Upload New Banner" button to store a new banner on Cloudflare R2 and approve it for the mobile dating app.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((b) => (
            <div
              key={b.id}
              className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl overflow-hidden flex flex-col group hover:border-slate-700 transition-all"
            >
              {/* Banner Image Container */}
              <div className="relative aspect-[16/9] w-full bg-slate-950 overflow-hidden">
                <img
                  src={b.imageUrl}
                  alt={b.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badges Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg ${
                      b.status === 'APPROVED'
                        ? 'bg-emerald-500/90 text-white'
                        : b.status === 'PENDING'
                        ? 'bg-amber-500/90 text-slate-900'
                        : 'bg-rose-500/90 text-white'
                    }`}
                  >
                    {b.status}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      b.active ? 'bg-black/60 text-emerald-400 border border-emerald-500/30' : 'bg-black/60 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {b.active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <a
                  href={b.imageUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open in Cloudflare R2"
                  className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 hover:bg-black text-slate-200 backdrop-blur-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Banner Metadata */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>Banner #{b.id}</span>
                    <span>Order: {b.sortOrder}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1 line-clamp-1">{b.title}</h3>
                  {b.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{b.description}</p>
                  )}
                  {b.linkUrl && (
                    <div className="text-[11px] text-cyan-400 font-mono truncate mt-2">
                      🔗 {b.linkUrl}
                    </div>
                  )}
                </div>

                {/* Banner Actions Bar */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {b.status === 'PENDING' ? (
                      <>
                        <button
                          onClick={() => handleApprove(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleReject(b.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    ) : b.status === 'APPROVED' ? (
                      <button
                        onClick={() => handleReject(b.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-semibold"
                      >
                        Unapprove
                      </button>
                    ) : (
                      <button
                        onClick={() => handleApprove(b.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 text-xs font-semibold"
                      >
                        Re-Approve
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleActive(b.id)}
                      title={b.active ? 'Deactivate' : 'Activate'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        b.active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-slate-500 hover:bg-slate-800'
                      }`}
                    >
                      {b.active ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                    </button>

                    <button
                      onClick={() => handleDelete(b.id)}
                      title="Purge from Cloudflare R2"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Banner Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-[#0f172a] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-rose-400" />
                <h3 className="text-base font-bold text-white">Upload Banner to Cloudflare R2</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadBanner} className="space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Banner Creative Image
                </label>
                <div className="relative border-2 border-dashed border-slate-700 hover:border-rose-500/60 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-900/50">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-36 mx-auto rounded-xl object-cover shadow"
                    />
                  ) : (
                    <div className="py-4 space-y-1">
                      <Upload className="w-7 h-7 text-rose-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-300">Click or drag banner image here</p>
                      <p className="text-[11px] text-slate-500">PNG, JPG, WEBP up to 10MB • 16:9 Recommended</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekend Spark Event"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Short promotional subtitle for users..."
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Link URL & Sort Order */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Click Link URL
                  </label>
                  <input
                    type="url"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Display Priority Order
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Auto Approve Switch */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Instant Live Approval</span>
                  <span className="text-[11px] text-slate-400">Publish immediately to mobile app active feed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoApprove(!autoApprove)}
                  className={`p-1 rounded-lg transition-colors ${autoApprove ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                  {autoApprove ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6" />}
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <span>Uploading directly to Cloudflare R2...</span>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload & Store on Cloudflare R2</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
