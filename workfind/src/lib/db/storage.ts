import { createClient } from '@/lib/supabase/client';
import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Storage bucket names
 */
export const STORAGE_BUCKETS = {
  PROFILE_PICTURES: 'profile-pictures',
  BUSINESS_LOGOS: 'business-logos',
  COVER_IMAGES: 'cover-images',
  LISTING_IMAGES: 'listing-images',
  PORTFOLIO_IMAGES: 'portfolio-images',
  JOB_ATTACHMENTS: 'job-attachments',
  REVIEW_IMAGES: 'review-images',
  CHAT_ATTACHMENTS: 'chat-attachments',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

/**
 * Allowed MIME types per bucket
 */
export const BUCKET_MIME_TYPES: Record<StorageBucket, string[]> = {
  [STORAGE_BUCKETS.PROFILE_PICTURES]: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  [STORAGE_BUCKETS.BUSINESS_LOGOS]: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  [STORAGE_BUCKETS.COVER_IMAGES]: ['image/jpeg', 'image/png', 'image/webp'],
  [STORAGE_BUCKETS.LISTING_IMAGES]: ['image/jpeg', 'image/png', 'image/webp'],
  [STORAGE_BUCKETS.PORTFOLIO_IMAGES]: ['image/jpeg', 'image/png', 'image/webp'],
  [STORAGE_BUCKETS.JOB_ATTACHMENTS]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  [STORAGE_BUCKETS.REVIEW_IMAGES]: ['image/jpeg', 'image/png', 'image/webp'],
  [STORAGE_BUCKETS.CHAT_ATTACHMENTS]: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
};

/**
 * Maximum file size per bucket (in bytes)
 */
export const BUCKET_MAX_SIZE: Record<StorageBucket, number> = {
  [STORAGE_BUCKETS.PROFILE_PICTURES]: 5 * 1024 * 1024, // 5MB
  [STORAGE_BUCKETS.BUSINESS_LOGOS]: 5 * 1024 * 1024, // 5MB
  [STORAGE_BUCKETS.COVER_IMAGES]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.LISTING_IMAGES]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.PORTFOLIO_IMAGES]: 10 * 1024 * 1024, // 10MB
  [STORAGE_BUCKETS.JOB_ATTACHMENTS]: 20 * 1024 * 1024, // 20MB
  [STORAGE_BUCKETS.REVIEW_IMAGES]: 5 * 1024 * 1024, // 5MB
  [STORAGE_BUCKETS.CHAT_ATTACHMENTS]: 20 * 1024 * 1024, // 20MB
};

/**
 * Upload result
 */
export interface UploadResult {
  path: string;
  fullPath: string;
  publicUrl: string;
}

/**
 * Validate file before upload
 */
export function validateFile(file: File, bucket: StorageBucket): { valid: boolean; error?: string } {
  const allowedTypes = BUCKET_MIME_TYPES[bucket];
  const maxSize = BUCKET_MAX_SIZE[bucket];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} not allowed for ${bucket}. Allowed: ${allowedTypes.join(', ')}`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${maxSize / 1024 / 1024}MB for ${bucket}`,
    };
  }

  return { valid: true };
}

/**
 * Generate a unique file path
 */
export function generateFilePath(
  bucket: StorageBucket,
  userId: string,
  fileName: string,
  prefix?: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const extension = fileName.split('.').pop() || '';
  const baseName = fileName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 50);

  const parts: string[] = [bucket];
  if (prefix) parts.push(prefix);
  parts.push(userId);
  parts.push(`${timestamp}-${random}-${baseName}.${extension}`);

  return parts.join('/');
}

/**
 * Upload file to storage (client-side)
 */
export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: File,
  options?: { upsert?: boolean; cacheControl?: string }
): Promise<UploadResult> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    fullPath: data.fullPath,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Upload file to storage (server-side)
 */
