import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Cloud,
  File,
  FileImage,
  FileVideo,
  FileText,
  Trash2,
  ExternalLink,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { AdminApi } from '../api/client';
import { AdminStorageFileDto, Page } from '../types';

export const Storage: React.FC = () => {
  const [filesPage, setFilesPage] = useState<Page<AdminStorageFileDto> | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const res = await AdminApi.getStorageFiles(categoryFilter, page, 15);
      if (res.success && res.data) {
        setFilesPage(res.data);
      }
    } catch (err) {
      showToast('Failed to load storage files from Cloudflare R2', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [categoryFilter, page]);

  const handleDeleteFile = async (id: number) => {
    if (!confirm(`Permanently purge file #${id} from Cloudflare R2 bucket? This cannot be undone.`)) return;
    try {
      await AdminApi.deleteStorageFile(id);
      showToast(`File #${id} purged permanently from Cloudflare R2.`);
      fetchFiles();
    } catch (err) {
      showToast('Failed to delete file from Cloudflare R2', 'error');
    }
  };

  const getFileIcon = (contentType?: string, fileKey?: string) => {
    if (contentType?.startsWith('image/') || fileKey?.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
      return <FileImage className="w-5 h-5 text-cyan-400" />;
    }
    if (contentType?.startsWith('video/') || fileKey?.match(/\.(mp4|mov|webm)$/i)) {
      return <FileVideo className="w-5 h-5 text-purple-400" />;
    }
    if (contentType?.includes('pdf') || fileKey?.match(/\.pdf$/i)) {
      return <FileText className="w-5 h-5 text-amber-400" />;
    }
    return <File className="w-5 h-5 text-slate-400" />;
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-cyan-950/20 to-slate-900 border border-slate-800/80 shadow-xl">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Cloud className="w-6 h-6 text-cyan-400" />
            <span>Cloudflare R2 Object Storage</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse stored multipart media assets, verify public CDN delivery, and purge orphaned files
          </p>
        </div>

        <button
          onClick={fetchFiles}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Bucket</span>
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: 'All Files' },
          { id: 'banners', label: 'Banners' },
          { id: 'profiles', label: 'Profiles' },
          { id: 'gallery', label: 'Gallery' },
          { id: 'videos', label: 'Videos' },
          { id: 'documents', label: 'Verification Docs' },
          { id: 'messages', label: 'Chat Attachments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setCategoryFilter(tab.id); setPage(0); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === tab.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Storage Files Table */}
      <div className="rounded-3xl bg-[#0f172a]/90 border border-slate-800/80 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4">Preview</th>
                <th className="py-3.5 px-4">Object Key & File Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Size</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-4">Uploaded At</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-cyan-500 mb-2" />
                    <span>Querying Cloudflare R2 index...</span>
                  </td>
                </tr>
              ) : !filesPage?.content || filesPage.content.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No files found in this category.
                  </td>
                </tr>
              ) : (
                filesPage.content.map((f) => {
                  const isImage = f.contentType?.startsWith('image/') || f.fileKey.match(/\.(jpg|jpeg|png|webp|gif)$/i);

                  return (
                    <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Thumbnail Preview */}
                      <td className="py-3 px-4">
                        {isImage ? (
                          <img
                            src={f.fileUrl}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-slate-700 bg-slate-900"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
                            {getFileIcon(f.contentType, f.fileKey)}
                          </div>
                        )}
                      </td>

                      {/* File Key & Name */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-mono text-slate-200 text-xs truncate" title={f.fileKey}>
                          {f.fileKey}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {f.originalFilename || 'unnamed'} • {f.contentType || 'application/octet-stream'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                          {f.category}
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 font-mono text-slate-300 text-xs">
                        {f.formattedSize || '-'}
                      </td>

                      {/* Provider */}
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          {f.storageProvider || 'CLOUDFLARE_R2'}
                        </span>
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {f.createdAt ? new Date(f.createdAt).toLocaleString() : '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={f.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            title="Open / Download from Cloudflare CDN"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleDeleteFile(f.id)}
                            title="Permanently Purge from Cloudflare R2"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filesPage && filesPage.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page {filesPage.number + 1} of {filesPage.totalPages} ({filesPage.totalElements} total objects)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={filesPage.first}
                onClick={() => setPage(page - 1)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={filesPage.last}
                onClick={() => setPage(page + 1)}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
