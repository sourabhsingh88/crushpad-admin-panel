import axios from 'axios';
import {
  ApiResponse,
  AdminLoginResponseDto,
  PlatformStatsDto,
  AdminUserListItemDto,
  AdminUserDetailDto,
  AdminBannerDto,
  AdminStorageFileDto,
  Page
} from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach tokens or secret key dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crushpad_admin_token');
  const defaultKey = import.meta.env.VITE_ADMIN_SECRET_KEY || 'crushpad-admin-secret-key-2026';
  const secretKey = localStorage.getItem('crushpad_admin_secret') || defaultKey;

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  if (secretKey) {
    config.headers['X-Admin-Key'] = secretKey;
  }
  return config;
});

// Unify response extraction
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking credentials
      if (!window.location.pathname.includes('/login')) {
        // localStorage.removeItem('crushpad_admin_token');
      }
    }
    return Promise.reject(error);
  }
);

export const AdminApi = {
  // Auth
  login: async (email?: string, password?: string, secretKey?: string) => {
    const res = await api.post<ApiResponse<AdminLoginResponseDto>>('/v1/admin/auth/login', {
      email,
      password,
      secretKey,
    });
    return res.data;
  },

  // Platform
  getPlatformStats: async () => {
    const res = await api.get<ApiResponse<PlatformStatsDto>>('/v1/admin/platform/stats');
    return res.data;
  },

  // Users
  getUsers: async (query?: string, status: string = 'ALL', page: number = 0, size: number = 20) => {
    const res = await api.get<ApiResponse<Page<AdminUserListItemDto>>>('/v1/admin/users', {
      params: { query, status, page, size },
    });
    return res.data;
  },

  getUserDetail: async (id: number) => {
    const res = await api.get<ApiResponse<AdminUserDetailDto>>(`/v1/admin/users/${id}`);
    return res.data;
  },

  blockUser: async (id: number) => {
    const res = await api.put<ApiResponse<void>>(`/v1/admin/users/${id}/block`);
    return res.data;
  },

  unblockUser: async (id: number) => {
    const res = await api.put<ApiResponse<void>>(`/v1/admin/users/${id}/unblock`);
    return res.data;
  },

  approveUserVerification: async (id: number) => {
    const res = await api.put<ApiResponse<void>>(`/v1/admin/users/${id}/verify`);
    return res.data;
  },

  rejectUserVerification: async (id: number, reason: string) => {
    const res = await api.put<ApiResponse<void>>(`/v1/admin/users/${id}/reject-verification`, { reason });
    return res.data;
  },

  deleteUser: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/admin/users/${id}`);
    return res.data;
  },

  // Banners
  getAllBanners: async (status: string = 'ALL') => {
    const res = await api.get<ApiResponse<AdminBannerDto[]>>('/v1/admin/banners', {
      params: { status },
    });
    return res.data;
  },

  uploadBanner: async (formData: FormData) => {
    const res = await api.post<ApiResponse<AdminBannerDto>>('/v1/admin/banners/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  approveBanner: async (id: number) => {
    const res = await api.put<ApiResponse<AdminBannerDto>>(`/v1/admin/banners/${id}/approve`);
    return res.data;
  },

  rejectBanner: async (id: number) => {
    const res = await api.put<ApiResponse<AdminBannerDto>>(`/v1/admin/banners/${id}/reject`);
    return res.data;
  },

  toggleBannerActive: async (id: number) => {
    const res = await api.put<ApiResponse<AdminBannerDto>>(`/v1/admin/banners/${id}/toggle-active`);
    return res.data;
  },

  deleteBanner: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/admin/banners/${id}`);
    return res.data;
  },

  // Storage
  getStorageFiles: async (category: string = 'ALL', page: number = 0, size: number = 20) => {
    const res = await api.get<ApiResponse<Page<AdminStorageFileDto>>>('/v1/admin/storage/files', {
      params: { category, page, size },
    });
    return res.data;
  },

  deleteStorageFile: async (id: number) => {
    const res = await api.delete<ApiResponse<void>>(`/v1/admin/storage/files/${id}`);
    return res.data;
  },
};

export default api;