export async function uploadFileServer(
  bucket: StorageBucket,
  path: string,
  file: File | Blob,
  options?: { upsert?: boolean; cacheControl?: string }
): Promise<UploadResult> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: options?.cacheControl || '3600',
      upsert: options?.upsert || false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return {
    path: data.path,
    fullPath: data.fullPath,
    publicUrl: publicUrlData.publicUrl,
  };
}

/**
 * Delete file from storage (client-side)
 */
export async function deleteFile(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Delete file from storage (server-side)
 */
export async function deleteFileServer(bucket: StorageBucket, path: string): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Get public URL for a file (client-side)
 */
export function getPublicUrl(bucket: StorageBucket, path: string): string {
  const supabase = createClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Get public URL for a file (server-side)
 */
export async function getPublicUrlServer(bucket: StorageBucket, path: string): Promise<string> {
  const supabase = await createServerClient();
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Create signed URL for private buckets (client-side)
 */
export async function createSignedUrl(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Create signed URL for private buckets (server-side)
 */
export async function createSignedUrlServer(
  bucket: StorageBucket,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * List files in a folder (client-side)
 */
export async function listFiles(
  bucket: StorageBucket,
  folderPath: string,
  options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
): Promise<{ name: string; id: string | null; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> }[]> {
  const supabase = createClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data || [];
}

/**
 * List files in a folder (server-side)
 */
export async function listFilesServer(
  bucket: StorageBucket,
  folderPath: string,
  options?: { limit?: number; offset?: number; sortBy?: { column: string; order: 'asc' | 'desc' } }
): Promise<{ name: string; id: string | null; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> }[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folderPath, {
      limit: options?.limit || 100,
      offset: options?.offset || 0,
      sortBy: options?.sortBy || { column: 'name', order: 'asc' },
    });

  if (error) {
    throw new Error(`List failed: ${error.message}`);
  }

  return data || [];
}

/**
 * Move/rename file (client-side)
 */
export async function moveFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    throw new Error(`Move failed: ${error.message}`);
  }
}

/**
 * Move/rename file (server-side)
 */
export async function moveFileServer(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.storage.from(bucket).move(fromPath, toPath);

  if (error) {
    throw new Error(`Move failed: ${error.message}`);
  }
}

/**
 * Copy file (client-side)
 */
export async function copyFile(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) {
    throw new Error(`Copy failed: ${error.message}`);
  }
}

/**
 * Copy file (server-side)
 */
export async function copyFileServer(
  bucket: StorageBucket,
  fromPath: string,
  toPath: string
): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.storage.from(bucket).copy(fromPath, toPath);

  if (error) {
    throw new Error(`Copy failed: ${error.message}`);
  }
}

/**
 * Download file (client-side)
 */
export async function downloadFile(bucket: StorageBucket, path: string): Promise<Blob> {
  const supabase = createClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}

/**
 * Download file (server-side)
 */
export async function downloadFileServer(bucket: StorageBucket, path: string): Promise<Blob> {
  const supabase = await createServerClient();

  const { data, error } = await supabase.storage.from(bucket).download(path);

  if (error) {
    throw new Error(`Download failed: ${error.message}`);
  }

  return data;
}

/**
 * Get file info (client-side)
 */
export async function getFileInfo(
  bucket: StorageBucket,
  path: string
): Promise<{ id: string | null; name: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> } | null> {
  const supabase = createClient();
  const parts = path.split('/');
  const fileName = parts.pop() || '';
  const folder = parts.join('/');

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    search: fileName,
  });

  if (error) {
    if (error.message.includes('not found')) return null;
    throw new Error(`Get file info failed: ${error.message}`);
  }

  const file = data?.find(f => f.name === fileName);
  return file || null;
}

/**
 * Get file info (server-side)
 */
