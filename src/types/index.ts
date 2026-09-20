export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
  error?: string;
}

export interface AdminLoginResponseDto {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  username: string;
  name: string;
  role: string;
}

export interface PlatformStatsDto {
  users: {
    totalUsers: number;
    activeUsers: number;
    blockedUsers: number;
    verifiedUsers: number;
    pendingVerificationUsers: number;
    newUsersLast7Days: number;
  };
  banners: {
    totalBanners: number;
    activeBanners: number;
    pendingApprovalBanners: number;
    approvedBanners: number;
    rejectedBanners: number;
  };
  storage: {
    totalFiles: number;
    totalSizeBytes: number;
    formattedTotalSize: string;
    storageProvider: string;
    categoryCount: Record<string, number>;
    categoryFormattedSize: Record<string, string>;
  };
  health: {
    jvmUptimeSeconds: number;
    jvmHeapUsedMb: number;
    jvmHeapMaxMb: number;
    availableProcessors: number;
    dbConnected: boolean;
    storageConnected: boolean;
    serverTime: string;
  };
}

export interface AdminUserListItemDto {
  id: number;
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  gender?: string;
  age?: number;
  profilePictureUrl?: string;
  active: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  documentStatus?: string;
  documentUrl?: string;
  role?: string;
  createdAt?: string;
  lastSeenAt?: string;
}

export interface AdminUserDetailDto extends AdminUserListItemDto {
  bio?: string;
  relationshipIntent?: string;
  customStatus?: string;
  interests?: string[];
  galleryImages?: string[];
  introVideoUrl?: string;
  introVideoThumbnail?: string;
  city?: string;
  country?: string;
  followersCount?: number;
  followingCount?: number;
}

export interface AdminBannerDto {
  id: number;
  imageUrl: string;
  title: string;
  description?: string;
  linkUrl?: string;
  active: boolean;
  sortOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved: boolean;
  uploadedBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminStorageFileDto {
  id: number;
  fileKey: string;
  fileUrl: string;
  originalFilename?: string;
  contentType?: string;
  fileSize?: number;
  formattedSize?: string;
  category: string;
  storageProvider?: string;
  userId?: number;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}