export async function getFileInfoServer(
  bucket: StorageBucket,
  path: string
): Promise<{ id: string | null; name: string; updated_at: string; created_at: string; last_accessed_at: string; metadata: Record<string, unknown> } | null> {
  const supabase = await createServerClient();
  const parts = path.split('/');
  const fileName = parts.pop() || '';
  const folder = parts.join('/');

  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    search: fileName,
  });

  if (error) {
    if (error.message.includes('not found')) return null;
    throw new Error(`Get file info failed: ${error.message}`);
  }

  const file = data?.find(f => f.name === fileName);
  return file || null;
}

/**
 * Upload multiple files
 */
export async function uploadFiles(
  bucket: StorageBucket,
  files: Array<{ file: File; path: string }>,
  options?: { upsert?: boolean; cacheControl?: string }
): Promise<UploadResult[]> {
  const results = await Promise.all(
    files.map(({ file, path }) => uploadFile(bucket, path, file, options))
  );
  return results;
}

/**
 * Delete multiple files
 */
export async function deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`Bulk delete failed: ${error.message}`);
  }
}

/**
 * Delete multiple files (server-side)
 */
export async function deleteFilesServer(bucket: StorageBucket, paths: string[]): Promise<void> {
  const supabase = await createServerClient();

  const { error } = await supabase.storage.from(bucket).remove(paths);

  if (error) {
    throw new Error(`Bulk delete failed: ${error.message}`);
  }
}

/**
 * Helper: Upload profile picture
 */
export async function uploadProfilePicture(
  userId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.PROFILE_PICTURES);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.PROFILE_PICTURES, userId, file.name);
  return uploadFile(STORAGE_BUCKETS.PROFILE_PICTURES, path, file);
}

/**
 * Helper: Upload business logo
 */
export async function uploadBusinessLogo(
  providerId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.BUSINESS_LOGOS);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.BUSINESS_LOGOS, providerId, file.name, 'logo');
  return uploadFile(STORAGE_BUCKETS.BUSINESS_LOGOS, path, file);
}

/**
 * Helper: Upload cover image
 */
export async function uploadCoverImage(
  providerId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.COVER_IMAGES);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.COVER_IMAGES, providerId, file.name, 'cover');
  return uploadFile(STORAGE_BUCKETS.COVER_IMAGES, path, file);
}

/**
 * Helper: Upload listing image
 */
export async function uploadListingImage(
  listingId: string,
  file: File,
  displayOrder: number = 0
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.LISTING_IMAGES);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.LISTING_IMAGES, listingId, file.name, `img-${displayOrder}`);
  return uploadFile(STORAGE_BUCKETS.LISTING_IMAGES, path, file);
}

/**
 * Helper: Upload portfolio image
 */
export async function uploadPortfolioImage(
  providerId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.PORTFOLIO_IMAGES);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.PORTFOLIO_IMAGES, providerId, file.name, 'portfolio');
  return uploadFile(STORAGE_BUCKETS.PORTFOLIO_IMAGES, path, file);
}

/**
 * Helper: Upload job attachment
 */
export async function uploadJobAttachment(
  userId: string,
  jobRequestId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.JOB_ATTACHMENTS);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.JOB_ATTACHMENTS, userId, file.name, jobRequestId);
  return uploadFile(STORAGE_BUCKETS.JOB_ATTACHMENTS, path, file);
}

/**
 * Helper: Upload review image
 */
export async function uploadReviewImage(
  userId: string,
  reviewId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.REVIEW_IMAGES);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.REVIEW_IMAGES, userId, file.name, reviewId);
  return uploadFile(STORAGE_BUCKETS.REVIEW_IMAGES, path, file);
}

/**
 * Helper: Upload chat attachment
 */
export async function uploadChatAttachment(
  conversationId: string,
  file: File
): Promise<UploadResult> {
  const validation = validateFile(file, STORAGE_BUCKETS.CHAT_ATTACHMENTS);
  if (!validation.valid) throw new Error(validation.error);

  const path = generateFilePath(STORAGE_BUCKETS.CHAT_ATTACHMENTS, conversationId, file.name);
  return uploadFile(STORAGE_BUCKETS.CHAT_ATTACHMENTS, path, file);
}